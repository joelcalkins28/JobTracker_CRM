import { PrismaClient } from '@prisma/client';

/**
 * User type without password
 */
export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Contact with related tags
 */
export type ContactWithTags = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  linkedInUrl: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags: {
    id: string;
    name: string;
    color: string;
    createdAt: Date;
  }[];
};

/**
 * Job application with related documents
 */
export type ApplicationWithDocuments = {
  id: string;
  jobTitle: string;
  company: string;
  location: string | null;
  description: string | null;
  salary: string | null;
  applicationUrl: string | null;
  status: string;
  dateApplied: Date;
  updatedAt: Date;
  userId: string;
  documents: {
    id: string;
    name: string;
    type: string;
    fileUrl: string;
    createdAt: Date;
    applicationId: string;
  }[];
};

/**
 * Status options for job applications
 */
export enum ApplicationStatus {
  WISHLIST = 'Wishlist',
  APPLIED = 'Applied',
  PHONE_SCREEN = 'Phone Screen',
  INTERVIEW = 'Interview',
  OFFER = 'Offer',
  REJECTED = 'Rejected',
  ACCEPTED = 'Accepted',
  WITHDRAWN = 'Withdrawn',
}

/**
 * Document types for job applications
 */
export enum DocumentType {
  RESUME = 'Resume',
  COVER_LETTER = 'Cover Letter',
  PORTFOLIO = 'Portfolio',
  RECOMMENDATION = 'Recommendation',
  OTHER = 'Other',
}

/**
 * Contact form input type
 */
export type ContactFormData = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  linkedInUrl?: string;
  tags: string[];
};

/**
 * Job application form input type
 */
export type ApplicationFormData = {
  jobTitle: string;
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  applicationUrl?: string;
  status: ApplicationStatus;
  dateApplied: Date;
  contactIds?: string[];
};

/**
 * Dashboard statistics type
 */
export type DashboardStats = {
  totalApplications: number;
  applicationsByStatus: Record<ApplicationStatus, number>;
  recentApplications: ApplicationWithDocuments[];
  upcomingTasks: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    applicationId: string | null;
  }[];
}; 