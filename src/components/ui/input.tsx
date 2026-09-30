import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  floatingLabel?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, floatingLabel, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    if (floatingLabel) {
      return (
        <div className="relative w-full">
          <input
            id={inputId}
            className={cn(
              'peer block w-full appearance-none rounded-md border border-gray-300 bg-transparent px-3 pb-2 pt-6 text-sm text-gray-900 focus:border-[#F47920] focus:outline-none focus:ring-0 disabled:opacity-50',
              error && 'border-red-500 focus:border-red-500',
              className
            )}
            placeholder=" "
            ref={ref}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'absolute left-3 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-[#F47920]',
                error && 'text-red-500 peer-focus:text-red-500'
              )}
            >
              {label}
            </label>
          )}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
      );
    }

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-[#4D4D4D]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F47920] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
