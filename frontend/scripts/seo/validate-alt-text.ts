import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const GENERIC_ALT_VALUES = new Set(['image', 'photo', 'picture', 'img', 'graphic']);
const IMAGE_TAG_RE = /<(img|OptimizedImage)\b([^>]*)>/g;

// Definition files, not usages — they pass `alt`/`aria-hidden` through as dynamic props,
// which this regex-based (non-AST) scanner can't evaluate reliably.
const EXCLUDED_FILES = new Set(['OptimizedImage.tsx']);

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = `${dir}/${entry}`;
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...listSourceFiles(fullPath));
    } else if (/\.(tsx|jsx)$/.test(entry) && !EXCLUDED_FILES.has(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function getAttr(tag: string, name: string): string | undefined {
  const match = new RegExp(`${name}\\s*=\\s*"([^"]*)"`).exec(tag) ?? new RegExp(`${name}\\s*=\\s*\\{'([^']*)'\\}`).exec(tag);
  return match?.[1];
}

function hasBooleanOrTrueProp(tag: string, name: string): boolean {
  return new RegExp(`\\b${name}\\b(\\s*=\\s*\\{?\\s*true\\s*\\}?)?(?!\\w)`).test(tag) && !new RegExp(`${name}\\s*=\\s*\\{false\\}`).test(tag);
}

export function validateAltText(srcDir: string): string[] {
  const errors: string[] = [];

  for (const file of listSourceFiles(srcDir)) {
    const source = readFileSync(file, 'utf8');
    let match: RegExpExecArray | null;
    IMAGE_TAG_RE.lastIndex = 0;
    while ((match = IMAGE_TAG_RE.exec(source))) {
      const [, tagName, attrs] = match;
      const tag = `<${tagName}${attrs}>`;
      const isDecorative = hasBooleanOrTrueProp(attrs ?? '', 'decorative') || hasBooleanOrTrueProp(attrs ?? '', 'aria-hidden');
      const altValue = getAttr(tag, 'alt');
      const hasAltAttr = /\balt\s*=/.test(attrs ?? '');
      const relFile = file.split(/[/\\]src[/\\]/)[1] ? `src/${file.split(/[/\\]src[/\\]/)[1]}` : file;

      if (isDecorative) {
        if (hasAltAttr && altValue && altValue.trim() !== '') {
          errors.push(`${relFile}: decorative <${tagName}> (aria-hidden/decorative) has non-empty alt="${altValue}" — should be alt=""`);
        }
        continue;
      }

      if (!hasAltAttr) {
        errors.push(`${relFile}: <${tagName}> is missing an alt attribute`);
        continue;
      }
      if (altValue !== undefined) {
        if (altValue.trim() === '') {
          errors.push(`${relFile}: <${tagName}> has an empty alt but is not marked decorative`);
        } else if (GENERIC_ALT_VALUES.has(altValue.trim().toLowerCase())) {
          errors.push(`${relFile}: <${tagName}> has a non-descriptive alt="${altValue}"`);
        }
      }
    }
  }

  return errors;
}

function main() {
  const srcDir = fileURLToPath(new URL('../../src', import.meta.url)).replace(/[/\\]$/, '');
  const errors = validateAltText(srcDir);
  if (errors.length > 0) {
    console.error('[seo] Alt-text validation FAILED:');
    errors.forEach((e) => { console.error(`  - ${e}`); });
    process.exit(1);
  }
  console.log('[seo] Alt-text validation passed.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
