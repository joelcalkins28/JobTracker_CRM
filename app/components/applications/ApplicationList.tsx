'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { CalendarIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { ApplicationWithDocuments, ApplicationStatus } from '@/lib/types';
import FilterBar from './FilterBar';
import Button from '@/components/common/Button';
import { format } from 'date-fns';

/**
 * Get CSS class based on application status
 */
const getStatusColorClass = (status: string): string => {
  switch (status) {
    case ApplicationStatus.WISHLIST:
      return 'bg-gray-200 text-gray-800';
    case ApplicationStatus.APPLIED:
      return 'bg-blue-200 text-blue-800';
    case ApplicationStatus.PHONE_SCREEN:
      return 'bg-purple-200 text-purple-800';
    case ApplicationStatus.INTERVIEW:
      return 'bg-indigo-200 text-indigo-800';
    case ApplicationStatus.OFFER:
      return 'bg-green-200 text-green-800';
    case ApplicationStatus.REJECTED:
      return 'bg-red-200 text-red-800';
    case ApplicationStatus.ACCEPTED:
      return 'bg-emerald-200 text-emerald-800';
    case ApplicationStatus.WITHDRAWN:
      return 'bg-amber-200 text-amber-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

/**
 * Format date as relative time (e.g., 2 days ago)
 */
const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

interface ApplicationListProps {
  applications: ApplicationWithDocuments[];
  onDeleteSuccess: () => void;
}

/**
 * Component for displaying and filtering job applications
 */
export default function ApplicationList({ applications, onDeleteSuccess }: ApplicationListProps) {
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDocuments[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dateApplied' | 'company' | 'status'>('dateApplied');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Update filtered applications when filters or sort options change
   */
  useEffect(() => {
    let result = [...applications];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app => 
        app.jobTitle.toLowerCase().includes(term) || 
        app.company.toLowerCase().includes(term) || 
        (app.location ? app.location.toLowerCase().includes(term) : false)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'dateApplied') {
        const dateA = new Date(a.dateApplied).getTime();
        const dateB = new Date(b.dateApplied).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const valueA = a[sortBy].toLowerCase();
        const valueB = b[sortBy].toLowerCase();
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
    
    setFilteredApplications(result);
  }, [applications, statusFilter, sortBy, sortOrder, searchTerm]);

  /**
   * Toggle sort direction or change sort field
   */
  const handleSort = (field: 'dateApplied' | 'company' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }
    try {
      const response = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success('Application deleted successfully!');
        onDeleteSuccess();
      } else {
        throw new Error(result.error || 'Failed to delete application');
      }
    } catch (error: any) {
      toast.error(`Error deleting application: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <Link 
          href="/applications/new"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Application
        </Link>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by job title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      
        <FilterBar 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
        
        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Job Title
                      </th>
                      <th 
                        scope="col" 
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        onClick={() => handleSort('company')}
                      >
                        Company
                        {sortBy === 'company' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortBy === 'status' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        onClick={() => handleSort('dateApplied')}
                      >
                        Date Applied
                        {sortBy === 'dateApplied' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Documents
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((application) => (
                        <tr key={application.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {application.jobTitle}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div>{application.company}</div>
                            {application.location && (
                              <div className="text-xs text-gray-400">{application.location}</div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColorClass(application.status)}`}>
                              {application.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
                              <span>{formatRelativeDate(application.dateApplied)}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {application.documents.length} {application.documents.length === 1 ? 'document' : 'documents'}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link
                              href={`/applications/${application.id}`}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              View<span className="sr-only">, {application.jobTitle}</span>
                            </Link>
                            <button
                              onClick={() => handleDelete(application.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5 inline" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-sm text-gray-500 text-center">
                          No applications found. Add a new application or adjust your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 