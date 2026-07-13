import { useState, useCallback, useMemo } from 'react';
import type SwiperCore from 'swiper';
import { A11y, Autoplay, Keyboard, Pagination, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ChevronLeft, ChevronRight, PenLine, RefreshCw } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { ReviewCard } from './ReviewCard';
import { usePublicReviews } from '@/features/reviews/hooks';
import { ReviewSkeleton } from './ui/ReviewSkeleton';
import { ReviewDetailsModal } from './ReviewDetailsModal';
import { useReviewModal } from '@/features/reviews/hooks/useReviewModal';
import type { ReviewListParams } from '@/services/reviews.service';

// --- Loading & Empty States ---
function ReviewEmptyState({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="w-16 h-16 bg-orange-50 text-(--text-accent) rounded-full flex items-center justify-center mb-6">
        <PenLine size={32} />
      </div>
      <h3 className="text-xl font-bold text-(--text-primary) mb-2">Be our first verified client</h3>
      <p className="text-(--text-secondary) mb-8">Share your experience with Kargar's facility management services.</p>
      <button
        onClick={onOpenForm}
        className="px-6 py-3 bg-(--text-accent) text-white rounded-full font-semibold hover:bg-orange-600 transition-colors shadow-sm"
      >
        Write a Review
      </button>
    </div>
  );
}

// --- Main Carousel Component ---

interface ReviewsCarouselProps {
  inView: boolean;
  onOpenForm: () => void;
  params?: ReviewListParams;
}

export function ReviewsCarousel({ inView, onOpenForm, params }: ReviewsCarouselProps) {
  const reviewsQuery = usePublicReviews(params ?? { sortBy: 'featured', fetchAll: true }, { enabled: inView });
  const [swiper, setSwiper] = useState<SwiperCore | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const reviews = useMemo(() => reviewsQuery.data?.items ?? [], [reviewsQuery.data]);
  const hasReviews = reviews.length > 0;

  // Modal State Management
  const {
    isOpen: isModalOpen,
    selectedReview,
    openModal,
    closeModal,
    hasNext,
    hasPrev,
    goNext,
    goPrev
  } = useReviewModal(reviews);

  const handleSlideChange = useCallback((s: SwiperCore) => {
    // Determine the active index for Center Mode styles.
    setActiveIndex(s.realIndex);
  }, []);

  if (reviewsQuery.isLoading || !inView) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-[clamp(24px,4vw,80px)] py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[520px]">
          <ReviewSkeleton />
          <ReviewSkeleton />
          <ReviewSkeleton />
        </div>
      </div>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[520px]">
          <p className="text-red-500 mb-4">Failed to load reviews. Please try again.</p>
          <button
            onClick={() => { void reviewsQuery.refetch(); }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!hasReviews) {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-8 min-h-[520px]">
        <ReviewEmptyState onOpenForm={onOpenForm} />
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full max-w-[1440px] mx-auto px-[clamp(24px,4vw,80px)] py-8 group">
        {/* Custom Navigation Arrows */}
        <button
          type="button"
          className="kb-swiper-prev absolute left-[2%] lg:left-0 top-1/2 -translate-y-1/2 z-(--z-controls) w-14 h-14 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-(--shadow-float) border border-gray-100 text-gray-700 hover:scale-110 hover:text-(--text-accent) transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none"
          aria-label="Previous review"
          onClick={() => swiper?.slidePrev()}
        >
          <ChevronLeft size={24} />
        </button>

        <button
          type="button"
          className="kb-swiper-next absolute right-[2%] lg:right-0 top-1/2 -translate-y-1/2 z-(--z-controls) w-14 h-14 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-(--shadow-float) border border-gray-100 text-gray-700 hover:scale-110 hover:text-(--text-accent) transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none"
          aria-label="Next review"
          onClick={() => swiper?.slideNext()}
        >
          <ChevronRight size={24} />
        </button>

        <Swiper
          modules={[A11y, Autoplay, Keyboard, Pagination, Navigation]}
          onSwiper={setSwiper}
          onSlideChange={handleSlideChange}
          slidesPerView={1}
          spaceBetween={32}
          centeredSlides={true}
          loop={reviews.length >= 3}
          grabCursor
          keyboard={{ enabled: true }}
          navigation={{
            prevEl: '.kb-swiper-prev',
            nextEl: '.kb-swiper-next',
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            el: '.kb-swiper-pagination',
          }}
          autoplay={{
            delay: 8000,
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            768: {
              slidesPerView: 2,
              centeredSlides: false,
            },
            1180: {
              slidesPerView: 3,
              centeredSlides: true,
            },
          }}
          // Enable auto height behavior to false so that slide items stretch to match the tallest one naturally
          autoHeight={false}
          className="!pb-16 h-full flex items-stretch"
        >
          {reviews.map((review, index) => (
            <SwiperSlide key={review.id} className="!h-auto flex">
              <ReviewCard 
                review={review} 
                isActive={activeIndex === index} 
                onReadMore={openModal} 
              />
            </SwiperSlide>
          ))}
          
          <div className="kb-swiper-pagination absolute bottom-0 left-0 w-full flex justify-center gap-2 z-10" />
        </Swiper>
      </div>

      {/* Single Details Modal Instance */}
      <ReviewDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        review={selectedReview ?? null}
        onNext={goNext}
        onPrev={goPrev}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
    </>
  );
}
