import type { Service } from '../domain/service.types';


export const softServices: Record<string, Service> = {
  housekeeping: {
    id: 'housekeeping',
    categoryId: 'soft',
    slug: 'housekeeping',
    title: 'Housekeeping Services',
    shortDescription: 'Professional cleaning and hygiene management for a spotless workspace.',
    overview: 'Maintain a pristine and healthy environment with our professional housekeeping services. We provide comprehensive cleaning solutions tailored to your facility\'s unique needs. From daily janitorial tasks to specialized deep cleaning, our trained staff uses industry-leading equipment and eco-friendly products to ensure the highest standards of cleanliness and hygiene.',
    iconKey: 'sparkles',
    imageKey: 'housekeeping',
    seo: {
      title: 'Corporate Housekeeping Services',
      description: 'Top-tier corporate housekeeping and deep cleaning services to maintain a pristine, hygienic workspace, backed by trained and police-verified staff.',
      keywords: ['Corporate Housekeeping', 'Housekeeping Services', 'Deep Cleaning', 'Facility Hygiene']
    },
    serviceType: 'cleaning',
    layoutPreset: 'enterpriseCleaning',
    marketing: {
      headline: 'A Pristine Workspace for Peak Productivity.',
      summary: 'Ensure a spotless, hygienic, and welcoming environment for your employees and visitors.',
      ctaText: 'Get a Cleaning Audit'
    },
    operations: {
      scopeOfWork: [
        { title: 'Daily Janitorial', description: 'Dusting, vacuuming, and trash removal.' },
        { title: 'Restroom Hygiene', description: 'Strict sanitization protocols to prevent cross-contamination.' },
        { title: 'Deep Cleaning', description: 'Intensive periodic cleaning for specialized surfaces.' },
        { title: 'Consumables Management', description: 'Refilling soap, paper towels, and sanitizers.' }
      ],
      deliverables: [
        { title: 'Daily Cleaning Checklist', description: 'Signed logs of all daily cleaning tasks.' },
        { title: 'Monthly Hygiene Report', description: 'Detailed analysis of facility cleanliness.' }
      ]
    },
    capabilities: ['police-verified', 'iso-compliance', 'sla-driven'],
    whyChooseUs: [
      { title: 'Eco-Friendly', description: 'We use sustainable, non-toxic cleaning agents.', iconKey: 'leaf' },
      { title: 'Trained Personnel', description: 'Rigorous training in hospitality and hygiene.', iconKey: 'users' },
      { title: 'Quality Assurance', description: 'Regular unannounced inspections by supervisors.', iconKey: 'check-circle' }
    ],
    faqs: [
      { question: 'What is included in daily housekeeping?', answer: 'Tasks include emptying trash, vacuuming, mopping, cleaning restrooms, and wiping surfaces.' },
      { question: 'Do you use eco-friendly cleaning products?', answer: 'Yes, we prioritize the use of environmentally friendly and non-toxic cleaning solutions.' },
      { question: 'Are your housekeeping staff background-checked?', answer: 'Absolutely. All our personnel undergo thorough police verification and background checks.' }
    ],
    relationships: {
      relatedServices: ['security']
    },
    order: 1,
  },
  security: {
    id: 'security',
    categoryId: 'soft',
    slug: 'security-services',
    title: 'Security Services',
    shortDescription: 'Comprehensive manned guarding and surveillance solutions.',
    overview: 'Safeguard your assets, employees, and visitors with our robust security services. We offer highly trained security personnel, access control management, and surveillance monitoring. Our proactive approach to security ensures a safe environment, deterring potential threats and providing rapid response to any incidents.',
    iconKey: 'shield',
    imageKey: 'security',
    seo: {
      title: 'Corporate Security Services',
      description: 'Reliable trained security guards, access control, and CCTV surveillance monitoring for complete corporate and industrial facility protection.',
      keywords: ['Corporate Security Services', 'Security Guard Services', 'Trained Security Guards', 'Security Solutions'],
    },
    serviceType: 'security',
    layoutPreset: 'enterpriseTechnical',
    marketing: {
      headline: 'Uncompromising Protection for Your Business.',
      summary: 'Deter threats and ensure peace of mind with our highly trained security personnel.',
      ctaText: 'Request Security Assessment'
    },
    operations: {
      scopeOfWork: [
        { title: 'Manned Guarding', description: 'Trained security officers for static guarding and patrols.' },
        { title: 'Access Control', description: 'Managing entry and exit points to prevent unauthorized access.' },
        { title: 'CCTV Monitoring', description: '24/7 surveillance monitoring and incident recording.' },
        { title: 'Emergency Response', description: 'Rapid deployment and coordination during critical incidents.' }
      ],
      deliverables: [
        { title: 'Visitor Logs', description: 'Digital or physical logs of all facility visitors.' },
        { title: 'Incident Reports', description: 'Detailed documentation of any security breaches.' }
      ]
    },
    capabilities: ['24x7-support', 'police-verified', 'emergency-response'],
    whyChooseUs: [
      { title: 'Vetted Professionals', description: 'Strict background checks and psychological profiling.', iconKey: 'shield-check' },
      { title: 'Advanced Training', description: 'Trained in conflict resolution and emergency response.', iconKey: 'crosshair' },
      { title: 'Rapid Deployment', description: 'Quickly scale security presence based on threat levels.', iconKey: 'zap' }
    ],
    faqs: [
      { question: 'Are your security guards armed or unarmed?', answer: 'We primarily provide unarmed personnel, but armed guards can be arranged depending on regulations.' },
      { question: 'Do you offer 24/7 security coverage?', answer: 'Yes, we provide round-the-clock security services.' },
      { question: 'What is your response protocol for emergencies?', answer: 'Immediate containment, coordination with local authorities, and rapid incident reporting.' }
    ],
    relationships: {
      relatedServices: ['housekeeping']
    },
    order: 2,
  }
};
