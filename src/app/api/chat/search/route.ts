import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'
import { searchDocuments } from '@/lib/ragService'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      const query = searchParams.get('q')
      const limit = parseInt(searchParams.get('limit') || '10')
      const category = searchParams.get('category')
      const tags = searchParams.get('tags')?.split(',').filter(Boolean)

      if (!query || query.trim().length < 2) {
        return NextResponse.json({
          results: [],
          total: 0,
          query: query || '',
        })
      }

      // Search documents using RAG service
      const searchResults = await searchDocuments(
        query.trim(),
        limit,
        category || undefined,
        tags
      )

      // Format results for chat search
      const formattedResults = searchResults.map(result => ({
        id: result.id,
        title: result.title,
        content: result.content,
        category: result.category,
        tags: result.tags,
        similarity: result.similarity,
        source: result.source,
        snippet: getContentSnippet(result.content, query),
        relevanceScore: calculateRelevanceScore(result, query),
      }))

      // Sort by relevance score
      formattedResults.sort((a, b) => b.relevanceScore - a.relevanceScore)

      return NextResponse.json({
        results: formattedResults,
        total: formattedResults.length,
        query: query.trim(),
        categories: [...new Set(formattedResults.map(r => r.category))],
        tags: [...new Set(formattedResults.flatMap(r => r.tags))],
      })
    } catch (error) {
      console.error('Chat search error:', error)
      return NextResponse.json(
        { error: 'Failed to search documents' },
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

/**
 * Calculate relevance score based on similarity and content match
 */
function calculateRelevanceScore(result: any, query: string): number {
  const queryLower = query.toLowerCase()
  const titleLower = result.title.toLowerCase()
  const contentLower = result.content.toLowerCase()
  
  let score = result.similarity || 0
  
  // Boost score for title matches
  if (titleLower.includes(queryLower)) {
    score += 0.3
  }
  
  // Boost score for exact phrase matches
  const exactMatches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length
  score += exactMatches * 0.1
  
  // Boost score for category relevance
  if (result.category && result.category !== 'general') {
    score += 0.1
  }
  
  return Math.min(1, score) // Cap at 1.0
}
