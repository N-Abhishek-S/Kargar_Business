/**
 * Video Recorder — Main Orchestrator Hook
 *
 * Manages the full recording state machine, coordinates between
 * MediaService, RecorderService, and PluginManager.
 *
 * State machine:
 *   idle → requesting_permission → ready → countdown → recording ⇄ paused → stopped → preview
 *   Any state → error
 *   preview → retake → ready
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  RecorderState,
  RecorderError,
  UseVideoRecorderReturn,
} from '../types/video-recorder.types';
import { RecorderLimits } from '../config/recorder.config';
import { getStream, stopStream, classifyMediaError, getSupportedMimeType } from '../services/media.service';
import { createRecorderService, type RecorderServiceInstance } from '../services/recorder.service';
import { pluginManager } from '../services/plugin.service';
import { RecorderLogger } from '../services/logger.service';
import { blobToFile, generateRecordingFileName, safeRevokeObjectURL } from '../utils/video-recorder.utils';
import { buildConstraints } from '../utils/quality-presets.utils';
import type { VideoQuality } from '../types/video-recorder.types';

export function useVideoRecorder(): UseVideoRecorderReturn {
  /* ---- State ---- */
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<RecorderError | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  /* ---- Refs (no re-renders) ---- */
  const recorderRef = useRef<RecorderServiceInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  /* ---- Device selection state (for external hooks to set) ---- */
  const selectedCameraRef = useRef<string | null>(null);
  const selectedMicRef = useRef<string | null>(null);
  const selectedQualityRef = useRef<VideoQuality>('720p');

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

  const releaseStream = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    setStream(null);
  }, []);

  const releasePreview = useCallback(() => {
    safeRevokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setRecordedBlob(null);
  }, []);

  const destroyRecorder = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.destroy();
      recorderRef.current = null;
    }
  }, []);

  /** Full cleanup — called on unmount and when modal closes */
  const cleanup = useCallback(() => {
    RecorderLogger.info('Full cleanup');
    clearTimer();
    clearCountdown();
    destroyRecorder();
    releaseStream();
    releasePreview();
    setElapsedSeconds(0);
    setError(null);
    setState('idle');
  }, [clearTimer, clearCountdown, destroyRecorder, releaseStream, releasePreview]);

  /* ---- Cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      clearTimer();
      clearCountdown();
      destroyRecorder();
      stopStream(streamRef.current);
      safeRevokeObjectURL(previewUrlRef.current);
    };
  }, [clearTimer, clearCountdown, destroyRecorder]);

  /* ---- Actions ---- */

  const open = useCallback(() => {
    setState('idle');
    setError(null);
  }, []);

  const requestPermission = useCallback(async () => {
    setState('requesting_permission');
    setError(null);

    try {
      const constraints = buildConstraints(
        selectedQualityRef.current,
        selectedCameraRef.current,
        selectedMicRef.current,
      );

      RecorderLogger.info('Requesting camera/mic permission');
      const mediaStream = await getStream(constraints);

      // Run plugin lifecycle
      const processedStream = await pluginManager.runBeforeRecording(mediaStream);

      streamRef.current = processedStream;
      setStream(processedStream);
      setState('ready');
      RecorderLogger.info('Permission granted, ready to record');
    } catch (err) {
      const classified = classifyMediaError(err);
      RecorderLogger.error('Permission/stream error', {
        type: classified.type,
        message: classified.message,
      });
      setError(classified);
      setState('error');
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (state !== 'ready') return;
    clearCountdown();

    setState('countdown');
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, clearCountdown]);

  const startRecordingInternal = useCallback(() => {
    if (!streamRef.current) return;

    destroyRecorder();
    releasePreview();
    setElapsedSeconds(0);

    const mimeType = getSupportedMimeType();

    const recorder = createRecorderService(streamRef.current, { mimeType });
    recorderRef.current = recorder;
    recorder.start();
    setState('recording');

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
  }, [destroyRecorder, releasePreview]);

  const stopRecordingInternal = useCallback(async () => {
    clearTimer();

    if (!recorderRef.current) return;

    try {
      const blob = await recorderRef.current.stop();
      destroyRecorder();

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
      setState('preview');

      RecorderLogger.info('Recording stopped, preview ready', {
        size: processedBlob.size,
        type: processedBlob.type,
      });
    } catch (err) {
      RecorderLogger.error('Stop recording failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      setError({
        type: 'recording_failed',
        message: 'Failed to finalize recording.',
        originalError: err,
      });
      setState('error');
    }
  }, [clearTimer, destroyRecorder, elapsedSeconds]);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current?.getState() === 'recording') {
      recorderRef.current.pause();
      clearTimer();
      setState('paused');
      RecorderLogger.info('Recording paused');
    }
  }, [clearTimer]);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current?.getState() === 'paused') {
      recorderRef.current.resume();
      setState('recording');
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
    }
  }, [elapsedSeconds, stopRecordingInternal]);

  const stopRecording = useCallback(() => {
    void stopRecordingInternal();
  }, [stopRecordingInternal]);

  const retake = useCallback(() => {
    RecorderLogger.info('Retake — restarting camera');
    destroyRecorder();
    releasePreview();
    setElapsedSeconds(0);
    clearTimer();
    // Don't release stream — camera stays on
    setState('ready');
  }, [destroyRecorder, releasePreview, clearTimer]);

  const getRecordedFile = useCallback((): File | null => {
    if (!recordedBlob) return null;
    const name = generateRecordingFileName(recordedBlob.type);
    return blobToFile(recordedBlob, name);
  }, [recordedBlob]);

  /* ---- Public setter for device selection (called by useMediaDevices) ---- */
  const setSelectedCamera = useCallback((id: string | null) => {
    selectedCameraRef.current = id;
  }, []);

  const setSelectedMic = useCallback((id: string | null) => {
    selectedMicRef.current = id;
  }, []);

  const setSelectedQuality = useCallback((q: VideoQuality) => {
    selectedQualityRef.current = q;
  }, []);

  return {
    state,
    error,
    stream,
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
  } as UseVideoRecorderReturn & {
    _setSelectedCamera: (id: string | null) => void;
    _setSelectedMic: (id: string | null) => void;
    _setSelectedQuality: (q: VideoQuality) => void;
  };
}
