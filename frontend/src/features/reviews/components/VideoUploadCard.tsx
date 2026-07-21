import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { clsx } from 'clsx';
import { X, UploadCloud } from 'lucide-react';

export interface VideoUploadCardProps {
  label: string;
  error?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  maxSizeMB?: number;
}

export function VideoUploadCard({ label, error, value, onChange, maxSizeMB = 100 }: VideoUploadCardProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
      return undefined;
    }
  }, [value]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onChange(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
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
        onClick={() => {
          if (!value) inputRef.current?.click();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'relative flex flex-col items-center w-full rounded-lg border-2 border-dashed transition-all duration-200 overflow-hidden',
          value ? 'border-gray-200' : 'min-h-32 justify-center cursor-pointer bg-gray-50/50 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:ring-offset-1',
          isDragActive ? 'border-orange-500 bg-orange-50/30' : error ? 'border-red-400' : 'hover:border-gray-300'
        )}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept="video/mp4, video/quicktime, video/webm" 
          className="sr-only" 
          onChange={handleChange}
          aria-invalid={!!error}
          aria-label={`Upload ${label}`}
        />

        {value && previewUrl ? (
          <div className="relative w-full h-full p-2 bg-white">
            <div className="relative w-full rounded-md overflow-hidden bg-black flex flex-col">
              <video 
                src={previewUrl} 
                controls 
                className="w-full max-h-64 object-contain"
                preload="metadata"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white/90 hover:bg-white rounded-md shadow-sm transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 text-red-600 bg-white/90 hover:bg-white rounded-md shadow-sm transition-colors"
                  aria-label="Remove video"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="mt-2 px-1 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 truncate pr-4">{value.name}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap">{(value.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 mb-3 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
              <UploadCloud size={20} />
            </div>
            <p className="text-sm font-medium text-navy-900 mb-1">
              Click to upload <span className="font-normal text-gray-500">or drag and drop</span>
            </p>
            <p className="text-xs text-gray-500">
              MP4, MOV, WebM (Max {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500 font-medium" role="alert">{error}</p>
      )}
    </div>
  );
}
