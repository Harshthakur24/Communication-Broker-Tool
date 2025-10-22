import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { validateEmailVerificationToken, markEmailVerificationTokenAsUsed } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Validate the token
    const tokenValidation = await validateEmailVerificationToken(token)
    
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Mark the token as used and verify the email
    await markEmailVerificationTokenAsUsed(tokenValidation.userId!)

    // Get the updated user
    const user = await prisma.user.findUnique({
      where: { id: tokenValidation.userId },
      select: {
        id: true,
        name: true,
        email: true,
        isEmailVerified: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Email verified successfully',
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          isEmailVerified: user?.isEmailVerified,
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
