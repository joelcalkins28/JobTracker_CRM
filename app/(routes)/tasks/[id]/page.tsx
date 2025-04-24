'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AppLayout from 'app/components/common/AppLayout';
import Card from 'app/components/common/Card';
import Button from 'app/components/common/Button';
import { ArrowLeftIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

/**
 * Task detail page component
 * Displays a single task with all its details and actions
 */
export default function TaskDetailPage() {
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  /**
   * Fetch task data
   */
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

  // Fetch task when the component mounts
  useEffect(() => {
    fetchTask();
  }, [id]);

  /**
   * Format date in human-readable format
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Check if a task is overdue
   */
  const isOverdue = (dateString: string | null, completed: boolean) => {
    if (!dateString || completed) return false;
    
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };

  /**
   * Get priority badge style
   */
  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Toggle task completion status
   */
  const toggleTaskStatus = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      toast.success(`Task ${!task.completed ? 'completed' : 'reopened'}`);
      fetchTask();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  /**
   * Delete task
   */
  const deleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      toast.success('Task deleted');
      router.push('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (!task) {
    return (
      <AppLayout>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Task not found</h2>
          <p className="text-gray-500">The task you're looking for doesn't exist or you don't have permission to view it.</p>
          <div className="mt-4">
            <Link href="/tasks">
              <Button variant="outline">Back to Tasks</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
          <Link href="/tasks" className="flex items-center text-indigo-600 hover:text-indigo-500">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span>Back to Tasks</span>
          </Link>
        </div>
        
        <Card>
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{task.title}</h2>
                {task.application && (
                  <Link 
                    href={`/applications/${task.application.id}`}
                    className="inline-block mt-1 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Related to: {task.application.jobTitle} at {task.application.company}
                  </Link>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm"
                  variant={task.completed ? 'outline' : 'primary'}
                  onClick={toggleTaskStatus}
                  className="flex items-center"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  {task.completed ? 'Mark as Pending' : 'Complete'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/tasks/${id}/edit`)}
                  className="flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={deleteTask}
                  className="flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  task.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {task.completed ? 'Completed' : 'Pending'}
              </span>
              
              {task.priority && (
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
              )}
              
              {task.dueDate && (
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isOverdue(task.dueDate, task.completed)
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {isOverdue(task.dueDate, task.completed) ? 'Overdue' : 'Due'}: {formatDate(task.dueDate)}
                </span>
              )}
            </div>
            
            {task.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-md text-gray-700 whitespace-pre-wrap">
                  {task.description}
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
                {task.updatedAt !== task.createdAt && (
                  <span>Last Updated: {new Date(task.updatedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
} 