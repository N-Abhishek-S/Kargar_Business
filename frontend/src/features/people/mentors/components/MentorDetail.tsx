import { Helmet } from 'react-helmet-async';

interface MentorDetailProps {
  mentorId: string;
  firstName: string;
  lastName: string;
  headline: string;
  bio: string;
}

export function MentorDetail({ firstName, lastName, headline, bio }: MentorDetailProps) {
  const fullName = `${firstName} ${lastName}`;
  
  // OS Standard: JSON-LD Structured Data Injection for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": fullName,
    "jobTitle": headline,
    "description": bio,
  };

  return (
    <>
      <Helmet>
        <title>{fullName} | Kargar Mentors</title>
        <meta name="description" content={bio.substring(0, 160)} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <article className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {fullName}
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            {headline}
          </p>
        </header>

        <section aria-labelledby="bio-heading">
          <h2 id="bio-heading" className="sr-only">Biography</h2>
          <div className="prose prose-indigo max-w-none text-gray-700">
            {bio}
          </div>
        </section>
      </article>
    </>
  );
}
