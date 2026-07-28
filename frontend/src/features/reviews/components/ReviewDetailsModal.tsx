import { BadgeCheck, Calendar, X, ChevronLeft, ChevronRight, User, Home, MapPin } from 'lucide-react';
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

  console.log('--- DEBUG REVIEW DETAILS MODAL ---', {
    profileImage: review.profileImage,
    companyLogo: review.companyLogo,
    galleryImages: review.images,
    videoUrl: review.videoUrl
  });

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

        <div className="p-6 sm:p-10 lg:p-0">
          <div className="flex flex-col lg:flex-row min-h-full">
            {/* Left Column: Review Content & Media */}
            <div className="flex-1 lg:p-12 xl:p-16 flex flex-col">
              {/* Premium Header Profile & Metadata */}
              <header className="flex flex-col gap-5 mb-8 border-b border-gray-100 pb-6">
                {/* Identity */}
                <div className="flex items-start gap-4">
                  {review.profileImage ? (
                    <Avatar
                      src={review.profileImage}
                      alt={`${customerName} profile photo`}
                      fallbackInitials={getInitials(customerName)}
                      size="xl"
                      className="border border-gray-100 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-gray-500">{getInitials(customerName)}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <strong className="text-lg sm:text-xl font-bold text-(--text-primary) tracking-tight break-words">
                      {customerName}
                    </strong>
                    <span className="text-[15px] font-bold text-blue-600 mt-0.5 break-words">
                      {companyName}
                    </span>
                    {review.location && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500 mt-1">
                        <MapPin size={14} className="text-gray-400" />
                        {review.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ratings & Badges */}
                <div className="flex flex-wrap items-center gap-4 mt-1">
                  <ReviewStars rating={safeRating} />
                  <div className="flex items-center gap-3 text-[13px] font-semibold">
                    {review.verified && (
                      <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">
                        <BadgeCheck size={14} className="text-green-600" /> Verified Client
                      </span>
                    )}
                    {formattedDate && (
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Calendar size={14} className="text-gray-400" /> {formattedDate}
                      </span>
                    )}
                  </div>
                </div>
              </header>

              {/* Full Review Text */}
              <div className="w-full mb-10">
                <h4 className="text-[15px] font-bold text-gray-900 mb-3">Review</h4>
                <p className="text-(--text-primary) font-medium text-[15px] lg:text-[16px] leading-[1.6] tracking-tight whitespace-pre-wrap break-words">
                  {reviewText}
                </p>
              </div>

              {/* Uploaded Images */}
              {images.length > 0 && (
                <div className="w-full mb-10">
                  <h4 className="text-[15px] font-bold text-gray-900 mb-4">Uploaded Images</h4>
                  <ReviewGallery images={images} companyName={companyName} />
                </div>
              )}

              {/* Video Testimonial */}
              {review.videoUrl && (
                <div className="w-full">
                  <h4 className="text-[15px] font-bold text-gray-900 mb-4">Video Testimonial</h4>
                  <div className="rounded-xl overflow-hidden bg-black w-full shadow-md relative group">
                    <video
                      src={review.videoUrl}
                      controls
                      preload="metadata"
                      className="w-full max-h-[60vh] lg:max-h-[50vh] object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar (Company Info) */}
            <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 p-8 lg:p-12 flex flex-col items-center lg:items-start relative">
              <button onClick={onClose} className="absolute right-6 top-6 p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors hidden lg:flex">
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center lg:items-start w-full">
                <span className="text-[13px] font-medium text-gray-400 mb-4">Company Logo</span>
                
                {review.companyLogo ? (
                  <div className="w-24 h-24 rounded-full border border-gray-200 shadow-sm flex items-center justify-center p-2 mb-10">
                    <img src={review.companyLogo} alt={`${companyName} logo`} className="w-full h-full object-contain rounded-full" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center mb-10">
                    <span className="text-xl font-bold text-gray-400">{getInitials(companyName)}</span>
                  </div>
                )}
                
                <h4 className="text-[15px] font-bold text-gray-900 mb-5 w-full text-center lg:text-left">About the Client</h4>
                
                <ul className="flex flex-col gap-4 w-full">
                  <li className="flex items-center gap-3 text-[14px] font-medium text-gray-700">
                    <User size={16} className="text-gray-400 shrink-0" />
                    <span className="break-words">{customerName}</span>
                  </li>
                  {review.serviceName && (
                    <li className="flex items-center gap-3 text-[14px] font-medium text-gray-700">
                      <Home size={16} className="text-gray-400 shrink-0" />
                      <span className="break-words">{review.serviceName}</span>
                    </li>
                  )}
                  {review.location && (
                    <li className="flex items-center gap-3 text-[14px] font-medium text-gray-700">
                      <MapPin size={16} className="text-gray-400 shrink-0" />
                      <span className="break-words">{review.location}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
