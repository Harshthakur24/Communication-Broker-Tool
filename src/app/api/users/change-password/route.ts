import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'
import { comparePassword, hashPassword, validatePassword } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { currentPassword, newPassword } = await request.json()

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current password and new password are required' },
          { status: 400 }
        )
      }

      // Get user with password
      const userWithPassword = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      })

      if (!userWithPassword) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        userWithPassword.password
      )

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Validate new password
      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          { error: 'New password does not meet requirements', details: passwordValidation.errors },
          { status: 400 }
        )
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword)

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword },
      })

      // Delete all existing sessions for security
      await prisma.session.deleteMany({
        where: { userId: user.id },
      })

      return NextResponse.json(
        { message: 'Password changed successfully. Please log in again.' },
        { status: 200 }
      )
    } catch (error) {
      console.error('Change password error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
