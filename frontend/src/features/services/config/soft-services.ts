import type { Service } from '../domain/service.types';


export const softServices: Record<string, Service> = {
  housekeeping: {
    id: 'housekeeping',
    categoryId: 'soft',
    slug: 'housekeeping',
    title: 'Housekeeping Services',
    shortDescription: 'Professional housekeeping services in Pune for corporate offices and commercial facilities.',
    overview: 'Kargar Business Services provides professional housekeeping services in Pune for corporate offices, commercial facilities, and workplaces. We deliver comprehensive cleaning solutions tailored to each facility\'s needs, from daily janitorial housekeeping to specialized deep cleaning. Our trained housekeeping staff uses industry-leading equipment and eco-friendly products, backed by regular supervision, to maintain consistently high standards of cleanliness and hygiene. Based in Baner, Pune, our team supports office housekeeping for IT parks and corporate campuses, commercial housekeeping for retail and hospitality spaces, and industrial housekeeping for manufacturing plants and warehouses, with consistent standards across every environment. We serve facilities across Pune and the wider Pune Metropolitan Region, including PCMC.',
    iconKey: 'sparkles',
    imageKey: 'housekeeping',
    seo: {
      title: 'Housekeeping Services in Pune',
      description: 'Professional housekeeping services in Pune for corporate offices and commercial facilities, with trained staff, eco-friendly cleaning, and reliable supervision.',
      keywords: ['Housekeeping Services in Pune', 'Corporate Housekeeping Services Pune', 'Office Housekeeping Services Pune', 'Commercial Housekeeping Pune', 'Industrial Housekeeping Pune', 'Housekeeping Company Pune']
    },
    serviceType: 'cleaning',
    layoutPreset: 'enterpriseCleaning',
    marketing: {
      headline: 'Professional Housekeeping Services in Pune',
      summary: 'Ensure a spotless, hygienic, and welcoming workplace for your employees and visitors, with trained housekeeping staff based in Pune.',
      ctaText: 'Request a Consultation'
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
    compliance: [
      { title: 'Verified Workforce', description: 'All housekeeping personnel undergo thorough police verification and background checks before deployment.', iconKey: 'shield-check' },
      { title: 'ISO-Aligned Processes', description: 'Housekeeping operations follow ISO process guidelines for consistent quality standards.', iconKey: 'file-check' },
      { title: 'Structured Service Delivery', description: 'Daily cleaning checklists and monthly hygiene reports provide measurable, deliverable-driven tracking.', iconKey: 'clipboard-check' }
    ],
    process: [
      { step: 1, title: 'Enquiry & Consultation', description: 'Share your facility\'s housekeeping requirements through our contact page. Our team follows up to understand your site and cleaning needs.' },
      { step: 2, title: 'Service Plan & Staff Deployment', description: 'We deploy trained housekeeping staff covering daily janitorial work, restroom hygiene, deep cleaning, and consumables management based on your facility.' },
      { step: 3, title: 'Ongoing Supervision', description: 'Supervisors conduct regular unannounced inspections to maintain consistent quality standards.' },
      { step: 4, title: 'Reporting & Quality Tracking', description: 'Cleaning activity is tracked through daily cleaning checklists and monthly hygiene reports.' }
    ],
    whyChooseUs: [
      { title: 'Eco-Friendly', description: 'We use sustainable, non-toxic cleaning agents.', iconKey: 'leaf' },
      { title: 'Trained Personnel', description: 'Rigorous training in hospitality and hygiene.', iconKey: 'users' },
      { title: 'Quality Assurance', description: 'Regular unannounced inspections by supervisors.', iconKey: 'check-circle' }
    ],
    industries: [
      { title: 'Corporate Offices', iconKey: 'building' },
      { title: 'IT Parks', iconKey: 'building-2' },
      { title: 'Healthcare', iconKey: 'plus-square' },
      { title: 'Retail & Malls', iconKey: 'shopping-bag' },
      { title: 'Hotels & Hospitality', iconKey: 'bed' },
      { title: 'Warehouses', iconKey: 'package' },
      { title: 'Manufacturing', iconKey: 'factory' }
    ],
    faqs: [
      { question: 'Does Kargar provide housekeeping services in Pune?', answer: 'Yes. Kargar Business Services is based in Baner, Pune, and provides professional housekeeping services for corporate offices and commercial facilities across the city.' },
      { question: 'Does Kargar provide housekeeping staff for corporate offices?', answer: 'Yes, we provide trained housekeeping staff for corporate offices, commercial facilities, and workplace environments, with regular supervision and quality checks.' },
      { question: 'What is included in daily housekeeping?', answer: 'Tasks include emptying trash, vacuuming, mopping, cleaning restrooms, and wiping surfaces.' },
      { question: 'Do you use eco-friendly cleaning products?', answer: 'Yes, we prioritize the use of environmentally friendly and non-toxic cleaning solutions.' },
      { question: 'Are your housekeeping staff background-checked?', answer: 'Absolutely. All our personnel undergo thorough police verification and background checks.' },
      { question: 'How can I request housekeeping services in Pune?', answer: 'You can request a housekeeping service quote through our contact page, and our team will follow up to understand your facility\'s requirements.' },
      { question: 'Does Kargar provide commercial and industrial housekeeping services?', answer: 'Yes. Beyond corporate offices, our housekeeping teams support commercial facilities such as retail spaces and hotels, as well as industrial environments including manufacturing plants and warehouses.' },
      { question: 'Do you provide housekeeping services in PCMC and other parts of the Pune metropolitan region?', answer: 'Yes. Operating out of Baner, Pune, we serve corporate and industrial facilities across Pune and the wider Pune Metropolitan Region, including PCMC.' },
      { question: 'What information do you need to prepare a housekeeping services proposal?', answer: 'Typically your facility type, site size, operating hours, and current staffing needs. Share these through our contact page and our team will follow up with a tailored proposal.' }
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
