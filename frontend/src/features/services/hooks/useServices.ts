import { useContext } from 'react';
import { ServicesContext } from '../context/ServicesContextObj';

export function useServices() {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  const { categories, services, getCategory, getService, getServicesByCategory } = context;

  const getFeaturedServices = () => services.filter((s) => s.content?.status === 'published');
  
  const getRelatedServices = (serviceId: string) => {
    const service = getService(serviceId);
    if (!service?.relationships?.relatedServices) return [];
    return service.relationships.relatedServices
      .map((id: string) => getService(id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);
  };

  const searchServices = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(lowerQuery) ||
        s.shortDescription.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    categories,
    services,
    getCategory,
    getService,
    getServicesByCategory,
    getFeaturedServices,
    getRelatedServices,
    searchServices,
  };
}
