/**
 * Video Preview — Post-recording playback with Retake / Use this Video
 *
 * Shows the recorded video with native controls (not mirrored).
 */

import { RotateCcw, Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { VideoPreviewProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';
import { formatRecordingTime, formatFileSize } from '../../utils/video-recorder.utils';

export function VideoPreview({
  previewUrl,
  onRetake,
  onUseVideo,
  metadata,
  thumbnailUrl,
}: VideoPreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Video player */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <video
          src={previewUrl}
          controls
          playsInline
          className="w-full h-full object-contain"
          aria-label="Recorded video preview"
        />
      </div>

      {/* Metadata row */}
      {metadata && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1">
          {metadata.duration > 0 && (
            <span className="text-xs text-gray-400">
              <span className="font-medium text-gray-300">{recorderStrings.duration}:</span>{' '}
              {formatRecordingTime(metadata.duration)}
            </span>
          )}
          {metadata.width > 0 && metadata.height > 0 && (
            <span className="text-xs text-gray-400">
              <span className="font-medium text-gray-300">{recorderStrings.resolution}:</span>{' '}
              {metadata.width}×{metadata.height}
            </span>
          )}
          {metadata.size > 0 && (
            <span className="text-xs text-gray-400">
              <span className="font-medium text-gray-300">{recorderStrings.fileSize}:</span>{' '}
              {formatFileSize(metadata.size)}
            </span>
          )}
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="w-12 h-8 rounded object-cover border border-gray-700 ml-auto"
            />
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRetake}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold',
            'text-gray-300 bg-white/10 hover:bg-white/15',
            'transition-all duration-200 recorder-focus-ring',
          )}
          aria-label={recorderStrings.retake}
        >
          <RotateCcw size={16} />
          {recorderStrings.retake}
        </button>

        <button
          type="button"
          onClick={onUseVideo}
          className={clsx(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold',
            'text-white bg-orange-500 hover:bg-orange-600',
            'shadow-sm hover:shadow-md',
            'transition-all duration-200 recorder-focus-ring',
            'active:scale-[0.97]',
          )}
          aria-label={recorderStrings.useVideo}
        >
          <Check size={16} />
          {recorderStrings.useVideo}
        </button>
      </div>
    </div>
  );
}
