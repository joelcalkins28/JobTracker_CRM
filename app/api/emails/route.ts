import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from 'app/lib/auth';
import { prisma } from 'app/lib/prisma';
import { fetchEmails, sendEmail, getEmailThreads, getGmailLabels } from 'app/lib/gmail';

/**
 * GET /api/emails
 * Fetch emails from Gmail and return them
 * Query parameters:
 * - maxResults: Maximum number of emails to fetch (default: 20)
 * - q: Search query for filtering emails
 * - labelIds: Comma-separated list of label IDs
 * - pageToken: Token for pagination
 */
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const maxResults = parseInt(url.searchParams.get('maxResults') || '20');
    const q = url.searchParams.get('q') || '';
    const labelIdsParam = url.searchParams.get('labelIds') || '';
    const labelIds = labelIdsParam ? labelIdsParam.split(',') : ['INBOX'];
    const pageToken = url.searchParams.get('pageToken') || undefined;
    const threadId = url.searchParams.get('threadId');

    // If threadId is provided, fetch emails from a specific thread
    if (threadId) {
      const thread = await getEmailThreads(userId, {
        q: `threadId:${threadId}`,
        maxResults: 100, // Get all emails in thread
      });
      
      return NextResponse.json(thread);
    }

    // Otherwise fetch emails based on other criteria
    const result = await fetchEmails(userId, {
      maxResults,
      q,
      labelIds,
      pageToken,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/emails
 * Send a new email via Gmail
 * Request body:
 * - to: Recipient email address(es)
 * - subject: Email subject
 * - body: Email body content
 * - isHtml: Whether body is HTML (default: false)
 * - cc: CC recipients (optional)
 * - bcc: BCC recipients (optional)
 * - applicationId: Job application ID to associate with email (optional)
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.to || !body.subject) {
      return NextResponse.json(
        { error: 'Recipient and subject are required' },
        { status: 400 }
      );
    }

    // Send email
    const messageId = await sendEmail(userId, {
      to: body.to,
      subject: body.subject,
      body: body.body || '',
      isHtml: body.isHtml || false,
      cc: body.cc || '',
      bcc: body.bcc || '',
    });

    // If applicationId is provided, associate email with application
    if (body.applicationId) {
      const application = await prisma.jobApplication.findFirst({
        where: {
          id: body.applicationId,
          userId,
        },
      });

      if (application) {
        // Find the email we just created in the database
        const email = await prisma.email.findFirst({
          where: {
            gmailId: messageId,
            userId,
          },
        });

        if (email) {
          // Update the email to associate it with the application
          await prisma.email.update({
            where: { id: email.id },
            data: {
              jobApplicationId: body.applicationId,
            },
          });
        }
      }
    }

    return NextResponse.json({ messageId, success: true });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/emails/labels
 * Get Gmail labels for the authenticated user
 */
export async function GET_labels(req: NextRequest) {
  try {
    // Check if user is authenticated
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get labels
    const labels = await getGmailLabels(userId);
    return NextResponse.json({ labels });
  } catch (error: any) {
    console.error('Error fetching labels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labels', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/emails/threads
 * Get email threads for the authenticated user
 * Query parameters:
 * - maxResults: Maximum number of threads to fetch (default: 10)
 * - q: Search query for filtering threads
 * - pageToken: Token for pagination
 */
export async function GET_threads(req: NextRequest) {
  try {
    // Check if user is authenticated
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const maxResults = parseInt(url.searchParams.get('maxResults') || '10');
    const q = url.searchParams.get('q') || '';
    const pageToken = url.searchParams.get('pageToken') || undefined;

    // Get threads
    const result = await getEmailThreads(userId, {
      maxResults,
      q,
      pageToken,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching email threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email threads', details: error.message },
      { status: 500 }
    );
  }
} 