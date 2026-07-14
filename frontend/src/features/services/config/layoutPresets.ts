 
import type { PageBlock } from '../domain/service.types';
import { BlockType, FeatureGridVariant, CollectionVariant, BackgroundIntent } from '../domain/service.types';

export const layoutPresets: Record<string, PageBlock[]> = {
  categoryDefault: [
    { id: 'hero', type: BlockType.Hero, order: 10, schemaVersion: 1, lazy: false, priority: 1, analytics: { name: 'hero', trackView: true } },
    { id: 'stats', type: BlockType.Statistics, order: 20, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, priority: 2 },
    { id: 'clients', type: BlockType.TrustedClients, order: 30, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, priority: 3, condition: (_entity) => true }, // Add real condition later
    { id: 'overview', type: BlockType.Overview, order: 40, schemaVersion: 1, background: BackgroundIntent.White, lazy: true },
    { id: 'challenges', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Cards, order: 50, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.challenges },
    { id: 'solutions', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Highlight, order: 60, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.solutions },
    { id: 'services', type: BlockType.Collection, variant: CollectionVariant.Service, order: 70, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true },
    { id: 'industries', type: BlockType.Collection, variant: CollectionVariant.Industry, order: 80, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.industries && entity.industries.length > 0 },
    { id: 'why-us', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Cards, order: 90, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.whyChooseUs },
    { id: 'benefits', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Checklist, order: 100, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.benefits },
    { id: 'process', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Timeline, order: 110, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.process },
    { id: 'compliance', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Cards, order: 120, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.compliance },
    { id: 'faq', type: BlockType.FAQ, order: 130, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.faqs && entity.faqs.length > 0 },
    { id: 'cta', type: BlockType.CTA, order: 140, schemaVersion: 1, background: BackgroundIntent.Dark, lazy: true, analytics: { name: 'cta', trackView: true, trackCTA: true } },
  ],
  enterpriseTechnical: [
    { id: 'hero', type: BlockType.Hero, order: 10, schemaVersion: 1, lazy: false, priority: 1, analytics: { name: 'hero' } },
    { id: 'overview', type: BlockType.Overview, order: 20, schemaVersion: 1, background: BackgroundIntent.White, lazy: true },
    { id: 'scope', type: BlockType.FeatureGrid, variant: FeatureGridVariant.List, order: 30, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.operations?.scopeOfWork },
    { id: 'equipment', type: BlockType.Collection, variant: CollectionVariant.Equipment, order: 40, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.operations?.equipmentMaintained },
    { id: 'features', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Cards, order: 50, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.features },
    { id: 'benefits', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Highlight, order: 60, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.whyChooseUs },
    { id: 'industries', type: BlockType.Collection, variant: CollectionVariant.Industry, order: 70, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.industries },
    { id: 'process', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Timeline, order: 80, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.process },
    { id: 'gallery', type: BlockType.Gallery, order: 90, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.gallery },
    { id: 'testimonials', type: BlockType.Testimonial, order: 100, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.testimonials },
    { id: 'faq', type: BlockType.FAQ, order: 110, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.faqs },
    { id: 'related', type: BlockType.Collection, variant: CollectionVariant.Related, order: 120, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.relationships?.relatedServices },
    { id: 'cta', type: BlockType.CTA, order: 130, schemaVersion: 1, background: BackgroundIntent.Dark, lazy: true, analytics: { name: 'cta' } },
  ],
  enterpriseCleaning: [
    { id: 'hero', type: BlockType.Hero, order: 10, schemaVersion: 1, lazy: false, priority: 1, analytics: { name: 'hero' } },
    { id: 'overview', type: BlockType.Overview, order: 20, schemaVersion: 1, background: BackgroundIntent.White, lazy: true },
    { id: 'scope', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Checklist, order: 30, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.operations?.scopeOfWork },
    { id: 'deliverables', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Cards, order: 40, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.operations?.deliverables },
    { id: 'why-us', type: BlockType.FeatureGrid, variant: FeatureGridVariant.Cards, order: 50, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.whyChooseUs },
    { id: 'industries', type: BlockType.Collection, variant: CollectionVariant.Industry, order: 60, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.industries },
    { id: 'gallery', type: BlockType.Gallery, order: 70, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.gallery },
    { id: 'testimonials', type: BlockType.Testimonial, order: 80, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.testimonials },
    { id: 'faq', type: BlockType.FAQ, order: 90, schemaVersion: 1, background: BackgroundIntent.Light, lazy: true, condition: (entity) => !!entity.faqs },
    { id: 'related', type: BlockType.Collection, variant: CollectionVariant.Related, order: 100, schemaVersion: 1, background: BackgroundIntent.White, lazy: true, condition: (entity) => !!entity.relationships?.relatedServices },
    { id: 'cta', type: BlockType.CTA, order: 110, schemaVersion: 1, background: BackgroundIntent.Dark, lazy: true, analytics: { name: 'cta' } },
  ]
};
