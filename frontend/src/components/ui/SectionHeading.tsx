import { clsx } from 'clsx';
import { type HTMLAttributes } from 'react';

export interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: 'left' | 'center' | 'right';
  dark?: boolean;
}

/**
 * Enterprise Section Heading Component
 * - Standardized headings across the application
 * - Supports eyebrow (small text above title), title, and subtitle
 * - Alignment and dark mode variants
 */
export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  align = 'left',
  dark = false,
  className,
  ...props
}: SectionHeadingProps) {
  const alignments = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  };

  return (
    <div className={clsx('max-w-3xl mb-12', alignments[align], className)} {...props}>
      {eyebrow && (
        <p className="mb-3 font-semibold uppercase tracking-wider text-sm text-orange-500">
          {eyebrow}
        </p>
      )}
      <h2
        className={clsx(
          'mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl',
          dark ? 'text-white' : 'text-navy-900',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={clsx(
            'text-lg leading-relaxed',
            dark ? 'text-navy-200' : 'text-gray-600',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
