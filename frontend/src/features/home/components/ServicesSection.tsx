import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { serviceImages } from '@/config/images';
import {
  ArrowRight,
  Brush,
  Wrench,
  ShieldCheck,
  SprayCanIcon,
  Headset,
} from 'lucide-react';
import { useStaggerReveal } from '@/hooks/animations';

/**
 * Icon badge color variants matching the service design system.
 * Each service gets a unique color for its overlapping badge.
 */
const iconColors = [
  { bg: 'bg-blue-500', text: 'text-white' },       // Soft Services
  { bg: 'bg-orange-500', text: 'text-white' },      // Hard Services
  { bg: 'bg-emerald-500', text: 'text-white' },     // Security Services
  { bg: 'bg-blue-600', text: 'text-white' },        // Housekeeping Services
  { bg: 'bg-orange-600', text: 'text-white' },      // Facility Support
] as const;

const services = [
  {
    title: 'Soft Services',
    description:
      'Housekeeping, pantry, security, waste management and more to keep your environment clean and hygienic.',
    image: serviceImages.softServices,
    icon: Brush,
  },
  {
    title: 'Hard Services',
    description:
      'Electrical, HVAC, plumbing, firefighting, civil & building maintenance for smooth & reliable operations.',
    image: serviceImages.hardServices,
    icon: Wrench,
  },
  {
    title: 'Security Services',
    description:
      'Professional security personnel and advanced surveillance solutions to ensure safety 24/7.',
    image: serviceImages.security,
    icon: ShieldCheck,
  },
  {
    title: 'Housekeeping Services',
    description:
      'High-quality cleaning solutions for workplaces, ensuring hygiene, health, and a great first impression.',
    image: serviceImages.housekeeping,
    icon: SprayCanIcon,
  },
  {
    title: 'Facility Support',
    description:
      'Manpower, helpdesk, admin support and customized facility management solutions.',
    image: serviceImages.facilitySupport,
    icon: Headset,
  },
];

export function ServicesSection() {
  const containerRef = useStaggerReveal();

  return (
    <section id="services" className="section-padding bg-white">
      <Container size="2xl">
        <SectionHeading
          align="center"
          eyebrow="What We Offer"
          title="Our Integrated Facility Management Services"
        />

        <div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-7"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            const color = iconColors[index % iconColors.length] ?? iconColors[0];
            return (
              <div
                key={index}
                data-gsap-stagger-item
                className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2"
              >
                {/* ── Image ── */}
                <div className="overflow-hidden rounded-t-2xl">
                  <OptimizedImage
                    src={service.image?.src ?? ''}
                    alt={service.image?.alt ?? ''}
                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* ── Icon badge (sits between image and text) ── */}
                <div className="px-5 -mt-6 relative z-10">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${color.bg} ${color.text}`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                </div>

                {/* ── Content ── */}
                <div className="flex flex-col flex-1 px-5 pt-3 pb-5">
                  <h3 className="text-lg font-bold text-navy-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1">
                    {service.description}
                  </p>
                  <button className="flex items-center text-orange-500 font-semibold text-sm group/btn mt-auto">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
