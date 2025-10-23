import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'

// In-memory store for user presence (in production, use Redis)
const userPresence = new Map<string, {
  status: string
  activity: string
  lastSeen: Date
}>()

// GET - Fetch online users
export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!

      // Get all users
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          lastLogin: true,
        },
        take: 50,
      })

      // Map with presence data
      const onlineUsers = users.map(u => {
        const presence = userPresence.get(u.id)
        const now = new Date()
        const lastSeen = presence?.lastSeen || u.lastLogin || now
        const timeDiff = now.getTime() - new Date(lastSeen).getTime()
        
        // Consider online if active in last 5 minutes
        let status = 'offline'
        if (presence && timeDiff < 5 * 60 * 1000) {
          status = presence.status || 'online'
        } else if (timeDiff < 30 * 60 * 1000) {
          status = 'away'
        }

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          department: u.department || 'General',
          status,
          currentActivity: presence?.activity,
          lastSeen: lastSeen.toISOString(),
        }
      }).filter(u => u.status !== 'offline')

      // Sort by status priority
      const statusPriority = { online: 0, busy: 1, away: 2 }
      onlineUsers.sort((a, b) => {
        const aPriority = statusPriority[a.status as keyof typeof statusPriority] ?? 3
        const bPriority = statusPriority[b.status as keyof typeof statusPriority] ?? 3
        return aPriority - bPriority
      })

      return NextResponse.json({
        users: onlineUsers,
        total: onlineUsers.length,
      })
    } catch (error) {
      console.error('Get presence error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

// POST - Update user status
export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { status, activity } = await request.json()

      // Update presence
      userPresence.set(user.id, {
        status: status || 'online',
        activity: activity || '',
        lastSeen: new Date(),
      })

      // Update last login in database
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      })

      return NextResponse.json({
        success: true,
        status,
      })
    } catch (error) {
      console.error('Update presence error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

