import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useStaggerReveal } from '@/hooks/animations';
import { useServices } from '@/features/services/hooks/useServices';
import { ServiceCategoryCard } from '@/features/services/components/ServiceCategoryCard';

export function ServicesSection() {
  const containerRef = useStaggerReveal();
  const { categories } = useServices();

  // We only want to display top level categories here (Hard and Soft services)
  const displayCategories = categories.filter(c => c.showInNavigation).sort((a, b) => a.priority - b.priority);

  return (
    <section id="services" className="section-padding bg-gray-50">
      <Container size="xl">
        <SectionHeading
          align="center"
          eyebrow="What We Offer"
          title="Our Integrated Facility Management Services"
        />

        <div
          ref={containerRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 max-w-7xl mx-auto"
        >
          {displayCategories.map((category) => (
            <div key={category.id} data-gsap-stagger-item className="h-full flex">
              <div className="w-full h-full">
                <ServiceCategoryCard category={category} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
