import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import type { PublicReview } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { ReviewStars } from './ui/ReviewStars';
import { ChevronRight, BadgeCheck } from 'lucide-react';

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
      onClick={() => { onReadMore?.(review); }}
      className={clsx(
        'kb-enterprise-card relative flex flex-col overflow-hidden rounded-2xl bg-(--surface-primary) p-6 sm:p-8 w-full',
        'h-full min-h-96 shrink-0',
        'transition-all duration-(--duration-slow) ease-(--ease-smooth)',
        'border border-gray-100 hover:shadow-(--shadow-premium-hover) hover:-translate-y-2',
        onReadMore && 'cursor-pointer group',
        isActive ? 'shadow-(--shadow-premium-card) border-blue-100/50 scale-[1.015]' : 'shadow-sm',
      )}
    >
      {/* Absolute Decorative Quote */}
      <QuoteIcon className="absolute right-8 bottom-8 text-(--color-navy-200) opacity-10 pointer-events-none" />

      {/* Header: Company Logo, Title, Subtitle, Stars, Verified Badge */}
      <header className="relative z-10 flex items-start gap-4 mb-4 sm:mb-6 shrink-0">
        <div className="shrink-0">
          <Avatar
            src={review.companyLogo ?? ''}
            alt={`${companyName !== 'Unknown Company' ? companyName : customerName} logo`}
            fallbackInitials={getInitials(companyName !== 'Unknown Company' ? companyName : customerName)}
            size="lg"
            className="border border-gray-200 shadow-sm bg-white"
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-start">
          <strong className="text-[17px] sm:text-[19px] font-bold text-(--text-primary) leading-tight tracking-tight">
            {customerName}
          </strong>
          <span className="text-[13px] sm:text-[14px] font-medium text-gray-500 mt-0.5">
            {companyName !== 'Unknown Company' ? companyName : ''}
            {companyName !== 'Unknown Company' && review.location ? ' • ' : ''}
            {review.location}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <ReviewStars rating={safeRating} />
            {review.verified && (
              <span className="flex items-center gap-1 text-[12px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">
                <BadgeCheck size={14} className="text-green-600" />
                Verified Client
              </span>
            )}
          </div>
        </div>

        {onReadMore && (
          <div className="shrink-0 self-center text-gray-400 group-hover:text-blue-500 transition-colors">
            <ChevronRight size={24} strokeWidth={2.5} />
          </div>
        )}
      </header>

      {/* Body: Review Text */}
      <div className="relative z-10 flex-grow flex flex-col min-h-0 overflow-hidden">
        <div ref={textRef} className="overflow-hidden flex-grow relative">
          <p
            className={clsx(
              'text-(--text-primary) font-medium leading-[1.6] tracking-tight break-words',
              'text-[15px] sm:text-[16px]',
              'line-clamp-4 sm:line-clamp-5'
            )}
          >
            {reviewText}
          </p>
        </div>
        
        {isClamped && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onReadMore?.(review); }}
            className="mt-3 text-left text-[14px] font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-sm w-max shrink-0 inline-flex items-center gap-1"
          >
            Read more
          </button>
        )}
      </div>
    </article>
  );
}
