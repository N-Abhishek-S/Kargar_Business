import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Camera, Video } from 'lucide-react';
import type { PublicReview } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { ReviewStars } from './ui/ReviewStars';

// Massive SVG Quote for decoration
const QuoteIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="84"
    height="64"
    viewBox="0 0 84 64"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M35.636 10.334C35.636 16.0353 31.0142 20.657 25.313 20.657C19.6117 20.657 15.1328 16.2917 15.1328 10.334C15.1328 4.63273 19.6117 0.0110321 25.313 0.0110321C31.0142 0.0110321 35.636 4.63273 35.636 10.334ZM34.7214 26.5024C32.1607 43.1497 22.8407 55.4526 8.7397 63.8596L0 55.4526C8.59102 48.6946 12.0628 39.9238 13.7088 29.508C5.84927 28.5939 0 21.6444 0 13.2374V10.334H35.636V26.5024H34.7214ZM84 10.334C84 16.0353 79.3783 20.657 73.677 20.657C67.9757 20.657 63.4969 16.2917 63.4969 10.334C63.4969 4.63273 67.9757 0.0110321 73.677 0.0110321C79.3783 0.0110321 84 4.63273 84 10.334ZM83.0854 26.5024C80.5247 43.1497 71.2048 55.4526 57.1037 63.8596L48.364 55.4526C56.955 48.6946 60.4268 39.9238 62.0729 29.508C54.2133 28.5939 48.364 21.6444 48.364 13.2374V10.334H84V26.5024H83.0854Z" />
  </svg>
);

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export interface ReviewCardProps {
  review: PublicReview;
  isActive?: boolean;
  onReadMore?: (review: PublicReview) => void;
}

export function ReviewCard({ review, isActive, onReadMore }: ReviewCardProps) {
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Normalize data for fallbacks
  const images = review.images ?? (review.profileImage ? [review.profileImage] : []);
  const companyName = review.companyName.trim() ? review.companyName : 'Unknown Company';
  const customerName = review.customerName.trim() ? review.customerName : 'Anonymous';
  const reviewText = review.reviewText.trim() ? review.reviewText : 'No written review provided.';
  
  // Safe rating normalization
  const safeRating = Math.max(1, Math.min(5, review.rating));

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // Use ResizeObserver for robust layout measurement
    const observer = new ResizeObserver(() => {
      // scrollHeight strictly greater than clientHeight means visual truncation
      if (el.scrollHeight > el.clientHeight) {
        setIsClamped(true);
      } else {
        setIsClamped(false);
      }
    });

    observer.observe(el);
    return () => { observer.disconnect(); };
  }, [reviewText]);

  return (
    <article
      onDoubleClick={() => { onReadMore?.(review); }}
      className={clsx(
        'kb-enterprise-card relative flex flex-col overflow-hidden rounded-2xl bg-(--surface-primary) p-8 sm:p-10 w-full',
        'h-full min-h-96 shrink-0', // Fluid flex height
        'transition-all duration-(--duration-slow) ease-(--ease-smooth)',
        'border border-gray-100 hover:shadow-(--shadow-premium-hover) hover:-translate-y-2',
        onReadMore && 'cursor-pointer',
        isActive ? 'shadow-(--shadow-premium-card) border-blue-100/50 scale-[1.015]' : 'shadow-sm',
      )}
    >
      {/* Absolute Decorative Quote */}
      <QuoteIcon className="absolute left-10 top-10 text-(--color-navy-200) opacity-20" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-end mb-6 shrink-0">
        <ReviewStars rating={safeRating} />
      </header>

      {/* Body: Review Text */}
      <div className="relative z-10 flex-grow mt-4 flex flex-col min-h-0 overflow-hidden">
        <div ref={textRef} className="overflow-hidden flex-grow relative">
          <p
            className={clsx(
              'text-(--text-primary) font-medium leading-relaxed tracking-tight break-words',
              'text-[clamp(1.125rem,1.5vw,1.375rem)]',
              'line-clamp-4 sm:line-clamp-5'
            )}
          >
            {reviewText}
          </p>
        </div>
        
        {isClamped && (
          <button
            type="button"
            onClick={() => { onReadMore?.(review); }}
            className="mt-3 text-left text-[15px] font-semibold text-orange-500 hover:text-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 rounded-sm w-max shrink-0 inline-flex items-center gap-1"
          >
            Read full review &rarr;
          </button>
        )}

        {/* Media Indicators */}
        {(images.length > 0 || review.videoUrl) && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {review.videoUrl && (
              <button
                type="button"
                onClick={() => { onReadMore?.(review); }}
                className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full text-sm font-semibold hover:bg-orange-100 transition-colors"
              >
                <Video size={16} />
                <span>Play Video</span>
              </button>
            )}
            {images.length > 0 && (
              <div className="flex items-center gap-1.5 text-(--text-muted) text-sm font-medium px-2.5 py-1 bg-gray-50 rounded-full border border-gray-100">
                <Camera size={16} />
                <span>{images.length} Photo{images.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Separator */}
      <hr className="my-8 border-t border-(--border-subtle) shrink-0" />

      {/* Footer: Company Identity */}
      <footer className="flex items-center gap-4 relative z-10 shrink-0">
        <Avatar
          src={review.companyLogo ?? ''}
          alt={`${companyName} logo`}
          fallbackInitials={getInitials(companyName !== 'Unknown Company' ? companyName : customerName)}
          size="lg"
          className="border border-gray-100 shadow-sm shrink-0"
        />
        <div className="flex flex-col overflow-hidden">
          <strong className="truncate text-[18px] font-bold text-(--text-primary)">
            {companyName}
          </strong>
          {review.location && (
            <span className="truncate text-[15px] font-medium text-(--text-muted)">
              {review.location}
            </span>
          )}
        </div>
      </footer>
    </article>
  );
}
