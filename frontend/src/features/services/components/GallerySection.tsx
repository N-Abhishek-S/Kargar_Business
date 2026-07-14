/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import type { ServiceBlockProps } from '../registry/BlockRenderer';

export const GallerySection = memo(function GallerySection({ entity, block }: ServiceBlockProps) {
  const gallery = (entity as unknown as { gallery?: any[] }).gallery;
  
  if (!gallery || gallery.length === 0) return null;

  const bgClass = block.background === 'light' ? 'bg-slate-50' 
                : block.background === 'dark' ? 'bg-navy-900' 
                : 'bg-white';

  return (
    <section id={block.id} className={`py-20 lg:py-28 ${bgClass}`}>
      <Container size="xl">
        <SectionHeading 
          title="Our Work in Action" 
          eyebrow="Gallery"
          align="center"
          className="mb-12"
        />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((imageKey: string, i: number) => {
             // Ideally we map imageKey to a real asset from the Asset Registry
             // For now, we will use placeholder structural images
             const src = `/assets/services/gallery/${imageKey}.webp`;
             return (
               <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-200 group">
                 {/* 
                   Fallback placeholder if asset missing. In real app, OptimizedImage will handle fallback.
                 */}
                 <OptimizedImage 
                   src={src}
                   alt={`Gallery image ${i + 1}`}
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 />
                 <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/20 transition-colors duration-300" />
               </div>
             );
          })}
        </div>
      </Container>
    </section>
  );
});
