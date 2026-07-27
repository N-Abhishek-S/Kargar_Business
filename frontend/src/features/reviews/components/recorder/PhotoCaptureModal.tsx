import React from 'react';
import { SharedCameraModal } from '../../../../media-sdk/capture-ui';

export interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (bitmap: ImageBitmap) => void;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const handlePhotoTaken = async (file: File) => {
    try {
      const bitmap = await createImageBitmap(file);
      onCapture(bitmap);
    } catch (e) {
      console.error("Failed to convert capture to ImageBitmap", e);
    }
  };

  return (
    <SharedCameraModal
      isOpen={isOpen}
      onClose={onClose}
      onPhotoTaken={handlePhotoTaken}
      title="Take Photo"
    />
  );
};
