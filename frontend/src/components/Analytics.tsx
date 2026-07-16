import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { config } from '@/config';
import type { GtagArgs } from '@/types/analytics';
import { trackEvent } from '@/types/analytics';

export function Analytics() {
  const location = useLocation();
  const initialized = useRef(false);

  useEffect(() => {
    // Determine if analytics should run.
    // By default, only runs in production unless VITE_FORCE_ANALYTICS is true.
    const shouldRun = config.isProd || config.analytics.forceAnalytics;
    if (!shouldRun || !config.analytics.gaId) {
      return;
    }

    if (initialized.current) {
      return;
    }
    initialized.current = true;

    // Initialize GA script if it hasn't been added yet
    const scriptId = 'ga-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.analytics.gaId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer ?? [];
      
      // Use modern rest parameters and strongly typed arguments
      window.gtag = function gtag(...args: GtagArgs) {
        window.dataLayer?.push(args);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', config.analytics.gaId, {
        send_page_view: false, // Handled manually on route change
        debug_mode: config.analytics.debugMode,
      });
    }
  }, []);

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
