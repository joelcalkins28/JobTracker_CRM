'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { CalendarIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Task form schema validation
 */
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  applicationId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

/**
 * Task form props
 */
interface TaskFormProps {
  initialData?: {
    id?: string;
    title: string;
    description?: string | null;
    dueDate?: string | null;
    priority?: string | null;
    applicationId?: string | null;
  };
  isEditing?: boolean;
  onCancel?: () => void;
}

/**
 * Task form component for creating and editing tasks
 */
export default function TaskForm({ initialData, isEditing = false, onCancel }: TaskFormProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      dueDate: initialData?.dueDate 
        ? new Date(initialData.dueDate).toISOString().split('T')[0] 
        : '',
      priority: (initialData?.priority as 'high' | 'medium' | 'low') || undefined,
      applicationId: initialData?.applicationId || '',
    },
  });

  // Fetch applications for the dropdown
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications');
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        setApplications(data.data || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      }
    };

    fetchApplications();
  }, []);

  /**
   * Form submission handler
   */
  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    
    try {
      let url = '/api/tasks';
      let method = 'POST';
      
      // If editing, use PATCH request to the specific task endpoint
      if (isEditing && initialData?.id) {
        url = `/api/tasks/${initialData.id}`;
        method = 'PATCH';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
          applicationId: data.applicationId || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save task');
      }
      
      toast.success(`Task ${isEditing ? 'updated' : 'created'} successfully`);
      
      if (isEditing) {
        router.push('/tasks');
      } else {
        // Reset form for new task creation
        reset({
          title: '',
          description: '',
          dueDate: '',
          priority: undefined,
          applicationId: '',
        });
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/tasks');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          id="title"
          label="Task Title"
          placeholder="Enter task title"
          error={errors.title?.message}
          {...register('title')}
          fullWidth
          required
        />
        
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            placeholder="Enter task description"
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="date"
              id="dueDate"
              {...register('dueDate')}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            {...register('priority')}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="applicationId" className="block text-sm font-medium text-gray-700">
            Related Application
          </label>
          <select
            id="applicationId"
            {...register('applicationId')}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">None</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.jobTitle} at {app.company}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
} 