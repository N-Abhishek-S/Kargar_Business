import { clsx } from 'clsx';
import { OptimizedImage } from './OptimizedImage';
import type { ImageConfig } from '@/types';
import { useReducedMotion } from 'framer-motion';

export interface LogoSliderProps {
  logos: ImageConfig[];
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
  className?: string;
}

/**
 * Enterprise Logo Slider Component
 * - Infinite CSS marquee animation
 * - Pauses on hover
 * - Respects prefers-reduced-motion
 * - Grayscale to color on hover
 */
export function LogoSlider({
  logos,
  speed = 'normal',
  direction = 'left',
  className,
}: LogoSliderProps) {
  const prefersReducedMotion = useReducedMotion();

  const speedClasses = {
    slow: 'duration-[60s]',
    normal: 'duration-[40s]',
    fast: 'duration-[20s]',
  };

  const animationClass = direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse';

  return (
    <div
      className={clsx(
        'group relative flex w-full overflow-hidden bg-white py-12',
        className,
      )}
    >
      {/* Fade gradients for smooth edges */}
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

      <div
        className={clsx(
          'flex min-w-full shrink-0 items-center justify-around gap-16 px-8',
          !prefersReducedMotion && animationClass,
          !prefersReducedMotion && speedClasses[speed],
          'group-hover:!play-state-paused', // Custom utility we'll add to CSS or use inline style
        )}
        style={{ animationPlayState: 'running' }}
        onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
      >
        {logos.map((logo, idx) => (
          <div
            key={`logo-1-${idx}`}
            className="flex w-32 shrink-0 items-center justify-center opacity-60 transition-all duration-300 hover:opacity-100 hover:grayscale-0 grayscale"
          >
            <OptimizedImage
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              showBlur={false}
              objectFit="contain"
            />
          </div>
        ))}
      </div>

      {/* Duplicate for infinite effect (only if motion allowed) */}
      {!prefersReducedMotion && (
        <div
          className={clsx(
            'flex min-w-full shrink-0 items-center justify-around gap-16 px-8',
            animationClass,
            speedClasses[speed],
          )}
          style={{ animationPlayState: 'running' }}
          onMouseEnter={(e) => {
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const children = parent.children;
              (children[2] as HTMLElement).style.animationPlayState = 'paused';
              (children[3] as HTMLElement).style.animationPlayState = 'paused';
            }
          }}
          onMouseLeave={(e) => {
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const children = parent.children;
              (children[2] as HTMLElement).style.animationPlayState = 'running';
              (children[3] as HTMLElement).style.animationPlayState = 'running';
            }
          }}
        >
          {logos.map((logo, idx) => (
            <div
              key={`logo-2-${idx}`}
              className="flex w-32 shrink-0 items-center justify-center opacity-60 transition-all duration-300 hover:opacity-100 hover:grayscale-0 grayscale"
            >
              <OptimizedImage
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                showBlur={false}
                objectFit="contain"
                decorative // Screen readers only need to hear the first list
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
