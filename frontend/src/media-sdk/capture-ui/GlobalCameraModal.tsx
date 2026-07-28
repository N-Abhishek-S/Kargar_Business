import React, { useEffect, useState } from 'react';
import { SharedCameraModal } from './SharedCameraModal';
import { ImageAcquisitionService, type ImageAcquisitionOptions } from '../capture-core/services/ImageAcquisitionService';

export const GlobalCameraModal: React.FC = () => {
  const [request, setRequest] = useState<{ options: ImageAcquisitionOptions; resolve: (file: File | null) => void } | null>(null);

  useEffect(() => {
    const handler = (params: { options: ImageAcquisitionOptions; resolve: (file: File | null) => void }) => {
      setRequest(params);
    };

    ImageAcquisitionService.onCameraRequest(handler);
    return () => {
      ImageAcquisitionService.offCameraRequest(handler);
    };
  }, []);

  if (!request) return null;

  const handlePhotoTaken = (file: File) => {
    request.resolve(file);
    setRequest(null);
  };

  const handleClose = () => {
    request.resolve(null);
    setRequest(null);
  };

  return (
    <SharedCameraModal 
      isOpen={true}
      onPhotoTaken={handlePhotoTaken}
      onClose={handleClose}
    />
  );
};
