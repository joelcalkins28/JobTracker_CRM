'use client';

import { ChangeEvent, forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

/**
 * Input component props
 */
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onValueChange?: (value: string) => void;
}

/**
 * Reusable Input component
 * Supports various sizes, icons, error states, and helper text
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      size = 'md',
      fullWidth = false,
      id,
      onValueChange,
      onChange,
      ...props
    },
    ref
  ) => {
    // Base classes for the input container
    const containerClasses = `${fullWidth ? 'w-full' : ''}`;
    
    // Base classes for the input itself
    const baseInputClasses = 'block w-full border-0 rounded-md ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm';
    
    // Size-specific classes
    const sizeClasses = {
      sm: 'py-1.5 px-2 text-xs',
      md: 'py-2 px-3 text-sm',
      lg: 'py-3 px-4 text-base',
    };
    
    // State-specific classes
    const stateClasses = error
      ? 'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500'
      : 'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600';
    
    // Icon padding classes
    const iconPaddingClasses = {
      left: leftIcon ? 'pl-10' : '',
      right: rightIcon ? 'pr-10' : '',
    };
    
    // Combined input classes
    const inputClasses = `
      ${baseInputClasses}
      ${sizeClasses[size]}
      ${stateClasses}
      ${iconPaddingClasses.left}
      ${iconPaddingClasses.right}
      ${className}
    `;
    
    /**
     * Handle input changes
     */
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };
    
    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium leading-6 text-gray-900 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={id}
            className={inputClasses}
            onChange={handleChange}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          />
          
          {rightIcon && !error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {rightIcon}
            </div>
          )}
          
          {error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-600" id={`${id}-error`}>
            {error}
          </p>
        )}
        
        {!error && helperText && (
          <p className="mt-2 text-sm text-gray-500" id={`${id}-helper`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 