import { Document, DocumentChunk } from '@prisma/client';
import mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';

export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  category?: string;
  tags: string[];
  chunks: ProcessedChunk[];
  metadata: {
    wordCount: number;
    pageCount?: number;
    language?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface ProcessedChunk {
  id: string;
  content: string;
  chunkIndex: number;
  metadata: {
    section?: string;
    pageNumber?: number;
    wordCount: number;
    tokenCount: number;
    position: {
      start: number;
      end: number;
    };
  };
}

export class DocumentProcessor {
  private readonly CHUNK_SIZE = 1000; // Characters per chunk
  private readonly CHUNK_OVERLAP = 200; // Overlap between chunks
  private readonly MAX_CHUNK_SIZE = 1500; // Maximum chunk size

  /**
   * Process a document and extract text content based on file type
   */
  async processDocument(file: File, documentData: Partial<Document>): Promise<ProcessedDocument> {
    const content = await this.extractTextContent(file, documentData.type || 'txt');
    const chunks = this.createChunks(content, documentData.title || 'Untitled');
    
    return {
      id: documentData.id || '',
      title: documentData.title || 'Untitled',
      content,
      type: documentData.type || 'txt',
      category: documentData.category || undefined,
      tags: documentData.tags || [],
      chunks,
      metadata: {
        wordCount: this.countWords(content),
        pageCount: this.estimatePageCount(content),
        language: this.detectLanguage(content),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }

  /**
   * Extract text content from various file types
   */
  private async extractTextContent(file: File, type: string): Promise<string> {
    const buffer = await file.arrayBuffer();
    
    switch (type.toLowerCase()) {
      case 'pdf':
        return this.extractFromPDF(buffer);
      case 'docx':
        return this.extractFromDocx(buffer);
      case 'txt':
      case 'md':
      case 'markdown':
        return this.extractFromText(buffer);
      case 'html':
        return this.extractFromHTML(buffer);
      default:
        throw new Error(`Unsupported file type: ${type}`);
    }
  }

  /**
   * Extract text from PDF files
   */
  private async extractFromPDF(buffer: ArrayBuffer): Promise<string> {
    try {
      const data = await pdfParse(Buffer.from(buffer));
      return data.text;
    } catch (error) {
      console.error('Error extracting PDF content:', error);
      throw new Error('Failed to extract PDF content');
    }
  }

  /**
   * Extract text from DOCX files
   */
  private async extractFromDocx(buffer: ArrayBuffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      return result.value;
    } catch (error) {
      console.error('Error extracting DOCX content:', error);
      throw new Error('Failed to extract DOCX content');
    }
  }

  /**
   * Extract text from plain text files
   */
  private async extractFromText(buffer: ArrayBuffer): Promise<string> {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }

  /**
   * Extract text from HTML files
   */
  private async extractFromHTML(buffer: ArrayBuffer): Promise<string> {
    const decoder = new TextDecoder('utf-8');
    const html = decoder.decode(buffer);
    
    // Simple HTML tag removal (in production, use a proper HTML parser)
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Create chunks from document content
   */
  private createChunks(content: string, title: string): ProcessedChunk[] {
    const chunks: ProcessedChunk[] = [];
    const sentences = this.splitIntoSentences(content);
    let currentChunk = '';
    let chunkIndex = 0;
    let position = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;

      if (potentialChunk.length > this.CHUNK_SIZE && currentChunk) {
        // Create chunk from current content
        chunks.push(this.createChunkFromContent(
          currentChunk,
          chunkIndex,
          position,
          title
        ));
        
        // Start new chunk with overlap
        const overlapText = this.getOverlapText(currentChunk);
        currentChunk = overlapText + (overlapText ? ' ' : '') + sentence;
        position += currentChunk.length - overlapText.length;
        chunkIndex++;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add the last chunk if it has content
    if (currentChunk.trim()) {
      chunks.push(this.createChunkFromContent(
        currentChunk,
        chunkIndex,
        position,
        title
      ));
    }

    return chunks;
  }

  /**
   * Create a chunk from content with metadata
   */
  private createChunkFromContent(
    content: string,
    chunkIndex: number,
    position: number,
    title: string
  ): ProcessedChunk {
    const trimmedContent = content.trim();
    
    return {
      id: `${title}-chunk-${chunkIndex}`,
      content: trimmedContent,
      chunkIndex,
      metadata: {
        section: this.detectSection(trimmedContent),
        wordCount: this.countWords(trimmedContent),
        tokenCount: this.estimateTokenCount(trimmedContent),
        position: {
          start: position,
          end: position + trimmedContent.length,
        },
      },
    };
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting (in production, use a proper NLP library)
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Get overlap text from the end of a chunk
   */
  private getOverlapText(chunk: string): string {
    const words = chunk.split(' ');
    const overlapWords = Math.floor(this.CHUNK_OVERLAP / 5); // Approximate words
    return words.slice(-overlapWords).join(' ');
  }

  /**
   * Detect section headers in content
   */
  private detectSection(content: string): string | undefined {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 100) {
        // Simple heuristic for section headers
        if (trimmed.match(/^[A-Z][A-Z\s]+$/) || // ALL CAPS
            trimmed.match(/^\d+\.\s/) || // Numbered
            trimmed.match(/^[A-Z][a-z]+:/)) { // Title case with colon
          return trimmed;
        }
      }
    }
    return undefined;
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokenCount(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Estimate page count based on content length
   */
  private estimatePageCount(content: string): number {
    // Rough approximation: 500 words per page
    const wordCount = this.countWords(content);
    return Math.ceil(wordCount / 500);
  }

  /**
   * Detect language of content
   */
  private detectLanguage(content: string): string {
    // Simple language detection based on common words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = content.toLowerCase().split(/\s+/);
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    
    return englishCount > words.length * 0.1 ? 'en' : 'unknown';
  }

  /**
   * Generate embeddings for document chunks
   */
  async generateEmbeddings(chunks: ProcessedChunk[]): Promise<Array<{ id: string; embedding: number[] }>> {
    // This would integrate with an embedding service like OpenAI
    // For now, return placeholder embeddings
    return chunks.map(chunk => ({
      id: chunk.id,
      embedding: new Array(1536).fill(0).map(() => Math.random() - 0.5) // Placeholder
    }));
  }

  /**
   * Update document chunks in database
   */
  async updateDocumentChunks(
    documentId: string,
    chunks: ProcessedChunk[],
    embeddings: Array<{ id: string; embedding: number[] }>
  ): Promise<void> {
    // This would update the database with the new chunks and embeddings
    // Implementation would depend on your database setup
    console.log(`Updating ${chunks.length} chunks for document ${documentId}`);
  }
}