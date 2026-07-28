import { PermissionDeniedError, SDKError } from "../types";

export class PermissionService {
  /**
   * Request basic camera permission.
   *
   * Uses the Permissions API when available to avoid creating a throwaway
   * MediaStream. Falls back to a real getUserMedia call on browsers that
   * do not expose `permissions.query` for the camera (e.g. older Safari).
   */
  async requestCameraPermission(): Promise<void> {
    // Fast-path: check via Permissions API (no stream created)
    const queryResult = await this.checkCameraPermission();
    if (queryResult === "granted") {
      return; // Permission already granted — skip getUserMedia entirely
    }
    if (queryResult === "denied") {
      throw new PermissionDeniedError();
    }

    // Slow-path: "prompt" or unknown — must call getUserMedia to trigger the prompt
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Immediately stop the tracks since we only wanted permission
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          throw new PermissionDeniedError();
        }
        throw new SDKError(`Failed to request camera permission: ${error.message}`);
      }
      throw new SDKError("Failed to request camera permission: Unknown error");
    }
  }

  /**
   * Check if permissions are granted without prompting (if supported)
   */
  async checkCameraPermission(): Promise<"granted" | "prompt" | "denied"> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!navigator.permissions.query) {
      // Fallback for browsers that don't support permissions.query for camera (e.g., Firefox, Safari)
      return "prompt";
    }

    try {
      const status = await navigator.permissions.query({ name: "camera" });
      return status.state;
    } catch {
      // Some browsers throw if 'camera' is not a supported permission name
      return "prompt";
    }
  }
}
