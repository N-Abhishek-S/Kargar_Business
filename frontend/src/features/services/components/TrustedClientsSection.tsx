/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';
import { Container } from '@/components/ui/Container';
import type { ServiceBlockProps } from '../registry/BlockRenderer';

export const TrustedClientsSection = memo(function TrustedClientsSection({ entity, block }: ServiceBlockProps) {
  // Safe cast since we don't have clients in BaseEntity yet
  const clients = (entity as unknown as { clients?: any[] }).clients;
  
  if (!clients || clients.length === 0) return null;

  const bgClass = block.background === 'light' ? 'bg-slate-50' 
                : block.background === 'dark' ? 'bg-navy-900' 
                : 'bg-white';

  return (
    <section id={block.id} className={`py-12 border-b border-slate-100 ${bgClass}`}>
      <Container size="xl">
        <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">
          Trusted By Industry Leaders
        </p>
        <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {clients.map((client: { name: string; logoUrl: string }, index: number) => (
             <div key={index} className="flex items-center justify-center">
                {/* Normally an OptimizedImage here */}
                <img src={client.logoUrl} alt={client.name} className="h-10 object-contain" />
             </div>
          ))}
        </div>
      </Container>
    </section>
  );
});
