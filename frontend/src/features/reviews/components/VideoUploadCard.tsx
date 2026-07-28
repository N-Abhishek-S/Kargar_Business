/**
 * Video Upload Card — Two-option UI
 *
 * Option 1: Upload Existing Video (original drag-and-drop — fully preserved)
 * Option 2: Record Video (opens VideoRecorderModal — lazy loaded)
 *
 * The recorded video is converted to a standard File and passed through
 * the existing onChange(file) callback — zero changes to parent form.
 */

import { useState, useRef, useEffect, useMemo, lazy, Suspense, type ChangeEvent } from 'react';
import { clsx } from 'clsx';
import { X, UploadCloud, Video, Loader2 } from 'lucide-react';
import { recorderStrings } from '../i18n/recorder.i18n';
import { trackRecorderEvent } from '../services/analytics.service';
import { RecorderFlags } from '../config/recorder.config';
import { CameraProvider } from '../../../media-sdk/capture-react/useMediaCapture';

/* ---- Lazy-load the recorder modal (Phase 1 perf requirement) ---- */
const VideoRecorderModal = lazy(() =>
  import('./recorder/VideoRecorderModal').then((m) => ({ default: m.VideoRecorderModal })),
);

// Extract flag to runtime variable so TypeScript doesn't narrow `true as const`
const videoRecordingEnabled: boolean = RecorderFlags.ENABLE_VIDEO_RECORDING;

export interface VideoUploadCardProps {
  label: string;
  error?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  maxSizeMB?: number;
}

export function VideoUploadCard({ label, error, value, onChange, maxSizeMB = 100 }: VideoUploadCardProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---- Preview URL lifecycle ---- */
  const previewUrl = useMemo(() => value ? URL.createObjectURL(value) : null, [value]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ---- Upload handlers (preserved from original) ---- */
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

  /* ---- Recorder handlers ---- */
  const handleOpenRecorder = () => {
    setIsRecorderOpen(true);
  };

  const handleCloseRecorder = () => {
    setIsRecorderOpen(false);
  };

  const handleUseRecordedVideo = (file: File) => {
    onChange(file);
    setIsRecorderOpen(false);
  };

  /* ---- If a video is already selected, show the preview (same as original) ---- */
  if (value && previewUrl) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium leading-none text-navy-900">
          {label} <span className="text-gray-400 font-normal ml-1">{recorderStrings.videoSectionOptional}</span>
        </label>

        <div className="relative flex flex-col items-center w-full rounded-lg border-2 border-gray-200 overflow-hidden">
          <div className="relative w-full p-2 bg-white">
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

          {/* Hidden file input for Replace functionality */}
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4, video/quicktime, video/webm"
            className="sr-only"
            onChange={handleChange}
            aria-label={`Upload ${label}`}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 font-medium" role="alert">{error}</p>
        )}
      </div>
    );
  }

  /* ---- No video selected — show two-option card ---- */
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium leading-none text-navy-900">
        {label} <span className="text-gray-400 font-normal ml-1">{recorderStrings.videoSectionOptional}</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* ---- Option 1: Upload Existing Video ---- */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={clsx(
            'relative flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed',
            'cursor-pointer transition-all duration-200',
            'hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-1',
            isDragActive
              ? 'border-orange-500 bg-orange-50/30'
              : error
                ? 'border-red-400 bg-red-50/20'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50/30',
          )}
          aria-label={recorderStrings.uploadExistingVideo}
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

          <div className="w-10 h-10 mb-2.5 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <UploadCloud size={20} />
          </div>
          <p className="text-sm font-semibold text-navy-900 mb-0.5">
            {recorderStrings.uploadExistingVideo}
          </p>
          <p className="text-xs text-gray-400">
            {recorderStrings.uploadExistingDesc}
          </p>
        </div>

        {/* ---- Option 2: Record Video ---- */}
        {videoRecordingEnabled && (
          <button
            type="button"
            onClick={handleOpenRecorder}
            className={clsx(
              'relative flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed',
              'cursor-pointer transition-all duration-200',
              'border-gray-200 hover:border-orange-300 bg-gray-50/30 hover:bg-orange-50/20',
              'focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-1',
            )}
            aria-label={recorderStrings.recordVideo}
          >
            <div className="w-10 h-10 mb-2.5 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
              <Video size={20} />
            </div>
            <p className="text-sm font-semibold text-navy-900 mb-0.5">
              {recorderStrings.recordVideo}
            </p>
            <p className="text-xs text-gray-400">
              {recorderStrings.recordVideoDesc}
            </p>
          </button>
        )}
      </div>

      {/* Format & size info */}
      <p className="text-xs text-gray-400 mt-1">
        {recorderStrings.supportedFormats} · Max {maxSizeMB} MB
      </p>

      {error && (
        <p className="text-sm text-red-500 font-medium" role="alert">{error}</p>
      )}

      {/* Lazy-loaded Recorder Modal */}
      {isRecorderOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          }
        >
          <CameraProvider
            onSDKEvent={(eventName, payload) => {
              if (eventName === 'camera_error') {
                 trackRecorderEvent('camera_open_failed' as any, payload);
              } else if (eventName === 'camera_opened') {
                 trackRecorderEvent('camera_opened' as any, payload);
              } else if (eventName === 'state_transition_failed') {
                 trackRecorderEvent('state_transition_failed' as any, payload);
              }
            }}
          >
            <VideoRecorderModal
              isOpen={isRecorderOpen}
              onClose={handleCloseRecorder}
              onUseVideo={handleUseRecordedVideo}
            />
          </CameraProvider>
        </Suspense>
      )}
    </div>
  );
}
