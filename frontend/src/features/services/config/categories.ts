import type { Category } from '../domain/service.types';


export const serviceCategories: Record<string, Category> = {
  hard: {
    id: 'hard',
    slug: 'hard-services',
    title: 'Hard Services',
    shortDescription: 'Reliable engineering and maintenance solutions for seamless operations.',
    overview: 'Our Hard Services encompass the critical engineering and structural maintenance required to keep your facilities running smoothly. We provide expert electrical, plumbing, HVAC, and civil maintenance, ensuring that your core infrastructure operates at peak performance. With our preventive and breakdown maintenance strategies, we minimize downtime and extend the lifespan of your assets.',
    iconKey: 'wrench',
    imageKey: 'hardServices',
    seo: {
      title: 'Hard Facility Management',
      description: 'Expert hard services covering HVAC, electrical, and plumbing maintenance that keep enterprise facilities running safely with minimal downtime.',
      keywords: ['Hard Services', 'Building Maintenance', 'MEP Maintenance', 'Preventive Maintenance'],
    },
    showInNavigation: true,
    priority: 1,
    layoutPreset: 'categoryDefault',
    statistics: [
      { value: '25+', label: 'Years Experience' },
      { value: '150+', label: 'Engineers' },
      { value: '99%', label: 'SLA Compliance' },
    ],
  },
  soft: {
    id: 'soft',
    slug: 'soft-services',
    title: 'Soft Services',
    shortDescription: 'Professional cleaning, security, and facility support services.',
    overview: 'Our Soft Services create a clean, safe, and welcoming environment for your employees and visitors. From professional housekeeping and deep cleaning to comprehensive security and pest control, we handle the day-to-day services that enhance the quality of your workspace. Our trained staff ensures high standards of hygiene and safety across all your facilities.',
    iconKey: 'brush',
    imageKey: 'softServices',
    seo: {
      title: 'Soft Facility Management',
      description: 'Professional soft services covering housekeeping, security, pest control, and facility support that keep your workplace clean, safe, and welcoming.',
      keywords: ['Soft Services', 'Housekeeping Services', 'Security Solutions', 'Facility Support Services'],
    },
    showInNavigation: true,
    priority: 2,
    layoutPreset: 'categoryDefault',
    statistics: [
      { value: '500+', label: 'Trained Staff' },
      { value: '5M+', label: 'Sq. Ft. Managed' },
      { value: '24/7', label: 'Support Available' },
    ],
  },
};
