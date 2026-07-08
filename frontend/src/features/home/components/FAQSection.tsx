import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Accordion } from '@/components/ui/Accordion';
import { useScrollReveal } from '@/hooks/animations';

const faqs = [
  {
    title: 'What regions do you serve?',
    children: 'We serve businesses across Pune with dedicated on-ground teams covering major commercial, IT, residential, and industrial areas.',
  },
  {
    title: 'Are your staff members background verified?',
    children: 'Yes, 100% of our workforce undergoes rigorous police verification and background checks before deployment. They also receive extensive training on safety, compliance, and soft skills.',
  },
  {
    title: 'How do you ensure service quality?',
    children: 'We use a proprietary CMMS (Computerized Maintenance Management System) that tracks daily tasks, SLA compliance, and allows clients to monitor performance in real-time. We also conduct regular surprise audits.',
  },
  {
    title: 'Can you handle specialized healthcare facility management?',
    children: 'Absolutely. We have a dedicated healthcare division trained in NABH compliance, infection control protocols, and biomedical waste management.',
  },
  {
    title: 'Do you provide eco-friendly cleaning solutions?',
    children: 'Yes, sustainability is one of our core values. We use green-certified cleaning chemicals and implement water and energy conservation practices across all our sites.',
  },
];

export function FAQSection() {
  const containerRef = useScrollReveal();

  return (
    <section id="faq" className="section-padding bg-gray-50" ref={containerRef}>
      <Container size="md">
        <SectionHeading
          align="center"
          eyebrow="FAQ"
          title="Common Questions"
          data-gsap-reveal="fade-up"
        />
        
        <div data-gsap-reveal="fade-up" data-gsap-delay="0.2">
          <Accordion items={faqs} />
        </div>
      </Container>
    </section>
  );
}
