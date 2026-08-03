import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  MediaCameraController,
  PermissionService,
  MediaDeviceService,
  CameraCapabilityService,
  ConstraintBuilder,
  ImageProcessor,
  createEmitter,
  defaultConfig,
  BrowserAdapter,
  VideoRecorderController
} from "../capture-core";
import type { CameraState, FacingMode, SDKEventMap, RecordingState } from "../capture-core";

// Represents the SDK Instance shape exposed to React UI
export interface MediaCaptureSDK {
  state: CameraState;
  stream: MediaStream | null;
  error: Error | null;
  devices: { cameras: MediaDeviceInfo[]; microphones: MediaDeviceInfo[]; speakers: MediaDeviceInfo[] };
  facingMode: FacingMode | null;
  recordingState: RecordingState | "destroyed";
  
  open: (options?: { facingMode?: FacingMode; deviceId?: string; audio?: boolean; width?: number; height?: number; frameRate?: number; audioDeviceId?: string }) => Promise<void>;
  /** Change resolution/framerate/camera-device/mic-device of the ALREADY-ACTIVE stream (open() intentionally no-ops when already READY/OPENING). Omitted fields are preserved. */
  reconfigure: (options?: { width?: number; height?: number; frameRate?: number; deviceId?: string; audioDeviceId?: string; audio?: boolean }) => Promise<void>;
  close: () => void;
  switchCamera: (options?: { audio?: boolean }) => Promise<void>;
  capturePhoto: (videoElement: HTMLVideoElement) => Promise<Blob>;
  
  // Recording Actions
  startRecording: (options?: { mimeType?: string; videoBitsPerSecond?: number; audioBitsPerSecond?: number }) => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<Blob>;
}

const CameraContext = createContext<MediaCaptureSDK | null>(null);

function initCore() {
  const emitter = createEmitter<SDKEventMap>();
  const permissionService = new PermissionService();
  const deviceService = new MediaDeviceService();
  const capabilityService = new CameraCapabilityService();
  const constraintBuilder = new ConstraintBuilder(capabilityService);
  const browserAdapter = new BrowserAdapter();

  const cameraController = new MediaCameraController(
    emitter,
    defaultConfig,
    permissionService,
    deviceService,
    constraintBuilder,
    capabilityService,
    browserAdapter
  );

  const imageProcessor = new ImageProcessor(defaultConfig);
  const videoRecorderController = new VideoRecorderController(emitter);

  return { emitter, cameraController, imageProcessor, deviceService, videoRecorderController };
}

interface CameraProviderProps {
  children: React.ReactNode;
  onSDKEvent?: (eventName: string, payload: Record<string, unknown>) => void;
}

