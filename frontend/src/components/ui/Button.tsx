import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Enterprise Button Component
 * - Supports multiple variants and sizes
 * - Built-in loading state with spinner
 * - Icon support (left/right)
 * - Accessible focus ring and disabled states
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    // Determine classes based on props
    const baseStyles: ClassValue =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants: Record<NonNullable<ButtonProps['variant']>, ClassValue> = {
      primary:
        'bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-500 shadow-sm',
      secondary:
        'bg-navy-800 text-white hover:bg-navy-700 focus-visible:ring-navy-800 shadow-sm',
      outline:
        'border border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-400 text-gray-900',
      ghost: 'hover:bg-gray-100 hover:text-gray-900 text-gray-600 focus-visible:ring-gray-400',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-sm',
    };

    const sizes: Record<NonNullable<ButtonProps['size']>, ClassValue> = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-base',
      icon: 'h-10 w-10',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled ?? isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], widthClass, className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
