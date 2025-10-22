import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'
import { getRAGContext } from '@/lib/ragService'
import { generateRAGResponse, generateSimpleResponse } from '@/lib/ai'
import { processAIResponse } from '@/lib/responseProcessor'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      const sessionId = searchParams.get('sessionId')
      const offset = parseInt(searchParams.get('offset') || '0')
      const limit = parseInt(searchParams.get('limit') || '20')

      let messages: any[] = []

      if (sessionId) {
        // Get messages from specific session
        const session = await prisma.chatSession.findFirst({
          where: {
            id: sessionId,
            userId: user.id,
          },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              skip: offset,
              take: limit,
            },
          },
        })

        if (session) {
          messages = session.messages.map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: msg.createdAt,
            sources: msg.sources ? JSON.parse(msg.sources as string) : null,
            metadata: msg.metadata,
          }))
        }
      } else {
        // Get recent messages from user's active sessions
        const recentSessions = await prisma.chatSession.findMany({
          where: {
            userId: user.id,
            isActive: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 1,
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: limit,
            },
          },
        })

        if (recentSessions.length > 0) {
          messages = recentSessions[0].messages.map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: msg.createdAt,
            sources: msg.sources ? JSON.parse(msg.sources as string) : null,
            metadata: msg.metadata,
          }))
        }
      }

      return NextResponse.json({
        messages: messages.reverse(), // Reverse to show oldest first
        hasMore: messages.length === limit,
        total: messages.length,
      })
    } catch (error) {
      console.error('Get chat messages error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { message, sessionId } = await request.json()

      if (!message || typeof message !== 'string') {
        return NextResponse.json(
          { error: 'Message is required' },
          { status: 400 }
        )
      }

      // Get or create chat session
      let chatSession
      if (sessionId) {
        chatSession = await prisma.chatSession.findFirst({
          where: {
            id: sessionId,
            userId: user.id,
          },
        })
      }

      if (!chatSession) {
        chatSession = await prisma.chatSession.create({
          data: {
            userId: user.id,
            title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          },
        })
      }

      // Save user message
      const userMessage = await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          type: 'user',
          content: message,
        },
      })

      // Get RAG context for the message
      let ragContext
      let aiResponse: string
      let sources: any[] = []

      try {
        ragContext = await getRAGContext(message, 3)
        
        if (ragContext.documents.length > 0) {
          // Generate response with RAG
          aiResponse = await generateRAGResponse(
            message,
            ragContext.documents.map(doc => ({
              content: doc.content,
              title: doc.title,
              source: doc.source,
            }))
          )
          // Deduplicate sources by document ID to avoid showing same document multiple times
          console.log('Raw RAG documents:', ragContext.documents.length)
          console.log('Document IDs:', ragContext.documents.map(doc => doc.id))
          
          const uniqueSources = new Map()
          ragContext.documents.forEach(doc => {
            console.log('Processing document:', doc.id, doc.title)
            if (!uniqueSources.has(doc.id)) {
              uniqueSources.set(doc.id, {
                title: doc.title,
                url: `/documents/${doc.id}`,
                similarity: doc.similarity,
              })
              console.log('Added unique source:', doc.title)
            } else {
              console.log('Skipping duplicate:', doc.title)
            }
          })
          sources = Array.from(uniqueSources.values())
          console.log('Final unique sources:', sources.length, sources.map(s => s.title))
        } else {
          // Generate simple response when no relevant documents found
          aiResponse = await generateSimpleResponse(message)
        }
      } catch (error) {
        console.error('RAG processing error:', error)
        // Fallback to simple response
        aiResponse = await generateSimpleResponse(message)
      }

      // Process AI response to make it more human-like and professional
      const processedResponse = processAIResponse(aiResponse)

      // Save AI response
      const assistantMessage = await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          type: 'assistant',
          content: processedResponse,
          sources: sources.length > 0 ? JSON.stringify(sources) : undefined,
          metadata: ragContext ? {
            totalResults: ragContext.totalResults,
            query: ragContext.query,
          } : undefined,
        },
      })

      // Update session timestamp
      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: { updatedAt: new Date() },
      })

      return NextResponse.json({
        message: {
          id: assistantMessage.id,
          type: 'assistant',
          content: processedResponse,
          timestamp: assistantMessage.createdAt,
          sources,
          metadata: assistantMessage.metadata,
        },
        sessionId: chatSession.id,
      })
    } catch (error) {
      console.error('Send chat message error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}