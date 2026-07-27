import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { CameraProvider } from "../capture-react";
import { SharedCameraCapture } from "./SharedCameraCapture";

export interface SharedCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoTaken: (file: File) => void;
  title?: string; // e.g. "Profile Photo", "Upload Certificate"
}

export const SharedCameraModal: React.FC<SharedCameraModalProps> = ({
  isOpen,
  onClose,
  onPhotoTaken,
  title,
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = (blob: Blob) => {
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: blob.type });
    onPhotoTaken(file);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Optional Top Bar */}
      {title && (
        <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <h2 className="text-white text-center font-medium drop-shadow-md">{title}</h2>
        </div>
      )}
      
      {/* Fullscreen Camera Capture Component with Provider */}
      <div className="flex-1 relative w-full h-full">
        <CameraProvider>
          <SharedCameraCapture onCapture={handleCapture} onClose={onClose} />
        </CameraProvider>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
