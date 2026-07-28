/**
 * Device Selector — Camera & Microphone dropdown selectors
 */

import { clsx } from 'clsx';
import { Camera, Mic } from 'lucide-react';
import type { DeviceSelectorProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';

export function DeviceSelector({
  cameras,
  microphones,
  selectedCamera,
  selectedMic,
  onCameraChange,
  onMicChange,
  disabled = false,
}: DeviceSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Camera select */}
      {cameras.length > 1 && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Camera size={14} className="text-gray-400 flex-shrink-0" />
          <select
            value={selectedCamera ?? ''}
            onChange={(e) => { onCameraChange(e.target.value); }}
            disabled={disabled}
            className={clsx(
              'device-select-compact flex-1 min-w-0',
              'bg-white/10 border border-white/10 text-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-orange-500/40',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'truncate',
            )}
            aria-label={recorderStrings.cameraLabel}
          >
            {cameras.map((cam, i) => (
              <option key={cam.deviceId} value={cam.deviceId} className="bg-gray-800 text-white">
                {cam.label || recorderStrings.cameraFallback(i)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Microphone select */}
      {microphones.length > 1 && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Mic size={14} className="text-gray-400 flex-shrink-0" />
          <select
            value={selectedMic ?? ''}
            onChange={(e) => { onMicChange(e.target.value); }}
            disabled={disabled}
            className={clsx(
              'device-select-compact flex-1 min-w-0',
              'bg-white/10 border border-white/10 text-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-orange-500/40',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'truncate',
            )}
            aria-label={recorderStrings.microphoneLabel}
          >
            {microphones.map((mic, i) => (
              <option key={mic.deviceId} value={mic.deviceId} className="bg-gray-800 text-white">
                {mic.label || recorderStrings.micFallback(i)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
