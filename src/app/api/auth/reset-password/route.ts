import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { hashPassword, validatePassword, validatePasswordResetToken, markPasswordResetTokenAsUsed } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Validate reset token
    const tokenData = await validatePasswordResetToken(token)
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password
    await prisma.user.update({
      where: { email: tokenData.email },
      data: { password: hashedPassword },
    })

    // Mark token as used
    await markPasswordResetTokenAsUsed(token)

    // Delete all existing sessions for security
    const user = await prisma.user.findUnique({
      where: { email: tokenData.email },
    })

    if (user) {
      await prisma.session.deleteMany({
        where: { userId: user.id },
      })
    }

    return NextResponse.json(
      { message: 'Password reset successful. Please log in with your new password.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
