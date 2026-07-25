/**
 * Device Disconnected Dialog — Hot-swap recovery UI
 */

import { CameraOff } from 'lucide-react';
import { clsx } from 'clsx';
import type { DeviceDisconnectedDialogProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';

export function DeviceDisconnectedDialog({
  deviceLabel,
  onReconnect,
  onStop,
}: DeviceDisconnectedDialogProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/15 mb-4">
        <CameraOff size={28} className="text-red-400" />
      </div>

      <h3 className="text-base font-semibold text-white mb-1">
        {recorderStrings.deviceDisconnectedTitle}
      </h3>

      {deviceLabel && (
        <p className="text-xs text-gray-400 mb-1">
          {deviceLabel}
        </p>
      )}

      <p className="text-sm text-gray-400 max-w-xs text-center mb-5">
        {recorderStrings.deviceDisconnectedDescription}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onReconnect}
          className={clsx(
            'px-5 py-2 rounded-xl text-sm font-bold',
            'text-white bg-orange-500 hover:bg-orange-600',
            'transition-all duration-200 recorder-focus-ring',
          )}
        >
          {recorderStrings.reconnect}
        </button>

        <button
          type="button"
          onClick={onStop}
          className={clsx(
            'px-5 py-2 rounded-xl text-sm font-medium',
            'text-gray-300 bg-white/10 hover:bg-white/15',
            'transition-all duration-200 recorder-focus-ring',
          )}
        >
          {recorderStrings.stopRecording}
        </button>
      </div>
    </div>
  );
}
