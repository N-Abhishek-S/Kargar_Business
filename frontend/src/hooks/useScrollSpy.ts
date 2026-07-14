import { useState, useEffect } from 'react';

/**
 * Custom hook to determine the currently active section on the page based on scroll position.
 * @param sectionIds - Array of section IDs to track
 * @param offset - Offset in pixels to adjust the trigger point
 * @returns The ID of the currently active section
 */
export const useScrollSpy = (sectionIds: string[], offset = 100) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset;

      let currentActiveId = '';

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            currentActiveId = id;
          }
        }
      }

      // If scrolled to the very bottom, highlight the last section
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
        currentActiveId = sectionIds[sectionIds.length - 1] ?? '';
      }

      setActiveSection(currentActiveId);
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Call immediately to set initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds, offset]);

  return activeSection;
};
