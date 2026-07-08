import { useRef } from 'react';
import { gsap } from '@/config/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';

/**
 * Hook for smooth parallax scroll effects on images or backgrounds.
 */
export function useParallax(selector = '[data-gsap-parallax]', speed = 0.5) {
  const containerRef = useRef<HTMLElement | HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      const elements = gsap.utils.toArray<HTMLElement>(selector);

      elements.forEach((el) => {
        const itemSpeed = parseFloat(el.dataset.gsapParallax ?? speed.toString());
        
        // Ensure image container hides overflow
        if (el.parentElement) {
          el.parentElement.style.overflow = 'hidden';
        }
        
        // Make image taller to allow scrolling
        gsap.set(el, { scale: 1.2, transformOrigin: 'center center' });

        gsap.to(el, {
          yPercent: 20 * itemSpeed,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: 'top bottom', // Start when top of element hits bottom of viewport
            end: 'bottom top',   // End when bottom of element hits top of viewport
            scrub: true,         // Smooth scrubbing
          },
        });
      });
    },
    { scope: containerRef, dependencies: [prefersReducedMotion, selector, speed] }
  );

  return containerRef;
}
