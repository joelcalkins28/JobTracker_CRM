import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'app/lib/prisma';
import { getCurrentUser } from 'app/lib/auth';

/**
 * GET /api/tasks/:id
 * Retrieves a specific task by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUser();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const task = await prisma.task.findUnique({
      where: {
        id: params.id,
        userId,
      },
      include: {
        application: {
          select: {
            id: true,
            jobTitle: true,
            company: true,
          },
        },
      },
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/:id
 * Updates a specific task by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUser();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if task exists and belongs to the user
    const existingTask = await prisma.task.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Update the task
    const updatedTask = await prisma.task.update({
      where: {
        id: params.id,
      },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        dueDate: body.dueDate !== undefined ? body.dueDate : undefined,
        completed: body.completed !== undefined ? body.completed : undefined,
        priority: body.priority !== undefined ? body.priority : undefined,
        applicationId: body.applicationId !== undefined ? body.applicationId : undefined,
      },
      include: {
        application: {
          select: {
            id: true,
            jobTitle: true,
            company: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/:id
 * Deletes a specific task by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUser();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if task exists and belongs to the user
    const existingTask = await prisma.task.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Delete the task
    await prisma.task.delete({
      where: {
        id: params.id,
      },
    });
    
    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 