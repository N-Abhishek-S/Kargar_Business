import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Global scroll restoration component.
 * Ensures that on every route change, the window scrolls to the very top.
 * This should be placed inside the Router context, usually in App.tsx or a global layout.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Attempt to restore scroll on pathname change.
    // We use setTimeout to ensure React has flushed changes to the DOM.
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }, 0);
    
    return () => { clearTimeout(timer); };
  }, [pathname]);

  return null;
}
