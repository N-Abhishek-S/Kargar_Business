/**
 * Recording Timer — MM:SS / 03:00 live display
 */

import { clsx } from 'clsx';
import type { RecordingTimerProps } from '../../types/video-recorder.types';
import { formatRecordingTime } from '../../utils/video-recorder.utils';
import { RecorderLimits } from '../../config/recorder.config';

export function RecordingTimer({ elapsedSeconds, maxSeconds, isPaused }: RecordingTimerProps) {
  const remaining = maxSeconds - elapsedSeconds;
  const isWarning = remaining <= RecorderLimits.DURATION_WARNING_SECONDS && remaining > 0;

  return (
    <div
      className="flex items-center gap-1.5 tabular-nums text-sm font-semibold select-none"
      role="timer"
      aria-label={`Recording time: ${formatRecordingTime(elapsedSeconds)}`}
    >
      <span
        className={clsx(
          'transition-colors duration-200',
          isPaused ? 'text-gray-400' : isWarning ? 'text-amber-500' : 'text-red-500',
        )}
      >
        {formatRecordingTime(elapsedSeconds)}
      </span>
      <span className="text-gray-400 font-normal">/</span>
      <span className="text-gray-400 font-normal">
        {formatRecordingTime(maxSeconds)}
      </span>
    </div>
  );
}
