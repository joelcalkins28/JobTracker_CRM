'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  PencilIcon, 
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';
import { ContactWithTags } from '@/app/lib/types';

/**
 * ContactList properties interface
 */
interface ContactListProps {
  contacts: ContactWithTags[];
  onDeleteSuccess?: () => void;
}

/**
 * Component to display a list of contacts
 * Includes options to view, edit, and delete contacts
 */
export function ContactList({ contacts, onDeleteSuccess }: ContactListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Delete a contact
   */
  const deleteContact = async (id: string) => {
    setDeletingId(id);
    
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete contact');
      }
      
      toast.success('Contact deleted successfully');
      
      // Refresh the contacts list
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete contact');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Get the contact's initial for avatar
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

  if (contacts.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first contact.</p>
          <Link href="/contacts/new">
            <Button>Add Contact</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map(contact => (
        <Card key={contact.id} className="hover:shadow-md transition-shadow">
          <div className="flex items-start">
            {/* Contact Avatar */}
            <div className="flex-shrink-0 mr-4">
              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                <Image
                  src={getAvatarUrl(contact)}
                  alt={`${contact.firstName} ${contact.lastName}`}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="flex-1 min-w-0">
              <Link 
                href={`/contacts/${contact.id}`}
                className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
              >
                {contact.firstName} {contact.lastName}
              </Link>
              
              {contact.position && contact.company && (
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {contact.position} at {contact.company}
                </p>
              )}
              
              {!contact.position && contact.company && (
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {contact.company}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {contact.email && (
                  <a 
                    href={`mailto:${contact.email}`}
                    className="text-sm text-gray-600 hover:text-indigo-600 flex items-center"
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {contact.email}
                  </a>
                )}
                
                {contact.phone && (
                  <a 
                    href={`tel:${contact.phone}`}
                    className="text-sm text-gray-600 hover:text-indigo-600 flex items-center"
                  >
                    <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {contact.phone}
                  </a>
                )}
              </div>
              
              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
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
            
            {/* Actions */}
            <div className="flex-shrink-0 flex space-x-2 ml-4">
              <Link href={`/contacts/${contact.id}/edit`}>
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
                onClick={() => deleteContact(contact.id)}
                isLoading={deletingId === contact.id}
                disabled={!!deletingId}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 