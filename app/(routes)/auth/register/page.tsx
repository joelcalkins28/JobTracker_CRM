import { Metadata } from 'next';
import RegisterForm from '../../../components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register | JobTracker CRM',
  description: 'Create a new account for JobTracker CRM',
};

/**
 * Registration page component
 * Displays the registration form with a side illustration
 */
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Registration Form */}
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <div className="flex justify-center">
              <span className="text-3xl font-bold tracking-tight text-indigo-600">JobTracker</span>
            </div>
          </div>
          
          <RegisterForm />
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-12 text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Organize Your Job Hunt</h2>
              <p className="text-xl">
                Keep track of interviews, contacts, and applications all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 