import { useState, useRef, type ChangeEvent } from 'react';
import { clsx } from 'clsx';
import { ImagePlus, X, UploadCloud } from 'lucide-react';

export interface ImageUploadCardProps {
  label: string;
  error?: string;
  value?: { data: string; fileName: string; size: number } | null;
  onChange: (file: File | null) => void;
  maxSizeMB?: number;
}

export function ImageUploadCard({ label, error, value, onChange, maxSizeMB = 5 }: ImageUploadCardProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    // Reset input value to allow uploading the same file again if removed
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
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'relative flex flex-col items-center justify-center w-full min-h-32 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden bg-gray-50/50 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:ring-offset-1',
          isDragActive ? 'border-orange-500 bg-orange-50/30' : error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
        )}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept="image/jpeg, image/png, image/webp" 
          className="sr-only" 
          onChange={handleChange}
          aria-invalid={!!error}
          aria-label={`Upload ${label}`}
        />

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
            <div className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
              isDragActive ? "bg-orange-100 text-orange-600" : "bg-white shadow-sm border border-gray-100 text-gray-500"
            )}>
              {isDragActive ? <UploadCloud size={20} /> : <ImagePlus size={20} />}
            </div>
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? "Drop image here" : <><span className="text-orange-500 hover:text-orange-600 font-semibold">Click to upload</span> or drag and drop</>}
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
