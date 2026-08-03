import type { ImageConfig } from '@/types';

/**
 * Centralized image configuration registry.
 * Every image in the application is defined here.
 * To swap to CMS: replace `src` values with API URLs — no component changes needed.
 */

/** Placeholder SVG for image load failures */
export const FALLBACK_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0UyRThGMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iSW50ZXIsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5NEEzQjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4=';

/** 10x10px blur placeholder — used as loading state for all images */
export const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRTJFOEYwIi8+PC9zdmc+';

export const heroImages: Record<string, ImageConfig> = {
  background: {
    src: '/images/hero-bg.jpg',
    alt: 'Modern corporate facility managed by Kargar FM',
    width: 1920,
    height: 1080,
    blurDataUrl: BLUR_PLACEHOLDER,
    fallback: FALLBACK_IMAGE,
    sizes: '100vw',
    priority: true,
  },
};

export const aboutImages: Record<string, ImageConfig> = {
  office: {
    src: '/images/about-office.jpg',
    alt: 'Kargar Facility Management headquarters',
    width: 800,
    height: 600,
    blurDataUrl: BLUR_PLACEHOLDER,
    fallback: FALLBACK_IMAGE,
    sizes: '(max-width: 768px) 100vw, 50vw',
  },
};

export const serviceImages: Record<string, ImageConfig> = {
  softServices: {
    src: '/images/services/soft-services.webp',
    alt: 'Soft services — housekeeping, pantry, and waste management',
    width: 600,
    height: 400,
    blurDataUrl: BLUR_PLACEHOLDER,
    fallback: FALLBACK_IMAGE,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw',
  },
  hardServices: {
    src: '/images/services/hard-services.webp',
    alt: 'Hard services — electrical, HVAC, and plumbing maintenance',
    width: 600,
    height: 400,
    blurDataUrl: BLUR_PLACEHOLDER,
    fallback: FALLBACK_IMAGE,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw',
  },
  security: {
    src: '/images/services/security-services.webp',
    alt: 'Security management services',
    width: 600,
    height: 400,
    blurDataUrl: BLUR_PLACEHOLDER,
    fallback: FALLBACK_IMAGE,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw',
  },
  housekeeping: {
    src: '/images/services/housekeeping-services.webp',
    alt: 'Professional housekeeping services',
    width: 600,
    height: 400,
    blurDataUrl: BLUR_PLACEHOLDER,
    fallback: FALLBACK_IMAGE,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw',
  },
  facilitySupport: {
    src: '/images/services/facility-support.webp',
    alt: 'Facility support and management services',
    width: 600,
    height: 400,
    blurDataUrl: BLUR_PLACEHOLDER,
    fallback: FALLBACK_IMAGE,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw',
  },
};
