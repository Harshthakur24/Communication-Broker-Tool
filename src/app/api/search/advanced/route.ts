import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'

interface SearchFilters {
  query: string
  type?: 'all' | 'documents' | 'tasks' | 'messages'
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  category?: string
  priority?: string
  status?: string
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const filters: SearchFilters = await request.json()

      const { query, type = 'all', dateFrom, dateTo, tags, category, priority, status } = filters

      if (!query || query.trim().length < 3) {
        return NextResponse.json(
          { error: 'Query must be at least 3 characters' },
          { status: 400 }
        )
      }

      const results = []

      // Search in documents
      if (type === 'all' || type === 'documents') {
        const documentWhere: any = {
          uploadedBy: user.id,
          isActive: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        }

        if (dateFrom || dateTo) {
          documentWhere.createdAt = {}
          if (dateFrom) documentWhere.createdAt.gte = new Date(dateFrom)
          if (dateTo) documentWhere.createdAt.lte = new Date(dateTo)
        }

        if (tags && tags.length > 0) {
          documentWhere.tags = { hasSome: tags }
        }

        if (category) {
          documentWhere.category = category
        }

        const documents = await prisma.document.findMany({
          where: documentWhere,
          select: {
            id: true,
            title: true,
            content: true,
            tags: true,
            category: true,
            createdAt: true,
          },
          take: 20,
        })

        results.push(
          ...documents.map((doc) => ({
            id: doc.id,
            title: doc.title,
            content: doc.content.substring(0, 200),
            type: 'document' as const,
            date: doc.createdAt.toISOString(),
            tags: doc.tags,
            category: doc.category,
            relevance: calculateRelevance(query, doc.title + ' ' + doc.content),
          }))
        )
      }

      // Search in tasks
      if (type === 'all' || type === 'tasks') {
        const taskWhere: any = {
          userId: user.id,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }

        if (dateFrom || dateTo) {
          taskWhere.createdAt = {}
          if (dateFrom) taskWhere.createdAt.gte = new Date(dateFrom)
          if (dateTo) taskWhere.createdAt.lte = new Date(dateTo)
        }

        if (tags && tags.length > 0) {
          taskWhere.tags = { hasSome: tags }
        }

        if (priority) {
          taskWhere.priority = priority
        }

        if (status) {
          taskWhere.status = status
        }

        const tasks = await prisma.task.findMany({
          where: taskWhere,
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            tags: true,
            createdAt: true,
          },
          take: 20,
        })

        results.push(
          ...tasks.map((task) => ({
            id: task.id,
            title: task.title,
            content: task.description || '',
            type: 'task' as const,
            date: task.createdAt.toISOString(),
            tags: task.tags,
            priority: task.priority,
            status: task.status,
            relevance: calculateRelevance(query, task.title + ' ' + (task.description || '')),
          }))
        )
      }

      // Search in chat messages
      if (type === 'all' || type === 'messages') {
        const sessions = await prisma.chatSession.findMany({
          where: { userId: user.id },
          select: { id: true },
        })

        const sessionIds = sessions.map((s) => s.id)

        const messageWhere: any = {
          sessionId: { in: sessionIds },
          content: { contains: query, mode: 'insensitive' },
        }

        if (dateFrom || dateTo) {
          messageWhere.createdAt = {}
          if (dateFrom) messageWhere.createdAt.gte = new Date(dateFrom)
          if (dateTo) messageWhere.createdAt.lte = new Date(dateTo)
        }

        const messages = await prisma.chatMessage.findMany({
          where: messageWhere,
          select: {
            id: true,
            content: true,
            type: true,
            createdAt: true,
          },
          take: 20,
        })

        results.push(
          ...messages.map((msg) => ({
            id: msg.id,
            title: `${msg.type} message`,
            content: msg.content.substring(0, 200),
            type: 'message' as const,
            date: msg.createdAt.toISOString(),
            relevance: calculateRelevance(query, msg.content),
          }))
        )
      }

      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance)

      return NextResponse.json({
        results: results.slice(0, 50), // Limit to 50 total results
        total: results.length,
        query,
        filters: { type, dateFrom, dateTo, tags, category, priority, status },
      })
    } catch (error) {
      console.error('Advanced search error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

// Simple relevance calculation
function calculateRelevance(query: string, text: string): number {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  
  // Exact match in title gets highest score
  if (textLower.includes(queryLower)) {
    const position = textLower.indexOf(queryLower)
    // Earlier matches get higher scores
    return 1 - (position / textLower.length) * 0.5
  }
  
  // Partial word matches
  const queryWords = queryLower.split(' ')
  const matches = queryWords.filter((word) => textLower.includes(word))
  
  return matches.length / queryWords.length * 0.8
}

