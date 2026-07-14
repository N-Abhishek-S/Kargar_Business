import { useParams, Navigate } from 'react-router';
import { useServices } from '../hooks/useServices';
import { ServiceLayout } from '../layouts/ServiceLayout';
import { SEO } from '@/components/seo/SEO';

export function ServicePage() {
  const { categoryId, serviceId } = useParams<{ categoryId: string; serviceId: string }>();
  const { getService, getCategory, getRelatedServices } = useServices();

  if (!serviceId || !categoryId) return <Navigate to="/services" replace />;

  const service = getService(serviceId);
  const category = getCategory(categoryId);
  
  if (!service || !category) return <Navigate to="/404" replace />;

  const relatedServices = getRelatedServices(service.id);

  return (
    <>
      <SEO 
        title={service.seo.title} 
        description={service.seo.description}
      />
      <ServiceLayout 
        service={service} 
        category={category} 
        relatedServices={relatedServices} 
      />
    </>
  );
}
