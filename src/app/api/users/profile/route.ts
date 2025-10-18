import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!

      const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          department: true,
          role: true,
          isEmailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!userProfile) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ user: userProfile }, { status: 200 })
    } catch (error) {
      console.error('Get profile error:', error)
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
      const { name, department, avatar } = await request.json()

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name && { name }),
          ...(department !== undefined && { department }),
          ...(avatar !== undefined && { avatar }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          department: true,
          role: true,
          isEmailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return NextResponse.json(
        { 
          message: 'Profile updated successfully',
          user: updatedUser 
        },
        { status: 200 }
      )
    } catch (error) {
      console.error('Update profile error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
