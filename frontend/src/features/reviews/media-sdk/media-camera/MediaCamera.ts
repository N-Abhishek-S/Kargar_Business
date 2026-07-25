/**
 * MediaCamera handles device streams and actual frame capture.
 */

import { capabilityService } from '../core/capabilities/CapabilityService';

export type CaptureMode = 'single' | 'burst' | 'document' | 'square' | 'landscape';

export interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: { ideal: number; max?: number };
  height?: { ideal: number; max?: number };
}

export class MediaCamera {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement;
  
  constructor() {
    this.videoElement = document.createElement('video');
    this.videoElement.autoplay = true;
    this.videoElement.playsInline = true;
    this.videoElement.muted = true;
  }

  public async start(options: CameraOptions = {}): Promise<MediaStream> {
    this.stop(); // Ensure any existing stream is cleaned up first
    
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: options.facingMode ?? 'user',
        width: options.width,
        height: options.height,
      },
      audio: false
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.videoElement.srcObject = this.stream;
    
    // Wait for video to be ready
    await new Promise<void>((resolve) => {
      this.videoElement.onloadedmetadata = () => {
        resolve();
      };
    });
    
    await this.videoElement.play();
    
    // Detect capabilities
    const track = this.stream.getVideoTracks()[0];
    if (track) {
      capabilityService.detectCapabilities(track);
    }

    return this.stream;
  }

  public stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => { track.stop(); });
      this.stream = null;
    }
    this.videoElement.srcObject = null;
    this.videoElement.pause();
  }

  public async setTorch(enabled: boolean): Promise<boolean> {
    if (!this.stream) return false;
    const track = this.stream.getVideoTracks()[0];
    if (!track || !capabilityService.current.hasTorch) return false;

    try {
      await track.applyConstraints({
        advanced: [{ torch: enabled } as unknown as MediaTrackConstraintSet]
      });
      return true;
    } catch (err) {
      console.error('Failed to toggle torch:', err);
      return false;
    }
  }

  public async captureFrame(): Promise<ImageBitmap> {
    if (!this.stream || this.videoElement.readyState < 2) {
      throw new Error('Camera is not ready');
    }

    // Canvas-first pipeline strategy: we capture directly to an ImageBitmap
    // which is highly efficient and off-thread ready.
    return createImageBitmap(this.videoElement);
  }
  
  public getVideoElement(): HTMLVideoElement {
    return this.videoElement;
  }
}

export const mediaCamera = new MediaCamera();
