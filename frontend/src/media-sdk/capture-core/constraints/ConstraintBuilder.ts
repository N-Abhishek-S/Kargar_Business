import type { FacingMode } from "../types";
import type { CameraCapabilityService } from "../services/CameraCapabilityService";
import type { CameraConfig } from "../config/camera.config";

export interface BuildConstraintsOptions {
  facingMode?: FacingMode;
  deviceId?: string;
  config: CameraConfig;
  audio?: boolean;
  /** Optional ideal resolution/framerate override (e.g. from a recording quality preset). Falls back to config.maxWidth/maxHeight when omitted — existing consumers (photo capture) are unaffected. */
  width?: number;
  height?: number;
  frameRate?: number;
  /** Optional specific microphone device — ideal (not exact), so an unavailable mic degrades gracefully to the default rather than failing the whole getUserMedia call. */
  audioDeviceId?: string;
}

export class ConstraintBuilder {
  constructor(private capabilityService: CameraCapabilityService) {}

  /**
   * Dynamically constructs the ideal constraints based on platform,
   * requested facing mode, or specific device ID.
   */
  build(options: BuildConstraintsOptions): MediaStreamConstraints {
    const isMobile = this.capabilityService.isMobileDevice();

    const videoConstraints: MediaTrackConstraints = {
      width: { ideal: options.width ?? options.config.maxWidth },
      height: { ideal: options.height ?? options.config.maxHeight },
    };

    if (options.frameRate) {
      videoConstraints.frameRate = { ideal: options.frameRate };
    }

    if (isMobile) {
      // Mobile: Strictly default to environment camera.
      // Ignore deviceId during initial mobile camera selection to prevent overriding.
      const targetMode = options.facingMode ?? "environment";
      videoConstraints.facingMode = { ideal: targetMode };
    } else {
      // Desktop: Prefer deviceId. Users expect to switch to specific USB/Virtual webcams
      if (options.deviceId && options.deviceId !== "default") {
        videoConstraints.deviceId = { exact: options.deviceId };
      } else {
        // Fallback for desktop when no specific device is chosen
        videoConstraints.facingMode = options.facingMode ?? "user";
      }
    }

    const audioConstraints: boolean | MediaTrackConstraints = options.audioDeviceId
      ? { deviceId: { ideal: options.audioDeviceId } }
      : (options.audio ?? false);

    return {
      audio: audioConstraints,
      video: videoConstraints,
    };
  }
}
