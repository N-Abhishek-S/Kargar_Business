/**
 * Official social media configuration for Kargar Business Services.
 * Centralized social URLs and accessibility metadata.
 */

export interface SocialPlatform {
  id: 'instagram' | 'facebook' | 'linkedin' | 'x';
  name: string;
  url: string;
  ariaLabel: string;
  title: string;
}

export const OFFICIAL_SOCIAL_LINKS: readonly SocialPlatform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/kargar.facility/',
    ariaLabel: 'Follow Kargar on Instagram',
    title: 'Instagram',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    // Verified Kargar Facebook profile URL found in the codebase repository schema:
    url: 'https://www.facebook.com/people/Kargar-Facility-and-Security-Services-PVT-LTD/100076064059281/',
    ariaLabel: 'Follow Kargar on Facebook',
    title: 'Facebook',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/kargar-facility-services-pvt-ltd/?viewAsMember=true',
    ariaLabel: 'Follow Kargar on LinkedIn',
    title: 'LinkedIn',
  },
  {
    id: 'x',
    name: 'X',
    url: 'https://x.com/Kargar_Business',
    ariaLabel: 'Follow Kargar on X',
    title: 'X',
  },
] as const;
