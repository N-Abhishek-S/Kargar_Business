import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useScrollReveal } from '@/hooks/animations';
import { ShieldCheck, Cpu, Leaf, Clock, Users, BadgeCheck } from 'lucide-react';

const reasons = [
  {
    title: 'ISO Certified',
    description: 'Adhering to global standards for quality, environment, and occupational health & safety.',
    icon: BadgeCheck,
  },
  {
    title: 'Tech-Enabled',
    description: 'Proprietary CMMS software for transparent reporting and predictive maintenance.',
    icon: Cpu,
  },
  {
    title: 'Sustainability First',
    description: 'Eco-friendly chemicals, water conservation, and energy optimization protocols.',
    icon: Leaf,
  },
  {
    title: '24/7 Command Center',
    description: 'Centralized helpdesk ensuring rapid response and resolution of all facility tickets.',
    icon: Clock,
  },
  {
    title: 'Vetted Workforce',
    description: '100% background-verified, extensively trained, and compliant staff.',
    icon: Users,
  },
  {
    title: 'Zero Harm Policy',
    description: 'Uncompromising stance on workplace safety with continuous audits.',
    icon: ShieldCheck,
  },
];

export function WhyChooseUsSection() {
  const containerRef = useScrollReveal();

  return (
    <section id="why-choose-us" className="section-padding bg-white" ref={containerRef}>
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32" data-gsap-reveal="fade-right">
            <SectionHeading
              eyebrow="The Kargar Advantage"
              title="Why Industry Leaders Trust Us"
              subtitle="We don't just maintain facilities; we optimize them for peak performance and longevity."
              className="mb-8"
            />
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-x-8 gap-y-12">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div 
                  key={index}
                  data-gsap-reveal="fade-up"
                  data-gsap-delay={index * 0.1}
                  className="group flex flex-col gap-4"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/20">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy-900 mb-2">{reason.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
