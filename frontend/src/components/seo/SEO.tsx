import { Helmet } from 'react-helmet-async';
import { config } from '@/config';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export function SEO({ 
  title, 
  description, 
  canonicalUrl = config.siteUrl, 
  ogImage 
}: SEOProps) {
  const siteTitle = title ? `${title} | ${config.siteName}` : config.siteName;
  const metaDescription = description ?? 'Pune facility management partner for housekeeping, security, commercial cleaning, office support, and corporate facility services.';

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={metaDescription} />
      {ogImage && <meta property="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
