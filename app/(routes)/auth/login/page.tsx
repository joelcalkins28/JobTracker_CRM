import { Metadata } from 'next';
import Image from 'next/image';
import LoginForm from '../../../components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login | JobTracker CRM',
  description: 'Sign in to your JobTracker CRM account',
};

/**
 * Login page component
 * Displays the login form with a side illustration
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Login Form */}
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <div className="flex justify-center">
              <span className="text-3xl font-bold tracking-tight text-indigo-600">JobTracker</span>
            </div>
          </div>
          
          <LoginForm />
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-12 text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Manage Your Job Search</h2>
              <p className="text-xl">
                Track applications, network with contacts, and land your dream job.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 