import React, { useEffect, useRef } from "react";
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
  const { open, close, switchCamera, capturePhoto, state, devices } = useMediaCapture();
  const videoRef = useRef<HTMLVideoElement>(null);

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

    initCamera();

    return () => {
      mounted = false;
      close();
    };
  }, [open, close]);

  const handleCapture = async () => {
    if (state !== "READY" || !videoRef.current) return;
    try {
      const blob = await capturePhoto(videoRef.current);
      onCapture(blob);
    } catch (e) {
      console.error("Capture failed:", e);
    }
  };

  const handleSwitch = async () => {
    try {
      await switchCamera();
    } catch (e) {
      console.error("Switch failed:", e);
    }
  };

  // Allow switching if we have more than 1 device. Mobile might hide it if capability service thinks there's only 1.
  const canSwitch = devices.cameras.length > 1;

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
