import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ReviewLightboxProps {
  images: string[];
  initialIndex: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewLightbox({ images, initialIndex, isOpen, onClose }: ReviewLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation & ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowRight') {
        handleNext();
      }
      if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  const lightboxContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label="Image Lightbox"
      >
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 text-white">
          <span className="text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white z-10"
              aria-label="Previous Image"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white z-10"
              aria-label="Next Image"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}

        {/* Image Container with swipe constraints */}
        <motion.div 
          className="relative w-full h-full flex items-center justify-center p-4 sm:p-12"
          onClick={onClose} // Clicking backdrop closes
          drag={hasMultiple ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_e, { offset }) => {
            const swipe = offset.x;
            if (swipe < -50) {
              handleNext();
            } else if (swipe > 50) {
              handlePrev();
            }
          }}
        >
          <motion.img
            key={currentImage} // Force re-render for animation on change
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            src={currentImage}
            alt={`Review attachment ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); }} // Prevent closing when clicking image
            draggable={false}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(lightboxContent, document.body);
}
