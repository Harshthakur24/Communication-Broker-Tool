import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './database'
import crypto from 'crypto'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret'
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign(payload, secret, { expiresIn })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch (error) {
    return null
  }
}

export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

export const createSession = async (userId: string): Promise<string> => {
  const token = generateRandomToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

export const validateSession = async (token: string): Promise<{ user: any; session: any } | null> => {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  return { user: session.user, session }
}

export const deleteSession = async (token: string): Promise<void> => {
  await prisma.session.delete({
    where: { token },
  })
}

export const deleteAllUserSessions = async (userId: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: { userId },
  })
}

export const createPasswordResetToken = async (email: string): Promise<string> => {
  const token = generateRandomToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Delete any existing password reset tokens for this email
  await prisma.passwordReset.deleteMany({
    where: { email },
  })

  // Create new password reset token
  await prisma.passwordReset.create({
    data: {
      email,
      token,
      expiresAt,
    },
  })

  return token
}

export const validatePasswordResetToken = async (token: string): Promise<{ email: string } | null> => {
  const resetToken = await prisma.passwordReset.findUnique({
    where: { token },
  })

  if (!resetToken || resetToken.expiresAt < new Date() || resetToken.used) {
    return null
  }

  return { email: resetToken.email }
}

export const markPasswordResetTokenAsUsed = async (token: string): Promise<void> => {
  await prisma.passwordReset.update({
    where: { token },
    data: { used: true },
  })
}

export const createEmailVerificationToken = async (email: string): Promise<string> => {
  const token = generateRandomToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Delete any existing email verification tokens for this email
  await prisma.emailVerification.deleteMany({
    where: { email },
  })

  // Create new email verification token
  await prisma.emailVerification.create({
    data: {
      email,
      token,
      expiresAt,
    },
  })

  return token
}

export const validateEmailVerificationToken = async (token: string): Promise<{ email: string } | null> => {
  const verificationToken = await prisma.emailVerification.findUnique({
    where: { token },
  })

  if (!verificationToken || verificationToken.expiresAt < new Date() || verificationToken.used) {
    return null
  }

  return { email: verificationToken.email }
}

export const markEmailVerificationTokenAsUsed = async (token: string): Promise<void> => {
  await prisma.emailVerification.update({
    where: { token },
    data: { used: true },
  })
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
