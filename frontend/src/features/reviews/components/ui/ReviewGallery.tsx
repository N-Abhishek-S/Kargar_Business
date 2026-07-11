import { useState } from 'react';
import { ReviewLightbox } from './ReviewLightbox';
import { clsx } from 'clsx';

export interface ReviewGalleryProps {
  images: string[];
  companyName: string;
}

export function ReviewGallery({ images, companyName }: ReviewGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            onClick={() => { setSelectedIndex(index); }}
            className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 border border-gray-200 group focus:outline-none focus:ring-2 focus:ring-(--color-navy-300)"
            aria-label={`View full image ${index + 1}`}
          >
            <img
              src={src}
              alt={`Review attachment ${index + 1} from ${companyName}`}
              loading="lazy"
              decoding="async"
              className={clsx(
                "object-cover w-full h-full",
                "transition-transform duration-300 group-hover:scale-105"
              )}
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {/* Full Screen Lightbox */}
      <ReviewLightbox
        key={selectedIndex ?? 'closed'}
        images={images}
        initialIndex={selectedIndex}
        isOpen={selectedIndex !== null}
        onClose={() => { setSelectedIndex(null); }}
      />
    </>
  );
}
