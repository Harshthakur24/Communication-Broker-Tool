import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { validateEmailVerificationToken, markEmailVerificationTokenAsUsed } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    // Validate input
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Validate verification token
    const tokenData = await validateEmailVerificationToken(token)
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Update user email verification status
    const user = await prisma.user.update({
      where: { email: tokenData.email },
      data: { 
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    })

    // Mark token as used
    await markEmailVerificationTokenAsUsed(token)

    // Send welcome email
    const emailSent = await sendWelcomeEmail(user.email, user.name)
    if (!emailSent) {
      console.error('Failed to send welcome email to:', user.email)
      // Don't fail the verification, just log the error
    }

    return NextResponse.json(
      { 
        message: 'Email verified successfully! Welcome to AI Communication Hub.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
