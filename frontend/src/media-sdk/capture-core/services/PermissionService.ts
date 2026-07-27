import { PermissionDeniedError, SDKError } from "../types";

export class PermissionService {
  /**
   * Request basic camera permission
   */
  async requestCameraPermission(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Immediately stop the tracks since we only wanted permission
      stream.getTracks().forEach((track) => track.stop());
    } catch (error: any) {
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        throw new PermissionDeniedError();
      }
      throw new SDKError(`Failed to request camera permission: ${error.message}`);
    }
  }

  /**
   * Check if permissions are granted without prompting (if supported)
   */
  async checkCameraPermission(): Promise<"granted" | "prompt" | "denied"> {
    if (!navigator.permissions || !navigator.permissions.query) {
      // Fallback for browsers that don't support permissions.query for camera (e.g., Firefox, Safari)
      return "prompt";
    }

    try {
      const status = await navigator.permissions.query({ name: "camera" as PermissionName });
      return status.state;
    } catch (e) {
      // Some browsers throw if 'camera' is not a supported permission name
      return "prompt";
    }
  }
}
