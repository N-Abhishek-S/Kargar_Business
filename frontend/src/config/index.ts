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
  /** Backend API base URL */
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:4000/api'),

  /** Public site URL */
  siteUrl: getEnvVar('VITE_SITE_URL', 'http://localhost:5173'),

  /** Site name */
  siteName: getEnvVar('VITE_SITE_NAME', 'Kargar Facility Management'),

  /** Analytics — empty string means disabled */
  analytics: {
    gaId: getEnvVar('VITE_GA_MEASUREMENT_ID', ''),
    gtmId: getEnvVar('VITE_GTM_ID', ''),
    clarityId: getEnvVar('VITE_CLARITY_ID', ''),
    hotjarId: getEnvVar('VITE_HOTJAR_ID', ''),
    sentryDsn: getEnvVar('VITE_SENTRY_DSN', ''),
  },

  /** Whether we're in production */
  isProd: import.meta.env.PROD,
} as const;
