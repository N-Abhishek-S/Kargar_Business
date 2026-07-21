import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildRouteInventory } from './route-inventory';
import { SITE_URL } from './seo.config';

const PRIORITY_BY_TYPE: Record<string, string> = {
  static: '0.8',
  category: '0.7',
  service: '0.9',
};

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSitemap(): string {
  const pages = buildRouteInventory().filter((page) => !page.noindex);
  const today = new Date().toISOString().slice(0, 10);

  const urls = pages
    .map((page) => {
      const priority = page.path === '/' ? '1.0' : (PRIORITY_BY_TYPE[page.type] ?? '0.5');
      const imageBlock = page.image
        ? `\n    <image:image>\n      <image:loc>${xmlEscape(`${SITE_URL}${page.image.src}`)}</image:loc>\n      <image:title>${xmlEscape(page.image.alt)}</image:title>\n    </image:image>`
        : '';
      return `  <url>\n    <loc>${xmlEscape(page.canonical)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.type === 'static' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${priority}</priority>${imageBlock}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`;
}

function main() {
  const outPath = fileURLToPath(new URL('../../public/sitemap.xml', import.meta.url));
  const xml = generateSitemap();
  writeFileSync(outPath, xml, 'utf8');
  const urlCount = (xml.match(/<url>/g) ?? []).length;
  console.log(`[seo] sitemap.xml generated -> ${outPath} (${urlCount} URLs)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
