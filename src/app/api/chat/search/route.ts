import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST - Search chat history in database
export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { query } = await request.json()

      if (!query || query.trim().length < 2) {
        return NextResponse.json({
          results: [],
          total: 0,
          query: query || '',
        })
      }

      const searchTerm = query.trim()

      // Search in chat messages for this user
      const messages = await prisma.chatMessage.findMany({
        where: {
          session: {
            userId: user.id,
          },
          content: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        include: {
          session: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      })

      // Group by session and format results
      const sessionMap = new Map()
      
      messages.forEach((msg) => {
        const sessionId = msg.sessionId
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, {
            sessionId,
            title: msg.session.title || 'Untitled Chat',
            content: msg.content,
            timestamp: msg.createdAt.toISOString(),
            messages: [msg.content],
          })
        } else {
          const existing = sessionMap.get(sessionId)
          existing.messages.push(msg.content)
        }
      })

      const results = Array.from(sessionMap.values()).map((session) => ({
        sessionId: session.sessionId,
        title: session.title,
        content: getContentSnippet(session.content, searchTerm),
        timestamp: session.timestamp,
        messageCount: session.messages.length,
        lastMessage: session.content.substring(0, 200),
      }))

      return NextResponse.json({
        success: true,
        results,
        total: results.length,
        query: searchTerm,
      })
    } catch (error) {
      console.error('Chat search error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to search chat history',
          results: [],
          total: 0,
        },
        { status: 500 }
      )
    }
  })
}
/**
 * Extract a relevant snippet from content based on search query
 */
function getContentSnippet(content: string, query: string, maxLength: number = 200): string {
  const queryLower = query.toLowerCase()
  const contentLower = content.toLowerCase()
  
  // Find the first occurrence of the query
  const queryIndex = contentLower.indexOf(queryLower)
  
  if (queryIndex === -1) {
    // If query not found, return beginning of content
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '')
  }
  
  // Calculate start and end positions for snippet
  const start = Math.max(0, queryIndex - 50)
  const end = Math.min(content.length, queryIndex + query.length + 150)
  
  let snippet = content.substring(start, end)
  
  // Add ellipsis if needed
  if (start > 0) snippet = '...' + snippet
  if (end < content.length) snippet = snippet + '...'
  
  return snippet
}
