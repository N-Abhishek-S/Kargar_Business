import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

/**
 * Custom hook for ScrollSpy functionality.
 * - Tracks which section is currently visible in the viewport.
 * - Updates active section id on scroll.
 */
export function useScrollSpy(sectionIds: string[], offset = 100) {
  const [activeSection, setActiveSection] = useState<string>('');
  const { pathname } = useLocation();

  useEffect(() => {
    // Only run on homepage where sections exist
    if (pathname !== '/') return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;

      // Find the current section
      let current = '';
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          // Adjust for absolute page position
          const absoluteTop = top + window.scrollY;
          const absoluteBottom = bottom + window.scrollY;

          if (scrollPosition >= absoluteTop && scrollPosition < absoluteBottom) {
            current = id;
            break;
          }
        }
      }

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => { window.removeEventListener('scroll', handleScroll); };
  }, [sectionIds, offset, pathname]);

  return activeSection;
}
