import { Container } from '@/components/ui/Container';
import { Counter } from '@/components/ui/Counter';
import { useScrollReveal } from '@/hooks/animations';
import { Building, Users, Clock, Award } from 'lucide-react';

const stats = [
  { value: 50, suffix: '+', label: 'Million Sq.Ft Managed', icon: Building },
  { value: 15, suffix: 'k+', label: 'Trained Professionals', icon: Users },
  { value: 24, suffix: '/7', label: 'Helpdesk Support', icon: Clock },
  { value: 100, suffix: '%', label: 'Compliance Rate', icon: Award },
];

export function StatisticsSection() {
  const containerRef = useScrollReveal();

  return (
    <section className="bg-navy-900 py-20 border-t border-navy-800" ref={containerRef}>
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                data-gsap-reveal="fade-up"
                data-gsap-delay={index * 0.15}
                className="relative"
              >
                {/* Separator line except for last item on desktop */}
                {index !== stats.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-navy-700" />
                )}
                
                <Counter
                  end={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  icon={<Icon className="h-8 w-8 mx-auto" />}
                  className="text-white"
                />
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
