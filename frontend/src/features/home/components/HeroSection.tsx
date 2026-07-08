import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { heroImages } from '@/config/images';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useScrollReveal } from '@/hooks/animations/useScrollReveal';

export function HeroSection() {
  const containerRef = useScrollReveal();

  return (
    <section 
      id="hero" 
      ref={containerRef}
      className="relative flex min-h-[100svh] items-center pt-20 overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src={heroImages.background?.src ?? ''}
          alt={heroImages.background?.alt ?? ''}
          priority
          objectFit="cover"
          containerClassName="w-full h-full"
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-navy-950/70" />
      </div>

      <Container className="relative z-10 text-white pt-12 md:pt-24 pb-20">
        <div className="max-w-4xl">
          <div 
            data-gsap-reveal="fade-up" 
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm"
          >
            <ShieldCheck className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium tracking-wide">
              Pune's Premier Facility Management Partner
            </span>
          </div>
          
          <h1 
            data-gsap-reveal="fade-up"
            data-gsap-delay="0.1"
            className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl"
          >
            Elevating Workplaces.<br />
            <span className="text-orange-500">Empowering Business.</span>
          </h1>
          
          <p 
            data-gsap-reveal="fade-up"
            data-gsap-delay="0.2"
            className="mb-10 max-w-2xl text-lg text-gray-300 md:text-xl leading-relaxed"
          >
            We provide intelligent, integrated facility management solutions that optimize operations, 
            enhance safety, and create superior environments for enterprises across Pune.
          </p>
          
          <div 
            data-gsap-reveal="fade-up"
            data-gsap-delay="0.3"
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Button 
              size="lg" 
              rightIcon={<ArrowRight className="h-5 w-5" />}
              className="text-base"
              onClick={() => {
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Our Services
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-white border-white/30 hover:bg-white/10 focus-visible:ring-white text-base"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get a Free Consultation
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
