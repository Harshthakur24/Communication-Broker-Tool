const pdf = require('pdf-parse')
import mammoth from 'mammoth'
import { generateEmbeddings } from './ai'

export interface ProcessedDocument {
  title: string
  content: string
  type: string
  chunks: Array<{
    content: string
    chunkIndex: number
    metadata?: any
  }>
}

// Extract text from different file types
export async function extractTextFromFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  try {
    switch (extension) {
      case 'pdf':
        const pdfData = await pdf(buffer)
        return pdfData.text
        
      case 'docx':
        const docxResult = await mammoth.extractRawText({ buffer })
        return docxResult.value
        
      case 'txt':
      case 'md':
      case 'markdown':
        return buffer.toString('utf-8')
        
      default:
        // Try to extract as plain text
        return buffer.toString('utf-8')
    }
  } catch (error) {
    console.error(`Error extracting text from ${filename}:`, error)
    throw new Error(`Failed to extract text from ${filename}`)
  }
}

// Split text into chunks for better processing
export function splitTextIntoChunks(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    let end = start + chunkSize
    
    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end)
      const lastNewline = text.lastIndexOf('\n', end)
      const breakPoint = Math.max(lastPeriod, lastNewline)
      
      if (breakPoint > start + chunkSize * 0.5) {
        end = breakPoint + 1
      }
    }
    
    const chunk = text.slice(start, end).trim()
    if (chunk.length > 0) {
      chunks.push(chunk)
    }
    
    start = end - overlap
  }
  
  return chunks
}

// Process document and create chunks with embeddings
export async function processDocument(
  title: string,
  content: string,
  type: string,
  category?: string,
  tags?: string[]
): Promise<ProcessedDocument> {
  try {
    // Split content into chunks
    const textChunks = splitTextIntoChunks(content)
    
    // Generate embeddings for each chunk
    const embeddings = await generateEmbeddings(textChunks)
    
    // Create processed chunks
    const chunks = textChunks.map((chunk, index) => ({
      content: chunk,
      chunkIndex: index,
      metadata: {
        embedding: embeddings[index],
        category,
        tags,
        type,
      },
    }))
    
    return {
      title,
      content,
      type,
      chunks,
    }
  } catch (error) {
    console.error('Error processing document:', error)
    throw new Error('Failed to process document')
  }
}

// Extract metadata from filename
export function extractMetadataFromFilename(filename: string): {
  title: string
  type: string
  category?: string
  tags?: string[]
} {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  const extension = filename.split('.').pop()?.toLowerCase() || 'txt'
  
  // Extract category from filename patterns
  let category: string | undefined
  let tags: string[] = []
  
  const lowerName = nameWithoutExt.toLowerCase()
  
  if (lowerName.includes('policy') || lowerName.includes('policies')) {
    category = 'policies'
    tags.push('policy')
  } else if (lowerName.includes('procedure') || lowerName.includes('procedures')) {
    category = 'procedures'
    tags.push('procedure')
  } else if (lowerName.includes('faq') || lowerName.includes('frequently')) {
    category = 'faq'
    tags.push('faq')
  } else if (lowerName.includes('manual') || lowerName.includes('guide')) {
    category = 'manuals'
    tags.push('manual', 'guide')
  } else if (lowerName.includes('meeting') || lowerName.includes('minutes')) {
    category = 'meetings'
    tags.push('meeting', 'minutes')
  } else {
    category = 'general'
    tags.push('document')
  }
  
  // Add file type tag
  tags.push(extension)
  
  return {
    title: nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    type: extension,
    category,
    tags,
  }
}

// Validate file type
export function validateFileType(filename: string, mimeType: string): boolean {
  const allowedExtensions = ['pdf', 'docx', 'txt', 'md', 'markdown']
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ]
  
  const extension = filename.split('.').pop()?.toLowerCase()
  
  return (
    (extension && allowedExtensions.includes(extension)) ||
    allowedMimeTypes.includes(mimeType)
  )
}

// Get file size in human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
