import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { REDIRECTS } from './seo.config';
import { buildRouteInventory } from './route-inventory';

interface VercelRewrite {
  source: string;
  destination: string;
}

interface VercelConfig {
  redirects?: unknown[];
  rewrites?: VercelRewrite[];
  [key: string]: unknown;
}

export function mergeRedirects(existing: VercelConfig): VercelConfig {
  const inventory = buildRouteInventory();

  const rewriteSources = new Set<string>();

  // Extract every valid static, category, and service route from the SEO route inventory
  for (const page of inventory) {
    rewriteSources.add(page.path);
  }

  // Include parameter patterns for dynamic category/service routes and admin portal
  rewriteSources.add('/services/:categoryId');
  rewriteSources.add('/services/:categoryId/:serviceId');
  rewriteSources.add('/admin');
  rewriteSources.add('/admin/(.*)');

  const rewrites: VercelRewrite[] = Array.from(rewriteSources).map((source) => ({
    source,
    destination: '/index.html',
  }));

  return {
    ...existing,
    redirects: REDIRECTS.map((r) => ({ source: r.from, destination: r.to, permanent: r.permanent })),
    rewrites,
  };
}

function main() {
  const vercelJsonPath = fileURLToPath(new URL('../../vercel.json', import.meta.url));
  const existing = JSON.parse(readFileSync(vercelJsonPath, 'utf8')) as VercelConfig;
  const merged = mergeRedirects(existing);
  writeFileSync(vercelJsonPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  console.log(
    `[seo] vercel.json generated -> ${vercelJsonPath} (${REDIRECTS.length} redirects, ${merged.rewrites?.length ?? 0} rewrites)`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
