'use client';

import TaskForm from 'app/components/tasks/TaskForm';
import AppLayout from 'app/components/common/AppLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

/**
 * New Task page component
 * Page for creating a new task
 */
export default function NewTaskPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Add New Task</h1>
          <Link href="/tasks" className="flex items-center text-indigo-600 hover:text-indigo-500">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span>Back to Tasks</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <TaskForm />
        </div>
      </div>
    </AppLayout>
  );
} 