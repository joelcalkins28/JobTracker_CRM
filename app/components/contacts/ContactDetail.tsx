'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon, 
  LinkIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';
import { ContactWithTags } from '@/app/lib/types';

/**
 * ContactDetail properties interface
 */
interface ContactDetailProps {
  contact: ContactWithTags;
}

/**
 * Component to display detailed information about a single contact
 */
export function ContactDetail({ contact }: ContactDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  /**
   * Delete this contact
   */
  const deleteContact = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete contact');
      }
      
      toast.success('Contact deleted successfully');
      router.push('/contacts');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete contact');
      setIsDeleting(false);
    }
  };

  /**
   * Get the contact's initials for avatar
   */
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  /**
   * Get avatar URL or use initials
   */
  const getAvatarUrl = () => {
    if (contact.imageUrl) {
      return contact.imageUrl;
    }
    
    // Generate an avatar with initials
    const initials = getInitials(contact.firstName, contact.lastName);
    const color = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    
    return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=128`;
  };

  /**
   * Get background color class for a tag
   */
  const getTagBgClass = (color: string) => {
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      amber: 'bg-amber-100 text-amber-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      lime: 'bg-lime-100 text-lime-800',
      green: 'bg-green-100 text-green-800',
      emerald: 'bg-emerald-100 text-emerald-800',
      teal: 'bg-teal-100 text-teal-800',
      cyan: 'bg-cyan-100 text-cyan-800',
      sky: 'bg-sky-100 text-sky-800',
      blue: 'bg-blue-100 text-blue-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      violet: 'bg-violet-100 text-violet-800',
      purple: 'bg-purple-100 text-purple-800',
      fuchsia: 'bg-fuchsia-100 text-fuchsia-800',
      pink: 'bg-pink-100 text-pink-800',
      rose: 'bg-rose-100 text-rose-800',
    };
    
    return colorMap[color] || 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <Link href="/contacts" className="flex items-center text-indigo-600 hover:text-indigo-500">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Back to Contacts</span>
        </Link>
        <div className="flex space-x-3">
          <Link href={`/contacts/${contact.id}/edit`}>
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
            onClick={deleteContact}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
      
      {/* Contact Information */}
      <Card>
        <div className="md:flex">
          {/* Avatar Column */}
          <div className="md:w-1/4 flex flex-col items-center mb-6 md:mb-0">
            <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4">
              <Image
                src={getAvatarUrl()}
                alt={`${contact.firstName} ${contact.lastName}`}
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Tags */}
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-3 max-w-xs">
                {contact.tags.map(tag => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagBgClass(tag.color)}`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Details Column */}
          <div className="md:w-3/4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {contact.firstName} {contact.lastName}
            </h2>
            
            {(contact.position || contact.company) && (
              <p className="text-lg text-gray-600 mb-6">
                {contact.position && contact.company 
                  ? `${contact.position} at ${contact.company}`
                  : contact.position || contact.company}
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              {contact.email && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 text-gray-700">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}
              
              {/* Phone */}
              {contact.phone && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 text-gray-700">
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <a 
                      href={`tel:${contact.phone}`} 
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {/* Company */}
              {contact.company && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 text-gray-700">
                    <p className="text-sm font-medium text-gray-500">Company</p>
                    <p>{contact.company}</p>
                  </div>
                </div>
              )}
              
              {/* LinkedIn */}
              {contact.linkedInUrl && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 text-gray-700">
                    <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                    <a 
                      href={contact.linkedInUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 transition-colors truncate block max-w-xs"
                    >
                      {contact.linkedInUrl}
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Created/Updated timestamp */}
            <div className="mt-8 text-sm text-gray-500 border-t border-gray-200 pt-4">
              <p>Created on {formatDate(contact.createdAt)}</p>
              <p>Last updated on {formatDate(contact.updatedAt)}</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Activity Section Placeholder */}
      <Card title="Recent Activity" description="Interactions and notes with this contact">
        <p className="text-gray-500 italic">No recent activity found.</p>
      </Card>
      
      {/* Notes Section Placeholder */}
      <Card title="Notes" description="Your notes about this contact">
        <p className="text-gray-500 italic">No notes found. Add your first note about this contact.</p>
        <div className="mt-4">
          <Button variant="outline">Add Note</Button>
        </div>
      </Card>
    </div>
  );
} 