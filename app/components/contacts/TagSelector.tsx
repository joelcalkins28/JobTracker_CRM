'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';

// Available tag colors
const TAG_COLORS = [
  { name: 'Gray', value: 'gray' },
  { name: 'Red', value: 'red' },
  { name: 'Orange', value: 'orange' },
  { name: 'Amber', value: 'amber' },
  { name: 'Yellow', value: 'yellow' },
  { name: 'Lime', value: 'lime' },
  { name: 'Green', value: 'green' },
  { name: 'Emerald', value: 'emerald' },
  { name: 'Teal', value: 'teal' },
  { name: 'Cyan', value: 'cyan' },
  { name: 'Sky', value: 'sky' },
  { name: 'Blue', value: 'blue' },
  { name: 'Indigo', value: 'indigo' },
  { name: 'Violet', value: 'violet' },
  { name: 'Purple', value: 'purple' },
  { name: 'Fuchsia', value: 'fuchsia' },
  { name: 'Pink', value: 'pink' },
  { name: 'Rose', value: 'rose' },
];

/**
 * Tag interface with ID, name, and color
 */
interface Tag {
  id: string;
  name: string;
  color: string;
}

/**
 * TagSelector properties
 */
interface TagSelectorProps {
  initialTags?: string[];
  onTagsChange: (tagIds: string[]) => void;
}

/**
 * Tag selector component for managing contact tags
 * Allows for selecting existing tags and creating new ones
 */
export function TagSelector({ initialTags = [], onTagsChange }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTags);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('indigo');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        
        const data = await response.json();
        setAvailableTags(data.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
        toast.error('Failed to load tags');
      }
    };
    
    fetchTags();
  }, []);

  /**
   * Toggle tag selection
   */
  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prevSelected => {
      const newSelection = prevSelected.includes(tagId)
        ? prevSelected.filter(id => id !== tagId)
        : [...prevSelected, tagId];
      
      // Notify parent component of tag changes
      onTagsChange(newSelection);
      return newSelection;
    });
  };

  /**
   * Create a new tag
   */
  const createTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tag');
      }
      
      const result = await response.json();
      const newTag = result.data;
      
      // Add new tag to available tags
      setAvailableTags(prev => [...prev, newTag]);
      
      // Select the newly created tag
      setSelectedTagIds(prev => {
        const newSelection = [...prev, newTag.id];
        onTagsChange(newSelection);
        return newSelection;
      });
      
      // Reset form
      setNewTagName('');
      setIsAddingTag(false);
      toast.success('Tag created successfully');
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create tag');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get color class for tag background
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
   * Cancel adding a new tag
   */
  const cancelAddTag = () => {
    setIsAddingTag(false);
    setNewTagName('');
    setNewTagColor('indigo');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Tags</label>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {availableTags.map(tag => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={`
              ${getTagBgClass(tag.color)}
              ${selectedTagIds.includes(tag.id) 
                ? 'ring-2 ring-offset-2 ring-indigo-500' 
                : ''}
              px-3 py-1 rounded-full text-sm font-medium transition-all
            `}
          >
            {tag.name}
          </button>
        ))}
        
        {!isAddingTag && (
          <button
            type="button"
            onClick={() => setIsAddingTag(true)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            Add Tag
          </button>
        )}
      </div>
      
      {isAddingTag && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Create New Tag</h4>
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter tag name"
              />
            </div>
            
            <div>
              <label htmlFor="tagColor" className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {TAG_COLORS.map(color => (
                  <div 
                    key={color.value}
                    onClick={() => setNewTagColor(color.value)}
                    className={`
                      ${getTagBgClass(color.value)}
                      ${newTagColor === color.value ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}
                      h-8 rounded-md cursor-pointer flex items-center justify-center text-xs
                    `}
                    title={color.name}
                  >
                    {newTagColor === color.value && <span>✓</span>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelAddTag}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={createTag}
                isLoading={isLoading}
              >
                Create Tag
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 