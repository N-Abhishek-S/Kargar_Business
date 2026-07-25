/**
 * Face Detection Hint — Non-blocking advisory overlay
 */

import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FaceDetectionHintProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';

export function FaceDetectionHint({ onDismiss }: FaceDetectionHintProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 backdrop-blur-sm"
    >
      <User size={16} className="text-blue-400 flex-shrink-0" />
      <span className="text-xs text-blue-200 flex-1">{recorderStrings.faceNotDetected}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs text-blue-300 hover:text-white underline flex-shrink-0"
      >
        Dismiss
      </button>
    </motion.div>
  );
}
