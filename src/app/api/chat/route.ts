import { NextRequest, NextResponse } from 'next/server';
import { IntentDetector } from '@/core/intent/intentDetector';
import { ContextManager } from '@/core/context/contextManager';
import { CommandRouter } from '@/core/routing/commandRouter';
import { DocumentRetrieverImpl } from '@/rag/retrieval/documentRetriever';
import { EmbeddingServiceImpl } from '@/rag/embedding/embeddingService';
import { PineconeVectorStore } from '@/rag/embedding/vectorStore';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Initialize services
    const contextManager = new ContextManager();
    const intentDetector = new IntentDetector();
    const commandRouter = new CommandRouter();
    
    // Initialize RAG components
    const vectorStore = new PineconeVectorStore(
      process.env.PINECONE_API_KEY!,
      process.env.PINECONE_ENVIRONMENT!,
      process.env.PINECONE_INDEX_NAME!
    );
    const embeddingService = new EmbeddingServiceImpl(
      vectorStore,
      process.env.OPENAI_API_KEY!
    );
    const documentRetriever = new DocumentRetrieverImpl(
      embeddingService,
      vectorStore
    );

    // Get user context
    const userContext = await contextManager.getContext(userId);
    
    // Detect intent
    const intentResult = await intentDetector.detectIntent(message, userContext);
    
    // Create command
    const command = {
      type: intentResult.intent.type,
      intent: intentResult.intent,
      context: userContext,
      parameters: intentResult.intent.parameters,
      timestamp: new Date()
    };

    // Execute command
    const response = await commandRouter.execute(command);

    // Add message to history
    await contextManager.addToHistory(sessionId, {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date(),
      metadata: { intent: intentResult.intent.type }
    });

    // Add assistant response to history
    await contextManager.addToHistory(sessionId, {
      id: `msg_${Date.now() + 1}`,
      type: 'assistant',
      content: response.message,
      timestamp: new Date(),
      sources: response.sources,
      metadata: { 
        confidence: intentResult.confidence,
        commandType: command.type
      }
    });

    return NextResponse.json({
      success: true,
      message: response.message,
      data: response.data,
      sources: response.sources,
      metadata: {
        intent: intentResult.intent.type,
        confidence: intentResult.confidence,
        processingTime: intentResult.processingTime
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Sorry, I encountered an error processing your request. Please try again.'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'SessionId and userId are required' },
        { status: 400 }
      );
    }

    const contextManager = new ContextManager();
    const messages = await contextManager.getConversationHistory(sessionId);

    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata
      }))
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve messages' },
      { status: 500 }
    );
  }
}