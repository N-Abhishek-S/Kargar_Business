 
import React, { Suspense } from 'react';
import { BlockType } from '../domain/service.types';
import type { PageBlock, BaseEntity } from '../domain/service.types';
import {
  HeroSection,
  StatisticsSection,
  TrustedClientsSection,
  OverviewSection,
  FeatureGridSection,
  CollectionSection,
  FAQSection,
  CTASection,
  GallerySection,
  TestimonialSection,
} from '../components';

export interface ServiceBlockProps<
  TEntity extends BaseEntity = BaseEntity,
  TData = unknown
> {
  entity: TEntity;
  block: PageBlock;
  data?: TData;
}

export interface RegistryEntry<TEntity extends BaseEntity = BaseEntity> {
  component: React.ComponentType<ServiceBlockProps<TEntity>> | null;
  lazy: boolean;
};

// Use unknown instead of any to fix ESLint error
const blockRegistryManifest: Record<string, RegistryEntry> = {
  [BlockType.Hero]: { component: HeroSection, lazy: false },
  [BlockType.Statistics]: { component: StatisticsSection, lazy: true },
  [BlockType.TrustedClients]: { component: TrustedClientsSection, lazy: true },
  [BlockType.Overview]: { component: OverviewSection, lazy: true }, 
  [BlockType.FAQ]: { component: FAQSection, lazy: true },
  [BlockType.CTA]: { component: CTASection, lazy: true },
  [BlockType.FeatureGrid]: { component: FeatureGridSection, lazy: true },
  [BlockType.Collection]: { component: CollectionSection, lazy: true },
  [BlockType.Gallery]: { component: GallerySection, lazy: true },
  [BlockType.Testimonial]: { component: TestimonialSection, lazy: true },
};

export const BlockRenderer = <T extends BaseEntity>({ 
  entity, 
  block, 
  data
}: ServiceBlockProps<T>) => {
  const isEnabled = (block as unknown as Record<string, unknown>).enabled;
  if (isEnabled === false) return null;

  // Render condition check
  if (block.condition && !block.condition(entity)) {
    return null; // Block conditions not met
  }

  const registryItem = blockRegistryManifest[block.type];
  if (!registryItem?.component) {
    console.warn(`BlockRenderer: Component not found or not mapped for block type "${block.type}"`);
    return null;
  }

  const Component = registryItem.component as unknown as React.ElementType<ServiceBlockProps<T>>;

  if (block.lazy ?? registryItem.lazy) {
    return (
      <Suspense fallback={<div className="h-24 flex items-center justify-center text-slate-400 animate-pulse">Loading section...</div>}>
        <Component entity={entity} block={block} data={data} />
      </Suspense>
    );
  }

  return <Component entity={entity} block={block} data={data} />;
};
