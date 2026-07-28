import React, { useState } from 'react';
import { ImageUploadCard, type ImageUploadCardProps } from '../../../components/ui/ImageUploadCard';
import { PhotoCaptureModal } from './recorder/PhotoCaptureModal';

export type ReviewImageFieldProps = Omit<ImageUploadCardProps, 'onTakePhoto'>;

export const ReviewImageField: React.FC<ReviewImageFieldProps> = (props) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleTakePhoto = () => {
    setIsCameraOpen(true);
  };

  const handleCapture = (bitmap: ImageBitmap) => {
    setIsCameraOpen(false);
    
    // Instead of opening ImageEditorModal, we convert directly and upload
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = `photo_${new Date().getTime()}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          props.onChange(file);
        }
        bitmap.close();
      }, 'image/jpeg', 0.85);
    } else {
      bitmap.close();
    }
  };

  return (
    <>
      <ImageUploadCard 
        {...props} 
        onTakePhoto={handleTakePhoto} 
      />

      <PhotoCaptureModal
        isOpen={isCameraOpen}
        onClose={() => { setIsCameraOpen(false); }}
        onCapture={handleCapture}
      />
      {/* 
        ImageEditorModal was here. 
        It has been removed from this flow to bypass the confusing editor UX.
        If business rules require cropping in the future, it can be re-enabled here conditionally.
      */}
    </>
  );
};
