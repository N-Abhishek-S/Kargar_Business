export * from "./types";
export * from "./version";
export * from "./config/camera.config";
export * from "./utils/EventEmitter";

// Expose main controllers and services needed by UI Adapters
export * from './camera/MediaCameraController';
export * from './camera/BrowserAdapter';
export * from './recording/VideoRecorderController';
export { ImageProcessor } from "./processing/ImageProcessor";
export { PermissionService } from "./services/PermissionService";
export { MediaDeviceService } from "./services/MediaDeviceService";
export { CameraCapabilityService } from "./services/CameraCapabilityService";
export { ConstraintBuilder } from "./constraints/ConstraintBuilder";
