import { useState, useCallback } from 'react';
import type { PublicReview } from '@/types';

export function useReviewModal(reviews: PublicReview[]) {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const openModal = useCallback((review: PublicReview) => {
    setSelectedReviewId(review.id);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedReviewId(null);
  }, []);

  const currentIndex = reviews.findIndex((r) => r.id === selectedReviewId);
  const selectedReview = currentIndex !== -1 ? reviews[currentIndex] : null;

  const hasNext = currentIndex !== -1 && currentIndex < reviews.length - 1;
  const hasPrev = currentIndex > 0;

  const goNext = useCallback(() => {
    if (hasNext) {
      const nextReview = reviews[currentIndex + 1];
      if (nextReview) setSelectedReviewId(nextReview.id);
    }
  }, [hasNext, currentIndex, reviews]);

  const goPrev = useCallback(() => {
    if (hasPrev) {
      const prevReview = reviews[currentIndex - 1];
      if (prevReview) setSelectedReviewId(prevReview.id);
    }
  }, [hasPrev, currentIndex, reviews]);

  return {
    isOpen: selectedReviewId !== null,
    selectedReview,
    openModal,
    closeModal,
    hasNext,
    hasPrev,
    goNext,
    goPrev,
  };
}
