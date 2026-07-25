/**
 * Countdown Overlay — 3-2-1 animated countdown
 *
 * Full-size overlay on camera preview with large animated numbers.
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { CountdownOverlayProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 rounded-xl"
      role="status"
      aria-live="assertive"
      aria-label={`Recording starts in ${value}`}
    >
      <p className="text-sm font-medium text-white/70 mb-4 tracking-wide uppercase">
        {recorderStrings.getReady}
      </p>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
            duration: 0.5,
          }}
          className="text-8xl font-bold text-white tabular-nums select-none"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
