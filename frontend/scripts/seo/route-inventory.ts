import { seoRegistry } from '../../src/features/seo/registry';
import { serviceCategories, allServices } from '../../src/features/services/config';
import { STATIC_ROUTES, buildCanonicalUrl, PAGE_IMAGES } from './seo.config';

export interface RoutePage {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  canonical: string;
  noindex: boolean;
  image?: { src: string; alt: string };
  type: 'static' | 'category' | 'service';
  hasFaqs: boolean;
}

/**
 * The full public route inventory — every static route (from the registry) plus every
 * dynamic category/service route (from the services config). This is the single dataset
 * every generator and validator in the pipeline reads from, so they can never drift apart.
 */
export function buildRouteInventory(): RoutePage[] {
  const pages: RoutePage[] = [];

  for (const path of STATIC_ROUTES) {
    const entry = seoRegistry[path];
    if (!entry) continue;
    pages.push({
      path,
      title: entry.title,
      description: entry.description,
      keywords: entry.keywords,
      canonical: buildCanonicalUrl(path),
      noindex: entry.robots?.index === false,
      image: PAGE_IMAGES[path],
      type: 'static',
      hasFaqs: false,
    });
  }

  const categories = Object.values(serviceCategories);

  for (const category of categories) {
    const path = `/services/${category.slug}`;
    pages.push({
      path,
      title: category.seo.title,
      description: category.seo.description,
      keywords: category.seo.keywords,
      canonical: buildCanonicalUrl(path),
      noindex: false,
      image: PAGE_IMAGES[path],
      type: 'category',
      hasFaqs: Boolean(category.faqs && category.faqs.length > 0),
    });
  }

  for (const service of Object.values(allServices)) {
    const category = categories.find((c) => c.id === service.categoryId);
    const categorySlug = category?.slug ?? service.categoryId;
    const path = `/services/${categorySlug}/${service.slug}`;
    pages.push({
      path,
      title: service.seo.title,
      description: service.seo.description,
      keywords: service.seo.keywords,
      canonical: buildCanonicalUrl(path),
      noindex: false,
      image: PAGE_IMAGES[path],
      type: 'service',
      hasFaqs: Boolean(service.faqs && service.faqs.length > 0),
    });
  }

  return pages;
}
