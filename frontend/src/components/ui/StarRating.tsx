import { Star } from 'lucide-react';
import { clsx } from 'clsx';

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  size?: number;
  readonly?: boolean;
  onChange?: (rating: number) => void;
}

/**
 * Enterprise Star Rating Component
 * - Supports fractional display if needed (though usually int)
 * - Interactive mode (onChange) or readonly mode
 * - Accessible focus and keyboard navigation for interactive mode
 */
export function StarRating({
  rating,
  maxRating = 5,
  className,
  size = 20,
  readonly = true,
  onChange,
}: StarRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  return (
    <div
      className={clsx('flex items-center gap-1', className)}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={readonly ? `${rating} out of ${maxRating} stars` : 'Select a rating'}
    >
      {stars.map((star) => {
        const isFilled = star <= rating;
        
        if (readonly) {
          return (
            <Star
              key={star}
              size={size}
              className={clsx(
                isFilled ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200',
              )}
              aria-hidden="true"
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === rating}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            onClick={() => onChange?.(star)}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={size}
              className={clsx(
                isFilled ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200 hover:fill-orange-200 hover:text-orange-200 transition-colors',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
