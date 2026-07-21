import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Static heading check. This is a heuristic source scan, not a rendered-DOM check (the app
 * has no SSR/prerendering — see docs/SEO_ARCHITECTURE.md) — it finds each top-level component
 * function in the listed files, and within each function body counts <h1> tags, flagging:
 *   - more than one <h1> in a single render branch
 *   - an empty <h1>...</h1>
 *   - identical <h1> text reused verbatim across two different render branches
 * Functions with zero <h1> (layout helpers, cards, forms, etc.) are not flagged — only
 * component functions that render an <h1> at all are checked for count/emptiness/duplication.
 */
const PAGE_FILES = [
  'src/pages/KargarSinglePage.tsx',
  'src/pages/NotFoundPage.tsx',
  'src/features/services/components/HeroSection.tsx',
];

interface FunctionBlock {
  file: string;
  name: string;
  body: string;
}

function extractFunctionBlocks(file: string, source: string): FunctionBlock[] {
  const blocks: FunctionBlock[] = [];
  const fnStartRe = /function\s+(\w+)\s*\([^)]*\)\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = fnStartRe.exec(source))) {
    const name = match[1];
    const bodyStart = match.index + match[0].length;
    let depth = 1;
    let i = bodyStart;
    while (i < source.length && depth > 0) {
      if (source[i] === '{') depth++;
      else if (source[i] === '}') depth--;
      i++;
    }
    blocks.push({ file, name: name ?? 'anonymous', body: source.slice(bodyStart, i - 1) });
  }

  return blocks;
}

function extractH1s(body: string): string[] {
  const matches = [...body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
  return matches.map((m) => (m[1] ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
}

export function validateHeadings(rootDir: string): string[] {
  const errors: string[] = [];
  const seenH1Text = new Map<string, string>(); // text -> "file:function" of first sighting

  for (const relPath of PAGE_FILES) {
    const fullPath = `${rootDir}/${relPath}`;
    const source = readFileSync(fullPath, 'utf8');
    const blocks = extractFunctionBlocks(relPath, source);

    for (const block of blocks) {
      const h1s = extractH1s(block.body);
      if (h1s.length === 0) continue;

      if (h1s.length > 1) {
        errors.push(`${block.file}:${block.name} renders ${h1s.length} <h1> elements — expected exactly one`);
      }

      for (const text of h1s) {
        if (!text) {
          errors.push(`${block.file}:${block.name} has an empty <h1>`);
          continue;
        }
        const key = text.toLowerCase();
        const firstSeenAt = seenH1Text.get(key);
        if (firstSeenAt && firstSeenAt !== `${block.file}:${block.name}`) {
          errors.push(`Duplicate <h1> text "${text}" used by both ${firstSeenAt} and ${block.file}:${block.name}`);
        } else {
          seenH1Text.set(key, `${block.file}:${block.name}`);
        }
      }
    }
  }

  return errors;
}

function main() {
  const rootDir = fileURLToPath(new URL('../..', import.meta.url)).replace(/[/\\]$/, '');
  const errors = validateHeadings(rootDir);
  if (errors.length > 0) {
    console.error('[seo] Heading validation FAILED:');
    errors.forEach((e) => { console.error(`  - ${e}`); });
    process.exit(1);
  }
  console.log('[seo] Heading validation passed.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
