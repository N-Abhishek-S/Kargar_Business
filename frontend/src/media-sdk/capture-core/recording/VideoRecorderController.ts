import { SDKError } from "../types";
import { CameraConfig } from "../config/camera.config";
import type { Emitter } from "../utils/EventEmitter";
import type { SDKEventMap } from "../types";

export type RecordingState = "inactive" | "recording" | "paused";

export class VideoRecorderController {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private destroyed = false;
  private stopResolve: ((blob: Blob) => void) | null = null;
  
  constructor(
    private emitter: Emitter<SDKEventMap>,
    private config: CameraConfig
  ) {}

  getState(): RecordingState | "destroyed" {
    if (this.destroyed) return "destroyed";
    return (this.recorder?.state as RecordingState) ?? "inactive";
  }

  isRecording(): boolean {
    return this.getState() === "recording";
  }

  start(stream: MediaStream, mimeType?: string): void {
    if (this.destroyed) throw new SDKError("InvalidStateError", "Recorder is destroyed");
    
    this.chunks = [];
    
    // Choose format
    let targetMimeType = mimeType;
    if (!targetMimeType) {
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        targetMimeType = "video/webm;codecs=vp9";
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        targetMimeType = "video/webm";
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        targetMimeType = "video/mp4"; // iOS Safari
      }
    }

    try {
      this.recorder = new MediaRecorder(stream, {
        ...(targetMimeType ? { mimeType: targetMimeType } : {}),
      });
    } catch (err) {
      throw new SDKError("NotSupportedError", "Failed to create MediaRecorder: " + (err instanceof Error ? err.message : String(err)));
    }

    this.recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.recorder.onstop = () => {
      const finalMime = this.recorder?.mimeType || targetMimeType || "video/webm";
      const blob = new Blob(this.chunks, { type: finalMime });
      
      this.emitter.emit("recording.stopped", { blob });
      
      if (this.stopResolve) {
        this.stopResolve(blob);
        this.stopResolve = null;
      }
    };

    this.recorder.onerror = (event: Event) => {
      const err = new SDKError("RecordingError", "MediaRecorder encountered an error");
      this.emitter.emit("error", err);
    };

    this.recorder.onpause = () => {
      this.emitter.emit("recording.paused", undefined as any);
    };

    this.recorder.onresume = () => {
      this.emitter.emit("recording.resumed", undefined as any);
    };

    this.recorder.start(1000); // progressive chunking
    this.emitter.emit("recording.started", undefined as any);
  }

  pause(): void {
    if (this.destroyed || !this.recorder || this.recorder.state !== "recording") return;
    this.recorder.pause();
  }

  resume(): void {
    if (this.destroyed || !this.recorder || this.recorder.state !== "paused") return;
    this.recorder.resume();
  }

  stop(): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      if (this.destroyed || !this.recorder) {
        reject(new SDKError("InvalidStateError", "Recorder is not initialized or is destroyed"));
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

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.recorder && this.recorder.state !== "inactive") {
      try {
        this.recorder.stop();
      } catch (e) {
        // ignore
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
}
