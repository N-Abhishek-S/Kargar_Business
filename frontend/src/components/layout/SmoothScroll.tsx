import { type ReactNode, useEffect } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from 'framer-motion';

/**
 * Enterprise Smooth Scroll Component
 * - Uses Lenis for buttery smooth scrolling (standard in premium GSAP sites)
 * - Automatically disables if user prefers reduced motion
 * - Integrates with GSAP ScrollTrigger under the hood (configured in Phase 6)
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // If user prefers reduced motion, don't initialize Lenis
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  return <>{children}</>;
}
