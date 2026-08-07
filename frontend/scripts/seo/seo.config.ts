/**
 * Single source of truth for the Node-side SEO build pipeline.
 *
 * Scripts in this directory run under plain `tsx`, not Vite, so they cannot import
 * `@/config` (it reads `import.meta.env`, which only Vite populates) or anything that
 * transitively imports it (`@/lib/seo/*`, `@/components/seo/SEO`). SITE_URL below is
 * therefore a standalone constant — keep it in sync with the `siteUrl` default in
 * `frontend/src/config/index.ts` whenever the canonical domain changes.
 */

export const SITE_URL = 'https://www.kargarbusinessservices.com';

/** Static routes that render `KargarSinglePage` and are covered by `src/features/seo/registry.ts`. */
export const STATIC_ROUTES = ['/', '/services', '/sectors', '/company-profile', '/support', '/contact-us'];

/** Route prefixes that must never appear in the sitemap and must be disallowed in robots.txt. */
export const DISALLOWED_PREFIXES = ['/admin'];

export interface RedirectRule {
  from: string;
  to: string;
  permanent: boolean;
}

/** Single source of truth for redirects — generated into vercel.json's `redirects` array. */
export const REDIRECTS: RedirectRule[] = [
  { from: '/contact', to: '/contact-us', permanent: true },
  { from: '/about', to: '/company-profile', permanent: true },
  { from: '/about-us', to: '/company-profile', permanent: true },
];

/**
 * Known hero-image asset per route, for `<image:image>` sitemap entries.
 * Hardcoded here (rather than importing features/services/config/images.ts) to keep the
 * pipeline's dependency surface small and Node-safe; update alongside real asset changes.
 */
export const PAGE_IMAGES: Record<string, { src: string; alt: string }> = {
  '/': { src: '/images/page/hero-building.webp', alt: 'Kargar facility management hero building' },
  '/services': { src: '/images/page/services-hero.webp', alt: 'Kargar integrated facility management services' },
  '/services/hard-services': {
    src: '/images/services/hard-services.webp',
    alt: 'Hard services — electrical, HVAC, and plumbing maintenance',
  },
  '/services/soft-services': {
    src: '/images/services/soft-services.webp',
    alt: 'Soft services — housekeeping, pantry, and waste management',
  },
  '/services/hard-services/electrical-maintenance': {
    src: '/images/services/hard-services.webp',
    alt: 'Enterprise electrical maintenance and HT panels',
  },
  '/services/hard-services/hvac-maintenance': {
    src: '/images/services/hard-services.webp',
    alt: 'Commercial HVAC and chiller maintenance',
  },
  '/services/soft-services/housekeeping': {
    src: '/images/services/housekeeping-services.webp',
    alt: 'Corporate housekeeping and deep cleaning',
  },
  '/services/soft-services/security-services': {
    src: '/images/services/security-services.webp',
    alt: 'Corporate security and manned guarding',
  },
};

export function buildCanonicalUrl(path: string): string {
  const normalizedPath = path === '/' ? '' : path.replace(/\/+$/, '');
  return `${SITE_URL}${normalizedPath || '/'}`;
}
