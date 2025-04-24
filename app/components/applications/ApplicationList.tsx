'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PencilIcon, 
  TrashIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';
import { ApplicationWithDocuments, ApplicationStatus } from '@/app/lib/types';

/**
 * Props for the ApplicationList component
 */
interface ApplicationListProps {
  applications: ApplicationWithDocuments[];
  onDeleteSuccess?: () => void;
}

/**
 * Component to display a list of job applications
 * Includes status filtering and sorting options
 */
export function ApplicationList({ applications, onDeleteSuccess }: ApplicationListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dateApplied' | 'company' | 'status'>('dateApplied');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();

  /**
   * Delete a job application
   */
  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    setDeletingId(id);
    
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete application');
      }
      
      toast.success('Application deleted successfully');
      
      // Refresh the applications list
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete application');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Format a date in a human-readable format
   */
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
   * Filter and sort applications
   */
  const filteredAndSortedApplications = applications
    .filter((app) => statusFilter === 'all' || app.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'dateApplied') {
        return sortOrder === 'asc' 
          ? new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime()
          : new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
      }
      
      if (sortBy === 'company') {
        return sortOrder === 'asc'
          ? a.company.localeCompare(b.company)
          : b.company.localeCompare(a.company);
      }
      
      if (sortBy === 'status') {
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      
      return 0;
    });

  /**
   * Toggle sort order
   */
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  /**
   * Change sort field
   */
  const changeSortBy = (field: 'dateApplied' | 'company' | 'status') => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (applications.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first job application.</p>
          <Link href="/applications/new">
            <Button>Add Application</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              {Object.values(ApplicationStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sorting */}
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="flex items-center space-x-2">
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => changeSortBy(e.target.value as 'dateApplied' | 'company' | 'status')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="dateApplied">Date Applied</option>
                <option value="company">Company</option>
                <option value="status">Status</option>
              </select>
              <button
                type="button"
                onClick={toggleSortOrder}
                className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          
          {/* Add Application Button */}
          <div className="md:ml-auto">
            <Link href="/applications/new">
              <Button>Add Application</Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Applications List */}
      <div className="space-y-4">
        {filteredAndSortedApplications.map(application => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <div className="md:flex md:items-start">
              {/* Application Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <Link 
                    href={`/applications/${application.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                  >
                    {application.jobTitle}
                  </Link>
                  <span 
                    className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(application.status)}`}
                  >
                    {application.status}
                  </span>
                </div>
                
                <p className="mt-1 text-sm text-gray-600 flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {application.company}
                </p>
                
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                  {application.location && (
                    <span className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {application.location}
                    </span>
                  )}
                  
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    Applied {formatDate(application.dateApplied)}
                  </span>
                  
                  {application.salary && (
                    <span className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {application.salary}
                    </span>
                  )}
                </div>
                
                {application.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {application.description}
                  </p>
                )}
                
                {/* Documents */}
                {application.documents.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-gray-500">
                      Documents: {application.documents.length}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex mt-4 md:mt-0 space-x-2">
                <Link href={`/applications/${application.id}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                  >
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<TrashIcon className="h-4 w-4" />}
                  onClick={() => deleteApplication(application.id)}
                  isLoading={deletingId === application.id}
                  disabled={!!deletingId}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Empty State for Filtered Results */}
      {applications.length > 0 && filteredAndSortedApplications.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No applications match the selected filters.</p>
          <Button 
            variant="outline" 
            onClick={() => setStatusFilter('all')}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
} 