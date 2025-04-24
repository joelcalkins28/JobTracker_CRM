'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Squares2X2Icon, 
  UserGroupIcon, 
  BriefcaseIcon, 
  EnvelopeIcon, 
  CheckCircleIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * The sidebar navigation component for the application
 * Provides links to all major sections
 */
export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
    { name: 'Contacts', href: '/contacts', icon: UserGroupIcon },
    { name: 'Applications', href: '/applications', icon: BriefcaseIcon },
    { name: 'Email', href: '/emails', icon: EnvelopeIcon },
    { name: 'Tasks', href: '/tasks', icon: CheckCircleIcon },
  ];

  const secondaryNavigation = [
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    { name: 'Logout', href: '/auth/logout', icon: ArrowRightOnRectangleIcon },
  ];

  /**
   * Toggle the mobile menu open/closed
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 p-4 z-20">
        <button 
          type="button"
          onClick={toggleMobileMenu}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4">
        <div className="flex items-center flex-shrink-0 px-6">
          <span className="text-2xl font-bold text-indigo-600">JobTracker</span>
        </div>
        <div className="mt-6 flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${pathname === item.href 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-6 w-6 flex-shrink-0 
                    ${pathname === item.href ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <nav className="px-3 space-y-1">
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${pathname === item.href 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-6 w-6 flex-shrink-0 
                      ${pathname === item.href ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`
          lg:hidden fixed inset-0 flex z-10 transition-opacity duration-300 ease-in-out
          ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="pt-5 pb-4">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-2xl font-bold text-indigo-600">JobTracker</span>
            </div>
            <div className="mt-5">
              <nav className="px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-base font-medium rounded-md
                      ${pathname === item.href 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                    onClick={toggleMobileMenu}
                  >
                    <item.icon
                      className={`
                        mr-4 h-6 w-6 flex-shrink-0 
                        ${pathname === item.href ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}
                      `}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <nav className="px-2 space-y-1">
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-base font-medium rounded-md
                    ${pathname === item.href 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                  onClick={toggleMobileMenu}
                >
                  <item.icon
                    className={`
                      mr-4 h-6 w-6 flex-shrink-0 
                      ${pathname === item.href ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
} 