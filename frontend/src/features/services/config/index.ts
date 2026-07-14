import { serviceCategories } from './categories';
import { hardServices } from './hard-services';
import { softServices } from './soft-services';

export const allServices = {
  ...hardServices,
  ...softServices,
};

export { serviceCategories, hardServices, softServices };
