'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ApplicationDetail } from '@/components/applications/ApplicationDetail';
import { ApplicationWithDocuments, ContactWithTags } from '@/lib/types';
import AppLayout from '@/components/common/AppLayout';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

/**
 * Application detail page component
 * Displays a single application with all its details
 */
export default function ApplicationPage() {
  const [application, setApplication] = useState<ApplicationWithDocuments | null>(null);
  const [contacts, setContacts] = useState<ContactWithTags[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const id = params.id as string;

  // Fetch application data when the component mounts
  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the application
        const applicationResponse = await fetch(`/api/applications/${id}`);
        
        if (!applicationResponse.ok) {
          throw new Error('Failed to fetch application');
        }
        
        const applicationData = await applicationResponse.json();
        setApplication(applicationData.data);
        
        // Extract contact IDs from the application
        const contactIds = applicationData.data.contacts.map((contact: any) => contact.id);
        
        // If there are associated contacts, fetch their details
        if (contactIds.length > 0) {
          const contactsResponse = await fetch('/api/contacts');
          
          if (!contactsResponse.ok) {
            throw new Error('Failed to fetch contacts');
          }
          
          const contactsData = await contactsResponse.json();
          
          // Filter to only include contacts associated with this application
          const associatedContacts = contactsData.data.filter((contact: ContactWithTags) => 
            contactIds.includes(contact.id)
          );
          
          setContacts(associatedContacts);
        }
      } catch (error) {
        console.error('Error fetching application data:', error);
        toast.error('Failed to load application');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplicationData();
  }, [id]);

  return (
    <AppLayout>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : application ? (
        <ApplicationDetail 
          application={application} 
          contacts={contacts}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Application not found</h2>
          <p className="text-gray-500">The application you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      )}
    </AppLayout>
  );
} 