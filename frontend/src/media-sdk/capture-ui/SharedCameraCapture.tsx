import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMediaCapture } from "../capture-react";
import { CameraPreview } from "./CameraPreview";
import { CameraControls } from "./CameraControls";

export interface SharedCameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
  className?: string;
}

export const SharedCameraCapture: React.FC<SharedCameraCaptureProps> = ({
  onCapture,
  onClose,
  className = "",
}) => {
  const { open, switchCamera, capturePhoto, state, devices } = useMediaCapture();
  const videoRef = useRef<HTMLVideoElement>(null);

  /** Captured photo state for the "Use Photo" / "Retake" confirmation step */
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);

  // Automatically open the camera when mounted
  useEffect(() => {
    let mounted = true;
    const initCamera = async () => {
      try {
        if (mounted) {
          // Defaults are handled by the constraint builder
          await open();
        }
      } catch (err) {
        console.error("Camera open failed:", err);
      }
    };

    void initCamera();

    return () => {
      mounted = false;
    };
  }, [open]);

  // Clean up preview URL when component unmounts or captured blob changes
  useEffect(() => {
    return () => {
      if (capturedPreviewUrl) {
        URL.revokeObjectURL(capturedPreviewUrl);
      }
    };
  }, [capturedPreviewUrl]);

  const handleCapture = useCallback(async () => {
    if (state !== "READY" || !videoRef.current) return;
    try {
      const blob = await capturePhoto(videoRef.current);
      const url = URL.createObjectURL(blob);
      setCapturedBlob(blob);
      setCapturedPreviewUrl(url);
    } catch (e) {
      console.error("Capture failed:", e);
    }
  }, [state, capturePhoto]);

  const handleRetake = useCallback(() => {
    if (capturedPreviewUrl) {
      URL.revokeObjectURL(capturedPreviewUrl);
    }
    setCapturedBlob(null);
    setCapturedPreviewUrl(null);
  }, [capturedPreviewUrl]);

  const handleUsePhoto = useCallback(() => {
    if (capturedBlob) {
      onCapture(capturedBlob);
    }
  }, [capturedBlob, onCapture]);

  const handleSwitch = useCallback(async () => {
    try {
      await switchCamera();
    } catch (e) {
      console.error("Switch failed:", e);
    }
  }, [switchCamera]);

  // Allow switching if we have more than 1 device
  const canSwitch = devices.cameras.length > 1;

  // If a photo has been captured, show the confirmation UI
  if (capturedBlob && capturedPreviewUrl) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {/* Captured photo preview */}
        <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
          <img
            src={capturedPreviewUrl}
            alt="Captured photo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Confirmation controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
          <button
            type="button"
            onClick={handleRetake}
            className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-sm font-semibold transition-all duration-200 border border-white/20"
          >
            Retake
          </button>
          <button
            type="button"
            onClick={handleUsePhoto}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-orange-500/30"
          >
            Use Photo
          </button>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white transition-all duration-200 z-10"
          aria-label="Close camera"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  // Live camera view with capture controls
  return (
    <div className={`relative w-full h-full ${className}`}>
      <CameraPreview ref={videoRef} className="absolute inset-0" />
      <CameraControls
        onCapture={handleCapture}
        onSwitch={handleSwitch}
        onClose={onClose}
        canSwitch={canSwitch}
        disabled={state !== "READY"}
      />
    </div>
  );
};
