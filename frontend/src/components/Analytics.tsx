import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { config } from '@/config';
import { trackEvent } from '@/types/analytics';

export function Analytics() {
  const location = useLocation();
  useEffect(() => {
    const shouldRun = config.isProd || config.analytics.forceAnalytics;
    if (!shouldRun || !config.analytics.gaId) {
      return;
    }

    // Trigger page_view event on location change, including hash if present
    trackEvent('page_view', {
      page_path: `${location.pathname}${location.search}${location.hash}`,
    });
  }, [location]);

  // Global click tracker for tel:, mailto:, and whatsapp
  useEffect(() => {
    const shouldRun = config.isProd || config.analytics.forceAnalytics;
    if (!shouldRun || !config.analytics.gaId) {
      return;
    }

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (href.startsWith('tel:')) {
        trackEvent('call_click', { link_url: href });
      } else if (href.startsWith('mailto:')) {
        trackEvent('email_click', { link_url: href });
      } else if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        trackEvent('whatsapp_click', { link_url: href });
      }
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, []);

  return null;
}
