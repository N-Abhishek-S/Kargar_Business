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
  "camera.closed": void;
  "camera.switched": OnCameraSwitchedPayload;
  "capture.started": void;
  "capture.completed": OnCaptureCompletedPayload;
  "recording.started": void;
  "recording.paused": void;
  "recording.resumed": void;
  "recording.finished": { file: File; duration: number };
  "error": Error;
}

// Explicit Errors
export class SDKError extends Error {
  constructor(message: string, name?: string) {
    super(message);
    this.name = name || "SDKError";
  }
}

export class PermissionDeniedError extends SDKError {
  constructor(message: string = "Camera permission denied.") {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

export class CameraNotFoundError extends SDKError {
  constructor(message: string = "No suitable camera found.") {
    super(message);
    this.name = "CameraNotFoundError";
  }
}

export class DeviceBusyError extends SDKError {
  constructor(message: string = "Camera is currently in use by another application.") {
    super(message);
    this.name = "DeviceBusyError";
  }
}

export class ConstraintError extends SDKError {
  constructor(message: string = "Could not satisfy camera constraints.") {
    super(message);
    this.name = "ConstraintError";
  }
}
