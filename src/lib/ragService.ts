import { prisma } from './database'
import { generateEmbedding, cosineSimilarity } from './ai'

export interface DocumentSearchResult {
  id: string
  title: string
  content: string
  category?: string
  tags: string[]
  similarity: number
  source: string
}

export interface RAGContext {
  documents: DocumentSearchResult[]
  totalResults: number
  query: string
}

// Search for relevant documents using vector similarity
export async function searchDocuments(
  query: string,
  limit: number = 5,
  category?: string,
  tags?: string[]
): Promise<DocumentSearchResult[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)
    
    // Get all document chunks with their embeddings
    const chunks = await prisma.documentChunk.findMany({
      where: {
        document: {
          isActive: true,
          ...(category && { category }),
          ...(tags && tags.length > 0 && {
            tags: {
              hasSome: tags,
            },
          }),
        },
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            category: true,
            tags: true,
            type: true,
          },
        },
      },
    })
    
    // Calculate similarity scores
    const results = chunks
      .map(chunk => {
        if (!chunk.embedding) return null
        
        const embedding = JSON.parse(chunk.embedding) as number[]
        const similarity = cosineSimilarity(queryEmbedding, embedding)
        
        return {
          id: chunk.document.id,
          title: chunk.document.title,
          content: chunk.content,
          category: chunk.document.category,
          tags: chunk.document.tags,
          similarity,
          source: `${chunk.document.title} (${chunk.document.type})`,
        }
      })
      .filter((result): result is DocumentSearchResult => result !== null)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
    
    return results
  } catch (error) {
    console.error('Error searching documents:', error)
    throw new Error('Failed to search documents')
  }
}

// Get RAG context for a query
export async function getRAGContext(
  query: string,
  limit: number = 5,
  category?: string,
  tags?: string[]
): Promise<RAGContext> {
  try {
    const documents = await searchDocuments(query, limit, category, tags)
    
    return {
      documents,
      totalResults: documents.length,
      query,
    }
  } catch (error) {
    console.error('Error getting RAG context:', error)
    throw new Error('Failed to get RAG context')
  }
}

// Search documents by text (fallback for when embeddings are not available)
export async function searchDocumentsByText(
  query: string,
  limit: number = 5,
  category?: string,
  tags?: string[]
): Promise<DocumentSearchResult[]> {
  try {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
    
    const documents = await prisma.document.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
        ...(tags && tags.length > 0 && {
          tags: {
            hasSome: tags,
          },
        }),
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: query,
              mode: 'insensitive',
            },
          },
          ...searchTerms.map(term => ({
            title: {
              contains: term,
              mode: 'insensitive',
            },
          })),
          ...searchTerms.map(term => ({
            content: {
              contains: term,
              mode: 'insensitive',
            },
          })),
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        tags: true,
        type: true,
      },
      take: limit,
    })
    
    // Calculate simple relevance score based on term frequency
    const results = documents.map(doc => {
      const content = (doc.title + ' ' + doc.content).toLowerCase()
      let score = 0
      
      // Exact query match gets highest score
      if (content.includes(query.toLowerCase())) {
        score += 10
      }
      
      // Individual term matches
      searchTerms.forEach(term => {
        const matches = (content.match(new RegExp(term, 'g')) || []).length
        score += matches
      })
      
      return {
        id: doc.id,
        title: doc.title,
        content: doc.content.substring(0, 500) + '...', // Truncate for display
        category: doc.category,
        tags: doc.tags,
        similarity: Math.min(score / 10, 1), // Normalize to 0-1
        source: `${doc.title} (${doc.type})`,
      }
    })
    
    return results.sort((a, b) => b.similarity - a.similarity)
  } catch (error) {
    console.error('Error searching documents by text:', error)
    throw new Error('Failed to search documents by text')
  }
}

// Get document statistics
export async function getDocumentStats(): Promise<{
  totalDocuments: number
  totalChunks: number
  categories: Array<{ category: string; count: number }>
  recentUploads: Array<{ title: string; uploadedAt: Date; uploadedBy: string }>
}> {
  try {
    const [totalDocuments, totalChunks, categoryStats, recentUploads] = await Promise.all([
      prisma.document.count({
        where: { isActive: true },
      }),
      prisma.documentChunk.count(),
      prisma.document.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: { category: true },
      }),
      prisma.document.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          title: true,
          createdAt: true,
          user: {
            select: { name: true },
          },
        },
      }),
    ])
    
    return {
      totalDocuments,
      totalChunks,
      categories: categoryStats.map(stat => ({
        category: stat.category || 'Uncategorized',
        count: stat._count.category,
      })),
      recentUploads: recentUploads.map(doc => ({
        title: doc.title,
        uploadedAt: doc.createdAt,
        uploadedBy: doc.user.name,
      })),
    }
  } catch (error) {
    console.error('Error getting document stats:', error)
    throw new Error('Failed to get document statistics')
  }
}

// Get similar documents
export async function getSimilarDocuments(
  documentId: string,
  limit: number = 5
): Promise<DocumentSearchResult[]> {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        chunks: {
          take: 1,
          orderBy: { chunkIndex: 'asc' },
        },
      },
    })
    
    if (!document || !document.chunks.length) {
      return []
    }
    
    const firstChunk = document.chunks[0]
    if (!firstChunk.embedding) {
      return []
    }
    
    const documentEmbedding = JSON.parse(firstChunk.embedding) as number[]
    
    // Find similar documents
    const chunks = await prisma.documentChunk.findMany({
      where: {
        document: {
          isActive: true,
          id: { not: documentId },
        },
        embedding: { not: null },
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            category: true,
            tags: true,
            type: true,
          },
        },
      },
    })
    
    const results = chunks
      .map(chunk => {
        if (!chunk.embedding) return null
        
        const embedding = JSON.parse(chunk.embedding) as number[]
        const similarity = cosineSimilarity(documentEmbedding, embedding)
        
        return {
          id: chunk.document.id,
          title: chunk.document.title,
          content: chunk.content,
          category: chunk.document.category,
          tags: chunk.document.tags,
          similarity,
          source: `${chunk.document.title} (${chunk.document.type})`,
        }
      })
      .filter((result): result is DocumentSearchResult => result !== null)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
    
    return results
  } catch (error) {
    console.error('Error getting similar documents:', error)
    throw new Error('Failed to get similar documents')
  }
}
