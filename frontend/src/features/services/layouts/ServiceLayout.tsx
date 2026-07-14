import type { Category, Service } from '../domain/service.types';
import { LayoutEngine } from '../registry/LayoutEngine';

interface ServiceLayoutProps {
  service: Service;
  category: Category;
  relatedServices: Service[];
}

export function ServiceLayout({ service }: ServiceLayoutProps) {
  // We use LayoutEngine for the entire page composition, driven by layout presets.
  return (
    <div className="bg-white min-h-screen">
      <LayoutEngine entity={service} />
    </div>
  );
}
