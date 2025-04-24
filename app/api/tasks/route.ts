import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/tasks
 * Retrieves all tasks for the authenticated user
 * Query params:
 * - applicationId (optional): Filter tasks by application
 * - completed (optional): Filter by completion status
 * - priority (optional): Filter by priority level
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const completed = searchParams.get('completed');
    const priority = searchParams.get('priority');
    
    // Build filter conditions
    const where: any = {
      userId: session.user.id,
    };
    
    if (applicationId) {
      where.applicationId = applicationId;
    }
    
    if (completed !== null) {
      where.completed = completed === 'true';
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        application: {
          select: {
            id: true,
            jobTitle: true,
            company: true
          }
        }
      }
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Creates a new task for the authenticated user
 * Body:
 * - title: Task title (required)
 * - description: Task description (optional)
 * - dueDate: Due date (optional)
 * - priority: Priority level (optional)
 * - applicationId: Associated application (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Create task
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        priority: body.priority,
        applicationId: body.applicationId,
        userId: session.user.id,
      }
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 