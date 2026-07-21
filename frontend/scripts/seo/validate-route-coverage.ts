import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildRouteInventory } from './route-inventory';

/** Static <Route path="..."> declarations we expect to see wired up in App.tsx for every static route. */
function extractAppRoutes(appTsxSource: string): string[] {
  const matches = [...appTsxSource.matchAll(/<Route\s+path="([^"]+)"/g)];
  return matches.map((m) => m[1] ?? '').filter(Boolean);
}

export function validateRouteCoverage(appTsxSource: string): string[] {
  const errors: string[] = [];
  const appRoutes = extractAppRoutes(appTsxSource);
  const pages = buildRouteInventory();

  // Every static page in the inventory must be wired up as a literal route in App.tsx.
  for (const page of pages.filter((p) => p.type === 'static')) {
    if (!appRoutes.includes(page.path)) {
      errors.push(`${page.path}: has metadata in the registry but no matching <Route> in App.tsx`);
    }
  }

  // Dynamic category/service routes must be covered by the /services/:categoryId(/:serviceId) patterns.
  const hasCategoryRoute = appRoutes.some((r) => r === '/services/:categoryId');
  const hasServiceRoute = appRoutes.some((r) => r === '/services/:categoryId/:serviceId');
  if (pages.some((p) => p.type === 'category') && !hasCategoryRoute) {
    errors.push('Category pages exist in the services config but /services/:categoryId is not routed in App.tsx');
  }
  if (pages.some((p) => p.type === 'service') && !hasServiceRoute) {
    errors.push('Service pages exist in the services config but /services/:categoryId/:serviceId is not routed in App.tsx');
  }

  // Every route in App.tsx (excluding params/wildcards/admin) should have metadata somewhere in the inventory.
  const inventoryPaths = new Set(pages.map((p) => p.path));
  for (const route of appRoutes) {
    // Skip dynamic segments, the catch-all, admin routes, and relative nested-route paths
    // (e.g. the "reviews"/"contacts" children of <Route path="/admin">, which don't start with "/").
    if (route.includes(':') || route === '*' || route.startsWith('/admin') || !route.startsWith('/')) continue;
    if (!inventoryPaths.has(route)) {
      errors.push(`${route}: routed in App.tsx but missing from the SEO registry/service config`);
    }
  }

  return errors;
}

function main() {
  const appTsxPath = fileURLToPath(new URL('../../src/App.tsx', import.meta.url));
  const source = readFileSync(appTsxPath, 'utf8');
  const errors = validateRouteCoverage(source);
  if (errors.length > 0) {
    console.error('[seo] Route coverage validation FAILED:');
    errors.forEach((e) => { console.error(`  - ${e}`); });
    process.exit(1);
  }
  console.log('[seo] Route coverage validation passed.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
