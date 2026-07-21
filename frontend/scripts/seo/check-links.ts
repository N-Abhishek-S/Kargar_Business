import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildRouteInventory } from './route-inventory';
import { STATIC_ROUTES } from './seo.config';

const LINK_ATTR_RE = /\b(?:to|href)\s*=\s*"(\/[^"]*)"/g;
// Template-literal links (e.g. `to={`/services/${category.slug}`}`) can't be resolved to an
// exact path by this regex-based scanner, but their presence still matters for the orphan/
// crawl-depth report — count them separately rather than silently under-reporting real links.
const DYNAMIC_SERVICES_LINK_RE = /\b(?:to|href)\s*=\s*\{`\/services\/[^`]*`\}/g;

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = `${dir}/${entry}`;
    const stats = statSync(fullPath);
    if (stats.isDirectory()) files.push(...listSourceFiles(fullPath));
    else if (/\.(tsx|jsx)$/.test(entry)) files.push(fullPath);
  }
  return files;
}

/** Builds the set of known internal paths: static routes, admin routes, and every category/service page. */
function buildKnownPaths(): Set<string> {
  const known = new Set<string>(STATIC_ROUTES);
  known.add('/contact'); // legacy alias, redirected at the edge — still a "known" internal target
  known.add('/404'); // sentinel used by <Navigate to="/404" /> to fall through to the catch-all route
  known.add('/admin');
  known.add('/admin/login');
  known.add('/admin/forgot-password');
  known.add('/admin/update-password');
  known.add('/admin/reviews');
  known.add('/admin/contacts');
  for (const page of buildRouteInventory()) known.add(page.path);
  return known;
}

export interface LinkCheckResult {
  errors: string[];
  /** path -> number of internal <Link>/<a> references found across the codebase (for the crawl/link report). */
  incomingLinkCounts: Map<string, number>;
  /** Count of template-literal `/services/...` links found (can't be resolved to an exact path — see DYNAMIC_SERVICES_LINK_RE). */
  dynamicServiceLinkSites: number;
}

export function checkLinks(srcDir: string): LinkCheckResult {
  const knownPaths = buildKnownPaths();
  const errors: string[] = [];
  const incomingLinkCounts = new Map<string, number>();
  let dynamicServiceLinkSites = 0;

  for (const file of listSourceFiles(srcDir)) {
    const source = readFileSync(file, 'utf8');
    let match: RegExpExecArray | null;

    LINK_ATTR_RE.lastIndex = 0;
    while ((match = LINK_ATTR_RE.exec(source))) {
      const rawPath = match[1] ?? '';
      const path = rawPath.split('?')[0]?.split('#')[0] ?? rawPath;
      if (!path) continue;

      incomingLinkCounts.set(path, (incomingLinkCounts.get(path) ?? 0) + 1);

      if (!knownPaths.has(path)) {
        const relFile = file.split(/[/\\]src[/\\]/)[1] ? `src/${file.split(/[/\\]src[/\\]/)[1]}` : file;
        errors.push(`${relFile}: links to unknown route "${path}"`);
      }
    }

    dynamicServiceLinkSites += source.match(DYNAMIC_SERVICES_LINK_RE)?.length ?? 0;
  }

  return { errors, incomingLinkCounts, dynamicServiceLinkSites };
}

function main() {
  const srcDir = fileURLToPath(new URL('../../src', import.meta.url)).replace(/[/\\]$/, '');
  const { errors } = checkLinks(srcDir);
  if (errors.length > 0) {
    console.error('[seo] Link check FAILED:');
    errors.forEach((e) => { console.error(`  - ${e}`); });
    process.exit(1);
  }
  console.log('[seo] Link check passed.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
