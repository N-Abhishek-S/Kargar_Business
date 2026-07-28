import type { FacingMode } from "../types";
import type { CameraCapabilityService } from "../services/CameraCapabilityService";
import type { CameraConfig } from "../config/camera.config";

export interface BuildConstraintsOptions {
  facingMode?: FacingMode;
  deviceId?: string;
  config: CameraConfig;
  audio?: boolean;
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
      width: { ideal: options.config.maxWidth },
      height: { ideal: options.config.maxHeight },
    };

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

    return {
      audio: options.audio ?? false, 
      video: videoConstraints,
    };
  }
}
