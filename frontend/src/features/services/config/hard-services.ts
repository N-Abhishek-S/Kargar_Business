import type { Service } from '../domain/service.types';


export const hardServices: Record<string, Service> = {
  electrical: {
    id: 'electrical',
    categoryId: 'hard',
    slug: 'electrical-maintenance',
    title: 'Electrical Maintenance',
    shortDescription: 'Comprehensive electrical system maintenance and troubleshooting.',
    overview: 'Ensure the safety and reliability of your electrical infrastructure with our comprehensive electrical maintenance services. Our certified technicians handle everything from routine inspections and preventive maintenance to complex troubleshooting and emergency repairs. We cover lighting systems, power distribution, backup generators, and more, ensuring uninterrupted operations for your facility.',
    iconKey: 'zap',
    imageKey: 'electrical',
    seo: {
      title: 'Electrical Maintenance',
      description: 'Reliable electrical maintenance, troubleshooting, and preventive care for LT/HT panels, transformers, and backup generators across enterprise facilities.',
      keywords: ['Electrical Maintenance', 'LT Panels', 'HT Panels', 'Preventive Maintenance', 'Facility Management'],
    },
    serviceType: 'technical',
    layoutPreset: 'enterpriseTechnical',
    marketing: {
      headline: 'Uninterrupted Power for Uninterrupted Business.',
      summary: 'Keep your operations running safely with our 24/7 electrical maintenance services.',
      ctaText: 'Request an Electrical Audit'
    },
    operations: {
      scopeOfWork: [
        { title: 'Preventive Maintenance', description: 'Regular inspections to identify potential issues.' },
        { title: 'Emergency Repairs', description: '24/7 rapid response for critical failures.' },
        { title: 'System Upgrades', description: 'Modernization of outdated electrical panels.' },
        { title: 'Energy Optimization', description: 'Solutions to reduce power consumption.' }
      ],
      equipmentMaintained: [
        { name: 'LT Panels', iconKey: 'server' },
        { name: 'HT Panels', iconKey: 'server' },
        { name: 'Transformers', iconKey: 'zap' },
        { name: 'DG Synchronization', iconKey: 'power' },
        { name: 'Cabling & Earthing', iconKey: 'activity' }
      ]
    },
    capabilities: ['24x7-support', 'preventive-maintenance', 'emergency-response', 'iso-compliance'],
    whyChooseUs: [
      { title: 'Certified Technicians', description: 'Fully licensed and trained in latest safety standards.', iconKey: 'award' },
      { title: 'Rapid Response', description: '24/7 emergency support for critical failures.', iconKey: 'clock' },
      { title: 'Energy Savings', description: 'Proven strategies to reduce overall power consumption.', iconKey: 'trending-down' }
    ],
    faqs: [
      { question: 'How often should electrical maintenance be performed?', answer: 'We recommend comprehensive inspections at least annually, with more frequent checks for critical systems.' },
      { question: 'Do you provide emergency electrical services?', answer: 'Yes, our team is available 24/7 for emergency electrical troubleshooting and repairs.' },
      { question: 'Do you handle backup generator maintenance?', answer: 'Yes, generator maintenance is a key part of our electrical services to ensure reliable backup power.' }
    ],
    relationships: {
      relatedServices: ['hvac'],
      crossSellServices: ['hvac']
    },
    order: 1,
  },
  hvac: {
    id: 'hvac',
    categoryId: 'hard',
    slug: 'hvac-maintenance',
    title: 'HVAC Maintenance',
    shortDescription: 'Expert heating, ventilation, and air conditioning services.',
    overview: 'Maintain optimal indoor air quality and temperature with our expert HVAC maintenance services. We provide comprehensive care for all types of heating, ventilation, and air conditioning systems. From routine filter changes and coil cleaning to complex compressor repairs and system balancing, our services ensure your environment remains comfortable and energy-efficient year-round.',
    iconKey: 'wind',
    imageKey: 'hvac',
    seo: {
      title: 'Commercial HVAC Maintenance',
      description: 'Professional HVAC servicing, repair, and preventive maintenance for chillers, AHUs, and cooling towers across commercial and industrial facilities.',
      keywords: ['HVAC Maintenance', 'Mechanical Maintenance', 'Commercial Maintenance', 'Preventive Maintenance'],
    },
    serviceType: 'technical',
    layoutPreset: 'enterpriseTechnical',
    marketing: {
      headline: 'Optimized Air Quality. Maximum Efficiency.',
      summary: 'Ensure a healthy, comfortable, and energy-efficient environment for your workforce.',
      ctaText: 'Schedule HVAC Service'
    },
    operations: {
      scopeOfWork: [
        { title: 'Scheduled Servicing', description: 'Routine cleaning, lubrication, and calibration.' },
        { title: 'Air Quality Testing', description: 'Monitoring and improving indoor air quality.' },
        { title: 'System Balancing', description: 'Ensuring even temperature distribution.' },
        { title: 'Duct Cleaning', description: 'Thorough cleaning to improve airflow.' }
      ],
      equipmentMaintained: [
        { name: 'VRV / VRF Systems', iconKey: 'wind' },
        { name: 'Chillers', iconKey: 'thermometer-snowflake' },
        { name: 'Cooling Towers', iconKey: 'droplet' },
        { name: 'AHU & FCU', iconKey: 'fan' },
        { name: 'Cassette & Split ACs', iconKey: 'box' }
      ]
    },
    capabilities: ['preventive-maintenance', 'iso-compliance', 'sla-driven'],
    whyChooseUs: [
      { title: 'Energy Efficiency', description: 'We tune your systems to operate at peak efficiency.', iconKey: 'battery-charging' },
      { title: 'Health & Safety', description: 'Prioritizing indoor air quality for occupant well-being.', iconKey: 'heart' },
      { title: 'Comprehensive Care', description: 'From split ACs to massive commercial chillers.', iconKey: 'maximize' }
    ],
    faqs: [
      { question: 'What is included in routine HVAC maintenance?', answer: 'Changing filters, cleaning coils, checking refrigerant levels, and testing controls.' },
      { question: 'How can I improve my building\'s indoor air quality?', answer: 'Regular duct cleaning, upgrading to high-efficiency filters, and proper ventilation.' },
      { question: 'Do you service commercial chiller systems?', answer: 'Yes, our technicians are highly experienced in servicing large-scale commercial chillers.' }
    ],
    relationships: {
      relatedServices: ['electrical']
    },
    order: 2,
  }
};
