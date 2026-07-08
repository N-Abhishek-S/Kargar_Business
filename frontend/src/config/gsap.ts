import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  
  // Handle reduced motion preference globally for GSAP
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  if (prefersReducedMotion.matches) {
    // Disable most GSAP animations
    gsap.ticker.fps(1);
    gsap.globalTimeline.timeScale(1000); // Fast forward all animations
  }

  // Update reduced motion if user changes preference
  prefersReducedMotion.addEventListener('change', (e) => {
    if (e.matches) {
      gsap.ticker.fps(1);
      gsap.globalTimeline.timeScale(1000);
    } else {
      gsap.ticker.fps(60); // Reset to default
      gsap.globalTimeline.timeScale(1);
    }
  });

  // Refresh ScrollTrigger on resize to maintain correct trigger positions
  let timeoutId: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
  });
}

/**
 * Standardized easing curves for Kargar FM design system
 */
export const easings = {
  smooth: 'power4.out',
  spring: 'back.out(1.7)',
  slowStart: 'power3.inOut',
  bounce: 'elastic.out(1, 0.5)',
};

/**
 * Standardized animation durations
 */
export const durations = {
  fast: 0.3,
  normal: 0.6,
  slow: 1.2,
  epic: 2.0,
};

export { gsap, ScrollTrigger, useGSAP };
