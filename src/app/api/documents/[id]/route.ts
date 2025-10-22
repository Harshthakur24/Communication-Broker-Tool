import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const documentId = params.id
      
      if (!documentId) {
        return NextResponse.json(
          { error: 'Document ID is required' },
          { status: 400 }
        )
      }
      
      // Get document details
      const document = await prisma.document.findUnique({
        where: { 
          id: documentId,
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          content: true,
          type: true,
          category: true,
          tags: true,
          fileSize: true,
          createdAt: true,
          updatedAt: true,
          uploadedBy: true,
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
      })
      
      if (!document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }
      
      // Check if user has access to this document
      if (document.uploadedBy !== user.id && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized to access this document' },
          { status: 403 }
        )
      }
      
      return NextResponse.json({
        document: {
          id: document.id,
          title: document.title,
          content: document.content,
          type: document.type,
          category: document.category,
          tags: document.tags,
          fileSize: document.fileSize,
          chunksCount: document._count.chunks,
          uploadedBy: document.user.name,
          uploadedAt: document.createdAt,
          updatedAt: document.updatedAt,
        },
      })
    } catch (error) {
      console.error('Get document error:', error)
      return NextResponse.json(
        { error: 'Failed to get document' },
        { status: 500 }
      )
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const documentId = params.id
      
      console.log('Delete request for document ID:', documentId)
      
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
      
      console.log('Document found:', document)
      console.log('User ID:', user.id, 'User role:', user.role)
      
      if (!document) {
        console.log('Document not found in database')
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }
      
      if (!document.isActive) {
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
