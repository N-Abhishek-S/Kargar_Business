import { useParams, Navigate } from 'react-router';
import { useServices } from '../hooks/useServices';
import { CategoryLayout } from '../layouts/CategoryLayout';
import { SEO } from '@/components/seo/SEO';

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { getCategory, getServicesByCategory } = useServices();

  if (!categoryId) return <Navigate to="/services" replace />;

  const category = getCategory(categoryId);
  if (!category) return <Navigate to="/404" replace />;

  const services = getServicesByCategory(category.id);

  return (
    <>
      <SEO 
        title={category.seo.title} 
        description={category.seo.description}
      />
      <CategoryLayout category={category} services={services} />
    </>
  );
}
