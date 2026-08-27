/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { memo } from 'react';
import { Link } from 'react-router';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { ServiceBlockProps } from '../registry/BlockRenderer';
import { useServices } from '../hooks/useServices';
import * as LucideIcons from 'lucide-react';
import type { Service } from '../domain/service.types';

interface ExtendedEntity {
  industries?: { title: string; iconKey?: string }[] | string[];
  operations?: { equipmentMaintained?: { name: string; iconKey?: string }[] };
  relationships?: { relatedServices?: string[] };
}

export const CollectionSection = memo(function CollectionSection({ entity, block }: ServiceBlockProps) {
  const { getServicesByCategory, getService } = useServices();
  const serviceEntity = entity as unknown as ExtendedEntity;

  const bgClass = block.background === 'light' ? 'bg-slate-50' 
                : block.background === 'dark' ? 'bg-navy-900' 
                : 'bg-white';

  const renderVariant = () => {
    switch (block.variant) {
      case 'industry': {
        const industries = serviceEntity.industries || [];
        if (industries.length === 0) return null;
        
        return (
          <>
            <SectionHeading title="Industries Served" eyebrow="Our Expertise" align="center" className="mb-12" />
            <div className="flex flex-wrap justify-center gap-4">
              {industries.map((industry, i: number) => {
                const title = typeof industry === 'string' ? industry : industry.title;
                return (
                  <div key={i} className="px-6 py-3 bg-white border border-slate-200 rounded-full text-navy-900 font-medium hover:border-orange-500 hover:text-orange-500 transition-colors cursor-default shadow-sm hover:shadow-md">
                    {title}
                  </div>
                );
              })}
            </div>
          </>
        );
      }
      case 'equipment': {
        const equipment = serviceEntity.operations?.equipmentMaintained || [];
        if (equipment.length === 0) return null;
        
        return (
          <>
            <SectionHeading title="Equipment We Maintain" eyebrow="Technical Capabilities" align="center" className="mb-12" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {equipment.map((eq, i: number) => {
                const iconKey = eq.iconKey || 'wrench';
                const findIcon = (key: string) => {
                  const iconName = Object.keys(LucideIcons).find(
                    (name) => name.toLowerCase() === key.toLowerCase().replace(/-/g, '')
                  );
                  return iconName ? LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType : LucideIcons.Wrench;
                };
                const IconComponent = findIcon(iconKey);
                return (
                  <div key={i} className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-xl hover:shadow-lg transition-all text-center group cursor-default">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                      <IconComponent size={24} />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">{eq.name}</h3>
                  </div>
                );
              })}
            </div>
          </>
        );
      }
      case 'service':
      case 'related': {
        let services: Service[];
        let title: string;
        let eyebrow: string;
        
        if (block.variant === 'related') {
          title = 'Related Services';
          eyebrow = 'Discover More';
          const relatedIds = serviceEntity.relationships?.relatedServices || [];
          services = relatedIds.map((id: string) => getService(id)).filter((s): s is Service => Boolean(s));
        } else {
          title = 'Included Services';
          eyebrow = 'What We Offer';
          services = getServicesByCategory(entity.id);
        }

        if (services.length === 0) return null;

        return (
          <>
             <SectionHeading title={title} eyebrow={eyebrow} align="center" className="mb-12" />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {services.map((service) => (
                 <Link key={service.id} to={`/services/${service.categoryId}-services/${service.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                   <div className="p-8">
                     <div className="w-14 h-14 bg-navy-50 rounded-xl flex items-center justify-center text-navy-900 mb-6 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                       <LucideIcons.Layers size={28} />
                     </div>
                     <h3 className="text-xl font-bold text-navy-900 mb-3">{service.title}</h3>
                     <p className="text-slate-600 line-clamp-3 leading-relaxed mb-6">{service.shortDescription}</p>
                     <div className="flex items-center text-orange-600 font-bold group-hover:gap-2 transition-all">
                       Learn More <LucideIcons.ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                     </div>
                   </div>
                 </Link>
               ))}
             </div>
          </>
        );
      }
      default:
        return null;
    }
  };

  const content = renderVariant();
  if (!content) return null;

  return (
    <section id={block.id} className={`py-20 lg:py-28 ${bgClass}`}>
      <Container size="xl">
        {content}
      </Container>
    </section>
  );
});
