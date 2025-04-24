'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Input from '../common/Input';
import Button from '../common/Button';
import { ContactFormData } from '@/app/lib/types';
import { TagSelector } from './TagSelector';

/**
 * Contact form validation schema
 */
const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  position: z.string().optional().or(z.literal('')),
  linkedInUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  tags: z.array(z.string()),
});

/**
 * ContactForm Props 
 */
interface ContactFormProps {
  initialData?: ContactFormData;
  isEditing?: boolean;
  onCancel?: () => void;
}

/**
 * Contact form component for adding or editing contacts
 */
export function ContactForm({ initialData, isEditing = false, onCancel }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      linkedInUrl: '',
      tags: [],
    },
  });

  /**
   * Submit handler for the contact form
   */
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const endpoint = isEditing 
        ? `/api/contacts/${initialData?.id}` 
        : '/api/contacts';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }
      
      toast.success(isEditing ? 'Contact updated successfully' : 'Contact added successfully');
      router.push('/contacts');
      router.refresh();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle tag selection
   */
  const handleTagSelection = (selectedTags: string[]) => {
    setValue('tags', selectedTags);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <Input
          id="firstName"
          label="First Name"
          error={errors.firstName?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('firstName')}
        />
        
        {/* Last Name */}
        <Input
          id="lastName"
          label="Last Name"
          error={errors.lastName?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('lastName')}
        />
        
        {/* Email */}
        <Input
          id="email"
          type="email"
          label="Email Address"
          helperText="Contact's email address"
          error={errors.email?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('email')}
        />
        
        {/* Phone */}
        <Input
          id="phone"
          label="Phone Number"
          helperText="Contact's phone number"
          error={errors.phone?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('phone')}
        />
        
        {/* Company */}
        <Input
          id="company"
          label="Company"
          helperText="Company or organization name"
          error={errors.company?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('company')}
        />
        
        {/* Position */}
        <Input
          id="position"
          label="Position"
          helperText="Job title or position"
          error={errors.position?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('position')}
        />
        
        {/* LinkedIn URL */}
        <Input
          id="linkedInUrl"
          label="LinkedIn URL"
          helperText="LinkedIn profile URL"
          error={errors.linkedInUrl?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('linkedInUrl')}
        />
      </div>
      
      {/* Tags Selector */}
      <div className="pt-4">
        <TagSelector 
          initialTags={initialData?.tags || []} 
          onTagsChange={handleTagSelection}
        />
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          isLoading={isSubmitting}
        >
          {isEditing ? 'Update Contact' : 'Add Contact'}
        </Button>
      </div>
    </form>
  );
} 