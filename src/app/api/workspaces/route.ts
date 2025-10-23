import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'

// GET - Fetch all workspaces for the user
export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!

      // For now, return mock data since we don't have workspace schema yet
      // In production, you'd query from database
      const workspaces = [
        {
          id: '1',
          name: 'Engineering Team',
          description: 'Main engineering workspace for development tasks',
          members: 12,
          unreadMessages: 5,
          activeTasks: 8,
          lastActivity: new Date().toISOString(),
          color: 'from-blue-500 to-indigo-600',
        },
        {
          id: '2',
          name: 'Product Design',
          description: 'Product design and UX discussions',
          members: 6,
          unreadMessages: 2,
          activeTasks: 4,
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          color: 'from-purple-500 to-pink-600',
        },
        {
          id: '3',
          name: 'Marketing',
          description: 'Marketing campaigns and strategies',
          members: 8,
          unreadMessages: 0,
          activeTasks: 3,
          lastActivity: new Date(Date.now() - 7200000).toISOString(),
          color: 'from-green-500 to-teal-600',
        },
      ]

      return NextResponse.json({
        success: true,
        workspaces,
        total: workspaces.length,
      })
    } catch (error) {
      console.error('Fetch workspaces error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch workspaces' },
        { status: 500 }
      )
    }
  })
}

// POST - Create new workspace
export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { name, description } = await request.json()

      if (!name || !name.trim()) {
        return NextResponse.json(
          { error: 'Workspace name is required' },
          { status: 400 }
        )
      }

      // Mock workspace creation
      const newWorkspace = {
        id: Math.random().toString(36).substring(7),
        name: name.trim(),
        description: description || '',
        members: 1,
        unreadMessages: 0,
        activeTasks: 0,
        lastActivity: new Date().toISOString(),
        color: 'from-purple-500 to-indigo-600',
      }

      return NextResponse.json({
        success: true,
        workspace: newWorkspace,
      })
    } catch (error) {
      console.error('Create workspace error:', error)
      return NextResponse.json(
        { error: 'Failed to create workspace' },
        { status: 500 }
      )
    }
  })
}

