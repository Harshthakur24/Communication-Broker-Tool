import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!

      // Get user stats
      const userStats = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          lastLogin: true,
          createdAt: true,
          isEmailVerified: true,
        },
      })

      // Get total users count (for admin)
      const totalUsers = user.role === 'admin' 
        ? await prisma.user.count()
        : null

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const recentLogins = await prisma.user.count({
        where: {
          lastLogin: {
            gte: sevenDaysAgo,
          },
        },
      })

      // Mock data for demo (replace with real data sources)
      const stats = {
        user: {
          accountAge: userStats ? Math.floor((Date.now() - userStats.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0,
          isEmailVerified: userStats?.isEmailVerified || false,
          lastLogin: userStats?.lastLogin,
        },
        system: {
          totalUsers: totalUsers,
          recentLogins,
          activeSessions: 0, // Mock data - no session table in current schema
        },
        insights: {
          messagesToday: Math.floor(Math.random() * 50) + 10,
          projectsActive: Math.floor(Math.random() * 10) + 3,
          teamMembers: Math.floor(Math.random() * 20) + 5,
          notificationsUnread: Math.floor(Math.random() * 15) + 2,
        },
      }

      return NextResponse.json({ stats }, { status: 200 })
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
