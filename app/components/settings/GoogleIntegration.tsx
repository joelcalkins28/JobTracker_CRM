'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';

/**
 * Type for Google account connection status
 */
type ConnectionStatus = {
  isConnected: boolean;
  email?: string;
  scopes?: string[];
  lastSynced?: string;
};

/**
 * Google Integration Settings Component
 * Displays Google account connection status and actions
 */
export default function GoogleIntegration() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false
  });
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [syncingEmail, setSyncingEmail] = useState(false);

  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  /**
   * Fetch Google account connection status
   */
  const fetchConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/google/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch connection status');
      }
      
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      console.error('Error fetching Google connection status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connect to Google account
   */
  const handleConnectGoogle = async () => {
    try {
      const response = await fetch('/api/auth/google/authorize');
      
      if (!response.ok) {
        throw new Error('Failed to generate authorization URL');
      }
      
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Google:', error);
    }
  };

  /**
   * Disconnect Google account
   */
  const handleDisconnectGoogle = async () => {
    try {
      const response = await fetch('/api/google/disconnect', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect Google account');
      }
      
      setConnectionStatus({ isConnected: false });
    } catch (error) {
      console.error('Error disconnecting Google account:', error);
    }
  };

  /**
   * Sync calendar manually
   */
  const handleSyncCalendar = async () => {
    try {
      setSyncingCalendar(true);
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync calendar');
      }
      
      await fetchConnectionStatus();
    } catch (error) {
      console.error('Error syncing calendar:', error);
    } finally {
      setSyncingCalendar(false);
    }
  };

  /**
   * Sync Gmail manually
   */
  const handleSyncGmail = async () => {
    try {
      setSyncingEmail(true);
      const response = await fetch('/api/emails/sync', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync emails');
      }
      
      await fetchConnectionStatus();
    } catch (error) {
      console.error('Error syncing emails:', error);
    } finally {
      setSyncingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-100 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Google Integration</h3>
      
      {connectionStatus.isConnected ? (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Connected to Google
                </h3>
                {connectionStatus.email && (
                  <p className="mt-2 text-sm text-green-700">
                    Account: {connectionStatus.email}
                  </p>
                )}
                {connectionStatus.lastSynced && (
                  <p className="mt-2 text-sm text-green-700">
                    Last synced: {new Date(connectionStatus.lastSynced).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center mb-4">
                <CalendarIcon className="h-6 w-6 text-indigo-500 mr-2" />
                <h4 className="text-md font-medium">Calendar</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Sync your job interviews and application deadlines with Google Calendar.
              </p>
              <Button 
                onClick={handleSyncCalendar} 
                isLoading={syncingCalendar}
                variant="secondary"
                size="sm"
              >
                Sync Calendar Now
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center mb-4">
                <EnvelopeIcon className="h-6 w-6 text-indigo-500 mr-2" />
                <h4 className="text-md font-medium">Gmail</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Import emails related to your job applications from Gmail.
              </p>
              <Button 
                onClick={handleSyncGmail} 
                isLoading={syncingEmail}
                variant="secondary"
                size="sm"
              >
                Sync Emails Now
              </Button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button 
              onClick={handleDisconnectGoogle} 
              variant="danger"
              size="sm"
            >
              Disconnect Google Account
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Connecting your Google account enables calendar syncing and email integration, helping you manage your job search more effectively.
          </p>
          <Button onClick={handleConnectGoogle}>
            Connect Google Account
          </Button>
        </div>
      )}
    </div>
  );
} 