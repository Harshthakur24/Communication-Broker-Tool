import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { IntentDetector } from '@/lib/core/intent-detection';
import { CommandRouter, CommandContext } from '@/lib/core/command-router';
import { DocumentRetriever } from '@/lib/rag/retriever';
import { ResponseGenerator } from '@/lib/rag/generator';
import { VectorStore } from '@/lib/rag/vector-store';

const prisma = new PrismaClient();

// Initialize services
const vectorStore = new VectorStore({
  apiKey: process.env.PINECONE_API_KEY || '',
  environment: process.env.PINECONE_ENVIRONMENT || '',
  indexName: process.env.PINECONE_INDEX_NAME || 'ai-communication-hub'
});

const documentRetriever = new DocumentRetriever(vectorStore, prisma);
const responseGenerator = new ResponseGenerator(
  process.env.OPENAI_API_KEY || '',
  'gpt-4'
);

const intentDetector = new IntentDetector();
const commandRouter = new CommandRouter({
  documentRetriever,
  responseGenerator,
  db: prisma,
  integrations: {} // Would be initialized with actual integration services
});

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Get user context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        permissions: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get conversation history
    const conversationHistory = await prisma.chatMessage.findMany({
      where: { sessionId: sessionId || undefined },
      orderBy: { createdAt: 'asc' },
      take: 10,
      select: {
        type: true,
        content: true
      }
    });

    // Detect intent
    const intentResult = await intentDetector.detectIntent(message);

    // Create command context
    const commandContext: CommandContext = {
      userId: user.id,
      sessionId,
      userRole: user.role,
      department: user.department || 'General',
      permissions: user.permissions || [],
      conversationHistory: conversationHistory.map(msg => ({
        role: msg.type as 'user' | 'assistant',
        content: msg.content
      }))
    };

    // Route command
    const commandResult = await commandRouter.routeCommand(intentResult, commandContext);

    // Save message and response to database
    const chatSession = sessionId 
      ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
      : await prisma.chatSession.create({
          data: {
            userId: user.id,
            title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
          }
        });

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Failed to create or find chat session' },
        { status: 500 }
      );
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        type: 'user',
        content: message,
        metadata: {
          intent: intentResult.intent,
          confidence: intentResult.confidence,
          entities: intentResult.entities
        }
      }
    });

    // Save assistant response
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        type: 'assistant',
        content: commandResult.message,
        sources: commandResult.data?.sources || null,
        metadata: {
          intent: intentResult.intent,
          action: intentResult.action,
          success: commandResult.success,
          processingTime: commandResult.data?.metadata?.processingTime || 0
        }
      }
    });

    return NextResponse.json({
      success: commandResult.success,
      message: commandResult.message,
      data: commandResult.data,
      action: commandResult.action,
      sessionId: chatSession.id,
      requiresConfirmation: commandResult.requiresConfirmation,
      followUpActions: commandResult.followUpActions
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}