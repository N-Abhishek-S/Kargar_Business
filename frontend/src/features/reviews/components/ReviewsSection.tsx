import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useInView } from 'react-intersection-observer';
import type SwiperCore from 'swiper';
import { A11y, Autoplay, Keyboard, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { BadgeCheck, ChevronLeft, ChevronRight, MapPin, Quote, RefreshCw } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { config } from '@/config';
import { usePublicReviews, useReviewStats } from '@/features/reviews/hooks';
import type { PublicReview } from '@/types';
import { ReviewSubmissionForm } from './ReviewSubmissionForm';

function formatReviewDate(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <article className="kb-review-card">
      <div className="kb-review-card__top">
        {review.profileImage ? (
          <img src={review.profileImage} alt={`${review.customerName} profile`} loading="lazy" decoding="async" />
        ) : (
          <span aria-hidden="true">{getInitials(review.customerName)}</span>
        )}
        <div>
          <strong>{review.customerName}</strong>
          <small>{review.companyName}</small>
        </div>
        {review.companyLogo ? (
          <img className="kb-review-card__logo" src={review.companyLogo} alt={`${review.companyName} logo`} loading="lazy" decoding="async" />
        ) : null}
      </div>

      <div className="kb-review-card__rating">
        <StarRating rating={review.rating} size={18} />
        {review.verified ? (
          <span><BadgeCheck size={15} /> Verified</span>
        ) : null}
      </div>

      <Quote className="kb-review-card__quote" size={34} aria-hidden="true" />
      <h3>{review.reviewTitle}</h3>
      <p>{review.reviewText}</p>

      <div className="kb-review-card__meta">
        <span>{review.serviceName}</span>
        {review.location ? <span><MapPin size={14} /> {review.location}</span> : null}
        <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
      </div>

      {review.reply ? (
        <div className="kb-review-card__reply">
          <strong>Kargar reply</strong>
          <p>{review.reply.text}</p>
        </div>
      ) : null}
    </article>
  );
}

function ReviewSkeleton() {
  return (
    <div className="kb-review-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

export function ReviewsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '220px' });
  const reviewsQuery = usePublicReviews({ page: 1, limit: 9, sortBy: 'featured' }, { enabled: inView });
  const statsQuery = useReviewStats({ enabled: inView });
  const [swiper, setSwiper] = useState<SwiperCore | null>(null);

  const reviews = reviewsQuery.data?.items ?? [];
  const stats = statsQuery.data;
  const hasReviews = reviews.length > 0;

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
    <section className="kb-reviews" id="reviews" ref={ref}>
      {aggregateSchema ? (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(aggregateSchema)}</script>
        </Helmet>
      ) : null}

      <div className="kb-container">
        <div className="kb-reviews__header">
          <div>
            <p className="kb-eyebrow">Client Reviews</p>
            <h2>Verified feedback from business teams we support</h2>
            <span aria-hidden="true" />
          </div>
          <div className="kb-reviews__stats" aria-label="Review statistics">
            <article>
              <strong>{stats ? stats.averageRating.toFixed(1) : '0.0'}</strong>
              <span>Average Rating</span>
            </article>
            <article>
              <strong>{stats?.totalReviews ?? 0}</strong>
              <span>Total Reviews</span>
            </article>
            <article>
              <strong>{stats?.recommendationRate ?? 0}%</strong>
              <span>Recommend</span>
            </article>
          </div>
        </div>

        <div className="kb-reviews__grid">
          <div className="kb-reviews__carousel">
            <div className="kb-reviews__controls">
              <button type="button" aria-label="Previous review" onClick={() => swiper?.slidePrev()}>
                <ChevronLeft size={20} />
              </button>
              <button type="button" aria-label="Next review" onClick={() => swiper?.slideNext()}>
                <ChevronRight size={20} />
              </button>
            </div>

            {reviewsQuery.isLoading || !inView ? (
              <div className="kb-review-skeleton-grid">
                <ReviewSkeleton />
                <ReviewSkeleton />
              </div>
            ) : reviewsQuery.isError ? (
              <div className="kb-review-state" role="alert">
                <h3>Reviews could not be loaded</h3>
                <p>Please try again.</p>
                <button type="button" onClick={() => { void reviewsQuery.refetch(); }}>
                  <RefreshCw size={16} /> Retry
                </button>
              </div>
            ) : !hasReviews ? (
              <div className="kb-review-state">
                <h3>No approved reviews yet</h3>
                <p>Approved customer reviews will appear here automatically.</p>
              </div>
            ) : (
              <Swiper
                modules={[A11y, Autoplay, Keyboard, Pagination]}
                onSwiper={setSwiper}
                slidesPerView={1}
                spaceBetween={22}
                loop={reviews.length > 2}
                grabCursor
                keyboard={{ enabled: true }}
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 5200,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                lazyPreloadPrevNext={1}
                breakpoints={{
                  760: { slidesPerView: 2 },
                  1180: { slidesPerView: 2 },
                }}
                className="kb-review-swiper"
              >
                {reviews.map((review) => (
                  <SwiperSlide key={review.id}>
                    <ReviewCard review={review} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          <ReviewSubmissionForm />
        </div>
      </div>
    </section>
  );
}
