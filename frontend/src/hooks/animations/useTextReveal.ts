import { useRef } from 'react';
import { gsap, easings } from '@/config/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from 'framer-motion';

/**
 * Hook for splitting text into words or characters and animating them.
 * Note: Real SplitText is a Club GSAP plugin. We simulate word split with CSS/JS wrappers or simple character fade.
 * For this enterprise setup without Club GSAP, we will wrap words in spans and stagger them.
 */
export function useTextReveal(selector = '[data-gsap-text]') {
  const containerRef = useRef<HTMLElement | HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      const elements = gsap.utils.toArray<HTMLElement>(selector);

      elements.forEach((el) => {
        // Manual split text for free GSAP
        // Only run once to avoid nested spans
        if (!el.dataset.splitted) {
          const text = el.innerText;
          const words = text.split(' ');
          el.innerHTML = '';
          
          words.forEach((word, i) => {
            const wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';
            wordSpan.style.overflow = 'hidden';
            wordSpan.style.paddingRight = i < words.length - 1 ? '0.25em' : '0'; // Add space back
            
            const innerSpan = document.createElement('span');
            innerSpan.style.display = 'inline-block';
            innerSpan.innerText = word;
            innerSpan.className = 'gsap-word-inner';
            
            wordSpan.appendChild(innerSpan);
            el.appendChild(wordSpan);
          });
          
          el.dataset.splitted = 'true';
        }

        const innerWords = el.querySelectorAll('.gsap-word-inner');

        gsap.fromTo(
          innerWords,
          {
            yPercent: 100,
            opacity: 0,
          },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            ease: easings.smooth,
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    },
    { scope: containerRef, dependencies: [prefersReducedMotion, selector] }
  );

  return containerRef;
}
