import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true }
    })

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json(
        {
          message: 'If an account with that email exists, we have sent a password reset link.',
        },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    })

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken)
    
    if (!emailSent) {
      console.error('Failed to send password reset email to:', user.email)
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      )
    }

    console.log('Password reset email sent to:', user.email)

    return NextResponse.json(
      {
        message: 'If an account with that email exists, we have sent a password reset link.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
