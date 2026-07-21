import { serviceCategories } from '@/features/services/config';
import type { BreadcrumbItem } from '@/features/services/components/Breadcrumb';
import type { Category, Service } from '@/features/services/domain/service.types';

/**
 * Builds the "Services > Category > Service" breadcrumb trail for a category or service entity.
 * Shared by HeroSection (visible breadcrumb) and SEO (BreadcrumbList schema) so the trail
 * never drifts between what's shown on the page and what's in structured data.
 */
export function buildServiceBreadcrumbs(entity: Category | Service): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Services', href: '/services' }];
  const isService = 'categoryId' in entity;

  if (isService) {
    const service = entity;
    const category = Object.values(serviceCategories).find((c) => c.id === service.categoryId);
    if (category) {
      breadcrumbs.push({ label: category.title, href: `/services/${category.slug}` });
    }
    breadcrumbs.push({ label: service.title, href: '#' });
  } else {
    breadcrumbs.push({ label: entity.title, href: '#' });
  }

  return breadcrumbs;
}
