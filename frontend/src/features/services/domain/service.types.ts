/* eslint-disable @typescript-eslint/no-explicit-any */
export type ContentStatus = 'draft' | 'review' | 'published' | 'deprecated' | 'archived';

// Phase 2: Will be used for CMS integration, added now for structural readiness
export interface ContentMetadata {
  version: number;
  status: ContentStatus;
  lastUpdated: string;
  author: string;
  reviewedBy?: string;
  publishedAt?: string;
}

export type ServiceType = 
  | 'technical'
  | 'cleaning'
  | 'security'
  | 'support'
  | 'landscaping';

export const BlockType = {
  Hero: "hero",
  Statistics: "statistics",
  TrustedClients: "trusted-clients",
  Overview: "overview",
  FeatureGrid: "feature-grid",
  Collection: "collection",
  FAQ: "faq",
  CTA: "cta",
  Gallery: "gallery",
  Testimonial: "testimonial",
} as const;
export type BlockType = typeof BlockType[keyof typeof BlockType];

export const FeatureGridVariant = {
  Cards: "cards",
  Highlight: "highlight",
  List: "list",
  Checklist: "checklist",
  Comparison: "comparison",
  Timeline: "timeline",
  Statistics: "statistics",
  Numbered: "numbered",
  IconOnly: "icon-only",
  ImageCards: "image-cards",
} as const;
export type FeatureGridVariant = typeof FeatureGridVariant[keyof typeof FeatureGridVariant];

export const CollectionVariant = {
  Service: "service",
  Industry: "industry",
  Related: "related",
  Equipment: "equipment",
  Carousel: "carousel",
  Masonry: "masonry",
  Horizontal: "horizontal",
  Slider: "slider",
  Timeline: "timeline",
} as const;
export type CollectionVariant = typeof CollectionVariant[keyof typeof CollectionVariant];

export const BackgroundIntent = {
  Light: "light",
  White: "white",
  Dark: "dark",
  Accent: "accent",
} as const;
export type BackgroundIntent = typeof BackgroundIntent[keyof typeof BackgroundIntent];

export interface BlockAnalytics {
  name: string;
  trackView?: boolean;
  trackCTA?: boolean;
}

export interface PageBlock {
  schemaVersion: 1;
  id: string;
  type: BlockType;
  variant?: string; // FeatureGridVariant | CollectionVariant | string
  order: number;
  background?: BackgroundIntent;
  condition?: (entity: ExtendedEntity) => boolean;
  // Performance Metadata
  lazy?: boolean;
  priority?: number; // lower means higher priority loading
  prefetch?: boolean;
  analytics?: BlockAnalytics;
}

export type ServiceCapability = 
  | '24x7-support' 
  | 'preventive-maintenance' 
  | 'emergency-response' 
  | 'iso-compliance'
  | 'police-verified'
  | 'ppe-compliant'
  | 'sla-driven';

export interface MarketingData {
  headline: string;
  summary: string;
  ctaText?: string;
}

export interface ScopeItem {
  title: string;
  description?: string;
}

export interface Equipment {
  name: string;
  iconKey?: string;
}

export interface Deliverable {
  title: string;
  description: string;
}

export interface OperationsData {
  scopeOfWork: ScopeItem[];
  equipmentMaintained?: Equipment[];
  deliverables?: Deliverable[];
}

export interface ServiceFeature {
  title: string;
  description: string;
}

export interface ServiceProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
}

export interface Relationships {
  relatedServices?: string[];
  crossSellServices?: string[];
  recommendedServices?: string[];
  featuredServices?: string[];
}

export interface BaseEntity {
  id: string;
  slug: string;
  title: string;
  iconKey: string;
  imageKey: string;
  seo: SEOData;
  layoutPreset: string; // The preset ID to load blocks from
  marketing?: MarketingData;
  content?: ContentMetadata;
  // Shared data fields that blocks consume
  faqs?: ServiceFAQ[];
  statistics?: { value: string; label: string; suffix?: string }[];
  industries?: { title: string; iconKey: string }[];
  whyChooseUs?: { title: string; description: string; iconKey: string }[];
}

export interface ExtendedEntity extends BaseEntity {
  challenges?: any[];
  solutions?: any[];
  benefits?: any[];
  gallery?: any[];
  testimonials?: any[];
  process?: any[];
  compliance?: any[];
  operations?: { scopeOfWork?: any[], equipmentMaintained?: any[], deliverables?: any[] };
  relationships?: { relatedServices?: any[] };
  features?: any[];
}

export interface Service extends BaseEntity {
  categoryId: string;
  serviceType: ServiceType;
  shortDescription: string;
  overview: string;
  capabilities?: ServiceCapability[];
  operations?: OperationsData;
  features?: ServiceFeature[];
  process?: ServiceProcessStep[];
  certifications?: string[];
  compliance?: string[];
  relationships?: Relationships;
  order: number;
}

export interface Category extends BaseEntity {
  shortDescription: string;
  overview: string;
  showInNavigation: boolean;
  priority: number;
}
