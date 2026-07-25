/**
 * Unsupported Browser Notice
 *
 * Shown when MediaRecorder or getUserMedia is unavailable.
 */

import { MonitorX } from 'lucide-react';
import { clsx } from 'clsx';
import { recorderStrings } from '../../i18n/recorder.i18n';

interface UnsupportedBrowserNoticeProps {
  readonly onClose: () => void;
}

export function UnsupportedBrowserNotice({ onClose }: UnsupportedBrowserNoticeProps) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-700/50 mb-5">
        <MonitorX size={32} className="text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        {recorderStrings.unsupportedTitle}
      </h3>

      <p className="text-sm text-gray-400 max-w-sm mb-8 leading-relaxed">
        {recorderStrings.unsupportedDescription}
      </p>

      <button
        type="button"
        onClick={onClose}
        className={clsx(
          'px-6 py-2.5 rounded-xl text-sm font-bold',
          'text-white bg-orange-500 hover:bg-orange-600',
          'transition-all duration-200 recorder-focus-ring',
        )}
      >
        {recorderStrings.unsupportedAction}
      </button>
    </div>
  );
}
