/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
import { memo } from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { ServiceBlockProps } from '../registry/BlockRenderer';
import { Quote } from 'lucide-react';

export const TestimonialSection = memo(function TestimonialSection({ entity, block }: ServiceBlockProps) {
  const testimonials = (entity as unknown as { testimonials?: { id?: string, quote?: string, author?: string, role?: string, company?: string }[] }).testimonials;
  
  if (!testimonials || testimonials.length === 0) return null;

  const bgClass = block.background === 'light' ? 'bg-slate-50' 
                : block.background === 'dark' ? 'bg-navy-900' 
                : 'bg-white';
                
  const textColor = block.background === 'dark' ? 'text-gray-300' : 'text-slate-600';
  const nameColor = block.background === 'dark' ? 'text-white' : 'text-navy-900';

  return (
    <section id={block.id} className={`py-20 lg:py-28 ${bgClass}`}>
      <Container size="xl">
        <SectionHeading 
          title="What Our Clients Say" 
          eyebrow="Testimonials"
          align="center"
          className="mb-16"
        />
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, i: number) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
              <Quote className="absolute top-6 right-6 text-orange-100" size={48} />
              <div className="relative z-10">
                <p className={`text-lg italic leading-relaxed mb-6 ${textColor}`}>
                  "{testimonial.quote}"
                </p>
                <div>
                  <h4 className={`font-bold ${nameColor}`}>{testimonial.author}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
});
