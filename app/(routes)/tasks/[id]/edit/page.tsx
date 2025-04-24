'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import TaskForm from '@/app/components/tasks/TaskForm';
import AppLayout from '@/app/components/common/AppLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

/**
 * Edit Task page component
 * Page for editing an existing task
 */
export default function EditTaskPage() {
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Fetch task data when the component mounts
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/tasks/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch task');
        }
        
        const data = await response.json();
        setTask(data);
      } catch (error) {
        console.error('Error fetching task:', error);
        toast.error('Failed to load task');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTask();
  }, [id]);

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    router.push('/tasks');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
          <Link href="/tasks" className="flex items-center text-indigo-600 hover:text-indigo-500">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span>Back to Tasks</span>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : task ? (
          <div className="bg-white rounded-lg shadow p-6">
            <TaskForm 
              initialData={task} 
              isEditing={true}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Task not found</h2>
            <p className="text-gray-500">The task you're looking for doesn't exist or you don't have permission to edit it.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 