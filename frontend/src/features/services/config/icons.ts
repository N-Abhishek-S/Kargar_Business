import { Brush, Wrench, Shield, SprayCan, Headset, Zap, Wind } from 'lucide-react';
import type { ElementType } from 'react';

// Maps string keys from the data model to actual React components
export const serviceIcons: Record<string, ElementType> = {
  brush: Brush,
  wrench: Wrench,
  shield: Shield,
  sparkles: SprayCan,
  headset: Headset,
  zap: Zap,
  wind: Wind,
};
