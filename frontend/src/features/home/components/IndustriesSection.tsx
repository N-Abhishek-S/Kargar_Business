import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Building2, Stethoscope, Factory, GraduationCap, ShoppingBag, Landmark } from 'lucide-react';
import { useScrollReveal } from '@/hooks/animations';

const industries = [
  { name: 'Corporate IT Parks', icon: Building2 },
  { name: 'Healthcare & Pharma', icon: Stethoscope },
  { name: 'Manufacturing', icon: Factory },
  { name: 'Education', icon: GraduationCap },
  { name: 'Retail & Malls', icon: ShoppingBag },
  { name: 'Banking & Finance', icon: Landmark },
];

export function IndustriesSection() {
  const containerRef = useScrollReveal();

  return (
    <section id="industries" ref={containerRef} className="section-padding bg-navy-900 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-navy-500/20 rounded-full blur-[100px] pointer-events-none" />

      <Container className="relative z-10">
        <SectionHeading
          dark
          align="center"
          eyebrow="Industries We Serve"
          title="Tailored Solutions Across Sectors"
          subtitle="We understand that every industry has unique compliance and operational requirements."
          data-gsap-reveal="fade-up"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
          {industries.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <div 
                key={index}
                data-gsap-reveal="zoom-in"
                data-gsap-delay={index * 0.1}
                className="group flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-navy-700 bg-navy-800/50 backdrop-blur-sm transition-all duration-300 hover:bg-navy-700 hover:border-orange-500"
              >
                <div className="h-16 w-16 rounded-full bg-navy-900 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:shadow-orange-500/20">
                  <Icon className="h-8 w-8 text-orange-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <h3 className="font-semibold text-lg text-gray-200 group-hover:text-white transition-colors">
                  {industry.name}
                </h3>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
