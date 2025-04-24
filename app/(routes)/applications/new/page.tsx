'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationForm } from '@/app/components/applications/ApplicationForm';
import AppLayout from '@/app/components/common/AppLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

/**
 * New Application page component
 * Allows users to create a new job application
 */
export default function NewApplicationPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Add New Application</h1>
          <Link href="/applications" className="flex items-center text-indigo-600 hover:text-indigo-500">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span>Back to Applications</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <ApplicationForm />
        </div>
      </div>
    </AppLayout>
  );
} 