import { RetrievedDocument } from './retriever';

export interface GenerationContext {
  query: string;
  retrievedDocuments: RetrievedDocument[];
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  userContext?: {
    userId: string;
    role: string;
    department: string;
  };
  systemPrompt?: string;
}

export interface GeneratedResponse {
  content: string;
  sources: Array<{
    documentId: string;
    title: string;
    relevanceScore: number;
    chunks: Array<{
      content: string;
      relevanceScore: number;
    }>;
  }>;
  metadata: {
    intent: string;
    confidence: number;
    processingTime: number;
    tokenCount: number;
  };
}

export class ResponseGenerator {
  private openaiApiKey: string;
  private model: string;

  constructor(openaiApiKey: string, model: string = 'gpt-4') {
    this.openaiApiKey = openaiApiKey;
    this.model = model;
  }

  /**
   * Generate response using RAG
   */
  async generateResponse(context: GenerationContext): Promise<GeneratedResponse> {
    const startTime = Date.now();

    try {
      // Build context from retrieved documents
      const documentContext = this.buildDocumentContext(context.retrievedDocuments);
      
      // Create conversation context
      const conversationContext = this.buildConversationContext(context.conversationHistory);
      
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Create messages for OpenAI
      const messages = this.createMessages(
        systemPrompt,
        conversationContext,
        documentContext,
        context.query
      );

      // Generate response
      const response = await this.callOpenAI(messages);
      
      // Extract sources
      const sources = this.extractSources(context.retrievedDocuments);
      
      // Detect intent and calculate confidence
      const intent = this.detectIntent(context.query);
      const confidence = this.calculateConfidence(response, context.retrievedDocuments);

      const processingTime = (Date.now() - startTime) / 1000;

      return {
        content: response,
        sources,
        metadata: {
          intent,
          confidence,
          processingTime,
          tokenCount: this.estimateTokenCount(response),
        },
      };
    } catch (error) {
      console.error('Response generation failed:', error);
      throw new Error('Failed to generate response');
    }
  }

  /**
   * Build document context from retrieved documents
   */
  private buildDocumentContext(documents: RetrievedDocument[]): string {
    if (documents.length === 0) {
      return 'No relevant documents found.';
    }

    let context = 'Relevant information from company documents:\n\n';
    
    documents.forEach((doc, index) => {
      context += `Document ${index + 1}: ${doc.title}\n`;
      context += `Category: ${doc.category || 'General'}\n`;
      context += `Relevance: ${(doc.relevanceScore * 100).toFixed(1)}%\n\n`;
      
      // Add most relevant chunks
      const topChunks = doc.chunks
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);
      
      topChunks.forEach((chunk, chunkIndex) => {
        context += `Section ${chunkIndex + 1}:\n${chunk.content}\n\n`;
      });
      
      context += '---\n\n';
    });

