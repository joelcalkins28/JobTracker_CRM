'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Input from '../common/Input';
import Button from '../common/Button';
import { ApplicationFormData, ApplicationStatus, DocumentType } from '@/lib/types';
import { ContactSelector } from './ContactSelector';

/**
 * Application form validation schema
 */
const applicationSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  salary: z.string().optional().or(z.literal('')),
  applicationUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.nativeEnum(ApplicationStatus),
  dateApplied: z.date({
    required_error: "Application date is required",
  }),
  contactIds: z.array(z.string()).optional(),
});

/**
 * ApplicationForm Props 
 */
interface ApplicationFormProps {
  initialData?: ApplicationFormData;
  isEditing?: boolean;
  onCancel?: () => void;
}

/**
 * Application form component for adding or editing job applications
 */
export function ApplicationForm({ initialData, isEditing = false, onCancel }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: initialData || {
      jobTitle: '',
      company: '',
      location: '',
      description: '',
      salary: '',
      applicationUrl: '',
      status: ApplicationStatus.WISHLIST,
      dateApplied: new Date(),
      contactIds: [],
    },
  });

  /**
   * Submit handler for the application form
   */
  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    
    try {
      const endpoint = isEditing 
        ? `/api/applications/${initialData?.id}` 
        : '/api/applications';
      
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
      
      // Get the application ID from the response
      const responseData = await response.json();
      const applicationId = responseData.data.id;
      
      // If there are documents to upload, handle that separately
      if (documents.length > 0) {
        await uploadDocuments(applicationId);
      }
      
      toast.success(isEditing ? 'Application updated successfully' : 'Application added successfully');
      router.push('/applications');
      router.refresh();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save application');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Upload documents to the server
   */
  const uploadDocuments = async (applicationId: string) => {
    try {
      const formData = new FormData();
      
      documents.forEach((file, index) => {
        formData.append('files', file);
        formData.append('types', documentTypes[index] || DocumentType.OTHER);
      });
      
      formData.append('applicationId', applicationId);
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload documents');
      }
      
      toast.success('Documents uploaded successfully');
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload documents');
    }
  };

  /**
   * Handle document selection
   */
  const handleDocumentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const newDocuments = Array.from(fileList);
      setDocuments(prev => [...prev, ...newDocuments]);
      setDocumentTypes(prev => [...prev, ...newDocuments.map(() => DocumentType.OTHER)]);
    }
  };

  /**
   * Remove a document from the list
   */
  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    setDocumentTypes(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Update document type
   */
  const updateDocumentType = (index: number, type: DocumentType) => {
    setDocumentTypes(prev => {
      const updated = [...prev];
      updated[index] = type;
      return updated;
    });
  };

  /**
   * Handle contact selection
   */
  const handleContactSelection = (selectedContactIds: string[]) => {
    setValue('contactIds', selectedContactIds);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Title */}
        <Input
          id="jobTitle"
          label="Job Title"
          error={errors.jobTitle?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('jobTitle')}
        />
        
        {/* Company */}
        <Input
          id="company"
          label="Company"
          error={errors.company?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('company')}
        />
        
        {/* Location */}
        <Input
          id="location"
          label="Location"
          helperText="City, State, or Remote"
          error={errors.location?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('location')}
        />
        
        {/* Salary */}
        <Input
          id="salary"
          label="Salary"
          helperText="Expected or offered salary"
          error={errors.salary?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('salary')}
        />
        
        {/* Application URL */}
        <Input
          id="applicationUrl"
          label="Job Post URL"
          helperText="Link to the job posting"
          error={errors.applicationUrl?.message}
          fullWidth
          disabled={isSubmitting}
          {...register('applicationUrl')}
        />
        
        {/* Application Status */}
        <div className="flex flex-col">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={isSubmitting}
            {...register('status')}
          >
            {Object.values(ApplicationStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
        
        {/* Date Applied */}
        <Input
          id="dateApplied"
          type="date"
          label="Date Applied"
          error={errors.dateApplied?.message}
          fullWidth
          disabled={isSubmitting}
          value={watch('dateApplied') instanceof Date 
            ? watch('dateApplied').toISOString().split('T')[0]
            : undefined}
          onChange={(e) => setValue('dateApplied', new Date(e.target.value))}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={isSubmitting}
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>
      
      {/* Documents */}
      <div className="pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Documents
        </label>
        <div className="mb-4">
          <input
            type="file"
            id="documents"
            multiple
            className="hidden"
            onChange={handleDocumentsChange}
            disabled={isSubmitting}
          />
          <label
            htmlFor="documents"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
          >
            Select Documents
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Upload resume, cover letter, or other relevant documents
          </p>
        </div>
        
        {/* Document List */}
        {documents.length > 0 && (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md mb-4">
            {documents.map((doc, index) => (
              <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center flex-1 min-w-0">
                  <span className="flex-1 min-w-0 truncate">{doc.name}</span>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <select
                    value={documentTypes[index]}
                    onChange={(e) => updateDocumentType(index, e.target.value as DocumentType)}
                    className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    {Object.values(DocumentType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Associated Contacts */}
      <div className="pt-4">
        <ContactSelector 
          initialContactIds={initialData?.contactIds || []} 
          onContactsChange={handleContactSelection}
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
          {isEditing ? 'Update Application' : 'Add Application'}
        </Button>
      </div>
    </form>
  );
} 