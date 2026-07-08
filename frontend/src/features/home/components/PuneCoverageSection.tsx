import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useScrollReveal } from '@/hooks/animations';
import { MapPin } from 'lucide-react';

const locations = [
  { area: 'Hinjewadi', top: '32%', left: '28%' },
  { area: 'Baner', top: '42%', left: '34%' },
  { area: 'Kharadi', top: '42%', left: '66%' },
  { area: 'Hadapsar', top: '62%', left: '58%' },
  { area: 'Chakan', top: '22%', left: '48%' },
  { area: 'Pune', top: '50%', left: '48%' },
];

export function PuneCoverageSection() {
  const containerRef = useScrollReveal();

  return (
    <section className="section-padding bg-white overflow-hidden" ref={containerRef}>
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div data-gsap-reveal="fade-right">
            <SectionHeading
              eyebrow="Pune Local Presence"
              title="Pune Facility Management Coverage"
              subtitle="With dedicated local teams across Pune, we offer standardized facility management services to offices, IT parks, commercial sites, and industrial facilities."
            />
            
            <div className="grid sm:grid-cols-2 gap-6 mt-12">
              {locations.map((loc, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-navy-900">{loc.area}</span>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <span className="font-bold">+12</span>
                </div>
                <span className="font-semibold text-gray-600">More Pune Areas</span>
              </div>
            </div>
          </div>

          <div className="relative aspect-square max-w-lg mx-auto w-full" data-gsap-reveal="fade-left">
            {/* Abstract Pune coverage graphic */}
            <div className="absolute inset-0 bg-orange-50 rounded-full opacity-50 blur-3xl" />
            <svg viewBox="0 0 400 450" className="w-full h-full relative z-10 text-navy-100 drop-shadow-xl" fill="currentColor">
              {/* Simplified abstract polygon for illustration */}
              <path d="M150,50 L250,50 L300,150 L350,200 L300,300 L250,400 L200,420 L150,380 L100,300 L50,200 L100,100 Z" stroke="rgba(255,107,53,0.2)" strokeWidth="2" />
            </svg>
            
            {/* Location pins */}
            {locations.map((loc, index) => (
              <div 
                key={index}
                className="absolute w-4 h-4 -ml-2 -mt-2 group z-20"
                style={{ top: loc.top, left: loc.left }}
              >
                <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-75" />
                <div className="relative h-4 w-4 rounded-full bg-orange-500 border-2 border-white shadow-md" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1 bg-navy-900 text-white text-xs font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {loc.area}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy-900" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
