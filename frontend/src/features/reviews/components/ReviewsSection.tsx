import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useInView } from 'react-intersection-observer';
import { PenLine } from 'lucide-react';
import { config } from '@/config';
import { useReviewStats } from '@/features/reviews/hooks';
import { ReviewSubmissionForm } from './ReviewSubmissionForm';
import { ReviewsCarousel } from './ReviewsCarousel';
import { ReviewsHeader } from './ReviewsHeader';
import { ReviewTrustBar } from './ReviewTrustBar';
import { Modal } from '@/components/ui/Modal';

export function ReviewsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '220px' });
  const statsQuery = useReviewStats({ enabled: inView });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const stats = statsQuery.data;

  const aggregateSchema = useMemo(() => {
    if (!stats || stats.totalReviews === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Kargar Business Services',
      url: config.siteUrl,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: stats.averageRating,
        reviewCount: stats.totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
    };
  }, [stats]);

  return (
    <section className="relative w-full py-20 lg:py-32 bg-(--surface-secondary) overflow-hidden" id="reviews" ref={ref}>
      {aggregateSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(aggregateSchema)}</script>
        </Helmet>
      )}

      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 w-full">
        <ReviewsHeader />
        
        {/* Full width carousel */}
        <ReviewsCarousel inView={inView} onOpenForm={() => { setIsFormOpen(true); }} />
        
        <div className="max-w-[1440px] mx-auto px-[clamp(24px,4vw,80px)] mt-8">
          <ReviewTrustBar />
          
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => { setIsFormOpen(true); }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-(--surface-primary) border border-gray-200 shadow-(--shadow-premium-card) rounded-full hover:shadow-(--shadow-premium-hover) hover:-translate-y-1 transition-all duration-(--duration-slow) ease-(--ease-spring)"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-orange-50 text-(--text-accent) rounded-full group-hover:bg-(--text-accent) group-hover:text-white transition-colors duration-300">
                <PenLine size={20} />
              </div>
              <span className="text-(--text-primary) font-bold tracking-tight text-lg pr-2">
                Write a Review
              </span>
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); }}
        maxWidth="2xl"
        className="!p-0 overflow-hidden"
      >
        <div className="bg-(--surface-primary) p-2 sm:p-4">
          <ReviewSubmissionForm />
        </div>
      </Modal>
    </section>
  );
}
