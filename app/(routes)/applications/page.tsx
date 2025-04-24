'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/app/components/common/AppLayout';
import { ApplicationList } from '@/app/components/applications/ApplicationList';
import { Button } from '@/app/components/ui/button';
import { FilterBar } from '@/app/components/applications/FilterBar';
import { Application } from '@prisma/client';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ApplicationWithDocuments } from 'app/lib/types';

/**
 * Applications list page component
 * Displays a list of job applications with filtering and sorting options
 */
export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithDocuments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  // Fetch applications when the component mounts or search params change
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        
        // Build query string from search params
        const queryString = searchParams.toString();
        const url = `/api/applications${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        setApplications(data.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [searchParams]);

  /**
   * Refresh applications list
   */
  const refreshApplications = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/applications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      setApplications(data.data);
    } catch (error) {
      console.error('Error refreshing applications:', error);
      toast.error('Failed to refresh applications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <ApplicationList 
            applications={applications} 
            onDeleteSuccess={refreshApplications}
          />
        )}
      </div>
    </AppLayout>
  );
} 