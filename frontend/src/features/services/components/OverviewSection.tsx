/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { memo } from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { ServiceBlockProps } from '../registry/BlockRenderer';

export const OverviewSection = memo(function OverviewSection({ entity, block }: ServiceBlockProps) {
  const overview = (entity as any).overview;
  if (!overview) return null;

  const bgClass = block.background === 'light' ? 'bg-slate-50' 
                : block.background === 'dark' ? 'bg-navy-900' 
                : 'bg-white';
                
  const textColor = block.background === 'dark' ? 'text-gray-300' : 'text-slate-600';

  return (
    <section id={block.id} className={`py-20 lg:py-28 ${bgClass}`}>
      <Container size="md" className="mx-auto text-center">
        <SectionHeading 
          title="Business Overview" 
          eyebrow={entity.title}
          align="center"
          className="mb-8"
        />
        <p className={`text-lg md:text-xl leading-relaxed ${textColor} max-w-[75ch] mx-auto`}>
          {overview}
        </p>
      </Container>
    </section>
  );
});
