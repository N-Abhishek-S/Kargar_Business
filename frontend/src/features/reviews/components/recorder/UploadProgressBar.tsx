/**
 * Upload Progress Bar — Animated upload progress with cancel
 */

import { clsx } from 'clsx';
import { X, RefreshCw } from 'lucide-react';
import type { UploadProgressBarProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';
import { formatFileSize } from '../../utils/video-recorder.utils';
import '../../styles/video-recorder.css';

export function UploadProgressBar({ progress, onCancel, isRetrying }: UploadProgressBarProps) {
  return (
    <div className="flex flex-col gap-2 w-full px-1">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRetrying && (
            <RefreshCw size={14} className="text-amber-400 animate-spin" />
          )}
          <span className={clsx(
            'text-xs font-medium',
            isRetrying ? 'text-amber-400' : 'text-gray-300',
          )}>
            {isRetrying ? recorderStrings.retryUpload : recorderStrings.uploading}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {progress.speed > 0 && (
            <span className="text-xs text-gray-500">
              {formatFileSize(progress.speed)}/s
            </span>
          )}
          <span className="text-xs text-gray-400 tabular-nums font-semibold">
            {progress.percent}%
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
            aria-label={recorderStrings.cancelUpload}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="upload-progress-bar h-full rounded-full"
          style={{ width: `${progress.percent}%` }}
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Loaded / total */}
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>{formatFileSize(progress.loaded)}</span>
        <span>{formatFileSize(progress.total)}</span>
      </div>
    </div>
  );
}
