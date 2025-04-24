/**
 * Gmail API utility functions
 * This module provides functions for interacting with the Gmail API,
 * including authentication, fetching emails, and sending emails.
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';

// Gmail API scopes
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.labels'
];

/**
 * Get OAuth2 client for Gmail API
 * @param userId - The user ID to get credentials for
 * @returns Promise<google.auth.OAuth2> - Authentication client
 */
export async function getGmailAuthClient(userId: string) {
  try {
    // Get credentials path (same as calendar credentials)
    const CREDENTIALS_PATH = path.join(process.cwd(), 'scripts', 'credentials.json');
    const TOKEN_PATH = path.join(process.cwd(), 'scripts', 'token.json');

    // Load client credentials
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    
    // Handle both web and installed application credentials
    const config = credentials.web || credentials.installed;
    if (!config) {
      throw new Error('Invalid credentials format');
    }

    const { client_secret, client_id, redirect_uris } = config;
    const redirectUri = redirect_uris[0] || 'http://localhost';
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

    try {
      // Try to load existing token (same token used for calendar)
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    } catch (error: any) {
      throw new Error(`No authentication token found. Please run the auth script first. Error: ${error.message}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to get Gmail authentication client: ${error.message}`);
  }
}

/**
 * Get Gmail API client
 * @param auth - OAuth2 client
 * @returns gmail - Gmail API client
 */
export function getGmailClient(auth: google.auth.OAuth2) {
  return google.gmail({ version: 'v1', auth });
}

/**
 * Fetch emails from Gmail
 * @param userId - User ID to fetch emails for
 * @param options - Options for fetching emails
 * @returns Promise<GmailEmail[]> - Array of email objects
 */
export async function fetchEmails(
  userId: string, 
  options: { 
    maxResults?: number; 
    q?: string;
    labelIds?: string[];
    pageToken?: string;
  } = {}
) {
  try {
    const auth = await getGmailAuthClient(userId);
    const gmail = getGmailClient(auth);
    
    // Default options
    const { 
      maxResults = 20, 
      q = '', 
      labelIds = ['INBOX'], 
      pageToken 
    } = options;
    
    // List messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q,
      labelIds,
      pageToken
    });
    
    const messages = response.data.messages || [];
    const nextPageToken = response.data.nextPageToken;
    
    // Get full message details
    const emails = await Promise.all(
      messages.map(async (message) => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id as string,
          format: 'full'
        });
        
        return parseGmailMessage(msg.data);
      })
    );
    
    // Save emails to database
    await saveEmailsToDatabase(emails, userId);
    
    return { emails, nextPageToken };
  } catch (error: any) {
    console.error('Error fetching emails:', error);
    throw new Error(`Failed to fetch emails: ${error.message}`);
  }
}

/**
 * Parse Gmail message into a structured format
 * @param message - Gmail message object
 * @returns Parsed email object
 */
