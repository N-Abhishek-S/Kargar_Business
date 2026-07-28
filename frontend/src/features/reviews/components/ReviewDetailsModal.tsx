import { BadgeCheck, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import type { PublicReview } from '@/types';
import { ReviewStars } from './ui/ReviewStars';
import { ReviewGallery } from './ui/ReviewGallery';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: PublicReview | null;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function ReviewDetailsModal({
  isOpen,
  onClose,
  review,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: ReviewDetailsModalProps) {
  if (!review) return null;

  const images = review.images ?? [];
  const companyName = review.companyName.trim() ? review.companyName : 'Unknown Company';
  const customerName = review.customerName.trim() ? review.customerName : 'Anonymous';
  const reviewText = review.reviewText.trim() ? review.reviewText : 'No written review provided.';
  const safeRating = Math.max(1, Math.min(5, review.rating));

  // Format date securely
  const dateStr = review.approvedAt ?? review.createdAt;
  let formattedDate = '';
  try {
    if (dateStr) {
      formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(dateStr));
    }
  } catch {
    formattedDate = '';
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      className="!p-0 overflow-hidden bg-(--surface-primary) rounded-2xl"
    >
      {/* Navigation Controls (Absolute) */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-gray-500 hover:text-(--text-accent) hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-(--color-navy-200) hidden sm:flex"
          aria-label="Previous Review"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-gray-500 hover:text-(--text-accent) hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-(--color-navy-200) hidden sm:flex"
          aria-label="Next Review"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-y-auto w-full relative">
        
        {/* Mobile Nav Header */}
        <div className="sm:hidden flex items-center justify-between sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 py-3 border-b border-gray-100">
          <div className="flex gap-2">
             <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="p-2 rounded-full text-gray-500 disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="p-2 rounded-full text-gray-500 disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-10 lg:px-16 lg:py-12">
          {/* Premium Header Profile & Metadata */}
          <header className="flex flex-col gap-6 mb-10">
            {/* Identity */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0">
                <Avatar
                  src={review.profileImage ?? review.companyLogo ?? ''}
                  alt={`${customerName} photo`}
                  fallbackInitials={getInitials(customerName)}
                  size="xl"
                  className="border border-gray-100 shadow-sm shrink-0"
                />
                {review.profileImage && review.companyLogo && (
                   <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white shadow-sm bg-white overflow-hidden w-8 h-8 flex items-center justify-center">
                     <img src={review.companyLogo} alt={companyName} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                   </div>
                )}
              </div>
              <div className="flex flex-col">
                <strong className="text-xl sm:text-2xl font-bold text-(--text-primary) tracking-tight break-words">
                  {customerName}
                </strong>
                <span className="text-[17px] font-semibold text-(--color-navy-500) mt-0.5 break-words">
                  {companyName}
                </span>
                {review.location && (
                  <span className="text-sm font-medium text-(--text-muted) mt-1">
                    {review.location}
                  </span>
                )}
              </div>
            </div>

            {/* Ratings & Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-50/80">
              <ReviewStars rating={safeRating} />
              <div className="flex items-center gap-3 text-sm font-medium text-(--text-muted)">
                {review.verified && (
                  <span className="flex items-center gap-1.5 text-green-700 bg-green-50/80 px-2.5 py-1 rounded-md border border-green-100/50">
                    <BadgeCheck size={16} className="text-green-600" /> Verified Client
                  </span>
                )}
                {formattedDate && (
                  <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50/50 px-2.5 py-1 rounded-md border border-gray-100/50">
                    <Calendar size={16} /> {formattedDate}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Full Review Text */}
          <div className="w-full mb-10">
            <p className="text-(--text-primary) font-medium text-[22px] leading-[1.6] tracking-tight whitespace-pre-wrap break-words">
              {reviewText}
            </p>
          </div>

          {/* Optional Video Player */}
          {review.videoUrl && (
            <div className="mb-10 rounded-xl overflow-hidden bg-black max-w-4xl mx-auto shadow-md">
              <video
                src={review.videoUrl}
                controls
                preload="metadata"
                className="w-full max-h-[60vh] object-contain"
              />
            </div>
          )}

          {/* Optional Image Gallery */}
          {images.length > 0 && (
            <div className="mb-10">
              <ReviewGallery images={images} companyName={companyName} />
            </div>
          )}


        </div>
      </div>
    </Modal>
  );
}
