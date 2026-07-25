import React, { useState } from 'react';
import { ImageUploadCard, type ImageUploadCardProps } from '../../../components/ui/ImageUploadCard';
import { PhotoCaptureModal } from './recorder/PhotoCaptureModal';
import { ImageEditorModal } from './recorder/ImageEditorModal';


export type ReviewImageFieldProps = Omit<ImageUploadCardProps, 'onTakePhoto'>;

export const ReviewImageField: React.FC<ReviewImageFieldProps> = (props) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [capturedBitmap, setCapturedBitmap] = useState<ImageBitmap | null>(null);

  const handleTakePhoto = () => {
    setIsCameraOpen(true);
  };

  const handleCapture = (bitmap: ImageBitmap) => {
    setCapturedBitmap(bitmap);
    setIsCameraOpen(false);
    setIsEditorOpen(true);
  };

  const handleEditorSave = (editedBlob: Blob) => {
    // Generate a unique filename
    const fileName = `photo_${new Date().getTime()}.jpg`;
    const file = new File([editedBlob], fileName, { type: 'image/jpeg' });
    
    // Pass the created file up to the parent via onChange
    props.onChange(file);
    
    // Cleanup
    setIsEditorOpen(false);
    if (capturedBitmap) {
      capturedBitmap.close();
      setCapturedBitmap(null);
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    if (capturedBitmap) {
      capturedBitmap.close();
      setCapturedBitmap(null);
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

      <ImageEditorModal
        isOpen={isEditorOpen}
        imageBitmap={capturedBitmap}
        onClose={handleEditorClose}
        onSave={handleEditorSave}
      />
    </>
  );
};
