import { memo, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { ServiceBlockProps } from '../registry/BlockRenderer';
import { ChevronDown } from 'lucide-react';

export const FAQSection = memo(function FAQSection({ entity, block }: ServiceBlockProps) {
  const faqs = entity.faqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  if (!faqs || faqs.length === 0) return null;

  const bgClass = block.background === 'light' ? 'bg-slate-50' 
                : block.background === 'dark' ? 'bg-navy-900' 
                : 'bg-white';

  return (
    <section id={block.id} className={`py-20 lg:py-28 ${bgClass}`}>
      <Container size="md">
        <SectionHeading 
          title="Frequently Asked Questions" 
          eyebrow="Got Questions?"
          align="center"
          className="mb-12"
        />
        
        <div className="max-w-3xl mx-auto divide-y divide-slate-100">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className={`border rounded-xl transition-all duration-300 ${isOpen ? 'border-orange-500 bg-white shadow-md' : 'border-slate-200 bg-white hover:border-orange-300'}`}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-hidden"
                  onClick={() => { setOpenIndex(isOpen ? null : i); }}
                  aria-expanded={isOpen}
                >
                  <span className={`font-bold text-lg ${isOpen ? 'text-orange-600' : 'text-navy-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-orange-600' : 'text-slate-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
});
