import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

// This should match the announcements Map from the main route
// In production, you'd use a database
const announcements = new Map<string, any>()

// POST - Mark announcement as read
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const announcementId = params.id

      // Get announcement from storage
      const announcement = announcements.get(announcementId)
      
      if (!announcement) {
        return NextResponse.json(
          { error: 'Announcement not found' },
          { status: 404 }
        )
      }

      // Check if already read
      if (!announcement.readBy.includes(user.id)) {
        announcement.readBy.push(user.id)
        announcements.set(announcementId, announcement)
      }

      return NextResponse.json({
        success: true,
        announcement,
      })
    } catch (error) {
      console.error('Mark as read error:', error)
      return NextResponse.json(
        { error: 'Failed to mark as read' },
        { status: 500 }
      )
    }
  })
}

