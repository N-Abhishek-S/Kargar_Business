/**
 * Application configuration — centralized environment variable access.
 * All env vars are validated here at import time.
 * If a required variable is missing, the app fails fast with a clear error.
 */

function getEnvVar(key: string, fallback?: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value && fallback === undefined) {
    console.warn(`[Config] Missing environment variable: ${key}`);
    return '';
  }
  return value ?? fallback ?? '';
}

export const config = {
  /** Supabase browser client configuration */
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  },

  /** EmailJS email delivery configuration */
  emailjs: {
    publicKey: getEnvVar('VITE_EMAILJS_PUBLIC_KEY'),
    serviceId: getEnvVar('VITE_EMAILJS_SERVICE_ID'),
    templateId: getEnvVar('VITE_EMAILJS_TEMPLATE_ID'),
  },

  /** Public site URL */
  siteUrl: getEnvVar('VITE_SITE_URL', 'https://www.kargarbusinessservices.com'),

  /** Site name */
  siteName: getEnvVar('VITE_SITE_NAME', 'Kargar Facility Management'),

  /** Analytics — empty string means disabled */
  analytics: {
    gaId: getEnvVar('VITE_GA_MEASUREMENT_ID', ''),
    gtmId: getEnvVar('VITE_GTM_ID', ''),
    clarityId: getEnvVar('VITE_CLARITY_ID', ''),
    hotjarId: getEnvVar('VITE_HOTJAR_ID', ''),
    sentryDsn: getEnvVar('VITE_SENTRY_DSN', ''),
    forceAnalytics: getEnvVar('VITE_FORCE_ANALYTICS') === 'true',
    debugMode: getEnvVar('VITE_GA_DEBUG_MODE') === 'true',
  },

  /** Whether we're in production */
  isProd: import.meta.env.PROD,
} as const;
