/**
 * SEO build pipeline orchestrator — run via `npm run prebuild` (wired into `npm run build`).
 * Generates robots.txt/sitemap.xml/vercel.json redirects, then validates canonicals, metadata,
 * headings, alt text, schema, internal links, and route coverage. Fails the build (non-zero
 * exit) on the first validator that reports an error, after generation has already run so the
 * generated files reflect the current state even when a validator subsequently fails.
 */
import { generateRobots } from './generate-robots';
import { generateSitemap } from './generate-sitemap';
import { mergeRedirects } from './generate-redirects';
import { validateCanonicals } from './validate-canonicals';
import { validateMetadata } from './validate-metadata';
import { validateHeadings } from './validate-headings';
import { validateAltText } from './validate-alt-text';
import { validateSchemaData } from './validate-schema';
import { checkLinks } from './check-links';
import { validateRouteCoverage } from './validate-route-coverage';
import { generateReport } from './seo-report';

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function resolve(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url));
}

function runValidator(name: string, errors: string[]): boolean {
  if (errors.length === 0) {
    console.log(`[seo] ${name}: PASS`);
    return true;
  }
  console.error(`[seo] ${name}: FAIL`);
  errors.forEach((e) => { console.error(`  - ${e}`); });
  return false;
}

async function main() {
  console.log('[seo] Running SEO build pipeline...\n');

  // 1. Generate
  writeFileSync(resolve('../../public/robots.txt'), generateRobots(), 'utf8');
  console.log('[seo] Generated public/robots.txt');

  const sitemap = generateSitemap();
  writeFileSync(resolve('../../public/sitemap.xml'), sitemap, 'utf8');
  console.log(`[seo] Generated public/sitemap.xml (${(sitemap.match(/<url>/g) ?? []).length} URLs)`);

  const vercelJsonPath = resolve('../../vercel.json');
  const existingVercelConfig = JSON.parse(readFileSync(vercelJsonPath, 'utf8')) as Record<string, unknown>;
  writeFileSync(vercelJsonPath, `${JSON.stringify(mergeRedirects(existingVercelConfig), null, 2)}\n`, 'utf8');
  console.log('[seo] Generated vercel.json redirects\n');

  // 2. Validate
  const srcDir = resolve('../../src').replace(/[/\\]$/, '');
  const rootDir = resolve('../..').replace(/[/\\]$/, '');
  const appTsxSource = readFileSync(resolve('../../src/App.tsx'), 'utf8');

  const results = [
    runValidator('validate-canonicals', validateCanonicals()),
    runValidator('validate-metadata', validateMetadata()),
    runValidator('validate-headings', validateHeadings(rootDir)),
    runValidator('validate-alt-text', validateAltText(srcDir)),
    runValidator('validate-schema', validateSchemaData()),
    runValidator('check-links', checkLinks(srcDir).errors),
    runValidator('validate-route-coverage', validateRouteCoverage(appTsxSource)),
  ];

  console.log(`\n${generateReport(srcDir, resolve('../../public').replace(/[/\\]$/, ''))}`);

  if (results.some((passed) => !passed)) {
    console.error('[seo] SEO pipeline FAILED — see errors above.');
    process.exit(1);
  }

  console.log('[seo] SEO pipeline passed.');
}

void main();
