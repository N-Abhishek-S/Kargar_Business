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

      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.kargarbusinessservices.com/#organization",
              "name": config.siteName,
              "url": config.siteUrl,
              "logo": "https://www.kargarbusinessservices.com/images/brand/kargar-logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-1234567890",
                "contactType": "customer service"
              }
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://www.kargarbusinessservices.com/#localbusiness",
              "name": config.siteName,
              "url": config.siteUrl,
              "image": "https://www.kargarbusinessservices.com/images/brand/kargar-logo.png",
              "telephone": "+91-1234567890",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Pune",
                "addressRegion": "Maharashtra",
                "addressCountry": "IN"
              }
            },
            {
              "@type": "Service",
              "provider": { "@id": "https://www.kargarbusinessservices.com/#organization" },
              "name": "Facility Management Services",
              "serviceType": "Housekeeping, Security, Maintenance"
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": config.siteUrl
                }
              ]
            }
          ]
        })}
      </script>
    </Helmet>
  );
}
