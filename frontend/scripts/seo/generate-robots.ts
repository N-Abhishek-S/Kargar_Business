import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SITE_URL, DISALLOWED_PREFIXES } from './seo.config';

export function generateRobots(): string {
  const lines = ['User-agent: *', 'Allow: /', ''];
  for (const prefix of DISALLOWED_PREFIXES) {
    lines.push(`Disallow: ${prefix}`);
  }
  lines.push('', `Sitemap: ${SITE_URL}/sitemap.xml`, '');
  return lines.join('\n');
}

function main() {
  const outPath = fileURLToPath(new URL('../../public/robots.txt', import.meta.url));
  writeFileSync(outPath, generateRobots(), 'utf8');
  console.log(`[seo] robots.txt generated -> ${outPath}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
