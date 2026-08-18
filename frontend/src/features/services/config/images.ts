import { serviceImages as baseImages } from '@/config/images';
import type { ImageConfig } from '@/types';

/**
 * Enterprise Image Governance
 * 
 * Rules:
 * 1. Aspect Ratio: Hero (16:9), Cards (4:3)
 * 2. Format: WebP/AVIF preferred
 * 3. Max Size: Hero < 200KB, Cards < 80KB
 * 4. Content: Real commercial environments, no AI artifacts.
 */

const defaultHeroImage: ImageConfig = { 
  src: '/images/hero-bg.jpg', 
  alt: 'Premium Facility Management', 
  width: 1920, 
  height: 1080 
};

// We map keys used in our domain config to the global image configurations
export const serviceImages: Record<string, ImageConfig> = {
  hardServices: baseImages.hardServices ?? defaultHeroImage,
  softServices: baseImages.softServices ?? defaultHeroImage,
  
  // Hard Services
  electrical: {
    ...(baseImages.hardServices ?? defaultHeroImage),
    alt: 'Enterprise Electrical Maintenance and HT Panels',
  },
  hvac: {
    ...(baseImages.hardServices ?? defaultHeroImage),
    alt: 'Commercial HVAC and Chiller Maintenance',
  },
  
  // Soft Services
  housekeeping: {
    ...(baseImages.housekeeping ?? defaultHeroImage),
    alt: 'Housekeeping staff cleaning a corporate office lobby floor',
  },
  security: {
    ...(baseImages.security ?? defaultHeroImage),
    alt: 'Corporate Security and Manned Guarding',
  }
};
