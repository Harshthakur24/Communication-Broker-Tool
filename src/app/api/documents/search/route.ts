import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { searchDocuments, searchDocumentsByText } from '@/lib/ragService'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      
      const query = searchParams.get('q')
      const limit = parseInt(searchParams.get('limit') || '10')
      const category = searchParams.get('category')
      const tags = searchParams.get('tags')
      const useVectorSearch = searchParams.get('vector') !== 'false' // Default to true
      
      if (!query || query.trim().length === 0) {
        return NextResponse.json(
          { error: 'Search query is required' },
          { status: 400 }
        )
      }
      
      const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined
      
      let results
      
      try {
        if (useVectorSearch) {
          // Try vector search first
          results = await searchDocuments(query, limit, category || undefined, tagArray)
        } else {
          // Use text search
          results = await searchDocumentsByText(query, limit, category || undefined, tagArray)
        }
      } catch (error) {
        console.error('Vector search failed, falling back to text search:', error)
        // Fallback to text search if vector search fails
        results = await searchDocumentsByText(query, limit, category || undefined, tagArray)
      }
      
      return NextResponse.json({
        query,
        results,
        total: results.length,
        searchType: useVectorSearch ? 'vector' : 'text',
      })
    } catch (error) {
      console.error('Document search error:', error)
      return NextResponse.json(
        { error: 'Failed to search documents' },
        { status: 500 }
      )
    }
  })
}
