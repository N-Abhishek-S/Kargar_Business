import { useRef } from 'react';
import { gsap, easings, durations } from '@/config/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';

/**
 * Hook for standard scroll reveal (fade up, fade in, fade left, fade right).
 * Applies to elements with data-gsap-reveal attributes.
 */
export function useScrollReveal() {
  const containerRef = useRef<HTMLElement | HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      const elements = gsap.utils.toArray<HTMLElement>('[data-gsap-reveal]');

      elements.forEach((el) => {
        const revealType = el.dataset.gsapReveal;
        const delay = parseFloat(el.dataset.gsapDelay ?? '0');
        const duration = parseFloat(el.dataset.gsapDuration ?? durations.normal.toString());

        let startProps: gsap.TweenVars;
        
        switch (revealType) {
          case 'fade-up':
            startProps = { opacity: 0, y: 40 };
            break;
          case 'fade-down':
            startProps = { opacity: 0, y: -40 };
            break;
          case 'fade-left':
            startProps = { opacity: 0, x: -40 };
            break;
          case 'fade-right':
            startProps = { opacity: 0, x: 40 };
            break;
          case 'zoom-in':
            startProps = { opacity: 0, scale: 0.8 };
            break;
          default:
            startProps = { opacity: 0 };
        }

        gsap.fromTo(
          el,
          startProps,
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration,
            delay,
            ease: easings.smooth,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%', // Triggers when top of element hits 85% of viewport
              toggleActions: 'play none none reverse', // play on enter, reverse on leave back
            },
          }
        );
      });
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  );

  return containerRef;
}
