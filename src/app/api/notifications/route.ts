import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '20')
      const unreadOnly = searchParams.get('unreadOnly') === 'true'

      // Mock notifications (replace with real database queries)
      const allNotifications = [
        {
          id: '1',
          type: 'message',
          title: 'New message from Sarah',
          description: 'Sarah sent you a message about the Q4 project update',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false,
          priority: 'medium',
          actionUrl: '/chat',
          icon: '💬',
        },
        {
          id: '2',
          type: 'project',
          title: 'Project milestone completed',
          description: 'The API integration milestone has been completed successfully',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: true,
          priority: 'high',
          actionUrl: '/projects',
          icon: '🎯',
        },
        {
          id: '3',
          type: 'system',
          title: 'System maintenance scheduled',
          description: 'Scheduled maintenance for tomorrow at 2 AM EST',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          read: false,
          priority: 'low',
          actionUrl: '/system',
          icon: '🔧',
        },
        {
          id: '4',
          type: 'team',
          title: 'New team member joined',
          description: 'John Doe has joined the Engineering team',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: true,
          priority: 'medium',
          actionUrl: '/team',
          icon: '👥',
        },
        {
          id: '5',
          type: 'security',
          title: 'Security alert',
          description: 'Unusual login activity detected from new location',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          read: false,
          priority: 'high',
          actionUrl: '/security',
          icon: '🔒',
        },
        {
          id: '6',
          type: 'update',
          title: 'Weekly report available',
          description: 'Your weekly activity report is ready for review',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          read: true,
          priority: 'low',
          actionUrl: '/reports',
          icon: '📊',
        },
      ]

      let notifications = allNotifications

      // Filter by read status if requested
      if (unreadOnly) {
        notifications = notifications.filter(n => !n.read)
      }

      // Apply limit
      notifications = notifications.slice(0, limit)

      // Get unread count
      const unreadCount = allNotifications.filter(n => !n.read).length

      return NextResponse.json({ 
        notifications,
        unreadCount,
        total: allNotifications.length
      }, { status: 200 })
    } catch (error) {
      console.error('Get notifications error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { notificationId, read } = await request.json()

      if (!notificationId || typeof read !== 'boolean') {
        return NextResponse.json(
          { error: 'Notification ID and read status are required' },
          { status: 400 }
        )
      }

      // In a real implementation, you would update the notification in the database
      // For now, we'll just return success
      
      return NextResponse.json(
        { message: 'Notification updated successfully' },
        { status: 200 }
      )
    } catch (error) {
      console.error('Update notification error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
