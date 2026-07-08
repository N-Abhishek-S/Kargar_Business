import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BrandLogo } from '../ui/BrandLogo';

/**
 * Enterprise Loading Screen
 * - Full page loader shown on initial visit
 * - Framer Motion exit animation
 * - Clean minimal design matching the brand
 */
export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for critical resources or just a minimum time to show the brand
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => { clearTimeout(timer); };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-loading flex flex-col items-center justify-center bg-navy-950"
        >
          <div className="relative flex items-center justify-center">
            {/* Outer spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute h-28 w-72 rounded-2xl border-2 border-dashed border-orange-500/30"
            />
            {/* Inner pulsing logo */}
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex w-64 items-center justify-center rounded-xl bg-white p-4 shadow-lg shadow-orange-500/20"
            >
              <BrandLogo />
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-sm tracking-widest text-navy-200 uppercase"
          >
            Loading Experience
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
