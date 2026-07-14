import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { serviceCategories, allServices } from '../config';
import { ServicesContext } from './ServicesContextObj';

export function ServicesProvider({ children }: { children: ReactNode }) {
  const categoriesList = useMemo(() => Object.values(serviceCategories), []);
  const servicesList = useMemo(() => Object.values(allServices), []);

  const getCategory = useMemo(() => (id: string) => categoriesList.find((c) => c.id === id || c.slug === id), [categoriesList]);
  const getService = useMemo(() => (id: string) => servicesList.find((s) => s.id === id || s.slug === id), [servicesList]);
  const getServicesByCategory = useMemo(() => (categoryId: string) => servicesList.filter((s) => s.categoryId === categoryId), [servicesList]);

  const value = useMemo(
    () => ({
      categories: categoriesList,
      services: servicesList,
      getCategory,
      getService,
      getServicesByCategory,
    }),
    [categoriesList, servicesList, getCategory, getService, getServicesByCategory]
  );

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}
