import { useState } from 'react';
import { clsx } from 'clsx';
import { ImagePlus, X, UploadCloud, Camera } from 'lucide-react';

import { ImageAcquisitionService } from '../../media-sdk/capture-core/services/ImageAcquisitionService';

export interface ImageUploadCardProps {
  label: string;
  error?: string;
  value?: { data: string; fileName: string; size: number } | null;
  onChange: (file: File | null) => void;
  onTakePhoto?: () => void;
  maxSizeMB?: number;
}

export function ImageUploadCard({ label, error, value, onChange, onTakePhoto, maxSizeMB = 5 }: ImageUploadCardProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setIsProcessing(true);
      try {
        const result = await ImageAcquisitionService.processFile(file, { source: 'filepicker', maxSizeMB });
        if (result) onChange(result.file);
      } catch (err) {
        // Here we could toast the error
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleClick = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await ImageAcquisitionService.acquire({ source: 'gallery', maxSizeMB });
      if (result) onChange(result.file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProcessing) return;
    
    // If onTakePhoto is provided, it means the parent handles the camera explicitly (e.g. via ReviewImageField).
    // If not, we could fall back to our global acquisition service.
    // For now, we preserve the existing prop contract.
    if (onTakePhoto) {
      onTakePhoto();
    } else {
      setIsProcessing(true);
      try {
        const result = await ImageAcquisitionService.acquire({ source: 'camera', maxSizeMB });
        if (result) onChange(result.file);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium leading-none text-navy-900">
        {label} <span className="text-gray-400 font-normal ml-1">(Optional)</span>
      </label>
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'relative flex flex-col items-center justify-center w-full min-h-32 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden bg-gray-50/50 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:ring-offset-1',
          isDragActive ? 'border-orange-500 bg-orange-50/30' : error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300',
          isProcessing && 'opacity-50 pointer-events-none'
        )}
      >

        {value ? (
          <div className="absolute inset-0 w-full h-full p-2">
            <div className="relative w-full h-full rounded-md overflow-hidden bg-white shadow-sm border border-gray-100 flex items-center justify-between p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-gray-100 border border-gray-200/50">
                  <img src={value.data} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col truncate pr-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{value.fileName}</span>
                  <span className="text-xs text-gray-500">{(value.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                aria-label="Remove image"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="flex gap-4 mb-4">
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isDragActive ? "bg-orange-100 text-orange-600" : "bg-white shadow-sm border border-gray-100 text-gray-500"
              )}>
                {isDragActive ? <UploadCloud size={20} /> : <ImagePlus size={20} />}
              </div>
              <button
                type="button"
                onClick={handleCameraClick}
                disabled={isProcessing}
                className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-orange-500 transition-colors disabled:opacity-50"
                aria-label="Take photo"
              >
                <Camera size={20} />
              </button>
            </div>
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? "Drop image here" : (
                <>
                  <span className="text-orange-500 hover:text-orange-600 font-semibold">Click to upload</span>
                  {onTakePhoto ? ' or take a photo' : ' or drag and drop'}
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
