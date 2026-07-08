import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Enterprise Input Component
 * - Integrated label, error message, and helper text
 * - Icon support
 * - Accessible IDs and aria attributes
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = 'text', label, error, helperText, leftIcon, rightIcon, id: providedId, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const hasError = !!error;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium leading-none text-navy-900">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={id}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={clsx(
              'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
              hasError
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'border-gray-300 focus-visible:border-orange-500 focus-visible:ring-orange-500/20',
              leftIcon && 'pl-10',
              (rightIcon ?? hasError) && 'pr-10',
              className,
            )}
            {...props}
          />
          {hasError ? (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-red-500">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            </div>
          ) : rightIcon ? (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
              {rightIcon}
            </div>
          ) : null}
        </div>
        {hasError ? (
          <p id={errorId} className="text-sm font-medium text-red-500">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-sm text-gray-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';
