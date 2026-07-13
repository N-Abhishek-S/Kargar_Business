import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { aboutImages } from '@/config/images';
import { useScrollReveal } from '@/hooks/animations';
import { ShieldCheck, Cpu, Leaf, Clock, Users, BadgeCheck } from 'lucide-react';

const coreValues = [
  { label: 'Commitment to Safety & Compliance', icon: ShieldCheck },
  { label: 'Technology-Driven Operations', icon: Cpu },
  { label: 'Sustainable Practices', icon: Leaf },
  { label: '24/7 Rapid Response', icon: Clock },
  { label: 'Transparent Reporting', icon: BadgeCheck },
  { label: 'Highly Trained Workforce', icon: Users }
];

export function AboutSection() {
  const containerRef = useScrollReveal();

  return (
    <section id="about" ref={containerRef} className="section-padding bg-white overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          
          {/* Content */}
          <div className="max-w-sm mx-auto lg:max-w-none lg:mx-0 w-full">
            <SectionHeading
              data-gsap-reveal="fade-right"
              eyebrow="Who We Are"
              title="Redefining Facility Management in Pune"
              subtitle="Since 2010, Kargar FM has delivered world-class facility management services to leading Pune enterprises."
            />
            
            <div data-gsap-reveal="fade-right" data-gsap-delay="0.2" className="mb-8 prose prose-lg text-gray-600">
              <p>
                We understand that your facility is more than just a building - it's the foundation of your business operations. Our comprehensive suite of services ensures that your physical assets are maintained to the highest standards, allowing you to focus on your core business.
              </p>
            </div>

            <div data-gsap-reveal="fade-up" data-gsap-delay="0.3">
              <h3 className="text-xl font-bold text-navy-900 mb-4">Our Core Values</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coreValues.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <li key={index} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-orange-500 shrink-0" />
                      <span className="font-medium text-navy-800">{value.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Image */}
          <div data-gsap-reveal="fade-left" className="relative max-w-sm mx-auto lg:max-w-none lg:mx-0 w-full">
            <div className="absolute -inset-4 bg-orange-100 rounded-[2rem] transform rotate-3 scale-105 z-0" />
            <OptimizedImage
              src={aboutImages.office?.src ?? ''}
              alt={aboutImages.office?.alt ?? ''}
              containerClassName="rounded-2xl shadow-2xl relative z-10 aspect-[4/3]"
              className="w-full h-full"
            />
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 z-20 bg-white p-6 rounded-xl shadow-xl flex items-center gap-4">
              <div className="text-4xl font-bold text-orange-500">15+</div>
              <div className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
                Years of <br />Excellence
              </div>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
