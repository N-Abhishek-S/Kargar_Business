/**
 * Recording Indicator — Pulsing red dot + "REC"
 *
 * Positioned as an overlay on the camera preview.
 */

import { clsx } from 'clsx';
import { recorderStrings } from '../../i18n/recorder.i18n';
import '../../styles/video-recorder.css';

interface RecordingIndicatorProps {
  readonly isPaused: boolean;
}

export function RecordingIndicator({ isPaused }: RecordingIndicatorProps) {
  return (
    <div
      className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={isPaused ? 'Recording paused' : 'Recording in progress'}
    >
      <span
        className={clsx(
          'w-2.5 h-2.5 rounded-full',
          isPaused
            ? 'bg-amber-400'
            : 'bg-red-500 recorder-pulse',
        )}
      />
      <span className={clsx(
        'text-xs font-bold tracking-wider uppercase',
        isPaused ? 'text-amber-400' : 'text-red-400',
      )}>
        {isPaused ? 'PAUSED' : recorderStrings.recording}
      </span>
    </div>
  );
}
