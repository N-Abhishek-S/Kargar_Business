import { config } from '@/config';

/** Builds an absolute canonical URL for a given site-relative path (e.g. "/services/hard-services"). */
export function buildCanonicalUrl(path: string): string {
  const normalizedPath = path === '/' ? '' : path.replace(/\/+$/, '');
  return `${config.siteUrl}${normalizedPath || '/'}`;
}
