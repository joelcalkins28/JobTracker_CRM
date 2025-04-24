'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/components/common/AppLayout';
import ApplicationList from '@/components/applications/ApplicationList';
import Button from '@/components/common/Button';
import FilterBar from '@/components/applications/FilterBar';
import { ApplicationWithDocuments } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ApplicationForm } from '@/components/applications/ApplicationForm';

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

  const handleAddSuccess = () => {
    refreshApplications();
    toast.success('Application added successfully!');
  };
  
  const handleDeleteSuccess = async () => {
    await refreshApplications();
    toast.success('Application deleted successfully!');
  };

  return (
    <AppLayout title="Job Applications">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <Button 
          onClick={() => setShowAddForm(true)}
          variant="primary"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Application
        </Button>
      </div>

      <Suspense fallback={<div>Loading applications...</div>}>
        {isLoading && <div>Loading applications...</div>} 
        {!isLoading && (
          <ApplicationList 
             applications={applications} 
             onDeleteSuccess={handleDeleteSuccess} 
           />
        )}
      </Suspense>
    </AppLayout>
  );
} 