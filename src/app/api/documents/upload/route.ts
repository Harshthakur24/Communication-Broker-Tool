import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'
import { 
  extractTextFromFile, 
  processDocument, 
  extractMetadataFromFilename,
  validateFileType,
  formatFileSize 
} from '@/lib/documentProcessor'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const formData = await request.formData()
      
      const file = formData.get('file') as File
      const category = formData.get('category') as string
      const tags = formData.get('tags') as string
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      }
      
      // Validate file type (expanded support)
      if (!validateFileType(file.name, file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Supported types: PDF, DOCX, DOC, RTF, ODT, TXT, MD' },
          { status: 400 }
        )
      }
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 10MB' },
          { status: 400 }
        )
      }
      
      // Extract text from file
      const buffer = Buffer.from(await file.arrayBuffer())
      const content = await extractTextFromFile(buffer, file.name, file.type)
      
      if (!content.trim()) {
        return NextResponse.json(
          { error: 'Could not extract text from file' },
          { status: 400 }
        )
      }
      
      // Extract metadata from filename
      const metadata = extractMetadataFromFilename(file.name)
      
      // Process document
      const processedDoc = await processDocument(
        metadata.title,
        content,
        metadata.type,
        category || metadata.category,
        tags ? tags.split(',').map(tag => tag.trim()) : metadata.tags
      )
      
      // Save document to database
      const document = await prisma.document.create({
        data: {
          title: processedDoc.title,
          content: processedDoc.content,
          type: processedDoc.type,
          category: category || metadata.category,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : metadata.tags,
          fileSize: file.size,
          uploadedBy: user.id,
        },
      })
      
      // Save document chunks with embeddings
      const chunks = await Promise.all(
        processedDoc.chunks.map(chunk =>
          prisma.documentChunk.create({
            data: {
              documentId: document.id,
              content: chunk.content,
              chunkIndex: chunk.chunkIndex,
              embedding: JSON.stringify(chunk.metadata.embedding),
              metadata: chunk.metadata,
            },
          })
        )
      )
      
      return NextResponse.json({
        message: 'Document uploaded successfully',
        document: {
          id: document.id,
          title: document.title,
          type: document.type,
          category: document.category,
          tags: document.tags,
          fileSize: formatFileSize(document.fileSize || 0),
          chunksCount: chunks.length,
          uploadedAt: document.createdAt,
        },
      })
    } catch (error) {
      console.error('Document upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload document' },
        { status: 500 }
      )
    }
  })
}
