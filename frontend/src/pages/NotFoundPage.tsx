import { Link } from 'react-router';
import { SEO } from '@/components/seo/SEO';
import { buildCanonicalUrl } from '@/lib/seo/canonical';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <SEO
        title="Page Not Found"
        description="The page you are looking for could not be found."
        canonicalUrl={buildCanonicalUrl('/404')}
        robots={{ index: false, follow: false }}
      />
      <h1 className="text-4xl font-bold text-navy-900">Page Not Found</h1>
      <p className="mt-4 max-w-md text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Explore our facility management services instead.
      </p>
      <Link to="/services" className="kb-btn kb-btn--primary mt-8">
        Browse Services
      </Link>
    </div>
  );
}