    return context;
  }

  /**
   * Build conversation context
   */
  private buildConversationContext(history?: Array<{ role: string; content: string }>): string {
    if (!history || history.length === 0) {
      return '';
    }

    let context = 'Previous conversation:\n';
    history.slice(-6).forEach((message, index) => {
      context += `${message.role}: ${message.content}\n`;
    });
    context += '\n';

    return context;
  }

  /**
   * Build system prompt
   */
  private buildSystemPrompt(context: GenerationContext): string {
    const basePrompt = `You are an AI assistant for an internal company communication hub. Your role is to help employees with:

1. Project updates and status information
2. Company policies and procedures
3. Team communications and announcements
4. Document search and information retrieval
5. General company knowledge

Guidelines:
- Always provide accurate, up-to-date information based on the retrieved documents
- If you don't have specific information, say so clearly
- Be concise but comprehensive in your responses
- Use a professional, helpful tone
- Always cite your sources when providing information
- If asked to perform actions (like updating project status), explain what would need to be done
- Maintain context from previous messages in the conversation

Current user context:
- Role: ${context.userContext?.role || 'Employee'}
- Department: ${context.userContext?.department || 'General'}`;

    return context.systemPrompt || basePrompt;
  }

  /**
   * Create messages for OpenAI API
   */
  private createMessages(
    systemPrompt: string,
    conversationContext: string,
    documentContext: string,
    query: string
  ): Array<{ role: string; content: string }> {
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    if (conversationContext) {
      messages.push({
        role: 'system',
        content: conversationContext
      });
    }

    if (documentContext) {
      messages.push({
        role: 'system',
        content: documentContext
      });
    }

    messages.push({
      role: 'user',
      content: query
    });

    return messages;
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw new Error('Failed to generate response from AI');
    }
  }

  /**
   * Extract sources from retrieved documents
   */
  private extractSources(documents: RetrievedDocument[]): Array<{
    documentId: string;
    title: string;
    relevanceScore: number;
    chunks: Array<{
      content: string;
      relevanceScore: number;
    }>;
  }> {
    return documents.map(doc => ({
      documentId: doc.id,
      title: doc.title,
      relevanceScore: doc.relevanceScore,
      chunks: doc.chunks.map(chunk => ({
        content: chunk.content,
        relevanceScore: chunk.relevanceScore,
      })),
    }));
  }

  /**
   * Detect intent from query
   */
  private detectIntent(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('update') || lowerQuery.includes('change') || lowerQuery.includes('modify')) {
      return 'update_request';
    }
    
    if (lowerQuery.includes('what') || lowerQuery.includes('how') || lowerQuery.includes('when') || lowerQuery.includes('where')) {
      return 'information_query';
    }
    
    if (lowerQuery.includes('summarize') || lowerQuery.includes('summary')) {
      return 'summary_request';
    }
    
    if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('look for')) {
      return 'search_request';
    }
    
    if (lowerQuery.includes('status') || lowerQuery.includes('progress')) {
      return 'status_query';
    }
    
    return 'general_query';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(response: string, documents: RetrievedDocument[]): number {
    if (documents.length === 0) {
      return 0.3; // Low confidence if no documents found
    }
    
    // Base confidence on document relevance scores
    const avgRelevance = documents.reduce((sum, doc) => sum + doc.relevanceScore, 0) / documents.length;
    
    // Adjust based on response length and specificity
    const responseLength = response.length;
    const hasSpecificInfo = response.includes('Document') || response.includes('According to') || response.includes('Based on');
    
    let confidence = avgRelevance;
    
    if (responseLength > 100 && hasSpecificInfo) {
      confidence = Math.min(confidence + 0.1, 1.0);
    }
    
    if (responseLength < 50) {
      confidence = Math.max(confidence - 0.2, 0.1);
    }
    
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Estimate token count
   */
  private estimateTokenCount(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate follow-up questions
   */
  generateFollowUpQuestions(response: string, context: GenerationContext): string[] {
    const questions: string[] = [];
    
    // Extract key topics from the response
    const topics = this.extractTopics(response);
    
    // Generate relevant follow-up questions
    topics.forEach(topic => {
      if (topic.toLowerCase().includes('project')) {
        questions.push(`What is the current status of ${topic}?`);
        questions.push(`Who is working on ${topic}?`);
      }
      
      if (topic.toLowerCase().includes('policy')) {
        questions.push(`When was this policy last updated?`);
        questions.push(`Are there any exceptions to this policy?`);
      }
      
      if (topic.toLowerCase().includes('team')) {
        questions.push(`Who are the team members?`);
        questions.push(`What are the team's current priorities?`);
      }
    });
    
    return questions.slice(0, 3); // Return top 3 questions
  }

  /**
   * Extract topics from text
   */
  private extractTopics(text: string): string[] {
    // Simple topic extraction (in production, use NLP libraries)
    const words = text.toLowerCase().split(/\s+/);
    const topics = new Set<string>();
    
    const topicKeywords = ['project', 'policy', 'team', 'department', 'process', 'procedure', 'guideline'];
    
    topicKeywords.forEach(keyword => {
      if (words.some(word => word.includes(keyword))) {
        topics.add(keyword);
      }
    });
    
    return Array.from(topics);
  }
}