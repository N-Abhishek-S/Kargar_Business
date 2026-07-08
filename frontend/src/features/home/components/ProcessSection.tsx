import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useScrollReveal } from '@/hooks/animations';

const steps = [
  {
    number: '01',
    title: 'Site Audit & Analysis',
    description: 'Comprehensive evaluation of your facility\'s current state, compliance, and energy usage.',
  },
  {
    number: '02',
    title: 'Customized Proposal',
    description: 'Designing a tailored SLA with optimized resource allocation and cost-saving measures.',
  },
  {
    number: '03',
    title: 'Seamless Transition',
    description: 'Structured handover process with minimal disruption to your daily operations.',
  },
  {
    number: '04',
    title: 'Continuous Optimization',
    description: 'Regular performance reviews, tech-driven reporting, and proactive improvements.',
  },
];

export function ProcessSection() {
  const containerRef = useScrollReveal();

  return (
    <section id="process" className="section-padding bg-gray-50" ref={containerRef}>
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Our Process"
          title="How We Deliver Excellence"
          subtitle="A structured, transparent onboarding and management methodology."
          data-gsap-reveal="fade-up"
        />

        <div className="mt-16 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 z-0" />

          <div className="grid md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index} 
                data-gsap-reveal="fade-up"
                data-gsap-delay={index * 0.15}
                className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div className="absolute -top-6 left-6 h-12 w-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  {step.number}
                </div>
                <h3 className="mt-8 text-xl font-bold text-navy-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
