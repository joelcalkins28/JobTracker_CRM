'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import GoogleSignInButton from './GoogleSignInButton';

/**
 * Login form validation schema
 */
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Type for login form data
 */
type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login form component for user authentication
 */
export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  /**
   * Handle form submission
   */
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to login');
      }
      
      // Show success message
      toast.success('Logged in successfully');
      
      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{' '}
          <a href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            create a new account
          </a>
        </p>
      </div>
      
      <div className="space-y-4">
        <GoogleSignInButton />
        
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 flex-shrink text-sm text-gray-500">or continue with email</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email address"
          leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
          error={errors.email?.message}
          fullWidth
          disabled={isLoading}
          {...register('email')}
        />
        
        <Input
          id="password"
          type="password"
          label="Password"
          leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          error={errors.password?.message}
          fullWidth
          disabled={isLoading}
          {...register('password')}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>
    </div>
  );
} 