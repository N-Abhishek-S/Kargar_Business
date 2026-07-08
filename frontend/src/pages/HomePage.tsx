import { Layout } from '@/components/layout/Layout';

// Import all 14 sections
import { HeroSection } from '@/features/home/components/HeroSection';
import { ClientsSection } from '@/features/home/components/ClientsSection';
import { AboutSection } from '@/features/home/components/AboutSection';
import { ServicesSection } from '@/features/home/components/ServicesSection';
import { StatisticsSection } from '@/features/home/components/StatisticsSection';
import { IndustriesSection } from '@/features/home/components/IndustriesSection';
import { WhyChooseUsSection } from '@/features/home/components/WhyChooseUsSection';
import { ProcessSection } from '@/features/home/components/ProcessSection';
import { CaseStudiesSection } from '@/features/home/components/CaseStudiesSection';
import { TestimonialsSection } from '@/features/home/components/TestimonialsSection';
import { PuneCoverageSection } from '@/features/home/components/PuneCoverageSection';
import { FAQSection } from '@/features/home/components/FAQSection';
import { ContactSection } from '@/features/home/components/ContactSection';
import { SEO } from '@/components/seo/SEO';

/**
 * Homepage - the main single-page application view.
 * Assembles all 14 enterprise sections.
 */
export function HomePage() {
  return (
    <>
      <SEO title="Home - Enterprise Facility Management" />

      <Layout>
        <main id="main-content">
          <HeroSection />
          <ClientsSection />
          <AboutSection />
          <ServicesSection />
          <StatisticsSection />
          <IndustriesSection />
          <WhyChooseUsSection />
          <ProcessSection />
          <CaseStudiesSection />
          <TestimonialsSection />
          <PuneCoverageSection />
          <FAQSection />
          <ContactSection />
        </main>
      </Layout>
    </>
  );
}
