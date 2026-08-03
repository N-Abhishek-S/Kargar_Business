/**
 * Permission Dialog — Friendly camera/mic permission denied UI
 *
 * Shows browser-specific recovery instructions instead of alert().
 */

import { Camera, ShieldAlert, Settings, Info, RefreshCcw, Upload } from 'lucide-react';
import { clsx } from 'clsx';
import type { PermissionDialogProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';
import { getPermissionInstructions } from '../../utils/permission-instructions.utils';

const ICON_MAP = {
  lock: ShieldAlert,
  shield: ShieldAlert,
  settings: Settings,
  info: Info,
} as const;

export function PermissionDialog({ errorType, message, onRetry, onFallbackUpload }: PermissionDialogProps) {
  const isDenied = errorType === 'permission_denied';
  const isNotFound = errorType === 'not_found';
  const isRecordingFailed = errorType === 'recording_failed';

  const instructions = isDenied ? getPermissionInstructions() : null;
  const HintIcon = instructions ? ICON_MAP[instructions.iconHint] : Camera;

  const title = isDenied
    ? recorderStrings.permissionDeniedTitle
    : isNotFound
      ? 'Camera or Microphone Not Found'
      : isRecordingFailed
        ? recorderStrings.recordingFailedTitle
        : recorderStrings.permissionTitle;

  const description = isDenied
    ? recorderStrings.permissionDeniedDescription
    : isNotFound
      ? 'No camera or microphone was detected. Please connect a device and try again.'
      : isRecordingFailed
        // Prefer the specific, already-user-safe message from the caught error (see
        // useVideoRecorder's startRecordingInternal/stopRecordingInternal — these are
        // fixed, non-technical strings, never a raw error/stack trace) over the generic copy.
        ? (message ?? recorderStrings.recordingFailedDescription)
        : recorderStrings.permissionDescription;

  return (
    <div className="flex flex-col items-center text-center py-8 px-4">
      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-5">
        <HintIcon size={32} className="text-red-400" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">{description}</p>

      {/* Browser-specific instructions */}
      {isDenied && instructions && (
        <div className="w-full max-w-sm mb-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            How to fix in {instructions.browserName}
          </p>
          <ol className="text-left space-y-2">
            {instructions.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-300">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold',
            'text-white bg-orange-500 hover:bg-orange-600',
            'transition-all duration-200 recorder-focus-ring',
          )}
        >
          <RefreshCcw size={16} />
          {recorderStrings.tryAgain}
        </button>

        <button
          type="button"
          onClick={onFallbackUpload}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium',
            'text-gray-300 bg-white/10 hover:bg-white/15',
            'transition-all duration-200 recorder-focus-ring',
          )}
        >
          <Upload size={16} />
          {recorderStrings.uploadInstead}
        </button>
      </div>
    </div>
  );
}
