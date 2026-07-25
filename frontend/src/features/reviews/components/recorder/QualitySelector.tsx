/**
 * Quality Selector — 360p / 720p / 1080p radio group
 */

import { clsx } from 'clsx';
import type { QualitySelectorProps, VideoQuality } from '../../types/video-recorder.types';
import { QualityPresets } from '../../config/recorder.config';
import { recorderStrings } from '../../i18n/recorder.i18n';

const QUALITIES: VideoQuality[] = ['360p', '720p', '1080p'];

export function QualitySelector({
  selectedQuality,
  onQualityChange,
  disabled = false,
}: QualitySelectorProps) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label={recorderStrings.qualityLabel}>
      <span className="text-xs font-medium text-gray-400 mr-1">{recorderStrings.qualityLabel}</span>
      {QUALITIES.map((q) => {
        const preset = QualityPresets[q];
        const isActive = selectedQuality === q;

        return (
          <button
            key={q}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onQualityChange(q)}
            disabled={disabled}
            className={clsx(
              'px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200',
              isActive
                ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'recorder-focus-ring',
            )}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
