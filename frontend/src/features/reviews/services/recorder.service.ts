/**
 * Video Recorder — Recorder Service
 *
 * Wraps the MediaRecorder lifecycle. No React dependency.
 * Handles start, pause, resume, stop, and chunk assembly.
 */

import { RecorderLogger } from './logger.service';
import { getSupportedMimeType } from './media.service';
import { RecorderLimits } from '../config/recorder.config';

export interface RecorderServiceOptions {
  /** Override MIME type (auto-negotiated if omitted) */
  mimeType?: string;
  /** Video bitrate in bps */
  videoBitsPerSecond?: number;
  /** Audio bitrate in bps */
  audioBitsPerSecond?: number;
  /** Called with each data chunk */
  onDataAvailable?: (chunk: Blob) => void;
  /** Called when recording stops naturally or via stop() */
  onStop?: (blob: Blob) => void;
  /** Called on recorder error */
  onError?: (error: Event) => void;
  /** Called when paused */
  onPause?: () => void;
  /** Called when resumed */
  onResume?: () => void;
}

export interface RecorderServiceInstance {
  /** Start recording */
  start(): void;
  /** Pause recording */
  pause(): void;
  /** Resume recording */
  resume(): void;
  /** Stop recording — returns the assembled Blob */
  stop(): Promise<Blob>;
  /** Full cleanup: stop + destroy */
  destroy(): void;
  /** Current state */
  getState(): RecordingState | 'destroyed';
}

type RecordingState = 'inactive' | 'recording' | 'paused';

export function createRecorderService(
  stream: MediaStream,
  options: RecorderServiceOptions = {},
): RecorderServiceInstance {
  const mimeType = options.mimeType || getSupportedMimeType();
  const videoBitsPerSecond = options.videoBitsPerSecond ?? RecorderLimits.VIDEO_BITS_PER_SECOND;
  const audioBitsPerSecond = options.audioBitsPerSecond ?? RecorderLimits.AUDIO_BITS_PER_SECOND;

  const recorderOptions: MediaRecorderOptions = {
    ...(mimeType ? { mimeType } : {}),
    videoBitsPerSecond,
    audioBitsPerSecond,
  };

  let recorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let destroyed = false;

  // Deferred stop resolution
  let stopResolve: ((blob: Blob) => void) | null = null;

  try {
    recorder = new MediaRecorder(stream, recorderOptions);
  } catch (err) {
    RecorderLogger.error('Failed to create MediaRecorder', {
      mimeType,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }

  RecorderLogger.info('MediaRecorder created', {
    mimeType: recorder.mimeType,
    videoBitsPerSecond,
    audioBitsPerSecond,
    state: recorder.state,
  });

  // Wire up events
  recorder.ondataavailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
      options.onDataAvailable?.(event.data);
    }
  };

  recorder.onstop = () => {
    const finalMime = recorder?.mimeType || mimeType || 'video/webm';
    const blob = new Blob(chunks, { type: finalMime });
    RecorderLogger.info('Recording stopped', {
      chunks: chunks.length,
      size: blob.size,
      type: blob.type,
    });

    options.onStop?.(blob);
    stopResolve?.(blob);
    stopResolve = null;
  };

  recorder.onerror = (event: Event) => {
    RecorderLogger.error('MediaRecorder error', {
      error: (event as ErrorEvent).message ?? 'Unknown',
    });
    options.onError?.(event);
  };

  recorder.onpause = () => {
    RecorderLogger.info('Recording paused');
    options.onPause?.();
  };

  recorder.onresume = () => {
    RecorderLogger.info('Recording resumed');
    options.onResume?.();
  };

  return {
    start() {
      if (destroyed || !recorder) return;
      chunks = [];
      // Request data every 1 second for progressive chunk collection
      recorder.start(1000);
      RecorderLogger.info('Recording started');
    },

    pause() {
      if (destroyed || !recorder || recorder.state !== 'recording') return;
      recorder.pause();
    },

    resume() {
      if (destroyed || !recorder || recorder.state !== 'paused') return;
      recorder.resume();
    },

    stop(): Promise<Blob> {
      return new Promise<Blob>((resolve, reject) => {
        if (destroyed || !recorder) {
          reject(new Error('Recorder is destroyed'));
          return;
        }

        if (recorder.state === 'inactive') {
          // Already stopped — assemble from existing chunks
          const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
          resolve(blob);
          return;
        }

        stopResolve = resolve;
        recorder.stop();
      });
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;

      if (recorder && recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          // Already stopped
        }
      }

      // Clear references
      if (recorder) {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.onerror = null;
        recorder.onpause = null;
        recorder.onresume = null;
      }
      recorder = null;
      chunks = [];
      stopResolve = null;

      RecorderLogger.info('Recorder destroyed');
    },

    getState(): RecordingState | 'destroyed' {
      if (destroyed) return 'destroyed';
      return (recorder?.state as RecordingState) ?? 'inactive';
    },
  };
}
