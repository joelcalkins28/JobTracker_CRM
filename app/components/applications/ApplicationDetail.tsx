'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  LinkIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';
import { ApplicationWithDocuments, ApplicationStatus, ContactWithTags } from 'app/lib/types';

/**
 * Props for the ApplicationDetail component
 */
interface ApplicationDetailProps {
  application: ApplicationWithDocuments;
  contacts?: ContactWithTags[];
}

/**
 * Component to display detailed information about a job application
 */
export function ApplicationDetail({ application, contacts = [] }: ApplicationDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(application.status);
  const router = useRouter();

  /**
   * Delete this application
   */
  const deleteApplication = async () => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete application');
      }
      
      toast.success('Application deleted successfully');
      router.push('/applications');
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete application');
      setIsDeleting(false);
    }
  };

  /**
   * Update application status
   */
  const updateStatus = async (status: ApplicationStatus) => {
    setIsUpdatingStatus(true);
    
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }
      
      setCurrentStatus(status);
      toast.success(`Status updated to ${status}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  /**
   * Format a date in a human-readable format
   */
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Get color class for application status
   */
  const getStatusColorClass = (status: string) => {
    const statusColorMap: Record<string, string> = {
      [ApplicationStatus.WISHLIST]: 'bg-gray-100 text-gray-800',
      [ApplicationStatus.APPLIED]: 'bg-blue-100 text-blue-800',
      [ApplicationStatus.PHONE_SCREEN]: 'bg-indigo-100 text-indigo-800',
      [ApplicationStatus.INTERVIEW]: 'bg-purple-100 text-purple-800',
      [ApplicationStatus.OFFER]: 'bg-green-100 text-green-800',
      [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
      [ApplicationStatus.ACCEPTED]: 'bg-emerald-100 text-emerald-800',
      [ApplicationStatus.WITHDRAWN]: 'bg-amber-100 text-amber-800',
    };
    
    return statusColorMap[status] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get next possible statuses based on current status
   */
  const getNextStatuses = (currentStatus: string): ApplicationStatus[] => {
    const statusFlow: Record<string, ApplicationStatus[]> = {
      [ApplicationStatus.WISHLIST]: [
        ApplicationStatus.APPLIED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.APPLIED]: [
        ApplicationStatus.PHONE_SCREEN,
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.PHONE_SCREEN]: [
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.INTERVIEW]: [
        ApplicationStatus.OFFER,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.OFFER]: [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.ACCEPTED]: [
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.REJECTED]: [
        ApplicationStatus.APPLIED, // Reapply
      ],
      [ApplicationStatus.WITHDRAWN]: [
        ApplicationStatus.APPLIED, // Reapply
      ],
    };
    
    return statusFlow[currentStatus] || [];
  };

  /**
   * Get contact initials for avatar
   */
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  /**
   * Get avatar URL or use initials
   */
  const getAvatarUrl = (contact: ContactWithTags) => {
    if (contact.imageUrl) {
      return contact.imageUrl;
    }
    
    // Generate an avatar with initials
    const initials = getInitials(contact.firstName, contact.lastName);
    const color = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    
    return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff`;
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <Link href="/applications" className="flex items-center text-indigo-600 hover:text-indigo-500">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Back to Applications</span>
        </Link>
        <div className="flex space-x-3">
          <Link href={`/applications/${application.id}/edit`}>
            <Button
              variant="outline"
              leftIcon={<PencilIcon className="h-4 w-4" />}
            >
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            leftIcon={<TrashIcon className="h-4 w-4" />}
            onClick={deleteApplication}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
      
      {/* Application Information */}
      <Card>
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {application.jobTitle}
                </h2>
                <p className="mt-1 text-lg text-gray-600">
                  {application.company}
                </p>
              </div>
              <div 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(currentStatus)}`}
              >
                {currentStatus}
              </div>
            </div>
          </div>
          
          {/* Status Update */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {getNextStatuses(currentStatus).map(status => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={isUpdatingStatus}
                  className={`
                    inline-flex items-center px-3 py-1.5 border border-gray-300 
                    rounded-md text-sm font-medium bg-white text-gray-700 
                    hover:bg-gray-50 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-indigo-500
                    ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isUpdatingStatus && (
                    <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {application.location && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3 text-gray-700">
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p>{application.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3 text-gray-700">
                <p className="text-sm font-medium text-gray-500">Date Applied</p>
                <p>{formatDate(application.dateApplied)}</p>
              </div>
            </div>
            
            {application.salary && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3 text-gray-700">
                  <p className="text-sm font-medium text-gray-500">Salary</p>
                  <p>{application.salary}</p>
                </div>
              </div>
            )}
            
            {application.applicationUrl && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3 text-gray-700">
                  <p className="text-sm font-medium text-gray-500">Job Posting</p>
                  <a 
                    href={application.applicationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors truncate block max-w-xs"
                  >
                    {application.applicationUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* Description */}
          {application.description && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{application.description}</p>
            </div>
          )}
          
          {/* Contacts */}
          {contacts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Contacts</h3>
              <div className="flex flex-wrap gap-3">
                {contacts.map(contact => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 mr-3">
                      <Image
                        src={getAvatarUrl(contact)}
                        alt={`${contact.firstName} ${contact.lastName}`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </p>
                      {contact.company && (
                        <p className="text-xs text-gray-500">{contact.company}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Documents */}
          {application.documents.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Documents</h3>
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                {application.documents.map(doc => (
                  <li key={doc.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="truncate">{doc.name}</span>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                        {doc.type}
                      </span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Created/Updated timestamp */}
          <div className="mt-8 text-sm text-gray-500 border-t border-gray-200 pt-4">
            <p>Applied on {formatDate(application.dateApplied)}</p>
            <p>Last updated on {formatDate(application.updatedAt)}</p>
          </div>
        </div>
      </Card>
      
      {/* Activity Section Placeholder */}
      <Card title="Activity Timeline" description="History of status changes and interactions">
        <p className="text-gray-500 italic">No activity recorded yet.</p>
      </Card>
      
      {/* Notes Section Placeholder */}
      <Card title="Notes" description="Your notes about this application">
        <p className="text-gray-500 italic">No notes found. Add your first note about this application.</p>
        <div className="mt-4">
          <Button variant="outline">Add Note</Button>
        </div>
      </Card>
    </div>
  );
} 