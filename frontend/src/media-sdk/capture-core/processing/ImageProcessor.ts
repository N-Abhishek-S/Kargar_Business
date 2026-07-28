import type { CameraConfig } from "../config/camera.config";
import type { FacingMode } from "../types";

export class ImageProcessor {
  constructor(private config: CameraConfig) {}

  /**
   * Captures a frame from a video element, applies the strict mirroring rules,
   * and returns a Blob.
   * 
   * Strict Mirroring Rules:
   * - Front Camera: Preview is mirrored, Output is NORMAL (unmirrored).
   * - Rear Camera: Preview is NORMAL, Output is NORMAL.
   * 
   * Note: If the user explicitly wants mirrored output (e.g. they prefer selfie mode),
   * this can be configured in cameraConfig, but default is false.
   */
  async capture(videoElement: HTMLVideoElement, facingMode: FacingMode): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (videoElement.readyState < videoElement.HAVE_CURRENT_DATA) {
        reject(new Error(`Video is not ready for capture (readyState: ${videoElement.readyState})`)); return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get 2d context for canvas")); return;
      }

      // 1. Determine Dimensions (respecting config max limits but preserving aspect ratio)
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;
      const aspect = videoWidth / videoHeight;

      let targetWidth = videoWidth;
      let targetHeight = videoHeight;

      if (targetWidth > this.config.maxWidth) {
        targetWidth = this.config.maxWidth;
        targetHeight = targetWidth / aspect;
      }
      if (targetHeight > this.config.maxHeight) {
        targetHeight = this.config.maxHeight;
        targetWidth = targetHeight * aspect;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // 2. Mirror Correction
      // Front cameras typically show a mirrored preview via CSS (`transform: scaleX(-1)`).
      // However, drawing the video to a canvas draws the RAW, un-CSS-transformed pixels.
      // Usually, raw front camera frames are NOT mirrored, so we don't need to mirror the canvas
      // unless we explicitly want a mirrored output.
      
      // Let's implement the standard: text should be readable.
      // We assume raw frames from `getUserMedia` are never mirrored in the data stream itself.
      // Therefore, direct drawImage produces a standard, un-mirrored photo.
      
      let shouldMirror = false;
      if (facingMode === "user" && this.config.mirrorCapturedImage) {
        shouldMirror = true; // explicitly request mirrored output
      }

      if (shouldMirror) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      // 3. Draw Frame
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Restore context
      if (shouldMirror) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }

      // 4. Compression and Blob generation
      const format = this.config.imageFormat;
      const quality = this.config.enableCompression ? this.config.imageQuality : 1.0;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Blob generation failed"));
          }
        },
        format,
        quality
      );
    });
  }
}
