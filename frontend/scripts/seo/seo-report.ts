import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildRouteInventory } from './route-inventory';
import { checkLinks } from './check-links';
import { SITE_URL } from './seo.config';

function buildCrawlTree(pages: ReturnType<typeof buildRouteInventory>): string {
  const lines: string[] = ['Home'];
  const statics = pages.filter((p) => p.type === 'static');
  const categories = pages.filter((p) => p.type === 'category');
  const services = pages.filter((p) => p.type === 'service');

  for (const page of statics) {
    if (page.path === '/') continue;
    lines.push(` ├── ${page.path}`);
  }
  lines.push(' └── /services');
  categories.forEach((category, ci) => {
    const isLastCategory = ci === categories.length - 1;
    lines.push(`      ${isLastCategory ? '└──' : '├──'} ${category.path}`);
    const childServices = services.filter((s) => s.path.startsWith(`${category.path}/`));
    childServices.forEach((service, si) => {
      const isLastService = si === childServices.length - 1;
      lines.push(`      ${isLastCategory ? '    ' : '│   '}${isLastService ? '└──' : '├──'} ${service.path}`);
    });
  });

  return lines.join('\n');
}

export function generateReport(srcDir: string, publicDir: string): string {
  const pages = buildRouteInventory();
  const { incomingLinkCounts, dynamicServiceLinkSites } = checkLinks(srcDir);

  const orphans = pages.filter((p) => p.type !== 'static' && (incomingLinkCounts.get(p.path) ?? 0) === 0);
  const linkTallyLines = pages
    .filter((p) => p.type !== 'static')
    .map((p) => {
      const count = incomingLinkCounts.get(p.path) ?? 0;
      const flag = count === 0 ? ' ❌' : count === 1 ? ' ⚠' : '';
      return `  ${p.path}: ${count} incoming internal link(s)${flag}`;
    });
  const dynamicLinkNote =
    dynamicServiceLinkSites > 0
      ? `\nNote: ${dynamicServiceLinkSites} additional internal link(s) to /services/* use template-literal hrefs (e.g. \`to={\`/services/\${category.slug}\`}\`) and can't be resolved to an exact page by this static scanner — a 0 count above does not necessarily mean a page is truly unlinked; verify with the actual site nav/CollectionSection before treating it as orphaned.`
      : '';

  const robotsPath = `${publicDir}/robots.txt`;
  const robotsOk = existsSync(robotsPath) && readFileSync(robotsPath, 'utf8').includes('Disallow: /admin');
  const sitemapPath = `${publicDir}/sitemap.xml`;
  const sitemapOk = existsSync(sitemapPath);
  const sitemapUrlCount = sitemapOk ? (readFileSync(sitemapPath, 'utf8').match(/<url>/g) ?? []).length : 0;
  const schemaCount = pages.filter((p) => p.type !== 'static').length * 2 + pages.filter((p) => p.hasFaqs).length;

  const lines = [
    '=== SEO BUILD REPORT ===',
    '',
    `Pages in inventory: ${pages.length}`,
    `  static: ${pages.filter((p) => p.type === 'static').length}`,
    `  categories: ${pages.filter((p) => p.type === 'category').length}`,
    `  services: ${pages.filter((p) => p.type === 'service').length}`,
    '',
    'Crawl depth:',
    buildCrawlTree(pages),
    '',
    'Internal link tally (dynamic pages):',
    ...linkTallyLines,
    orphans.length > 0
      ? `\nOrphan pages (0 internal links found by static scan): ${orphans.map((o) => o.path).join(', ')}`
      : '\nNo orphan pages detected.',
    dynamicLinkNote,
    '',
    'Search Console readiness:',
    `  Canonical domain: ${SITE_URL}`,
    `  robots.txt: ${robotsOk ? 'PASS (admin disallowed)' : 'FAIL'}`,
    `  sitemap.xml: ${sitemapOk ? `PASS (${sitemapUrlCount} URLs)` : 'FAIL (not generated)'}`,
    '  hreflang: en-IN + x-default on every page (via SEO.tsx)',
    `  JSON-LD nodes (approx, Service/FAQPage on dynamic pages): ${schemaCount}`,
    '',
  ];

  return lines.join('\n');
}

function main() {
  const srcDir = fileURLToPath(new URL('../../src', import.meta.url)).replace(/[/\\]$/, '');
  const publicDir = fileURLToPath(new URL('../../public', import.meta.url)).replace(/[/\\]$/, '');
  console.log(generateReport(srcDir, publicDir));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
