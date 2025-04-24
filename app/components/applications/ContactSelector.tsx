'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ContactWithTags } from 'app/lib/types';
import Button from '../common/Button';

/**
 * Props for the ContactSelector component
 */
interface ContactSelectorProps {
  initialContactIds: string[];
  onContactsChange: (contactIds: string[]) => void;
}

/**
 * Component to select contacts to associate with job applications
 */
export function ContactSelector({ initialContactIds = [], onContactsChange }: ContactSelectorProps) {
  const [availableContacts, setAvailableContacts] = useState<ContactWithTags[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(initialContactIds);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactSelector, setShowContactSelector] = useState(false);

  // Fetch available contacts on component mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/contacts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        
        const data = await response.json();
        setAvailableContacts(data.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load contacts');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContacts();
  }, []);

  /**
   * Toggle contact selection
   */
  const toggleContact = (contactId: string) => {
    setSelectedContactIds(prevSelected => {
      const newSelection = prevSelected.includes(contactId)
        ? prevSelected.filter(id => id !== contactId)
        : [...prevSelected, contactId];
      
      // Notify parent component of contact changes
      onContactsChange(newSelection);
      return newSelection;
    });
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

  /**
   * Filter contacts based on search term
   */
  const filteredContacts = availableContacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const company = contact.company?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || company.includes(searchLower);
  });

  /**
   * Get selected contacts
   */
  const selectedContacts = availableContacts.filter(contact => 
    selectedContactIds.includes(contact.id)
  );

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Associated Contacts</label>
      
      {/* Selected Contacts Display */}
      <div className="mb-4">
        {selectedContacts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedContacts.map(contact => (
              <div 
                key={contact.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
              >
                <div className="flex-shrink-0 mr-2">
                  <Image
                    src={getAvatarUrl(contact)}
                    alt={`${contact.firstName} ${contact.lastName}`}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </div>
                <span>{contact.firstName} {contact.lastName}</span>
                <button
                  type="button"
                  onClick={() => toggleContact(contact.id)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No contacts associated with this application.</p>
        )}
      </div>
      
      {/* Contact Selector */}
      <div>
        {!showContactSelector ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => setShowContactSelector(true)}
          >
            Add Contacts
          </Button>
        ) : (
          <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-900">Select Contacts</h4>
              <button
                type="button"
                onClick={() => setShowContactSelector(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Search input */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts..."
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            {/* Contacts list */}
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading contacts...</p>
              </div>
            ) : filteredContacts.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto divide-y divide-gray-200">
                {filteredContacts.map(contact => (
                  <li 
                    key={contact.id}
                    className="py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 px-2 rounded"
                    onClick={() => toggleContact(contact.id)}
                  >
                    <div className="flex items-center">
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
                    </div>
                    {selectedContactIds.includes(contact.id) && (
                      <CheckIcon className="h-5 w-5 text-indigo-600" />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4 text-gray-500">
                {searchTerm ? "No contacts match your search" : "No contacts available"}
              </p>
            )}
            
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setShowContactSelector(false)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 