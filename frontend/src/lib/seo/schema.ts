import { config } from '@/config';
import { buildCanonicalUrl } from './canonical';
import type { BreadcrumbItem } from '@/features/services/components/Breadcrumb';
import type { Category, Service, ServiceFAQ } from '@/features/services/domain/service.types';

const ORGANIZATION_ID = `${config.siteUrl}/#organization`;
const LOCAL_BUSINESS_ID = `${config.siteUrl}/#localbusiness`;
const WEBSITE_ID = `${config.siteUrl}/#website`;
const LOGO_URL = `${config.siteUrl}/images/brand/kargar-logo.png`;

export function buildOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: config.siteName,
    url: config.siteUrl,
    logo: LOGO_URL,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-8788726752',
      contactType: 'customer service',
    },
  };
}

export function buildLocalBusinessSchema() {
  return {
    '@type': 'LocalBusiness',
    '@id': LOCAL_BUSINESS_ID,
    name: config.siteName,
    url: config.siteUrl,
    image: LOGO_URL,
    telephone: '+91-8788726752',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '301, 3rd Floor, Unity Commercial, Baner',
      addressLocality: 'Pune',
      addressRegion: 'Maharashtra',
      postalCode: '411045',
      addressCountry: 'IN',
    },
  };
}

export function buildWebsiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: config.siteUrl,
    name: config.siteName,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${config.siteUrl}/services?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  const allItems: BreadcrumbItem[] = [{ label: 'Home', href: '/' }, ...items];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && item.href !== '#' ? { item: buildCanonicalUrl(item.href) } : {}),
    })),
  };
}

export function buildServiceSchema(service: Service, category: Category) {
  return {
    '@type': 'Service',
    '@id': `${buildCanonicalUrl(`/services/${category.slug}/${service.slug}`)}#service`,
    name: service.title,
    description: service.seo.description,
    serviceType: service.title,
    provider: { '@id': ORGANIZATION_ID },
    areaServed: {
      '@type': 'City',
      name: 'Pune',
    },
    category: category.title,
  };
}

export function buildCategoryServiceSchema(category: Category) {
  return {
    '@type': 'Service',
    '@id': `${buildCanonicalUrl(`/services/${category.slug}`)}#service`,
    name: category.title,
    description: category.seo.description,
    serviceType: category.title,
    provider: { '@id': ORGANIZATION_ID },
  };
}

export function buildFAQSchema(faqs: ServiceFAQ[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
