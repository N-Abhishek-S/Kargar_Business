import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Download } from 'lucide-react';
import { useScrollReveal } from '@/hooks/animations';

const caseStudies = [
  {
    title: 'Fortune 500 IT Park, Hinjewadi',
    challenge: 'High energy costs and inconsistent housekeeping across a 2M sq.ft. campus.',
    solution: 'Implemented IoT-based energy monitoring and a mechanized cleaning schedule.',
    result: '22% reduction in energy costs and 100% SLA compliance within 3 months.',
    tag: 'Energy Optimization',
  },
  {
    title: 'Multi-Specialty Hospital, Baner',
    challenge: 'Critical need for hospital-grade infection control and 24/7 MEP reliability.',
    solution: 'Deployed NABH-compliant cleaning protocols and predictive maintenance for HVAC.',
    result: 'Zero downtime in critical areas and perfectly maintained sterile zones.',
    tag: 'Healthcare',
  },
];

export function CaseStudiesSection() {
  const containerRef = useScrollReveal();

  return (
    <section id="case-studies" className="section-padding bg-navy-900 text-white" ref={containerRef}>
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <SectionHeading
            dark
            eyebrow="Success Stories"
            title="Impact We've Created"
            className="mb-0"
            data-gsap-reveal="fade-right"
          />
          <Button 
            variant="outline" 
            className="text-white border-white/30 hover:bg-white/10 shrink-0 w-fit"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            data-gsap-reveal="fade-left"
          >
            View All Case Studies
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {caseStudies.map((study, index) => (
            <div 
              key={index}
              data-gsap-reveal="fade-up"
              data-gsap-delay={index * 0.2}
              className="bg-navy-800 rounded-2xl p-8 border border-navy-700 flex flex-col h-full hover:border-orange-500/50 transition-colors"
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold mb-6 w-fit">
                {study.tag}
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">{study.title}</h3>
              
              <div className="space-y-4 mb-8 flex-1">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Challenge</h4>
                  <p className="text-gray-300">{study.challenge}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Solution</h4>
                  <p className="text-gray-300">{study.solution}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Result</h4>
                  <p className="text-orange-400 font-medium">{study.result}</p>
                </div>
              </div>
              
              <button className="flex items-center text-sm font-semibold text-gray-300 hover:text-white group transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Download Full Report
              </button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
