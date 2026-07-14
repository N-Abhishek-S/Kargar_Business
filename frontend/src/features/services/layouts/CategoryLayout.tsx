import type { ReactNode } from 'react';
import type { Category, Service } from '../domain/service.types';
import { LayoutEngine } from '../registry/LayoutEngine';
import { Container } from '@/components/ui/Container';

interface CategoryLayoutProps {
  category: Category;
  services: Service[]; // kept for signature compatibility
  children?: ReactNode;
}

export function CategoryLayout({ category, children }: CategoryLayoutProps) {
  // We use LayoutEngine for the entire page composition, driven by layout presets.
  return (
    <div className="bg-gray-50 min-h-screen">
      <LayoutEngine entity={category} />
      {children && (
        <section className="py-16 bg-white">
          <Container>{children}</Container>
        </section>
      )}
    </div>
  );
}