export const CameraProvider: React.FC<CameraProviderProps> = ({ children, onSDKEvent }) => {
  const [state, setState] = useState<CameraState>("IDLE");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [devices, setDevices] = useState<{ cameras: MediaDeviceInfo[]; microphones: MediaDeviceInfo[]; speakers: MediaDeviceInfo[] }>({ cameras: [], microphones: [], speakers: [] });
  const [facingMode, setFacingMode] = useState<FacingMode | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState | "destroyed">("STOPPED");

  // Initialize Core SDK singletons once, securely held in a ref
  const [core] = useState(() => initCore());

  // Sync React State with Core SDK State
  useEffect(() => {
    const syncState = () => {
      setState(core.cameraController.getState());
      setStream(core.cameraController.getStream());
      setRecordingState(core.videoRecorderController.getState());
      
      const activeStream = core.cameraController.getStream();
      if (activeStream) {
        const track = activeStream.getVideoTracks()[0];
        if (track?.getSettings().facingMode) {
          setFacingMode(track.getSettings().facingMode as FacingMode);
        }
      } else {
        setFacingMode(null);
      }
    };

    core.emitter.on("camera.opened", syncState);
    core.emitter.on("camera.switched", syncState);
    core.emitter.on("camera.closed", syncState);
    core.emitter.on("recording.started", syncState);
    core.emitter.on("recording.paused", syncState);
    core.emitter.on("recording.resumed", syncState);
    core.emitter.on("recording.finished", syncState);
    core.emitter.on("error", (err: Error) => {
      setError(err);
      if (onSDKEvent) onSDKEvent("camera_error", { errorName: err.name, errorMessage: err.message });
      syncState();
    });

    let onSDKOpened: ((payload: unknown) => void) | undefined;
    let onSDKTransitionFailed: ((payload: unknown) => void) | undefined;

    if (onSDKEvent) {
      onSDKOpened = (payload) => { onSDKEvent("camera_opened", payload as Record<string, unknown>); };
      onSDKTransitionFailed = (payload) => { onSDKEvent("state_transition_failed", payload as Record<string, unknown>); };
      
      core.emitter.on("camera.opened", onSDKOpened);
      core.emitter.on("transition.failed", onSDKTransitionFailed);
    }

    const unsubscribeDevices = core.deviceService.listenForDeviceChanges((allDevices: MediaDeviceInfo[]) => {
      setDevices({
        cameras: allDevices.filter((d: MediaDeviceInfo) => d.kind === "videoinput"),
        microphones: allDevices.filter((d: MediaDeviceInfo) => d.kind === "audioinput"),
        speakers: allDevices.filter((d: MediaDeviceInfo) => d.kind === "audiooutput"),
      });
    });

    void core.deviceService.getDevices().then(setDevices);

    return () => {
      // Unsubscribe only the listeners attached in THIS effect cycle
      core.emitter.off("camera.opened", syncState);
      core.emitter.off("camera.switched", syncState);
      core.emitter.off("camera.closed", syncState);
      core.emitter.off("recording.started", syncState);
      core.emitter.off("recording.paused", syncState);
      core.emitter.off("recording.resumed", syncState);
      core.emitter.off("recording.finished", syncState);
      
      if (onSDKEvent) {
        if (onSDKOpened) core.emitter.off("camera.opened", onSDKOpened);
        if (onSDKTransitionFailed) core.emitter.off("transition.failed", onSDKTransitionFailed);
      }
      
      unsubscribeDevices();

      // Deliberately reset(), NOT destroy(), here — confirmed by direct testing that this
      // effect's cleanup fires immediately at mount under React StrictMode's dev-only
      // double-invoke (mount -> cleanup -> mount), against the SAME `core`/controller
      // instance (it persists across the phantom cycle: useState's lazy initializer is not
      // re-run just because an effect re-runs). destroy() is a one-way terminal operation
      // with no "undestroy" — calling it here meant every recorder session was permanently
      // destroyed before the user ever pressed Record, causing recording to silently fail
      // after a real countdown (this was the Commit A regression: countdown completed,
      // VideoRecorderController.start() threw InvalidStateError since destroyed was already
      // true, and the UI had no way to show it — see the `error` handling below).
      // reset() is idempotent/reversible (safe to call on a real cleanup too) and provides
      // everything actually needed here: any in-flight recorder is safely stopped and the
      // camera stream is released. The controller is naturally garbage-collected on a real
      // unmount regardless of whether `destroyed` was ever set — nothing in this codebase
      // reuses a `core` object after its owning CameraProvider truly unmounts, so the
      // one-way guard destroy() provides no realized safety benefit here, only this hazard.
      core.videoRecorderController.reset();
      core.cameraController.close();
    };
  }, [core, onSDKEvent]);

  // Stabilize actions to prevent React dependency loops
  const actions = useMemo(() => ({
    open: async (options?: { facingMode?: FacingMode; deviceId?: string; audio?: boolean; width?: number; height?: number; frameRate?: number; audioDeviceId?: string }) => {
      // Intentionally not setting error here directly to keep dependencies simple
      // Errors will be captured and emitted by the core controller anyway
      await core.cameraController.open(options);
    },
    reconfigure: async (options?: { width?: number; height?: number; frameRate?: number; deviceId?: string; audioDeviceId?: string; audio?: boolean }) => {
      await core.cameraController.reconfigure(options);
    },
    close: () => {
      // Ordinary session close (modal closed, navigated away) — NOT terminal. Safely stops
      // any in-flight recording and releases the recorder WITHOUT permanently destroying it
      // (reset(), not destroy()), so the same core instance can open/record again later.
      // Both calls are idempotent/safe to call multiple times or when already stopped/closed.
      core.videoRecorderController.reset();
      core.cameraController.close();
    },
    switchCamera: async (options?: { audio?: boolean }) => {
      await core.cameraController.switchCamera(options);
    },
    capturePhoto: async (videoElement: HTMLVideoElement) => {
      const currentStream = core.cameraController.getStream();
      let mode = defaultConfig.mobileDefaultFacingMode;
      if (currentStream) {
        const track = currentStream.getVideoTracks()[0];
        if (track?.getSettings().facingMode) {
          mode = track.getSettings().facingMode as FacingMode;
        }
      }
      return core.imageProcessor.capture(videoElement, mode);
    },
    startRecording: (options?: { mimeType?: string; videoBitsPerSecond?: number; audioBitsPerSecond?: number }) => {
      const currentStream = core.cameraController.getStream();
      if (!currentStream) throw new Error("Cannot start recording: no active stream");
      core.videoRecorderController.start(currentStream, options);
    },
    pauseRecording: () => {
      core.videoRecorderController.pause();
    },
    resumeRecording: () => {
      core.videoRecorderController.resume();
    },
    stopRecording: async () => {
      return core.videoRecorderController.stop();
    }
  }), [core]);

  const sdk: MediaCaptureSDK = useMemo(() => ({
    state,
    stream,
    error,
    devices,
    facingMode,
    recordingState,
    ...actions
  }), [state, stream, error, devices, facingMode, recordingState, actions]);

  return (
    <CameraContext.Provider value={sdk}>
      {children}
    </CameraContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMediaCapture = (): MediaCaptureSDK => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error("useMediaCapture must be used within a CameraProvider");
  }
  return context;
};
