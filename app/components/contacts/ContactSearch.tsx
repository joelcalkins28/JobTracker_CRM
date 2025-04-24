'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * Props interface for ContactSearch component
 */
interface ContactSearchProps {
  onSearchChange?: (searchParams: URLSearchParams) => void;
}

/**
 * Contact search component for filtering the contacts list
 * Includes search by name, company, and tag filter
 */
export function ContactSearch({ onSearchChange }: ContactSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [tag, setTag] = useState(searchParams.get('tag') || '');
  const [company, setCompany] = useState(searchParams.get('company') || '');
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch available tags and companies on component mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch tags
        const tagsResponse = await fetch('/api/tags');
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setAvailableTags(tagsData.data);
        }
        
        // Fetch unique companies
        const companiesResponse = await fetch('/api/contacts/companies');
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json();
          setAvailableCompanies(companiesData.data);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
    
    fetchFilters();
  }, []);

  /**
   * Handle search submit
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build search params
    const params = new URLSearchParams();
    
    if (search) params.set('q', search);
    if (tag) params.set('tag', tag);
    if (company) params.set('company', company);
    
    // Update URL with search params
    router.push(`/contacts?${params.toString()}`);
    
    // Call the callback if provided
    if (onSearchChange) {
      onSearchChange(params);
    }
  };

  /**
   * Clear all search filters
   */
  const clearFilters = () => {
    setSearch('');
    setTag('');
    setCompany('');
    
    router.push('/contacts');
    
    if (onSearchChange) {
      onSearchChange(new URLSearchParams());
    }
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

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              id="search"
              placeholder="Search contacts by name, email, or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
              rightIcon={
                search ? (
                  <button 
                    type="button" 
                    onClick={() => setSearch('')} 
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                ) : null
              }
            />
          </div>
          
          <Button 
            type="button" 
            variant={showFilters ? 'primary' : 'outline'}
            leftIcon={<FunnelIcon className="h-5 w-5" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          
          <Button type="submit">Search</Button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            {/* Tag Filter */}
            <div>
              <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Tag
              </label>
              <select
                id="tag-filter"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Tags</option>
                {availableTags.map((tagOption) => (
                  <option key={tagOption.id} value={tagOption.id}>
                    {tagOption.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Company Filter */}
            <div>
              <label htmlFor="company-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Company
              </label>
              <select
                id="company-filter"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Companies</option>
                {availableCompanies.map((companyName) => (
                  <option key={companyName} value={companyName}>
                    {companyName}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Clear Filters Button */}
            <div className="md:col-span-2 flex justify-end mt-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
        
        {/* Active Filters Display */}
        {(tag || company) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tag && (
              <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-sm">
                <span>Tag:</span>
                <span className="font-medium">
                  {availableTags.find(t => t.id === tag)?.name || tag}
                </span>
                <button
                  type="button"
                  onClick={() => setTag('')}
                  className="text-indigo-500 hover:text-indigo-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {company && (
              <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-sm">
                <span>Company:</span>
                <span className="font-medium">{company}</span>
                <button
                  type="button"
                  onClick={() => setCompany('')}
                  className="text-indigo-500 hover:text-indigo-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
} 