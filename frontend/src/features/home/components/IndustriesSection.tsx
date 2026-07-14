import { Container } from '@/components/ui/Container';
import { Building2, Factory, Plane, Home, PlusSquare, ShoppingBag, Package, Bed, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/animations';

const sectors = [
  {
    name: 'IT Parks',
    icon: Building2,
    description: 'High-performance facility services for modern IT campuses.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
  },
  {
    name: 'Manufacturing',
    icon: Factory,
    description: 'Safe, efficient & reliable support for industrial operations.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80',
  },
  {
    name: 'Airport Lounges',
    icon: Plane,
    description: 'Premium housekeeping and facility management for airport spaces.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80',
  },
  {
    name: 'Corporate Offices',
    icon: Home,
    description: 'Smart, professional & seamless facility management for offices.',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80',
  },
  {
    name: 'Healthcare',
    icon: PlusSquare,
    description: 'Hygienic, safe & compliant facility solutions for hospitals.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80',
  },
  {
    name: 'Retail & Malls',
    icon: ShoppingBag,
    description: 'Clean, customer-friendly environments that elevate experience.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Warehouses',
    icon: Package,
    description: 'Efficient operations with organized and safe facility support.',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Hotels & Hospitality',
    icon: Bed,
    description: 'Exceptional housekeeping and guest experience support.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80',
  },
];

export function IndustriesSection() {
  const containerRef = useScrollReveal();

  return (
    <section id="sectors" ref={containerRef} className="py-24 bg-[#FFFFFF] relative overflow-hidden">
      <Container className="relative z-10">
        <div className="text-center mb-16" data-gsap-reveal="fade-up">
          <h2 className="text-[#06183a] text-4xl md:text-5xl font-[800] tracking-tight">
            Diverse sectors. Tailored solutions.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto">
          {sectors.map((sector, index) => {
            const Icon = sector.icon;
            return (
              <div 
                key={index}
                data-gsap-reveal="zoom-in"
                data-gsap-delay={index * 0.1}
                className="group relative flex flex-col justify-end h-[320px] rounded-[16px] overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${sector.image})` }}
                />
                
                {/* Gradient Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06183a] via-[#06183a]/80 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Content */}
                <div className="relative z-10 p-6 flex flex-col h-full justify-end">
                  <div className="flex flex-col flex-1 justify-end">
                    {/* Icon Box */}
                    <div className="bg-white w-12 h-12 rounded-[8px] flex items-center justify-center mb-5 shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <Icon className="w-6 h-6 text-[#ff5a0a]" strokeWidth={2.5} />
                    </div>
                    
                    {/* Title & Description */}
                    <h3 className="font-[700] text-xl text-white mb-2 tracking-tight">
                      {sector.name}
                    </h3>
                    <p className="text-sm text-gray-300 font-[500] leading-relaxed mb-6 line-clamp-3">
                      {sector.description}
                    </p>
                  </div>

                  {/* Bottom Action Row (Arrow only, active clients removed) */}
                  <div className="flex items-center justify-end mt-auto pt-4 border-t border-white/10">
                    <ArrowRight className="w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
