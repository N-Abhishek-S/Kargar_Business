import { Star } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

interface ReviewStarsProps {
  rating: number;
  className?: string;
}

export function ReviewStars({ rating, className }: ReviewStarsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setMounted(true); }, 50);
    return () => { clearTimeout(timer); };
  }, []);

  return (
    <div
      className={clsx('flex items-center gap-0.5', className)}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={18}
          className={clsx(
            'transition-all duration-[400ms] ease-(--ease-spring)',
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
            i < rating
              ? 'fill-(--text-accent) text-(--text-accent)'
              : 'fill-gray-200 text-gray-200'
          )}
          style={{ transitionDelay: `${i * 50}ms` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
