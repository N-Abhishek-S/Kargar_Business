import { useRef, useEffect } from 'react';
import { gsap, easings } from '@/config/gsap';
import { useReducedMotion } from 'framer-motion';

/**
 * Hook for magnetic hover effects on buttons or icons.
 * Pulls the element slightly towards the mouse cursor.
 */
export function useMagnetic(strength = 0.5) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement | HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion) return;

    const mouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const { clientX, clientY } = mouseEvent;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 1,
        ease: easings.smooth,
      });
    };

    const mouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 1,
        ease: easings.spring,
      });
    };

    el.addEventListener('mousemove', mouseMove);
    el.addEventListener('mouseleave', mouseLeave);

    return () => {
      el.removeEventListener('mousemove', mouseMove);
      el.removeEventListener('mouseleave', mouseLeave);
    };
  }, [prefersReducedMotion, strength]);

  return ref;
}
