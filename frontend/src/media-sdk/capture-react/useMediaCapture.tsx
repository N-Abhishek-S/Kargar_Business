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
  
  // Actions
  open: (options?: { facingMode?: FacingMode; deviceId?: string; audio?: boolean }) => Promise<void>;
  close: () => Promise<void>;
  switchCamera: (options?: { audio?: boolean }) => Promise<void>;
  capturePhoto: (videoElement: HTMLVideoElement) => Promise<Blob>;
  
  // Recording Actions
  startRecording: (mimeType?: string) => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<Blob>;
}

const CameraContext = createContext<MediaCaptureSDK | null>(null);

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CameraState>("IDLE");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [devices, setDevices] = useState<{ cameras: MediaDeviceInfo[]; microphones: MediaDeviceInfo[]; speakers: MediaDeviceInfo[] }>({ cameras: [], microphones: [], speakers: [] });
  const [facingMode, setFacingMode] = useState<FacingMode | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState | "destroyed">("STOPPED");

  // Initialize Core SDK singletons once
  const core = useMemo(() => {
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
  }, []);

  // Sync React State with Core SDK State
  useEffect(() => {
    const syncState = () => {
      setState(core.cameraController.getState());
      setStream(core.cameraController.getStream());
      setRecordingState(core.videoRecorderController.getState());
      
      const activeStream = core.cameraController.getStream();
      if (activeStream) {
        const track = activeStream.getVideoTracks()[0];
        if (track && track.getSettings().facingMode) {
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
    core.emitter.on("error", (err) => {
      setError(err);
      syncState();
    });

    const unsubscribeDevices = core.deviceService.listenForDeviceChanges({
      on: () => {},
      off: () => {},
      emit: (e: string, data: any) => {
        if (e === "devicesChanged") {
          const allDevices = data as MediaDeviceInfo[];
          setDevices({
            cameras: allDevices.filter((d) => d.kind === "videoinput"),
            microphones: allDevices.filter((d) => d.kind === "audioinput"),
            speakers: allDevices.filter((d) => d.kind === "audiooutput"),
          });
        }
      },
      clear: () => {}
    } as any);

    core.deviceService.getDevices().then(setDevices);

    return () => {
      core.emitter.clear();
      unsubscribeDevices();
      core.videoRecorderController.destroy();
      core.cameraController.close(); // Cleanup on unmount
    };
  }, [core]);

  const sdk: MediaCaptureSDK = useMemo(() => ({
    state,
    stream,
    error,
    devices,
    facingMode,
    recordingState,
    open: async (options) => {
      setError(null);
      await core.cameraController.open(options);
    },
    close: async () => {
      await core.cameraController.close();
    },
    switchCamera: async (options) => {
      await core.cameraController.switchCamera(options);
    },
    capturePhoto: async (videoElement: HTMLVideoElement) => {
      const mode = facingMode || defaultConfig.mobileDefaultFacingMode;
      return core.imageProcessor.capture(videoElement, mode);
    },
    startRecording: (mimeType?: string) => {
      const currentStream = core.cameraController.getStream();
      if (!currentStream) throw new Error("Cannot start recording: no active stream");
      core.videoRecorderController.start(currentStream, mimeType);
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
  }), [state, stream, error, devices, facingMode, recordingState, core]);

  return (
    <CameraContext.Provider value={sdk}>
      {children}
    </CameraContext.Provider>
  );
};

export const useMediaCapture = (): MediaCaptureSDK => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error("useMediaCapture must be used within a CameraProvider");
  }
  return context;
};
