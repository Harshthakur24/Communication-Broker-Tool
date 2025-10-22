import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!

      // Mock suggestions based on user role and department
      const suggestions = [
        {
          id: '1',
          title: 'Project Status Update',
          description: 'Get the latest status on all active projects',
          category: 'projects',
          icon: '📊',
        },
        {
          id: '2',
          title: 'Team Performance Metrics',
          description: 'View team performance and productivity metrics',
          category: 'analytics',
          icon: '📈',
        },
        {
          id: '3',
          title: 'Recent Policy Changes',
          description: 'Check for any recent company policy updates',
          category: 'policies',
          icon: '📋',
        },
        {
          id: '4',
          title: 'Meeting Schedule',
          description: 'View upcoming meetings and calendar events',
          category: 'calendar',
          icon: '📅',
        },
        {
          id: '5',
          title: 'Documentation Search',
          description: 'Search through company documentation',
          category: 'search',
          icon: '🔍',
        },
        {
          id: '6',
          title: 'System Health Check',
          description: 'Check system status and performance',
          category: 'system',
          icon: '⚡',
        },
      ]

      // Filter suggestions based on user role
      const filteredSuggestions = user.role === 'admin' 
        ? suggestions 
        : suggestions.filter(s => s.category !== 'system')

      return NextResponse.json({ suggestions: filteredSuggestions }, { status: 200 })
    } catch (error) {
      console.error('Get suggestions error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
