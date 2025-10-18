import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'
import { getRAGContext } from '@/lib/ragService'
import { generateRAGResponse, generateSimpleResponse } from '@/lib/ai'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      const sessionId = searchParams.get('sessionId')
      const offset = parseInt(searchParams.get('offset') || '0')
      const limit = parseInt(searchParams.get('limit') || '20')

      let messages = []

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
        ragContext = await getRAGContext(message, 5)
        
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
          sources = ragContext.documents.map(doc => ({
            title: doc.title,
            url: `/documents/${doc.id}`,
            similarity: doc.similarity,
          }))
        } else {
          // Generate simple response when no relevant documents found
          aiResponse = await generateSimpleResponse(message)
        }
      } catch (error) {
        console.error('RAG processing error:', error)
        // Fallback to simple response
        aiResponse = await generateSimpleResponse(message)
      }

      // Save AI response
      const assistantMessage = await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          type: 'assistant',
          content: aiResponse,
          sources: sources.length > 0 ? JSON.stringify(sources) : null,
          metadata: ragContext ? {
            totalResults: ragContext.totalResults,
            query: ragContext.query,
          } : null,
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
          content: aiResponse,
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