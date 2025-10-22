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
        try {
          // Try different import patterns for pdf-parse
          let pdfFn
          try {
            // Method 1: Direct import
            const pdfParse = await import('pdf-parse')
            
            if (typeof pdfParse === 'function') {
              pdfFn = pdfParse
            } else if ((pdfParse as any).default && typeof (pdfParse as any).default === 'function') {
              pdfFn = (pdfParse as any).default
            } else if ((pdfParse as any).PDFParse && typeof (pdfParse as any).PDFParse === 'function') {
              pdfFn = (pdfParse as any).PDFParse
            } else if ((pdfParse as any).pdf && typeof (pdfParse as any).pdf === 'function') {
              pdfFn = (pdfParse as any).pdf
            } else {
              throw new Error('PDF parser function not found in module')
            }
          } catch (importError) {
            console.warn('First import attempt failed:', importError)
            // Method 2: Try require syntax
            try {
              const pdfParse = require('pdf-parse')
              if (typeof pdfParse === 'function') {
                pdfFn = pdfParse
              } else if (pdfParse.default && typeof pdfParse.default === 'function') {
                pdfFn = pdfParse.default
              } else if (pdfParse.PDFParse && typeof pdfParse.PDFParse === 'function') {
                pdfFn = pdfParse.PDFParse
              } else {
                throw new Error('PDF parser not available via require')
              }
            } catch (requireError) {
              console.warn('Require attempt also failed:', requireError)
              throw new Error('PDF parser not available')
            }
          }
          
          const pdfData = await pdfFn(buffer)
          // Clean the text to remove null bytes and invalid UTF-8 sequences
          const cleanText = pdfData.text.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
          return cleanText
        } catch (e) {
          console.warn('PDF extraction via pdf-parse failed, falling back to plain text:', e)
          // For PDF files, try to extract any readable text from the buffer
          // This is a best-effort approach for corrupted or complex PDFs
          try {
            const textContent = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000)) // First 10KB
            const cleanText = textContent
              .replace(/\0/g, '') // Remove null bytes
              .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
              .replace(/[^\x20-\x7E\n\r\t]/g, '') // Keep only printable ASCII and common whitespace
              .trim()
            
            if (cleanText.length > 50) { // If we found substantial text
              return cleanText
            }
          } catch (fallbackError) {
            console.warn('Fallback text extraction also failed:', fallbackError)
          }
          
          // Ultimate fallback - return a generic message
          return 'PDF content could not be extracted. The file was uploaded successfully but text extraction failed.'
        }
        
      case 'docx':
        try {
          const mammothModule = await import('mammoth')
          // Some bundlers expose default, others namespace
          const mammoth = (mammothModule as any).default ?? mammothModule
          const docxResult = await (mammoth as any).extractRawText({ buffer })
          if (docxResult?.value && docxResult.value.trim().length > 0) {
            return docxResult.value
          }
        } catch (e) {
          console.warn('DOCX extraction via mammoth failed, falling back to plain text:', e)
        }
        // Fallback: attempt UTF-8; if binary, this will at least avoid hard failure
        return buffer.toString('utf-8')
      case 'doc':
      case 'rtf':
      case 'odt':
        // Best-effort fallback for lesser-supported formats
        return buffer.toString('utf-8')
        
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
  // For small documents (less than 1.5KB), use a single chunk
  if (text.length < 1500) {
    return [text]
  }
  
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

// Clean text content to remove null bytes and invalid UTF-8 sequences
function cleanTextContent(text: string): string {
  return text
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim()
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
    // Clean the content before processing
    const cleanContent = cleanTextContent(content)
    
    // Split content into chunks
    const textChunks = splitTextIntoChunks(cleanContent)
    
    // Generate embeddings for each chunk (graceful fallback if it fails)
    let embeddings: number[][] = []
    try {
      embeddings = await generateEmbeddings(textChunks)
    } catch (embeddingError) {
      console.warn('Embedding generation failed, proceeding without embeddings:', embeddingError)
      // Create empty embeddings for each chunk so downstream logic can continue
      embeddings = Array.from({ length: textChunks.length }, () => [])
    }
    
    // Create processed chunks
    const chunks = textChunks.map((chunk, index) => ({
      content: chunk,
      chunkIndex: index,
      metadata: {
        embedding: embeddings[index] && embeddings[index].length ? embeddings[index] : undefined,
        category,
        tags,
        type,
      },
    }))
    
    return {
      title,
      content: cleanContent,
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
  const allowedExtensions = ['pdf', 'docx', 'doc', 'rtf', 'odt', 'txt', 'md', 'markdown']
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
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
