'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import toast from 'react-hot-toast';

/**
 * Task interface for component props
 */
interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  priority: string | null;
  application?: {
    id: string;
    jobTitle: string;
    company: string;
  } | null;
}

/**
 * TaskList props
 */
interface TaskListProps {
  tasks: Task[];
  onRefresh: () => void;
}

/**
 * Task list component for displaying and managing tasks
 * Includes filtering and sorting options
 */
export default function TaskList({ tasks, onRefresh }: TaskListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Format date in human-readable format
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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
  const toggleTaskStatus = async (taskId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      toast.success(`Task ${!currentStatus ? 'completed' : 'reopened'}`);
      onRefresh();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  /**
   * Delete a task
   */
  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      toast.success('Task deleted');
      onRefresh();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  /**
   * Edit a task
   */
  const editTask = (taskId: string) => {
    router.push(`/tasks/${taskId}/edit`);
  };

  /**
   * Filter tasks based on current filters
   */
  const filteredTasks = tasks.filter(task => {
    // Filter by completion status
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    // Filter by priority
    if (priorityFilter && task.priority !== priorityFilter) return false;
    
    return true;
  });

  /**
   * Sort tasks by due date and completion status
   */
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Completed tasks at the bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Sort by due date if available
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Tasks without due dates at the bottom
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm"
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            size="sm"
            variant={filter === 'pending' ? 'primary' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button 
            size="sm"
            variant={filter === 'completed' ? 'primary' : 'outline'}
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
        </div>
        
        <div className="flex gap-2">
          <select
            className="block rounded-md border-gray-300 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={priorityFilter || ''}
            onChange={(e) => setPriorityFilter(e.target.value || null)}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button 
            size="sm"
            onClick={() => router.push('/tasks/new')}
          >
            Add Task
          </Button>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500">No tasks found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {sortedTasks.map((task) => (
              <li 
                key={task.id} 
                className={`p-4 hover:bg-gray-50 ${task.completed ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.completed)}
                      className={`flex-shrink-0 h-5 w-5 rounded border ${
                        task.completed
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-gray-300'
                      } flex items-center justify-center`}
                    >
                      {task.completed && <CheckIcon className="h-3 w-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                          {task.description}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-2 items-center">
                        {task.priority && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        )}
                        
                        {task.application && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {task.application.jobTitle} at {task.application.company}
                          </span>
                        )}
                        
                        {task.dueDate && (
                          <span className={`text-xs ${
                            isOverdue(task.dueDate, task.completed)
                              ? 'text-red-600 font-medium'
                              : 'text-gray-500'
                          }`}>
                            {isOverdue(task.dueDate, task.completed) ? 'Overdue: ' : 'Due: '}
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => editTask(task.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 