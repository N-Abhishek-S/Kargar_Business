import { useParams, Navigate } from 'react-router';
import { useServices } from '../hooks/useServices';
import { ServiceLayout } from '../layouts/ServiceLayout';
import { SEO } from '@/components/seo/SEO';
import { config } from '@/config';
import { buildCanonicalUrl } from '@/lib/seo/canonical';
import { buildServiceBreadcrumbs } from '@/lib/seo/breadcrumbs';
import { buildServiceSchema, buildFAQSchema } from '@/lib/seo/schema';
import { serviceImages } from '../config/images';

export function ServicePage() {
  const { categoryId, serviceId } = useParams<{ categoryId: string; serviceId: string }>();
  const { getService, getCategory, getRelatedServices } = useServices();

  if (!serviceId || !categoryId) return <Navigate to="/services" replace />;

  const service = getService(serviceId);
  const category = getCategory(categoryId);

  if (!service || !category) return <Navigate to="/404" replace />;

  const relatedServices = getRelatedServices(service.id);
  const heroImage = serviceImages[service.imageKey];

  return (
    <>
      <SEO
        title={service.seo.title}
        description={service.seo.description}
        canonicalUrl={buildCanonicalUrl(`/services/${category.slug}/${service.slug}`)}
        ogImage={heroImage ? `${config.siteUrl}${heroImage.src}` : undefined}
        breadcrumbItems={buildServiceBreadcrumbs(service)}
        schema={[
          buildServiceSchema(service, category),
          ...(service.faqs && service.faqs.length > 0 ? [buildFAQSchema(service.faqs)] : []),
        ]}
      />
      <ServiceLayout
        service={service}
        category={category}
        relatedServices={relatedServices}
      />
    </>
  );
}
