import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'
import { formatFileSize } from '@/lib/documentProcessor'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const category = searchParams.get('category')
      const search = searchParams.get('search')
      const sortBy = searchParams.get('sortBy') || 'createdAt'
      const sortOrder = searchParams.get('sortOrder') || 'desc'
      
      const skip = (page - 1) * limit
      
      // Build where clause
      const where: any = {
        isActive: true,
      }
      
      if (category && category !== 'all') {
        where.category = category
      }
      
      if (search) {
        where.OR = [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ]
      }
      
      // Get documents with pagination
      const [documents, totalCount] = await Promise.all([
        prisma.document.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            tags: true,
            fileSize: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                chunks: true,
              },
            },
          },
        }),
        prisma.document.count({ where }),
      ])
      
      // Format documents
      const formattedDocuments = documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        category: doc.category,
        tags: doc.tags,
        fileSize: formatFileSize(doc.fileSize || 0),
        chunksCount: doc._count.chunks,
        uploadedBy: doc.user.name,
        uploadedAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }))
      
      return NextResponse.json({
        documents: formattedDocuments,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      })
    } catch (error) {
      console.error('Get documents error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }
  })
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      const documentId = searchParams.get('id')
      
      console.log('DELETE request with query params:', searchParams.toString())
      console.log('Document ID from query:', documentId)
      
      if (!documentId) {
        return NextResponse.json(
          { error: 'Document ID is required' },
          { status: 400 }
        )
      }
      
      // Check if user owns the document or is admin
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { uploadedBy: true, isActive: true },
      })
      
      console.log('Document found in main route:', document)
      console.log('User ID:', user.id, 'User role:', user.role)
      
      if (!document) {
        console.log('Document not found in database (main route)')
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }
      
      if (!document.isActive) {
        console.log('Document already deleted')
        return NextResponse.json(
          { error: 'Document already deleted' },
          { status: 404 }
        )
      }
      
      if (document.uploadedBy !== user.id && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized to delete this document' },
          { status: 403 }
        )
      }
      
      // Soft delete the document
      await prisma.document.update({
        where: { id: documentId },
        data: { isActive: false },
      })
      
      return NextResponse.json({
        message: 'Document deleted successfully',
      })
    } catch (error) {
      console.error('Delete document error:', error)
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      )
    }
  })
}
