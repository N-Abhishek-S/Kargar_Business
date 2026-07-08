import { useRef } from 'react';
import { gsap, easings, durations } from '@/config/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';

/**
 * Hook for staggering children elements (like cards in a grid).
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  selector = '[data-gsap-stagger-item]',
  staggerAmount = 0.1,
  startPoint = 'top 85%'
) {
  const containerRef = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      const items = gsap.utils.toArray<HTMLElement>(selector);
      
      if (items.length === 0) return;

      gsap.fromTo(
        items,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: durations.normal,
          ease: easings.smooth,
          stagger: staggerAmount,
          scrollTrigger: {
            trigger: containerRef.current,
            start: startPoint,
            toggleActions: 'play none none reverse',
          },
        }
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion, selector, staggerAmount, startPoint] }
  );

  return containerRef;
}
