import { clsx } from 'clsx';
import { type HTMLAttributes, forwardRef } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fluid?: boolean;
}

/**
 * Enterprise Container Component
 * - Standardized max-widths and responsive padding
 * - Based on Tailwind screen sizes
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'xl', fluid = false, children, ...props }, ref) => {
    const maxWidths = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'mx-auto w-full px-4 sm:px-6 lg:px-8',
          !fluid && maxWidths[size],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Container.displayName = 'Container';
