import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { config } from '@/config';
import type { GtagArgs } from '@/types/analytics';



export function Analytics() {
  const location = useLocation();
  const initialized = useRef(false);

  useEffect(() => {
    // Only load GA in production if a measurement ID is configured
    if (!config.isProd || !config.analytics.gaId) {
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
      });
    }
  }, []);

  useEffect(() => {
    if (!config.isProd || !config.analytics.gaId) {
      return;
    }

    // Trigger page_view event on location change
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: `${location.pathname}${location.search}`,
      });
    }
  }, [location]);

  return null;
}
