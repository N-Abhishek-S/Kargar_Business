/**
 * Network Status Banner — Offline/online notification
 */

import { WifiOff, Wifi } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { NetworkStatusBannerProps } from '../../types/video-recorder.types';
import { recorderStrings } from '../../i18n/recorder.i18n';

export function NetworkStatusBanner({ isOnline, wasOffline }: NetworkStatusBannerProps) {
  const showBanner = !isOnline || wasOffline;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium',
              isOnline
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400',
            )}
            role="alert"
            aria-live="assertive"
          >
            {isOnline ? (
              <>
                <Wifi size={14} />
                <span>{recorderStrings.networkRestored}</span>
              </>
            ) : (
              <>
                <WifiOff size={14} />
                <span>{recorderStrings.networkLost}</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
