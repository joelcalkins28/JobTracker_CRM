'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import TaskList from '@/components/tasks/TaskList';
import AppLayout from '@/components/common/AppLayout';

/**
 * Tasks page component
 * Displays a list of tasks with filtering and management options
 */
export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch tasks from the API
   */
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch tasks when the component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <TaskList 
            tasks={tasks} 
            onRefresh={fetchTasks}
          />
        )}
      </div>
    </AppLayout>
  );
} 