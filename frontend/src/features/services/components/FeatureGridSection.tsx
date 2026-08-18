/* eslint-disable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/prefer-nullish-coalescing */
import { memo } from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { ServiceBlockProps } from '../registry/BlockRenderer';
import * as LucideIcons from 'lucide-react';

interface FeatureItem {
  title: string;
  description?: string;
  iconKey?: string;
}

interface ExtendedEntity {
  whyChooseUs?: FeatureItem[];
  challenges?: FeatureItem[];
  solutions?: FeatureItem[];
  benefits?: FeatureItem[];
  compliance?: FeatureItem[];
  operations?: { scopeOfWork?: FeatureItem[], deliverables?: FeatureItem[] };
  process?: FeatureItem[];
  features?: FeatureItem[];
}

export const FeatureGridSection = memo(function FeatureGridSection({ entity, block }: ServiceBlockProps) {
  // Map block id to the correct data array on the entity
  let items: FeatureItem[] = [];
  let title = '';
  let eyebrow = '';

  const serviceEntity = entity as unknown as ExtendedEntity;
  switch (block.id) {
    case 'why-us':
      items = serviceEntity.whyChooseUs || [];
      title = 'Why Choose Kargar';
      eyebrow = 'The Enterprise Advantage';
      break;
    case 'challenges':
      items = serviceEntity.challenges || [];
      title = 'Business Challenges';
      eyebrow = 'Understanding Your Needs';
      break;
    case 'solutions':
      items = serviceEntity.solutions || [];
      title = 'Our Solutions';
      eyebrow = 'How We Fix It';
      break;
    case 'benefits':
      items = serviceEntity.benefits || serviceEntity.whyChooseUs || [];
      title = 'Key Benefits';
      eyebrow = 'What You Get';
      break;
    case 'compliance':
      items = serviceEntity.compliance || [];
      title = 'Trust & Compliance';
      eyebrow = 'Verified & Reliable';
      break;
    case 'scope':
      items = serviceEntity.operations?.scopeOfWork || [];
      title = 'Scope of Work';
      eyebrow = 'What We Do';
      break;
    case 'deliverables':
      items = serviceEntity.operations?.deliverables || [];
      title = 'Key Deliverables';
      eyebrow = 'Measurable Results';
      break;
    case 'process':
      items = serviceEntity.process || [];
      title = 'Our Process';
      eyebrow = 'How It Works';
      break;
    case 'features':
      items = serviceEntity.features || [];
      title = 'Key Features';
      eyebrow = 'What Makes Us Different';
      break;
    default:
      break;
  }

  if (!items || items.length === 0) return null;

  const bgClass = block.background === 'light' ? 'bg-slate-50' 
                : block.background === 'dark' ? 'bg-navy-900' 
                : 'bg-white';

  const renderVariant = () => {
    switch (block.variant) {
      case 'checklist':
        return (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                   <LucideIcons.Check size={14} strokeWidth={3} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-900 mb-1">{item.title}</h3>
                  {item.description && <p className="text-slate-600">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'list':
      case 'timeline':
        return (
          <ol className="max-w-3xl mx-auto space-y-8 list-none">
            {items.map((item, i) => (
              <li key={i} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div aria-hidden="true" className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  {i < items.length - 1 && <div className="w-px h-full bg-orange-100 my-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="text-xl font-bold text-navy-900 mb-2">{item.title}</h3>
                  {item.description && <p className="text-slate-600 leading-relaxed">{item.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        );

      case 'highlight':
      case 'cards':
      default:
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, i) => {
              const iconKey = item.iconKey || 'check-circle';
              
              // Helper function to find icon (case-insensitive)
              const findIcon = (key: string) => {
                const iconName = Object.keys(LucideIcons).find(
                  (name) => name.toLowerCase() === key.toLowerCase().replace(/-/g, '')
                );
                return iconName ? LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType : LucideIcons.CheckCircle;
              };
              
              const IconComponent = findIcon(iconKey);
              
              return (
                <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                    <IconComponent size={28} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-3">{item.title}</h3>
                  {item.description && <p className="text-slate-600 leading-relaxed">{item.description}</p>}
                </div>
              );
            })}
          </div>
        );
    }
  };

  return (
    <section id={block.id} className={`py-20 lg:py-28 ${bgClass}`}>
      <Container size="xl">
        <SectionHeading 
          title={title} 
          eyebrow={eyebrow}
          align="center"
          className="mb-16"
        />
        {renderVariant()}
      </Container>
    </section>
  );
});
