import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function resolve(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url));
}

function postbuild() {
  const distDir = resolve('../../dist');
  const indexPath = `${distDir}/index.html`;
  const path404 = `${distDir}/404.html`;
  const vercelJsonPath = resolve('../../vercel.json');

  if (!existsSync(indexPath)) {
    console.error('[postbuild] ERROR: dist/index.html not found!');
    process.exit(1);
  }

  copyFileSync(indexPath, path404);
  console.log('[postbuild] Verified and copied dist/index.html -> dist/404.html');

  if (!existsSync(vercelJsonPath)) {
    console.error('[postbuild] ERROR: vercel.json not found!');
    process.exit(1);
  }

  const vercelConfig = JSON.parse(readFileSync(vercelJsonPath, 'utf8')) as {
    rewrites?: Array<{ source: string; destination: string }>;
    redirects?: Array<{ source: string; destination: string }>;
  };

  const hasWildcardRewrite = vercelConfig.rewrites?.some((r) => r.source === '/(.*)');
  if (hasWildcardRewrite) {
    console.error('[postbuild] ERROR: vercel.json still contains wildcard /(.*) rewrite rule!');
    process.exit(1);
  }

  console.log(`[postbuild] vercel.json validated: ${vercelConfig.redirects?.length ?? 0} redirects, ${vercelConfig.rewrites?.length ?? 0} explicit rewrites, 0 wildcard rewrites.`);
  console.log('[postbuild] Postbuild verification successfully completed.');
}

postbuild();
