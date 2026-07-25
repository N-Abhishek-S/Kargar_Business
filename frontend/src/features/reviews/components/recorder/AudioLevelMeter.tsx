/**
 * Audio Level Meter — Visual microphone level indicator
 *
 * Shows a horizontal bar that responds to audio input.
 * Green → yellow → red gradient. Shows warning when silent.
 */

import { clsx } from 'clsx';
import { Mic, MicOff } from 'lucide-react';
import type { AudioLevelMeterProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';
import '../../styles/video-recorder.css';

export function AudioLevelMeter({ level, isSilent }: AudioLevelMeterProps) {
  const percent = Math.round(level * 100);

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Mic icon */}
      {isSilent ? (
        <MicOff size={14} className="text-amber-400 flex-shrink-0" />
      ) : (
        <Mic size={14} className="text-gray-400 flex-shrink-0" />
      )}

      {/* Level bar container */}
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="audio-level-bar h-full rounded-full"
          style={{ width: `${percent}%` }}
          role="meter"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={recorderStrings.micLevel}
        />
      </div>

      {/* Label / Warning */}
      <span className={clsx(
        'text-xs flex-shrink-0 min-w-[4.5rem] text-right',
        isSilent ? 'text-amber-400 font-medium' : 'text-gray-500',
      )}>
        {isSilent ? recorderStrings.noAudioDetected.split('—')[0]!.trim() : recorderStrings.micLevel}
      </span>
    </div>
  );
}