function parseGmailMessage(message: any) {
  const headers = message.payload.headers;
  const parts = message.payload.parts || [];
  
  // Extract headers
  const getHeader = (name: string) => {
    const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  };
  
  const from = getHeader('from');
  const to = getHeader('to');
  const subject = getHeader('subject');
  const date = new Date(getHeader('date'));
  
  // Extract body content
  let body = '';
  let htmlBody = '';
  
  // Check if the message is multipart
  if (parts.length > 0) {
    // Look for text/plain and text/html parts
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      if (part.mimeType === 'text/html' && part.body?.data) {
        htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
  } else if (message.payload.body?.data) {
    // Handle single part messages
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    if (message.payload.mimeType === 'text/html') {
      htmlBody = body;
      body = ''; // Set plain text to empty if only HTML is available
    }
  }
  
  // Extract sender information
  const senderMatch = from.match(/^([^<]*)<([^>]*)>/) || [null, from, ''];
  const senderName = senderMatch[1]?.trim() || '';
  const senderEmail = senderMatch[2]?.trim() || from;
  
  return {
    id: message.id,
    threadId: message.threadId,
    labelIds: message.labelIds || [],
    snippet: message.snippet || '',
    subject,
    from,
    senderName,
    senderEmail,
    to,
    date,
    body,
    htmlBody,
    isRead: !message.labelIds?.includes('UNREAD'),
    isStarred: message.labelIds?.includes('STARRED') || false,
  };
}

/**
 * Save emails to database
 * @param emails - Array of parsed email objects
 * @param userId - User ID to associate emails with
 */
async function saveEmailsToDatabase(emails: any[], userId: string) {
  try {
    for (const email of emails) {
      // Check if email already exists
      const existingEmail = await prisma.email.findUnique({
        where: { gmailId: email.id }
      });
      
      if (!existingEmail) {
        // Create new email record
        await prisma.email.create({
          data: {
            subject: email.subject,
            body: email.body || email.htmlBody,
            sender: email.from,
            recipients: email.to,
            date: email.date,
            isRead: email.isRead,
            gmailId: email.id,
            threadId: email.threadId,
            userId,
          }
        });
      }
    }
  } catch (error: any) {
    console.error('Error saving emails to database:', error);
  }
}

/**
 * Send an email via Gmail
 * @param userId - User ID sending the email
 * @param options - Email options (to, subject, body)
 * @returns Promise<string> - Message ID of sent email
 */
export async function sendEmail(
  userId: string,
  options: {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
    cc?: string;
    bcc?: string;
  }
) {
  try {
    const auth = await getGmailAuthClient(userId);
    const gmail = getGmailClient(auth);
    
    const { to, subject, body, isHtml = false, cc = '', bcc = '' } = options;
    
    // Construct the email
    let email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: ' + (isHtml ? 'text/html' : 'text/plain') + '; charset=utf-8',
      'MIME-Version: 1.0',
    ];
    
    if (cc) email.push(`Cc: ${cc}`);
    if (bcc) email.push(`Bcc: ${bcc}`);
    
    email.push('', body);
    
    // Convert to base64 encoding
    const encodedEmail = Buffer.from(email.join('\r\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });
    
    // Save to database
    if (response.data.id) {
      await prisma.email.create({
        data: {
          subject,
          body,
          sender: 'me', // Will be replaced with actual email on fetch
          recipients: to,
          date: new Date(),
          isRead: true,
          gmailId: response.data.id,
          threadId: response.data.threadId as string,
          userId,
        }
      });
    }
    
    return response.data.id as string;
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Get email threads
 * @param userId - User ID to fetch threads for
 * @param options - Options for fetching threads
 * @returns Promise<object> - Thread data
 */
export async function getEmailThreads(
  userId: string,
  options: {
    maxResults?: number;
    q?: string;
    pageToken?: string;
  } = {}
) {
  try {
    const auth = await getGmailAuthClient(userId);
    const gmail = getGmailClient(auth);
    
    const { maxResults = 10, q = '', pageToken } = options;
    
    // List threads
    const response = await gmail.users.threads.list({
      userId: 'me',
      maxResults,
      q,
      pageToken,
    });
    
    const threads = response.data.threads || [];
    const nextPageToken = response.data.nextPageToken;
    
    // Get full thread details
    const threadDetails = await Promise.all(
      threads.map(async (thread) => {
        const threadData = await gmail.users.threads.get({
          userId: 'me',
          id: thread.id as string,
        });
        
        return {
          id: threadData.data.id,
          historyId: threadData.data.historyId,
          messages: (threadData.data.messages || []).map(parseGmailMessage),
        };
      })
    );
    
    return { threads: threadDetails, nextPageToken };
  } catch (error: any) {
    console.error('Error fetching email threads:', error);
    throw new Error(`Failed to fetch email threads: ${error.message}`);
  }
}

/**
 * Extract potential contacts from email
 * @param email - Parsed email object
 * @returns Array of potential contact information
 */
export function extractContactsFromEmail(email: any) {
  const contacts = [];
  
  // Extract from sender
  if (email.senderName && email.senderEmail) {
    contacts.push({
      name: email.senderName,
      email: email.senderEmail,
      source: 'From: ' + email.subject,
    });
  }
  
  // Extract from signature block (simplified approach)
  if (email.body) {
    // Look for common signature patterns
    const signatureMatch = email.body.match(/(?:regards|sincerely|best|cheers),?\s*\n+([^@\n]+)\s*\n+([^@\n]*@[^@\n]*)/i);
    
    if (signatureMatch && signatureMatch.length >= 3) {
      contacts.push({
        name: signatureMatch[1].trim(),
        email: signatureMatch[2].trim(),
        source: 'Signature: ' + email.subject,
      });
    }
  }
  
  return contacts;
}

/**
 * Get all Gmail labels for a user
 * @param userId - User ID to get labels for
 * @returns Promise<object> - Labels data
 */
export async function getGmailLabels(userId: string) {
  try {
    const auth = await getGmailAuthClient(userId);
    const gmail = getGmailClient(auth);
    
    const response = await gmail.users.labels.list({
      userId: 'me',
    });
    
    return response.data.labels || [];
  } catch (error: any) {
    console.error('Error fetching Gmail labels:', error);
    throw new Error(`Failed to fetch Gmail labels: ${error.message}`);
  }
} 