import { fileURLToPath } from 'node:url';
import { buildRouteInventory } from './route-inventory';

// SEO.tsx appends " | Kargar Facility Management" (29 chars) to every title, so the raw
// title stored in the registry/service config must land in 21-31 chars for the rendered
// <title> to hit the 50-60 char target. Keep this in sync with config.siteName.
const TITLE_MIN = 21;
const TITLE_MAX = 31;
const DESCRIPTION_MIN = 140;
const DESCRIPTION_MAX = 160;

export function validateMetadata(): string[] {
  const errors: string[] = [];
  const pages = buildRouteInventory().filter((page) => !page.noindex);

  const titles = new Map<string, string[]>();
  const descriptions = new Map<string, string[]>();

  for (const page of pages) {
    if (!page.title) errors.push(`${page.path}: missing title`);
    if (!page.description) errors.push(`${page.path}: missing description`);

    if (page.title && (page.title.length < TITLE_MIN || page.title.length > TITLE_MAX)) {
      errors.push(
        `${page.path}: title length ${page.title.length} outside ${TITLE_MIN}-${TITLE_MAX} char target (before brand suffix) — "${page.title}"`,
      );
    }
    if (page.description && (page.description.length < DESCRIPTION_MIN || page.description.length > DESCRIPTION_MAX)) {
      errors.push(
        `${page.path}: description length ${page.description.length} outside ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} char target`,
      );
    }
    if (page.keywords && page.keywords.length > 0 && page.description) {
      const primaryKeyword = page.keywords[0]?.toLowerCase();
      if (primaryKeyword && !page.description.toLowerCase().includes(primaryKeyword) && !page.title.toLowerCase().includes(primaryKeyword)) {
        errors.push(`${page.path}: primary keyword "${page.keywords[0]}" not found in title or description`);
      }
    }

    titles.set(page.title, [...(titles.get(page.title) ?? []), page.path]);
    descriptions.set(page.description, [...(descriptions.get(page.description) ?? []), page.path]);
  }

  for (const [title, paths] of titles) {
    if (paths.length > 1) errors.push(`Duplicate title "${title}" used by: ${paths.join(', ')}`);
  }
  for (const [description, paths] of descriptions) {
    if (paths.length > 1) errors.push(`Duplicate description used by: ${paths.join(', ')}`);
  }

  return errors;
}

function main() {
  const errors = validateMetadata();
  if (errors.length > 0) {
    console.error('[seo] Metadata validation FAILED:');
    errors.forEach((e) => { console.error(`  - ${e}`); });
    process.exit(1);
  }
  console.log('[seo] Metadata validation passed.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
