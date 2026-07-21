import type { RobotsDirective } from '@/components/seo/SEO';

export interface RouteSEOEntry {
  path: string;
  /** Passed as-is to <SEO title>; the SEO component appends " | {siteName}" automatically. */
  title: string;
  description: string;
  keywords?: string[];
  robots?: RobotsDirective;
}

const homeEntry: RouteSEOEntry = {
  path: '/',
  title: 'Facility Management Company',
  description:
    'Kargar is a trusted integrated facility management company delivering housekeeping, security, and maintenance services for corporate offices across India.',
  keywords: ['Facility Management Company', 'Integrated Facility Management', 'Housekeeping and Security Services'],
};

const adminEntry: RouteSEOEntry = {
  path: '/admin',
  title: 'Admin',
  description: 'Kargar internal admin console.',
  robots: { index: false, follow: false },
};

/**
 * Single source of truth for metadata on every STATIC route.
 * Dynamic service/category routes are NOT duplicated here — they already carry their
 * own `seo` field in features/services/config/{categories,hard-services,soft-services}.ts,
 * which stays their source of truth.
 */
export const seoRegistry: Record<string, RouteSEOEntry> = {
  '/': homeEntry,
  '/services': {
    path: '/services',
    title: 'Facility Management Services',
    description:
      'Explore Kargar facility management services: soft services like housekeeping and security, plus hard services like electrical and HVAC maintenance.',
    keywords: ['Facility Management Services', 'Soft Services', 'Hard Services'],
  },
  '/sectors': {
    path: '/sectors',
    title: 'Facility Management by Sector',
    description:
      'Kargar delivers commercial facility management, industrial facility management, and corporate facility management solutions for manufacturing plants.',
    keywords: [
      'Commercial Facility Management',
      'Industrial Facility Management',
      'Corporate Facility Management',
      'Facility Management for Manufacturing Plants',
    ],
  },
  '/company-profile': {
    path: '/company-profile',
    title: 'Trusted Facility Management',
    description:
      'Kargar Business Services is a professional, trusted facility management company with 10+ years of experience serving 10,000+ clients across 50+ sites in India.',
    keywords: ['Trusted Facility Management Company', 'Professional Facility Management Company'],
  },
  '/support': {
    path: '/support',
    title: 'Facility Support Services',
    description:
      'Get fast response and expert coordination from Kargar support team for facility management, housekeeping, security, and maintenance service requests nationwide.',
    keywords: ['Facility Support Services', 'Workplace Management Services'],
  },
  '/contact-us': {
    path: '/contact-us',
    title: 'Get Facility Management Quote',
    description:
      'Contact Kargar, a facility management company for corporate offices in Pune, Baner. Request a proposal for housekeeping, security, or maintenance services.',
    keywords: ['Facility Management Company for Corporate Offices'],
  },
  '/404': {
    path: '/404',
    title: 'Page Not Found',
    description: 'The page you are looking for could not be found. Return to our services page to keep browsing Kargar facility management solutions.',
    robots: { index: false, follow: false },
  },
  '/admin': adminEntry,
};

/** Resolves the closest registry entry for a pathname, falling back to the homepage entry. */
export function getSeoEntry(pathname: string): RouteSEOEntry {
  if (pathname.startsWith('/admin')) return adminEntry;
  return seoRegistry[pathname] ?? homeEntry;
}
