import type { Service, Category } from '../domain/service.types';

export function generateServiceStructuredData(service: Service) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': service.title,
    'description': service.shortDescription,
    'provider': {
      '@type': 'Organization',
      'name': 'Kargar Facility Management',
      'url': 'https://kargarfm.com'
    },
    'areaServed': {
      '@type': 'City',
      'name': 'Pune'
    }
  };

  return JSON.stringify(schema);
}

export function generateCategoryStructuredData(category: Category) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': category.title,
    'description': category.shortDescription,
    'provider': {
      '@type': 'Organization',
      'name': 'Kargar Facility Management',
      'url': 'https://kargarfm.com'
    }
  };

  return JSON.stringify(schema);
}

export function generateFAQStructuredData(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };

  return JSON.stringify(schema);
}
