'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ApplicationForm } from '@/components/applications/ApplicationForm';
import { ApplicationFormData } from '@/lib/types';
import AppLayout from '@/components/common/AppLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

/**
 * Edit Application page component
 * Allows users to edit an existing job application
 */
export default function EditApplicationPage() {
  const [application, setApplication] = useState<ApplicationFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Fetch application data when the component mounts
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/applications/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch application');
        }
        
        const data = await response.json();
        
        // Extract contact IDs from the contacts array
        const contactIds = data.data.contacts ? 
          data.data.contacts.map((contact: any) => contact.id) : 
          [];
        
        // Format the application data for the form
        setApplication({
          ...data.data,
          contactIds,
          id: data.data.id
        });
      } catch (error) {
        console.error('Error fetching application:', error);
        toast.error('Failed to load application');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplication();
  }, [id]);

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    router.push(`/applications/${id}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit Application</h1>
          <Link href={`/applications/${id}`} className="flex items-center text-indigo-600 hover:text-indigo-500">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span>Back to Application</span>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : application ? (
          <div className="bg-white rounded-lg shadow p-6">
            <ApplicationForm 
              initialData={application} 
              isEditing={true}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Application not found</h2>
            <p className="text-gray-500">The application you're looking for doesn't exist or you don't have permission to edit it.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 