import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { REDIRECTS } from './seo.config';

interface VercelConfig {
  redirects?: unknown[];
  [key: string]: unknown;
}

export function mergeRedirects(existing: VercelConfig): VercelConfig {
  return {
    ...existing,
    redirects: REDIRECTS.map((r) => ({ source: r.from, destination: r.to, permanent: r.permanent })),
  };
}

function main() {
  const vercelJsonPath = fileURLToPath(new URL('../../vercel.json', import.meta.url));
  const existing = JSON.parse(readFileSync(vercelJsonPath, 'utf8')) as VercelConfig;
  const merged = mergeRedirects(existing);
  writeFileSync(vercelJsonPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  console.log(`[seo] vercel.json redirects generated -> ${vercelJsonPath} (${REDIRECTS.length} rules)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
