import { fileURLToPath } from 'node:url';
import { buildRouteInventory } from './route-inventory';
import { SITE_URL, buildCanonicalUrl } from './seo.config';

export function validateCanonicals(): string[] {
  const errors: string[] = [];
  const pages = buildRouteInventory();
  const homepageCanonical = buildCanonicalUrl('/');
  const seen = new Map<string, string[]>();

  for (const page of pages) {
    if (!page.canonical.startsWith('https://')) {
      errors.push(`${page.path}: canonical is not https (${page.canonical})`);
    }
    if (!page.canonical.startsWith(SITE_URL)) {
      errors.push(`${page.path}: canonical is not on the primary domain (${page.canonical})`);
    }
    if (page.path !== '/' && page.canonical.endsWith('/')) {
      errors.push(`${page.path}: canonical has a trailing slash (${page.canonical})`);
    }
    if (page.path !== '/' && page.canonical === homepageCanonical) {
      errors.push(`${page.path}: canonical incorrectly points at the homepage (canonical leak)`);
    }

    const existing = seen.get(page.canonical) ?? [];
    existing.push(page.path);
    seen.set(page.canonical, existing);
  }

  for (const [canonical, paths] of seen) {
    if (paths.length > 1) {
      errors.push(`Duplicate canonical "${canonical}" used by: ${paths.join(', ')}`);
    }
  }

  return errors;
}

function main() {
  const errors = validateCanonicals();
  if (errors.length > 0) {
    console.error('[seo] Canonical validation FAILED:');
    errors.forEach((e) => { console.error(`  - ${e}`); });
    process.exit(1);
  }
  console.log('[seo] Canonical validation passed.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
