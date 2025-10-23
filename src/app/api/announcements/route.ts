import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'

// In-memory announcement storage (in production, use database)
const announcements = new Map<string, any>()

// GET - Fetch all announcements
export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!

      // Convert map to array and sort (pinned first, then by date)
      const allAnnouncements = Array.from(announcements.values()).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      return NextResponse.json({
        success: true,
        announcements: allAnnouncements,
        total: allAnnouncements.length,
      })
    } catch (error) {
      console.error('Fetch announcements error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch announcements' },
        { status: 500 }
      )
    }
  })
}

// POST - Create new announcement (admin only)
export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { title, message, type, isPinned } = await request.json()

      // In production, check if user is admin
      // if (user.role !== 'admin') {
      //   return NextResponse.json(
      //     { error: 'Unauthorized' },
      //     { status: 403 }
      //   )
      // }

      if (!title || !title.trim()) {
        return NextResponse.json(
          { error: 'Announcement title is required' },
          { status: 400 }
        )
      }

      if (!message || !message.trim()) {
        return NextResponse.json(
          { error: 'Announcement message is required' },
          { status: 400 }
        )
      }

      const announcementId = Math.random().toString(36).substring(7)
      
      const newAnnouncement = {
        id: announcementId,
        title: title.trim(),
        message: message.trim(),
        type: type || 'info', // info, warning, success, urgent
        author: user.name || user.email,
        department: user.department || 'General',
        isPinned: isPinned || false,
        createdAt: new Date().toISOString(),
        readBy: [],
      }

      announcements.set(announcementId, newAnnouncement)

      return NextResponse.json({
        success: true,
        announcement: newAnnouncement,
      })
    } catch (error) {
      console.error('Create announcement error:', error)
      return NextResponse.json(
        { error: 'Failed to create announcement' },
        { status: 500 }
      )
    }
  })
}

