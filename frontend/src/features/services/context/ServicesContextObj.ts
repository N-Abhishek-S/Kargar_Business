import { createContext } from 'react';
import type { Category, Service } from '../domain/service.types';

export interface ServicesContextType {
  categories: Category[];
  services: Service[];
  getCategory: (id: string) => Category | undefined;
  getService: (id: string) => Service | undefined;
  getServicesByCategory: (categoryId: string) => Service[];
}

export const ServicesContext = createContext<ServicesContextType | undefined>(undefined);
