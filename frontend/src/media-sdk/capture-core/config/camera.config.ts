export interface CameraConfig {
  mobileDefaultFacingMode: "environment" | "user";
  desktopDefaultDevice: "default";
  imageFormat: "image/jpeg" | "image/webp" | "image/png";
  imageQuality: number;
  maxWidth: number;
  maxHeight: number;
  enableCompression: boolean;
  mirrorFrontPreview: boolean;
  mirrorCapturedImage: boolean;
}

export interface CameraFeatureFlags {
  photoCapture: boolean;
  videoRecording: boolean;
  cameraSwitching: boolean;
  torch: boolean;
  zoom: boolean;
  imageCaptureAPI: boolean;
}

export const defaultConfig: CameraConfig = {
  mobileDefaultFacingMode: "environment", // Strictly required
  desktopDefaultDevice: "default",
  imageFormat: "image/jpeg",
  imageQuality: 0.92,
  maxWidth: 1920,
  maxHeight: 1080,
  enableCompression: true,
  mirrorFrontPreview: true, // Preview is mirrored for selfies
  mirrorCapturedImage: false, // Final image should be normal text
};

export const defaultFeatureFlags: CameraFeatureFlags = {
  photoCapture: true,
  videoRecording: true,
  cameraSwitching: true,
  torch: false,
  zoom: false,
  imageCaptureAPI: true, // Will feature-detect before use
};
