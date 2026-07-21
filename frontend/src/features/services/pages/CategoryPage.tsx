import { useParams, Navigate } from 'react-router';
import { useServices } from '../hooks/useServices';
import { CategoryLayout } from '../layouts/CategoryLayout';
import { SEO } from '@/components/seo/SEO';
import { config } from '@/config';
import { buildCanonicalUrl } from '@/lib/seo/canonical';
import { buildServiceBreadcrumbs } from '@/lib/seo/breadcrumbs';
import { buildCategoryServiceSchema } from '@/lib/seo/schema';
import { serviceImages } from '../config/images';

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { getCategory, getServicesByCategory } = useServices();

  if (!categoryId) return <Navigate to="/services" replace />;

  const category = getCategory(categoryId);
  if (!category) return <Navigate to="/404" replace />;

  const services = getServicesByCategory(category.id);
  const heroImage = serviceImages[category.imageKey];

  return (
    <>
      <SEO
        title={category.seo.title}
        description={category.seo.description}
        canonicalUrl={buildCanonicalUrl(`/services/${category.slug}`)}
        ogImage={heroImage ? `${config.siteUrl}${heroImage.src}` : undefined}
        breadcrumbItems={buildServiceBreadcrumbs(category)}
        schema={[buildCategoryServiceSchema(category)]}
      />
      <CategoryLayout category={category} services={services} />
    </>
  );
}
