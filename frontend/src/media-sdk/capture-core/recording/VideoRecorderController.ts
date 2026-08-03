import { SDKError } from "../types";

import type { Emitter } from "../utils/EventEmitter";
import type { SDKEventMap, RecordingState } from "../types";

export class VideoRecorderController {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private destroyed = false;
  private stopResolve: ((blob: Blob) => void) | null = null;
  private recordingStartTime = 0;
  
  constructor(
    private emitter: Emitter<SDKEventMap>
  ) {}

  getState(): RecordingState | "destroyed" {
    if (this.destroyed) return "destroyed";
    if (!this.recorder) return "STOPPED";
    
    switch (this.recorder.state) {
      case "recording": return "RECORDING";
      case "paused": return "PAUSED";
      case "inactive": return "STOPPED";
      default: return "STOPPED";
    }
  }

  isRecording(): boolean {
    return this.getState() === "RECORDING";
  }

  start(stream: MediaStream, options?: string | { mimeType?: string; videoBitsPerSecond?: number; audioBitsPerSecond?: number }): void {
    if (this.destroyed) throw new SDKError("InvalidStateError", "Recorder is destroyed");

    this.chunks = [];

    // Back-compat: allow a bare mimeType string (previous signature) alongside the new options object.
    const resolvedOptions = typeof options === "string" ? { mimeType: options } : (options ?? {});

    // Choose format — codec fallback chain unchanged, Safari-safe (mp4 last resort).
    let targetMimeType = resolvedOptions.mimeType;
    if (!targetMimeType) {
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        targetMimeType = "video/webm;codecs=vp9";
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        targetMimeType = "video/webm";
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        targetMimeType = "video/mp4"; // iOS Safari
      }
    }

    const baseOptions: MediaRecorderOptions = {
      ...(targetMimeType ? { mimeType: targetMimeType } : {}),
    };
    // Bitrate is a request/hint to the encoder, not a guarantee — actual output may vary by browser/codec.
    const optionsWithBitrate: MediaRecorderOptions = {
      ...baseOptions,
      ...(resolvedOptions.videoBitsPerSecond ? { videoBitsPerSecond: resolvedOptions.videoBitsPerSecond } : {}),
      ...(resolvedOptions.audioBitsPerSecond ? { audioBitsPerSecond: resolvedOptions.audioBitsPerSecond } : {}),
    };

    try {
      this.recorder = new MediaRecorder(stream, optionsWithBitrate);
    } catch (err) {
      // Some browsers reject specific bitrate/codec combinations — retry without explicit bitrate
      // rather than failing the recording outright.
      console.warn("VideoRecorderController: MediaRecorder construction with explicit bitrate failed, retrying without it.", err);
      try {
        this.recorder = new MediaRecorder(stream, baseOptions);
      } catch (fallbackErr) {
        throw new SDKError("NotSupportedError", "Failed to create MediaRecorder: " + (fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)));
      }
    }

    this.recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.recorder.onstop = () => {
      const finalMime = this.recorder?.mimeType ?? targetMimeType ?? "video/webm";
      const blob = new Blob(this.chunks, { type: finalMime });
      
      const duration = Date.now() - this.recordingStartTime;
      const file = new File([blob], `recording_${Date.now()}.webm`, { type: finalMime });

      this.emitter.emit("recording.finished", { file, duration });
      
      if (this.stopResolve) {
        this.stopResolve(blob);
        this.stopResolve = null;
      }
    };

    this.recorder.onerror = () => {
      const err = new SDKError("MediaRecorder encountered an error", "RecordingError");
      this.emitter.emit("error", err);
    };

    this.recorder.onpause = () => {
      this.emitter.emit("recording.paused", undefined);
    };

    this.recorder.onresume = () => {
      this.emitter.emit("recording.resumed", undefined);
    };

    this.recorder.start(1000); // progressive chunking
    this.recordingStartTime = Date.now();
    this.emitter.emit("recording.started", undefined);
  }

  pause(): void {
    if (this.destroyed || this.recorder?.state !== "recording") return;
    this.recorder.pause();
  }

  resume(): void {
    if (this.destroyed || this.recorder?.state !== "paused") return;
    this.recorder.resume();
  }

  stop(): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      if (this.destroyed || !this.recorder) {
        reject(new SDKError("Recorder is not initialized or is destroyed", "InvalidStateError"));
        return;
      }

      if (this.recorder.state === "inactive") {
        const blob = new Blob(this.chunks, { type: this.recorder.mimeType || "video/webm" });
        resolve(blob);
        return;
      }

      this.stopResolve = resolve;
      this.recorder.stop();
    });
  }

  /**
   * Safely stop and release the current recorder WITHOUT permanently destroying this
   * controller instance. Use this for ordinary session close (camera modal close,
   * unexpected navigation away while recording) where the SAME core/provider instance
   * may go on to open/record again later. Unlike destroy(), this does not set the
   * terminal `destroyed` flag — start() remains usable after reset().
   *
   * If a recording is in progress, MediaRecorder.stop() is called so the browser winds
   * down encoding cleanly (never left running / GC'd out from under it), but the
   * resulting blob is intentionally discarded (handlers are cleared) since a reset is,
   * by definition, an abandoned/superseded session, not a user-requested stop.
   */
  reset(): void {
    if (this.destroyed) return; // terminally destroyed already — nothing to reset

    if (this.recorder && this.recorder.state !== "inactive") {
      try {
        this.recorder.stop();
      } catch {
        // MediaRecorder.stop() should not throw when state is 'recording'/'paused' per
        // spec, but we're tearing down regardless — never let this propagate.
      }
    }

    if (this.recorder) {
      this.recorder.ondataavailable = null;
      this.recorder.onstop = null;
      this.recorder.onerror = null;
      this.recorder.onpause = null;
      this.recorder.onresume = null;
    }

    this.recorder = null;
    this.chunks = [];
    this.stopResolve = null;
  }

  /**
   * Terminal, one-way teardown — after destroy(), start() throws and this instance can
   * never record again. There is no "undestroy".
   *
   * CAUTION: do NOT call this from a plain React `useEffect` cleanup that owns a
   * long-lived instance (e.g. one created via `useState(() => ...)`), even one that only
   * runs "on unmount" in production. Under React StrictMode's dev-only double-invoke
   * (mount -> cleanup -> mount), that cleanup fires once immediately at mount, against the
   * SAME instance the remount will keep using — permanently destroying it before any real
   * use. (This exact bug shipped once: CameraProvider's unmount effect called destroy()
   * here, which silently broke every recording — countdown would complete but
   * MediaRecorder.start() never ran, throwing InvalidStateError instead. Fixed by using
   * reset() there instead, which is safe under the double-invoke since it doesn't set a
   * one-way flag.) Only call destroy() from a context that can guarantee it represents a
   * genuine, final disposal — e.g. explicit application shutdown/teardown logic outside
   * React's render lifecycle, not a component effect cleanup.
   */
  destroy(): void {
    if (this.destroyed) return;
    this.reset();
    this.destroyed = true;
  }
}
