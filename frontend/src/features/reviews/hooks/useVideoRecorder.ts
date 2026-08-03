import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  RecorderState,
  RecorderError,
  UseVideoRecorderReturn,
  VideoQuality
} from '../types/video-recorder.types';
import { RecorderLimits, QualityPresets } from '../config/recorder.config';
import { pluginManager } from '../services/plugin.service';
import { RecorderLogger } from '../services/logger.service';
import { blobToFile, generateRecordingFileName, safeRevokeObjectURL } from '../utils/video-recorder.utils';
import { useMediaCapture } from '../../../media-sdk/capture-react/useMediaCapture';

export function useVideoRecorder(): UseVideoRecorderReturn & {
  _setSelectedCamera: (id: string | null) => void;
  _setSelectedMic: (id: string | null) => void;
  _setSelectedQuality: (q: VideoQuality) => void;
  _setSelectedFacingMode: (mode: 'user' | 'environment') => void;
} {
  const mediaCapture = useMediaCapture();

  // `mediaCapture` (the SDK object) is a NEW reference on nearly every camera/recording state
  // transition (see useMediaCapture.tsx's `sdk` useMemo deps). Effects/callbacks that only need
  // to CALL a method on it later (cleanup, changeQuality) — not read its current state during
  // render — track it via this ref instead of depending on the object directly, so they aren't
  // torn down and rebuilt (and, for the unmount-cleanup effect below, don't have their cleanup
  // re-run) on every such transition. The ref is always current (updated every render, below),
  // so this is not a stale closure — it's the standard "latest ref" pattern, not a dependency
  // being dropped.
  const mediaCaptureRef = useRef(mediaCapture);
  useEffect(() => {
    mediaCaptureRef.current = mediaCapture;
  });

  /* ---- State ---- */
  const [internalState, setInternalState] = useState<RecorderState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  // Errors caught locally (e.g. VideoRecorderController.start()/stopRecording() throwing/
  // rejecting) — these are NOT routed through mediaCapture.error (that only reflects
  // MediaCameraController-level errors emitted via the SDK's event bus), so without this,
  // a start/stop failure would be caught, internalState set to 'error', and then silently
  // overridden back to 'ready' by the derive-from-mediaCapture block below on the very next
  // render (mediaCapture.error stays null) — recording would just appear to do nothing.
  const [internalError, setInternalError] = useState<RecorderError | null>(null);

  // Deriving state
  let derivedState = internalState;
  // 'error' set locally (see internalError above) is intentionally sticky, same as
  // 'countdown'/'preview' — it must NOT be re-derived away by mediaCapture's view, which
  // knows nothing about a locally-caught start()/stop() failure. Escaping 'error' happens
  // explicitly (requestPermission's retry, retake, cleanup — all clear internalError below).
  if (internalState !== 'countdown' && internalState !== 'preview' && internalState !== 'error') {
      const isRecording = mediaCapture.recordingState === 'RECORDING';
      const isPaused = mediaCapture.recordingState === 'PAUSED';
      if (mediaCapture.error) derivedState = 'error';
      else if (isRecording) derivedState = 'recording';
      else if (isPaused) derivedState = 'paused';
      // SWITCHING covers both camera-flip (switchCamera) and a resolution reconfigure
      // (changeQuality) — treat it as still "ready" so the camera preview/controls don't
      // flicker away and back for what is, from the user's perspective, a brief in-place
      // update to the same live session, not a return to an unopened state.
      else if (mediaCapture.state === 'READY' || mediaCapture.state === 'SWITCHING') derivedState = 'ready';
      else if (mediaCapture.state === 'OPENING') derivedState = 'requesting_permission';
      else derivedState = 'idle';
  }
  const isReconfiguring = mediaCapture.state === 'SWITCHING';

  /* ---- Refs (no re-renders) ---- */
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  /* ---- Device selection state (for external hooks to set) ---- */
  const selectedCameraRef = useRef<string | null>(null);
  const selectedMicRef = useRef<string | null>(null);
  const selectedQualityRef = useRef<VideoQuality>('720p');
  const selectedFacingModeRef = useRef<'user' | 'environment'>('environment');

  /* ---- Internal Helpers ---- */

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdownValue(null);
  }, []);

  const releasePreview = useCallback(() => {
    safeRevokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setRecordedBlob(null);
  }, []);

  /**
   * Full cleanup — called on unmount and when modal closes.
   * Defense in depth: explicitly closes the media capture stream (stops all tracks, turns off
   * the camera LED, safely stops any in-flight MediaRecorder) here rather than relying solely
   * on CameraProvider's own unmount effect to do it. mediaCapture.close() is idempotent/safe to
   * call multiple times or when already closed — see useMediaCapture.tsx / MediaCameraController.
   * The provider-level cleanup is NOT removed; this is additive, not a replacement.
   *
   * IMPORTANT: this calls mediaCaptureRef.current.close() rather than depending on `mediaCapture`
   * directly. `mediaCapture` is a NEW object reference on nearly every camera/recording state
   * transition (see useMediaCapture.tsx's `sdk` useMemo — state/stream/error/devices/facingMode/
   * recordingState are all deps). If this effect depended on `mediaCapture` itself, React would
   * re-run its cleanup — i.e. call close() — on ordinary transitions like recording actually
   * starting, closing the camera out from under an in-progress recording. The ref always holds
   * the latest `mediaCapture` (updated every render, above), so this is not a stale closure.
   */
  const cleanup = useCallback(() => {
    RecorderLogger.info('Full cleanup');
    clearTimer();
    clearCountdown();
    releasePreview();
    mediaCaptureRef.current.close();
    setElapsedSeconds(0);
    setInternalError(null);
    setInternalState('idle');
  }, [clearTimer, clearCountdown, releasePreview]);

  /* ---- Cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      clearTimer();
      clearCountdown();
      releasePreview();
      mediaCaptureRef.current.close();
    };
  }, [clearTimer, clearCountdown, releasePreview]);

  /* ---- Actions ---- */

  const open = useCallback(() => {
    setInternalState('idle');
  }, []);

  const requestPermission = useCallback(async () => {
    setInternalError(null); // escape any prior sticky local error — this is the retry path
    setInternalState('requesting_permission');
    try {
      const preset = QualityPresets[selectedQualityRef.current];
      await mediaCapture.open({
        facingMode: selectedFacingModeRef.current,
        deviceId: selectedCameraRef.current ?? undefined,
        audio: true,
        width: preset.width,
        height: preset.height,
        frameRate: preset.frameRate,
        audioDeviceId: selectedMicRef.current ?? undefined,
      });
      setInternalState('ready');
    } catch {
      setInternalState('error');
    }
  }, [mediaCapture]);

  const stopRecordingInternal = useCallback(async () => {
    clearTimer();

    try {
      const blob = await mediaCapture.stopRecording();
      
      // Run plugin lifecycle
      const metadata = {
        duration: elapsedSeconds,
        width: 0, // Will be extracted by useVideoMetadata
        height: 0,
        size: blob.size,
        mimeType: blob.type || 'video/webm',
      };
      const processedBlob = await pluginManager.runAfterRecording(blob, metadata);

      const url = URL.createObjectURL(processedBlob);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setRecordedBlob(processedBlob);
      setInternalState('preview');

      RecorderLogger.info('Recording stopped, preview ready');
    } catch (err) {
      RecorderLogger.error('Stop recording failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      setInternalError({
        type: 'recording_failed',
        message: 'Could not finish the recording. Please try again.',
        originalError: err,
      });
      setInternalState('error');
    }
  }, [clearTimer, mediaCapture, elapsedSeconds]);

  const startRecordingInternal = useCallback(() => {
    releasePreview();
    setElapsedSeconds(0);

    try {
      const preset = QualityPresets[selectedQualityRef.current];
      mediaCapture.startRecording({
        videoBitsPerSecond: preset.videoBitsPerSecond,
        audioBitsPerSecond: RecorderLimits.AUDIO_BITS_PER_SECOND,
      });
      setInternalState('recording');
      RecorderLogger.info('Recording started');

      // Start elapsed timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setElapsedSeconds(seconds);

        // Auto-stop at max duration
        if (seconds >= RecorderLimits.MAX_DURATION_SECONDS) {
          RecorderLogger.info('Max duration reached, auto-stopping');
          void stopRecordingInternal();
        }
      }, 1000);
    } catch (err) {
       RecorderLogger.error('Failed to start recording', {
         error: err instanceof Error ? err.message : String(err),
       });
       setInternalError({
         type: 'recording_failed',
         message: 'Could not start recording. Please try again.',
         originalError: err,
       });
       setInternalState('error');
    }
  }, [mediaCapture, releasePreview, stopRecordingInternal]);

  const startCountdown = useCallback(() => {
    if (derivedState !== 'ready') return;
    clearCountdown();

    setInternalState('countdown');
    let count = RecorderLimits.COUNTDOWN_SECONDS;
    setCountdownValue(count);

    RecorderLogger.info('Countdown started');

    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearCountdown();
        // Start actual recording
        startRecordingInternal();
      } else {
        setCountdownValue(count);
      }
    }, 1000);
  }, [derivedState, clearCountdown, startRecordingInternal]);

  const pauseRecording = useCallback(() => {
    mediaCapture.pauseRecording();
    clearTimer();
    setInternalState('paused');
    RecorderLogger.info('Recording paused');
  }, [mediaCapture, clearTimer]);

  const resumeRecording = useCallback(() => {
    mediaCapture.resumeRecording();
    setInternalState('recording');
    RecorderLogger.info('Recording resumed');

    // Resume timer
    let seconds = elapsedSeconds;
    timerRef.current = setInterval(() => {
      seconds += 1;
      setElapsedSeconds(seconds);

      if (seconds >= RecorderLimits.MAX_DURATION_SECONDS) {
        void stopRecordingInternal();
      }
    }, 1000);
  }, [mediaCapture, elapsedSeconds, stopRecordingInternal]);

  const stopRecording = useCallback(() => {
    void stopRecordingInternal();
  }, [stopRecordingInternal]);

  const retake = useCallback(() => {
    RecorderLogger.info('Retake — restarting camera');
    releasePreview();
    setElapsedSeconds(0);
    clearTimer();
    setInternalError(null);
    setInternalState('ready');
  }, [releasePreview, clearTimer]);

  const getRecordedFile = useCallback((): File | null => {
    if (!recordedBlob) return null;
    const name = generateRecordingFileName(recordedBlob.type);
    return blobToFile(recordedBlob, name);
  }, [recordedBlob]);

  const setSelectedCamera = useCallback((id: string | null) => {
    selectedCameraRef.current = id;
  }, []);

  const setSelectedMic = useCallback((id: string | null) => {
    selectedMicRef.current = id;
  }, []);

  const setSelectedQuality = useCallback((q: VideoQuality) => {
    selectedQualityRef.current = q;
  }, []);

  /**
   * Apply the current quality/camera/mic selection to the ALREADY-LIVE camera stream. open()
   * intentionally no-ops when the camera is already READY/OPENING (see MediaCameraController.
   * open()'s guard), so it can't be reused here for a quality, camera, or microphone change —
   * this calls the dedicated reconfigure() operation instead, which mirrors switchCamera()'s
   * proven stop-old-stream-then-get-new pattern.
   *
   * Always resends the FULL current selection set (quality preset + selected camera + selected
   * mic), not just whichever one changed — this is what guarantees a quality change can never
   * silently drop the selected camera/mic and vice versa: every call is "re-derive the whole
   * live-stream configuration from the current refs," not "patch one field."
   *
   * Only acts when the camera is actually 'ready' (derivedState covers READY and SWITCHING as
   * 'ready' — see above). If not ready (idle/requesting_permission/recording/paused/countdown/
   * preview/error), this is a no-op: the caller's _setSelected*() call already persisted the
   * choice, and the next requestPermission() will pick it up. This is the intentional "do not
   * allow device/quality switching during active recording" behavior — recording and paused
   * states are excluded here by construction, not by a separate guard.
   *
   * Overlapping calls are prevented by MediaCameraController.reconfigure()'s own state guard
   * (rejects a second call while already SWITCHING) — no separate lock/queue is introduced here.
   */
  const reconfigureActiveStream = useCallback(async () => {
    if (derivedState !== 'ready') return;
    const preset = QualityPresets[selectedQualityRef.current];
    await mediaCaptureRef.current.reconfigure({
      width: preset.width,
      height: preset.height,
      frameRate: preset.frameRate,
      deviceId: selectedCameraRef.current ?? undefined,
      audioDeviceId: selectedMicRef.current ?? undefined,
      audio: true,
    });
  }, [derivedState]);

  const setSelectedFacingMode = useCallback((mode: 'user' | 'environment') => {
    selectedFacingModeRef.current = mode;
  }, []);

  // Prefer a locally-caught error (start/stop failure) over mediaCapture's — both can only be
  // relevant when derivedState is actually 'error' (see the sticky-error derivation above), and
  // if a local one exists it's from a more specific, more recent, user-facing action.
  let mappedError: RecorderError | null = internalError;
  if (!mappedError && mediaCapture.error) {
     mappedError = { type: 'unknown', message: mediaCapture.error.message, originalError: mediaCapture.error };
  }

  return {
    state: derivedState,
    error: mappedError,
    stream: mediaCapture.stream,
    previewUrl,
    recordedBlob,
    elapsedSeconds,
    countdownValue,
    isReconfiguring,
    open,
    requestPermission,
    startCountdown,
    pauseRecording,
    resumeRecording,
    stopRecording,
    retake,
    reconfigureActiveStream,
    getRecordedFile,
    cleanup,
    // Exposed for companion hooks
    _setSelectedCamera: setSelectedCamera,
    _setSelectedMic: setSelectedMic,
    _setSelectedQuality: setSelectedQuality,
    _setSelectedFacingMode: setSelectedFacingMode,
  };
}
