/**
 * CapabilityService detects browser and device support for advanced camera features.
 */

export interface CameraCapabilities {
  hasImageCapture: boolean;
  hasTorch: boolean;
  hasZoom: boolean;
  hasFocus: boolean;
  hasFacingMode: boolean;
  canvasSupported: boolean;
}

export class CapabilityService {
  private capabilities: Partial<CameraCapabilities> = {};

  public detectCapabilities(track?: MediaStreamTrack): CameraCapabilities {
    const isImageCaptureSupported = 'ImageCapture' in window;
    
    // Default canvas support
    const canvasSupported = typeof HTMLCanvasElement !== 'undefined';

    let hasTorch = false;
    let hasZoom = false;
    let hasFocus = false;
    let hasFacingMode = false;

    if (track) {
      const typedTrack = track as MediaStreamTrack & { getCapabilities?: () => MediaTrackCapabilities };
      if (typeof typedTrack.getCapabilities === 'function') {
        try {
          const caps = typedTrack.getCapabilities();
          hasTorch = 'torch' in caps;
          hasZoom = 'zoom' in caps;
          hasFocus = 'focusMode' in caps || 'focusDistance' in caps;
          hasFacingMode = 'facingMode' in caps;
        } catch (err) {
          console.warn('Failed to read track capabilities:', err);
        }
      }
    }

    this.capabilities = {
      hasImageCapture: isImageCaptureSupported,
      hasTorch,
      hasZoom,
      hasFocus,
      hasFacingMode,
      canvasSupported
    };

    return this.capabilities as CameraCapabilities;
  }

  public get current(): Partial<CameraCapabilities> {
    return this.capabilities;
  }
}

export const capabilityService = new CapabilityService();
