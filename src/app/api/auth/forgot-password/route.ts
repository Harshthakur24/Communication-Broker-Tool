import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { createPasswordResetToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'

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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate password reset token
      const resetToken = await createPasswordResetToken(email.toLowerCase())

      // Send password reset email
      const emailSent = await sendPasswordResetEmail(email.toLowerCase(), resetToken)

      if (!emailSent) {
        console.error('Failed to send password reset email to:', email)
        return NextResponse.json(
          { error: 'Failed to send password reset email. Please try again.' },
          { status: 500 }
        )
      }
    }

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
