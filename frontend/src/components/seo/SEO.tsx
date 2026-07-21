import { Helmet } from 'react-helmet-async';
import { config } from '@/config';
import {
  buildOrganizationSchema,
  buildLocalBusinessSchema,
  buildWebsiteSchema,
  buildBreadcrumbSchema,
} from '@/lib/seo/schema';
import type { BreadcrumbItem } from '@/features/services/components/Breadcrumb';

export interface RobotsDirective {
  index?: boolean;
  follow?: boolean;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxSnippet?: number;
  maxVideoPreview?: number;
}

function buildRobotsContent({
  index = true,
  follow = true,
  maxImagePreview = 'large',
  maxSnippet = -1,
  maxVideoPreview = -1,
}: RobotsDirective): string {
  return [
    index ? 'index' : 'noindex',
    follow ? 'follow' : 'nofollow',
    `max-image-preview:${maxImagePreview}`,
    `max-snippet:${maxSnippet}`,
    `max-video-preview:${maxVideoPreview}`,
  ].join(', ');
}

interface SEOProps {
  title?: string;
  description?: string;
  /** Absolute canonical URL — use buildCanonicalUrl() to derive this. Required on every page except the homepage default. */
  canonicalUrl?: string;
  ogImage?: string;
  robots?: RobotsDirective;
  breadcrumbItems?: BreadcrumbItem[];
  /** Additional JSON-LD nodes (Service, FAQPage, etc.) appended to the site-wide @graph. */
  schema?: object[];
}

const DEFAULT_OG_IMAGE = `${config.siteUrl}/images/brand/kargar-logo.png`;

export function SEO({
  title,
  description,
  canonicalUrl = config.siteUrl,
  ogImage = DEFAULT_OG_IMAGE,
  robots,
  breadcrumbItems = [],
  schema = [],
}: SEOProps) {
  const siteTitle = title ? `${title} | ${config.siteName}` : config.siteName;
  const metaDescription =
    description ??
    'Pune facility management partner for housekeeping, security, commercial cleaning, office support, and corporate facility services.';
  const robotsContent = buildRobotsContent(robots ?? {});

  const graph = [
    buildOrganizationSchema(),
    buildLocalBusinessSchema(),
    buildWebsiteSchema(),
    buildBreadcrumbSchema(breadcrumbItems),
    ...schema,
  ];

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={ogImage} />

      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': graph,
        })}
      </script>
    </Helmet>
  );
}
