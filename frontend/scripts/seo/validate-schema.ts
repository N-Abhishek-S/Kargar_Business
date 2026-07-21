import { fileURLToPath } from 'node:url';
import { serviceCategories, allServices } from '../../src/features/services/config';
import { SITE_URL } from './seo.config';

/**
 * Validates the DATA that feeds src/lib/seo/schema.ts's builders (Organization, LocalBusiness,
 * Service, FAQPage). It doesn't import schema.ts itself — that module imports `@/config`, which
 * reads `import.meta.env` and only works under Vite, not plain tsx (verified empirically; see
 * docs/SEO_ARCHITECTURE.md). Instead this asserts the same required-field rules against the raw
 * category/service/faq objects: every entity has the fields buildServiceSchema/buildFAQSchema
 * need, and no two entities collide on the @id-equivalent (their canonical path).
 */
export function validateSchemaData(): string[] {
  const errors: string[] = [];
  const categories = Object.values(serviceCategories);
  const services = Object.values(allServices);
  const seenIds = new Set<string>();

  function checkId(id: string, context: string) {
    if (seenIds.has(id)) errors.push(`Duplicate schema id "${id}" (${context})`);
    seenIds.add(id);
  }

  for (const category of categories) {
    const id = `${SITE_URL}/services/${category.slug}#service`;
    checkId(id, `category:${category.id}`);
    if (!category.title) errors.push(`category:${category.id} missing name/title for Service schema`);
    if (!category.seo.description) errors.push(`category:${category.id} missing description for Service schema`);
    if (!category.slug) errors.push(`category:${category.id} missing slug (needed for @id URL)`);

    if (category.faqs) {
      category.faqs.forEach((faq, i) => {
        if (!faq.question.trim()) errors.push(`category:${category.id} faqs[${i}] has an empty question`);
        if (!faq.answer.trim()) errors.push(`category:${category.id} faqs[${i}] has an empty answer`);
      });
    }
  }

  for (const service of services) {
    const category = categories.find((c) => c.id === service.categoryId);
    if (!category) {
      errors.push(`service:${service.id} references unknown categoryId "${service.categoryId}"`);
      continue;
    }
    const id = `${SITE_URL}/services/${category.slug}/${service.slug}#service`;
    checkId(id, `service:${service.id}`);
    if (!service.title) errors.push(`service:${service.id} missing name/title for Service schema`);
    if (!service.seo.description) errors.push(`service:${service.id} missing description for Service schema`);
    if (!service.slug) errors.push(`service:${service.id} missing slug (needed for @id URL)`);

    if (service.faqs) {
      service.faqs.forEach((faq, i) => {
        if (!faq.question.trim()) errors.push(`service:${service.id} faqs[${i}] has an empty question`);
        if (!faq.answer.trim()) errors.push(`service:${service.id} faqs[${i}] has an empty answer`);
      });
    }

    if (service.relationships?.relatedServices) {
      for (const relatedId of service.relationships.relatedServices) {
        if (!services.some((s) => s.id === relatedId)) {
          errors.push(`service:${service.id} relationships.relatedServices references unknown service "${relatedId}"`);
        }
      }
    }
  }

  return errors;
}

function main() {
  const errors = validateSchemaData();
  if (errors.length > 0) {
    console.error('[seo] Schema data validation FAILED:');
    errors.forEach((e) => { console.error(`  - ${e}`); });
    process.exit(1);
  }
  console.log('[seo] Schema data validation passed.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
