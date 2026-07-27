import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  RecorderState,
  RecorderError,
  UseVideoRecorderReturn,
  VideoQuality
} from '../types/video-recorder.types';
import { RecorderLimits } from '../config/recorder.config';
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
  
  /* ---- State ---- */
  const [internalState, setInternalState] = useState<RecorderState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  
  // Deriving state
  let derivedState = internalState;
  if (internalState !== 'countdown' && internalState !== 'preview') {
      const isRecording = mediaCapture.recordingState === 'RECORDING';
      const isPaused = mediaCapture.recordingState === 'PAUSED';
      if (mediaCapture.error) derivedState = 'error';
      else if (isRecording) derivedState = 'recording';
      else if (isPaused) derivedState = 'paused';
      else if (mediaCapture.state === 'READY') derivedState = 'ready';
      else if (mediaCapture.state === 'OPENING') derivedState = 'requesting_permission';
      else derivedState = 'idle';
  }

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

  /** Full cleanup — called on unmount and when modal closes */
  const cleanup = useCallback(() => {
    RecorderLogger.info('Full cleanup');
    clearTimer();
    clearCountdown();
    releasePreview();
    setElapsedSeconds(0);
    setInternalState('idle');
    mediaCapture.close();
  }, [clearTimer, clearCountdown, releasePreview, mediaCapture]);

  /* ---- Cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      clearTimer();
      clearCountdown();
      releasePreview();
    };
  }, [clearTimer, clearCountdown, releasePreview]);

  /* ---- Actions ---- */

  const open = useCallback(() => {
    setInternalState('idle');
  }, []);

  const requestPermission = useCallback(async () => {
    setInternalState('requesting_permission');
    try {
      await mediaCapture.open({
        facingMode: selectedFacingModeRef.current,
        deviceId: selectedCameraRef.current || undefined,
        audio: true
      });
      setInternalState('ready');
    } catch (err) {
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
      setInternalState('error');
    }
  }, [clearTimer, mediaCapture, elapsedSeconds]);

  const startRecordingInternal = useCallback(() => {
    releasePreview();
    setElapsedSeconds(0);

    try {
      mediaCapture.startRecording();
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
          stopRecordingInternal();
        }
      }, 1000);
    } catch (e) {
       RecorderLogger.error('Failed to start recording');
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
        stopRecordingInternal();
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

  const setSelectedFacingMode = useCallback((mode: 'user' | 'environment') => {
    selectedFacingModeRef.current = mode;
  }, []);

  let mappedError: RecorderError | null = null;
  if (mediaCapture.error) {
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
    open,
    requestPermission,
    startCountdown,
    pauseRecording,
    resumeRecording,
    stopRecording,
    retake,
    getRecordedFile,
    cleanup,
    // Exposed for companion hooks
    _setSelectedCamera: setSelectedCamera,
    _setSelectedMic: setSelectedMic,
    _setSelectedQuality: setSelectedQuality,
    _setSelectedFacingMode: setSelectedFacingMode,
  };
}
