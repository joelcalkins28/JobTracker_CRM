'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

/**
 * Layout component for authenticated routes
 * Includes the sidebar navigation and page content
 * 
 * @param children - The page content to render
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '8px',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
          },
          success: {
            style: {
              border: '1px solid #4ade80',
            },
          },
          error: {
            style: {
              border: '1px solid #f87171',
            },
          },
        }}
      />
    </div>
  );
} 