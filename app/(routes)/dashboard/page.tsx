'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from 'app/components/common/AppLayout';
import Card from 'app/components/common/Card';
import Button from 'app/components/common/Button';
import toast from 'react-hot-toast';
import { ApplicationStatus } from 'app/lib/types';
import { ChartBarIcon } from '@heroicons/react/24/outline';

/**
 * Dashboard page component
 * Displays a summary of job applications and contacts
 */
export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // Fetch current user data
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user profile
        const userResponse = await fetch('/api/auth/me');
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await userResponse.json();
        setUser(userData.data);
        
        // Fetch applications
        const applicationsResponse = await fetch('/api/applications');
        
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData.data || []);
        }
        
        // Fetch contacts
        const contactsResponse = await fetch('/api/contacts');
        
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          setContacts(contactsData.data || []);
        }
        
        // Fetch tasks
        const tasksResponse = await fetch('/api/tasks');
        
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Please log in to continue');
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [router]);
  
  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to log out');
      }
      
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };
  
  /**
   * Get applications count by status
   */
  const getApplicationCountsByStatus = () => {
    const counts: Record<string, number> = {};
    Object.values(ApplicationStatus).forEach(status => {
      counts[status] = applications.filter(app => app.status === status).length;
    });
    return counts;
  };
  
  /**
   * Get a color for each application status
   */
  const getStatusColor = (status: string): string => {
    const statusColorMap: Record<string, string> = {
      [ApplicationStatus.WISHLIST]: 'bg-gray-100',
      [ApplicationStatus.APPLIED]: 'bg-blue-100',
      [ApplicationStatus.PHONE_SCREEN]: 'bg-indigo-100',
      [ApplicationStatus.INTERVIEW]: 'bg-purple-100',
      [ApplicationStatus.OFFER]: 'bg-green-100',
      [ApplicationStatus.REJECTED]: 'bg-red-100',
      [ApplicationStatus.ACCEPTED]: 'bg-emerald-100',
      [ApplicationStatus.WITHDRAWN]: 'bg-amber-100',
    };
    return statusColorMap[status] || 'bg-gray-100';
  };
  
  /**
   * Get recent applications (limited to 5)
   */
  const getRecentApplications = () => {
    return [...applications]
      .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())
      .slice(0, 5);
  };
  
  /**
   * Format a date in a human-readable format
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AppLayout>
    );
  }
  
  const applicationCounts = getApplicationCountsByStatus();
  const recentApplications = getRecentApplications();
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>
        
        <Card title="Welcome" description="This is your JobTracker dashboard">
          <div className="space-y-4">
            <p className="text-lg">
              Hello, <span className="font-semibold">{user?.name || 'User'}</span>!
            </p>
            <p>
              Welcome to JobTracker CRM. Track your job applications, manage your professional
              contacts, and organize your job search all in one place.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
                <p className="text-sm text-blue-800">Applications</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{contacts.length}</p>
                <p className="text-sm text-green-800">Contacts</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{applicationCounts[ApplicationStatus.INTERVIEW] || 0}</p>
                <p className="text-sm text-purple-800">Interviews</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-600">{applicationCounts[ApplicationStatus.OFFER] || 0}</p>
                <p className="text-sm text-emerald-800">Offers</p>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Status Chart */}
          <Card title="Application Status" icon={<ChartBarIcon className="h-5 w-5" />}>
            <div className="space-y-4">
              {Object.values(ApplicationStatus).map(status => (
                <div key={status} className="flex items-center">
                  <div className="w-36 text-sm text-gray-600">{status}</div>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStatusColor(status)}`} 
                      style={{ 
                        width: applications.length ? 
                          `${(applicationCounts[status] / applications.length) * 100}%` : 
                          '0%' 
                      }}
                    ></div>
                  </div>
                  <div className="w-10 text-right text-sm text-gray-600 ml-2">
                    {applicationCounts[status] || 0}
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <div className="py-4 text-center text-gray-500">
                  No applications yet. Start tracking your job applications!
                </div>
              )}
            </div>
            <div className="mt-4 text-right">
              <Link href="/applications">
                <Button variant="outline" size="sm">View All Applications</Button>
              </Link>
            </div>
          </Card>
          
          {/* Recent Applications */}
          <Card title="Recent Applications" description="Your 5 most recent job applications">
            {recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.map(app => (
                  <Link 
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{app.jobTitle}</p>
                        <p className="text-sm text-gray-600">{app.company}</p>
                      </div>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${getStatusColor(app.status)} text-gray-800`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Applied on {formatDate(app.dateApplied)}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4 text-center">You haven't added any applications yet.</p>
            )}
            <div className="mt-4 text-right">
              <Link href="/applications/new">
                <Button size="sm">Add Application</Button>
              </Link>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contacts */}
          <Card 
            title="Contacts" 
            description={`You have ${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`}
            footer={
              <div className="flex justify-end">
                <Link href="/contacts">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            }
          >
            {contacts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {contacts.slice(0, 5).map(contact => (
                  <li key={contact.id} className="py-3">
                    <Link href={`/contacts/${contact.id}`} className="hover:text-indigo-600">
                      <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                      {contact.company && (
                        <p className="text-sm text-gray-600">{contact.company}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-2">You haven't added any contacts yet.</p>
            )}
          </Card>
          
          {/* Tasks */}
          <Card 
            title="Upcoming Tasks" 
            description="Tasks and reminders for your job search"
            footer={
              <div className="flex justify-end">
                <Link href="/tasks">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            }
          >
            {tasks && tasks.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {tasks
                  .filter(task => !task.completed)
                  .slice(0, 5)
                  .map(task => (
                    <li key={task.id} className="py-3">
                      <Link href={`/tasks/${task.id}`} className="hover:text-indigo-600">
                        <div className="flex items-start">
                          {task.priority === 'high' && (
                            <span className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-red-400 flex-shrink-0"></span>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            {task.dueDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                Due: {formatDate(task.dueDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-2">You don't have any upcoming tasks.</p>
            )}
            <div className="mt-4 text-right">
              <Link href="/tasks/new">
                <Button size="sm">Add Task</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 