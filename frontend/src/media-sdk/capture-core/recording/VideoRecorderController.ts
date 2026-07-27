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

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.recorder && this.recorder.state !== "inactive") {
      try {
        this.recorder.stop();
      } catch {
        // Ignored
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
