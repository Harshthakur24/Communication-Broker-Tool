import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name: string
    role: string
    department?: string
    avatar?: string
    isActive: boolean
    isEmailVerified: boolean
    lastLogin?: Date
    createdAt: Date
    updatedAt: Date
  }
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get JWT token from Authorization header or cookie
    const authHeader = request.headers.get('Authorization')
    const authTokenCookie = request.cookies.get('authToken')?.value
    const jwtToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authTokenCookie

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify JWT token and get user
    const user = await getUserFromToken(jwtToken)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user

    return await handler(authenticatedRequest)
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}

export async function withRole(
  request: NextRequest,
  allowedRoles: string[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (authenticatedRequest) => {
    const user = authenticatedRequest.user!
    
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return await handler(authenticatedRequest)
  })
}

export async function requireEmailVerification(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (authenticatedRequest) => {
    const user = authenticatedRequest.user!
    
    if (!user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email verification required. Please check your email and verify your account.' },
        { status: 403 }
      )
    }

    return await handler(authenticatedRequest)
  })
}
