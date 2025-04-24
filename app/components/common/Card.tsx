'use client';

import { ReactNode } from 'react';

/**
 * Card component props
 */
interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
  icon?: ReactNode;
}

/**
 * Reusable Card component for displaying content in a box with optional header and footer
 */
export default function Card({
  title,
  description,
  children,
  footer,
  className = '',
  fullWidth = false,
  noPadding = false,
  icon,
}: CardProps) {
  return (
    <div
      className={`
        bg-white overflow-hidden shadow rounded-lg border border-gray-200
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {(title || description) && (
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          {title && (
            <div className="flex items-center">
              {icon && <div className="mr-2 text-gray-500">{icon}</div>}
              <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
            </div>
          )}
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      
      <div className={noPadding ? '' : 'px-4 py-5 sm:p-6'}>{children}</div>
      
      {footer && (
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">{footer}</div>
      )}
    </div>
  );
} 