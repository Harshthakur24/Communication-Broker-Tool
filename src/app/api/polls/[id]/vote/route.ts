import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

// This should match the polls Map from the main route
// In production, you'd use a database
const polls = new Map<string, any>()

// POST - Vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { optionId } = await request.json()
      const pollId = params.id

      // Get poll from storage
      const poll = polls.get(pollId)
      
      if (!poll) {
        return NextResponse.json(
          { error: 'Poll not found' },
          { status: 404 }
        )
      }

      // Check if user already voted
      const hasVoted = poll.options.some((opt: any) => 
        opt.voters.includes(user.id)
      )

      if (hasVoted) {
        return NextResponse.json(
          { error: 'You have already voted in this poll' },
          { status: 400 }
        )
      }

      // Find the option and add vote
      const option = poll.options.find((opt: any) => opt.id === optionId)
      
      if (!option) {
        return NextResponse.json(
          { error: 'Option not found' },
          { status: 404 }
        )
      }

      // Add vote
      option.votes += 1
      option.voters.push(user.id)
      poll.totalVotes += 1

      // Update poll in storage
      polls.set(pollId, poll)

      return NextResponse.json({
        success: true,
        poll,
      })
    } catch (error) {
      console.error('Vote error:', error)
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      )
    }
  })
}

