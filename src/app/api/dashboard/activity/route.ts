import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '10')

      // Mock activity data (replace with real data sources)
      const activities = [
        {
          id: '1',
          type: 'message',
          title: 'New message from Sarah',
          description: 'Sarah sent a message about the Q4 project update',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false,
          priority: 'medium',
        },
        {
          id: '2',
          type: 'project',
          title: 'Project milestone completed',
          description: 'The API integration milestone has been completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: true,
          priority: 'high',
        },
        {
          id: '3',
          type: 'system',
          title: 'System maintenance scheduled',
          description: 'Scheduled maintenance for tomorrow at 2 AM',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          read: false,
          priority: 'low',
        },
        {
          id: '4',
          type: 'team',
          title: 'New team member joined',
          description: 'John Doe has joined the Engineering team',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: true,
          priority: 'medium',
        },
        {
          id: '5',
          type: 'notification',
          title: 'Weekly report available',
          description: 'Your weekly activity report is ready for review',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          read: false,
          priority: 'low',
        },
      ].slice(0, limit)

      return NextResponse.json({ activities }, { status: 200 })
    } catch (error) {
      console.error('Get activity error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
