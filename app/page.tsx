'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page component
 * Redirects to dashboard if authenticated, otherwise to login page
 */
export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Try to fetch user data to check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // User is not authenticated, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        // Error occurred, redirect to login
        router.push('/auth/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Display a loading spinner while checking authentication
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}
