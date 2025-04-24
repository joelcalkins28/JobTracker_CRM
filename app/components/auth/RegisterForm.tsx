'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import GoogleSignInButton from './GoogleSignInButton';

/**
 * Registration form validation schema
 */
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * Type for registration form data
 */
type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Registration form component for new user signup
 */
export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  /**
   * Handle form submission
   */
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to register');
      }
      
      // Show success message
      toast.success('Account created successfully');
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>
      </div>
      
      <div className="space-y-4">
        <GoogleSignInButton />
        
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 flex-shrink text-sm text-gray-500">or register with email</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          type="text"
          label="Full name"
          leftIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
          error={errors.name?.message}
          fullWidth
          disabled={isLoading}
          {...register('name')}
        />
        
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
        
        <Input
          id="confirmPassword"
          type="password"
          label="Confirm password"
          leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
          error={errors.confirmPassword?.message}
          fullWidth
          disabled={isLoading}
          {...register('confirmPassword')}
        />
        
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <a href="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </a>
          </label>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Create account
        </Button>
      </form>
    </div>
  );
} 