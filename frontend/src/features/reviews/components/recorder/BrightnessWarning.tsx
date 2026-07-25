/**
 * Brightness Warning — Low light overlay
 */

import { Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BrightnessWarningProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';

export function BrightnessWarning({ onDismiss }: BrightnessWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 backdrop-blur-sm"
    >
      <Sun size={16} className="text-amber-400 flex-shrink-0" />
      <span className="text-xs text-amber-200 flex-1">{recorderStrings.brightnessWarning}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs text-amber-300 hover:text-white underline flex-shrink-0"
      >
        Dismiss
      </button>
    </motion.div>
  );
}
