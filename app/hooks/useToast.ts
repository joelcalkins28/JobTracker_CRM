'use client';

import { useCallback } from 'react';
import toast, { ToastOptions } from 'react-hot-toast';

/**
 * Type for toast severity levels
 */
export type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

/**
 * Custom hook to use toast notifications
 * @returns Toast functions to show different types of notifications
 */
export const useToast = () => {
  /**
   * Show a toast notification with the specified severity
   * @param {string} message - Message to display
   * @param {ToastSeverity} severity - Type of notification
   * @param {ToastOptions} options - Additional toast options
   */
  const showToast = useCallback((message: string, severity: ToastSeverity = 'info', options?: ToastOptions) => {
    switch (severity) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'info':
      case 'warning':
        // For info and warning, use the default toast with custom styling
        toast(message, {
          ...options,
          icon: severity === 'warning' ? '⚠️' : 'ℹ️',
          style: {
            backgroundColor: severity === 'warning' ? '#FFF3CD' : '#D1ECF1',
            color: severity === 'warning' ? '#856404' : '#0C5460',
            border: `1px solid ${severity === 'warning' ? '#FFEEBA' : '#BEE5EB'}`,
          },
        });
        break;
    }
  }, []);

  /**
   * Show a success toast notification
   * @param {string} message - Message to display
   * @param {ToastOptions} options - Additional toast options
   */
  const success = useCallback((message: string, options?: ToastOptions) => {
    showToast(message, 'success', options);
  }, [showToast]);

  /**
   * Show an error toast notification
   * @param {string} message - Message to display
   * @param {ToastOptions} options - Additional toast options
   */
  const error = useCallback((message: string, options?: ToastOptions) => {
    showToast(message, 'error', options);
  }, [showToast]);

  /**
   * Show an info toast notification
   * @param {string} message - Message to display
   * @param {ToastOptions} options - Additional toast options
   */
  const info = useCallback((message: string, options?: ToastOptions) => {
    showToast(message, 'info', options);
  }, [showToast]);

  /**
   * Show a warning toast notification
   * @param {string} message - Message to display
   * @param {ToastOptions} options - Additional toast options
   */
  const warning = useCallback((message: string, options?: ToastOptions) => {
    showToast(message, 'warning', options);
  }, [showToast]);

  return {
    showToast,
    success,
    error,
    info,
    warning,
    // Also expose the raw toast functions for advanced use cases
    toast
  };
}; 