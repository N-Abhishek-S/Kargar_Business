import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { ContactNavigationOptions } from '../domain/navigation.types';
import { buildContactUrl } from '../utils/contactNavigation';

/**
 * Layer 2: React Hook for Contact Navigation
 * Handles routing, analytics, scrolling, and focus.
 */
export function useContactNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToContact = useCallback(
    (options?: ContactNavigationOptions, e?: React.MouseEvent) => {
      // If it's a left click without modifiers, we can handle it
      if (e && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
        e.preventDefault();
      } else if (e) {
        // Let browser handle middle-click/new tab naturally since we use <Link> 
        return;
      }

      // Fire analytics event
      console.log('Analytics Event: Request Proposal Clicked', {
        ...options,
        timestamp: new Date().toISOString(),
      });

      const url = buildContactUrl(options);
      
      const isAlreadyOnContact = location.pathname === '/contact' || location.pathname === '/contact-us';

      if (isAlreadyOnContact) {
        // Just update search params without reloading
        void navigate(url, { replace: true });
        
        // Wait for next frame for state update, then scroll and focus
        requestAnimationFrame(() => {
          const form = document.getElementById('contact-form');
          if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Focus the first input field
            const firstInput = form.querySelector('input');
            if (firstInput) {
              firstInput.focus();
            }
          }
        });
      } else {
        void navigate(url);
      }
    },
    [navigate, location.pathname]
  );

  return { navigateToContact, buildContactUrl };
}
