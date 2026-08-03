/**
 * Audio Level Meter — Visual microphone level indicator
 *
 * Shows a horizontal bar that responds to audio input.
 * Green → yellow → red gradient. Shows warning when silent.
 */

import { useEffect } from 'react';
import { clsx } from 'clsx';
import { Mic, MicOff } from 'lucide-react';
import type { AudioLevelMeterProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';
import { useAudioLevel } from '../../hooks/useAudioLevel';
import '../../styles/video-recorder.css';

/**
 * Owns the high-frequency (~60fps) audio-level subscription itself, so only this small
 * leaf component re-renders on every audio-level tick — NOT the parent VideoRecorderModal.
 * See REVIEW_SYSTEM_AUDIT.md §1/§3 (P0-1): this used to be a modal-level hook call and was
 * the primary cause of the reported recording lag.
 */
export function AudioLevelMeter({ stream, isActive, onSilenceChange }: AudioLevelMeterProps) {
  const { level, isSilent } = useAudioLevel(isActive ? stream : null);
  const percent = Math.round(level * 100);

  // isSilent only flips at most twice per silence period (debounced in useAudioLevel),
  // not every frame — safe to lift to a parent callback without reintroducing frame-rate state.
  useEffect(() => {
    onSilenceChange?.(isSilent);
  }, [isSilent, onSilenceChange]);

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Mic icon */}
      {isSilent ? (
        <MicOff size={14} className="text-amber-400 shrink-0" />
      ) : (
        <Mic size={14} className="text-gray-400 shrink-0" />
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
        'text-xs shrink-0 min-w-18 text-right',
        isSilent ? 'text-amber-400 font-medium' : 'text-gray-500',
      )}>
        {isSilent ? (recorderStrings.noAudioDetected.split('—')[0] ?? '').trim() : recorderStrings.micLevel}
      </span>
    </div>
  );
}
