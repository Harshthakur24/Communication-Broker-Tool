import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'

// In-memory poll storage (in production, use database)
const polls = new Map<string, any>()

// GET - Fetch all polls
export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!

      // Convert map to array and sort by creation date
      const allPolls = Array.from(polls.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      return NextResponse.json({
        success: true,
        polls: allPolls,
        total: allPolls.length,
      })
    } catch (error) {
      console.error('Fetch polls error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch polls' },
        { status: 500 }
      )
    }
  })
}

// POST - Create new poll
export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { question, options } = await request.json()

      if (!question || !question.trim()) {
        return NextResponse.json(
          { error: 'Poll question is required' },
          { status: 400 }
        )
      }

      if (!options || options.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 options are required' },
          { status: 400 }
        )
      }

      const pollId = Math.random().toString(36).substring(7)
      
      const newPoll = {
        id: pollId,
        question: question.trim(),
        options: options.map((text: string, index: number) => ({
          id: `${pollId}-opt-${index}`,
          text: text.trim(),
          votes: 0,
          voters: [],
        })),
        createdBy: user.name || user.email,
        createdAt: new Date().toISOString(),
        totalVotes: 0,
        isActive: true,
      }

      polls.set(pollId, newPoll)

      return NextResponse.json({
        success: true,
        poll: newPoll,
      })
    } catch (error) {
      console.error('Create poll error:', error)
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      )
    }
  })
}

