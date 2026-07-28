export type FacingMode = "user" | "environment";

export type CameraState = "IDLE" | "OPENING" | "READY" | "SWITCHING" | "CLOSING" | "ERROR";
export type RecordingState = "STOPPED" | "RECORDING" | "PAUSED" | "STOPPING" | "ERROR";

export interface CameraSession {
  stream: MediaStream;
  deviceId: string;
  facingMode: FacingMode;
  startedAt: number;
  permissionState: "granted" | "prompt" | "denied";
  cameraLabel: string;
  platform: string; // 'ios', 'android', 'desktop'
}

// Analytics Event Payloads
export interface OnCameraOpenedPayload {
  camera: FacingMode;
  deviceId: string;
  browser: string;
  platform: string;
  durationMs?: number;
}

export interface OnCameraSwitchedPayload {
  from: FacingMode;
  to: FacingMode;
}

export interface OnCaptureCompletedPayload {
  duration: number; // ms taken to capture
  size: number; // bytes
  width: number;
  height: number;
}

// Public Event Bus Map
export interface SDKEventMap {
  "camera.opened": OnCameraOpenedPayload;
  "camera.closed": undefined;
  "camera.switched": OnCameraSwitchedPayload;
  "capture.started": undefined;
  "capture.completed": OnCaptureCompletedPayload;
  "recording.started": undefined;
  "recording.paused": undefined;
  "recording.resumed": undefined;
  "recording.finished": { file: File; duration: number };
  "error": Error;
  "transition.failed": { from: string; to: string; reason?: string | null };
  [key: string]: unknown;
}

// Explicit Errors
export class SDKError extends Error {
  constructor(message: string, name?: string) {
    super(message);
    this.name = name ?? "SDKError";
  }
}

export class PermissionDeniedError extends SDKError {
  constructor(message = "Camera permission denied.") {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

export class CameraNotFoundError extends SDKError {
  constructor(message = "No suitable camera found.") {
    super(message);
    this.name = "CameraNotFoundError";
  }
}

export class DeviceBusyError extends SDKError {
  constructor(message = "Camera is currently in use by another application.") {
    super(message);
    this.name = "DeviceBusyError";
  }
}

export class ConstraintError extends SDKError {
  constructor(message = "Could not satisfy camera constraints.") {
    super(message);
    this.name = "ConstraintError";
  }
}
