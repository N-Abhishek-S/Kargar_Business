import { type SelectHTMLAttributes, forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

/**
 * Enterprise Select Component
 * - Native select for best mobile UX and accessibility
 * - Custom styling wrapper to match design system
 * - Integrated label and error states
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, helperText, options, placeholder, id: providedId, ...props },
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
          <select
            id={id}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            className={clsx(
              'flex h-10 w-full appearance-none rounded-md border bg-white pl-3 pr-10 py-2 text-sm text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
              hasError
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'border-gray-300 focus-visible:border-orange-500 focus-visible:ring-orange-500/20',
              !props.value && !props.defaultValue && 'text-gray-400',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-gray-400">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="text-gray-900"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {hasError ? (
              <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
            )}
          </div>
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
Select.displayName = 'Select';
