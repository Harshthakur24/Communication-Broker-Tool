import { UserContext, ChatMessage, UserPreferences, UserRole } from '../intent/types';
import { prisma } from '@/lib/database';

export class ContextManager {
  private contextCache: Map<string, UserContext> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  async getContext(userId: string): Promise<UserContext> {
    // Check cache first
    const cached = this.contextCache.get(userId);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    // Load from database
    const context = await this.loadContextFromDatabase(userId);
    
    // Cache the context
    this.contextCache.set(userId, context);
    
    return context;
  }

  async updateContext(userId: string, updates: Partial<UserContext>): Promise<void> {
    const currentContext = await this.getContext(userId);
    const updatedContext = { ...currentContext, ...updates };
    
    // Update cache
    this.contextCache.set(userId, updatedContext);
    
    // Persist to database
    await this.persistContextToDatabase(userId, updatedContext);
  }

  async addToHistory(sessionId: string, message: ChatMessage): Promise<void> {
    try {
      await prisma.chatMessage.create({
        data: {
          id: message.id,
          sessionId,
          type: message.type,
          content: message.content,
          metadata: message.metadata || {},
          createdAt: message.timestamp
        }
      });

      // Update context cache if it exists
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { user: true }
      });

      if (session) {
        const context = this.contextCache.get(session.userId);
        if (context) {
          context.conversationHistory.push(message);
          this.contextCache.set(session.userId, context);
        }
      }
    } catch (error) {
      console.error('Error adding message to history:', error);
      throw error;
    }
  }

  async getConversationHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: limit
      });

      return messages.map(msg => ({
        id: msg.id,
        type: msg.type as any,
        content: msg.content,
        timestamp: msg.createdAt,
        metadata: msg.metadata as Record<string, any> || {}
      }));
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  async createSession(userId: string, title?: string): Promise<string> {
    try {
      const session = await prisma.chatSession.create({
        data: {
          userId,
          title: title || `Chat ${new Date().toLocaleString()}`,
          isActive: true
        }
      });

      return session.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async getActiveSession(userId: string): Promise<string | null> {
    try {
      const session = await prisma.chatSession.findFirst({
        where: {
          userId,
          isActive: true
        },
        orderBy: { updatedAt: 'desc' }
      });

      return session?.id || null;
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  }

  async updateSession(sessionId: string, updates: { title?: string; isActive?: boolean }): Promise<void> {
    try {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true }
      });

      if (user?.preferences) {
        return user.preferences as UserPreferences;
      }

      // Return default preferences
      return this.getDefaultPreferences();
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const currentPreferences = await this.getUserPreferences(userId);
      const updatedPreferences = { ...currentPreferences, ...preferences };

      await prisma.user.update({
        where: { id: userId },
        data: { preferences: updatedPreferences }
      });

      // Update context cache
      const context = this.contextCache.get(userId);
      if (context) {
        context.preferences = updatedPreferences;
        this.contextCache.set(userId, context);
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async clearContext(userId: string): Promise<void> {
    this.contextCache.delete(userId);
  }

  private async loadContextFromDatabase(userId: string): Promise<UserContext> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          chatSessions: {
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' },
            take: 1,
            include: {
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 20
              }
            }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const activeSession = user.chatSessions[0];
      const conversationHistory = activeSession?.messages.map(msg => ({
        id: msg.id,
        type: msg.type as any,
        content: msg.content,
        timestamp: msg.createdAt,
        metadata: msg.metadata as Record<string, any> || {}
      })) || [];

      const preferences = user.preferences as UserPreferences || this.getDefaultPreferences();

      return {
        userId: user.id,
        sessionId: activeSession?.id || '',
        role: user.role as UserRole,
        permissions: user.permissions as string[] || [],
        department: user.department || undefined,
        currentProject: undefined, // This would be set based on recent activity
        conversationHistory,
        preferences
      };
    } catch (error) {
      console.error('Error loading context from database:', error);
      throw error;
    }
  }

  private async persistContextToDatabase(userId: string, context: UserContext): Promise<void> {
    try {
      // Update user preferences
      await prisma.user.update({
        where: { id: userId },
        data: {
          preferences: context.preferences,
          updatedAt: new Date()
        }
      });

      // Update session if it exists
      if (context.sessionId) {
        await prisma.chatSession.update({
          where: { id: context.sessionId },
          data: { updatedAt: new Date() }
        });
      }
    } catch (error) {
      console.error('Error persisting context to database:', error);
      throw error;
    }
  }

  private isCacheValid(context: UserContext): boolean {
    // Simple TTL check - in production, you'd want more sophisticated caching
    return true; // For now, always consider cache valid
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      language: 'en',
      timezone: 'UTC',
      notificationSettings: {
        email: true,
        push: true,
        slack: false,
        teams: false
      },
      uiPreferences: {
        theme: 'light',
        sidebarCollapsed: false,
        chatLayout: 'single'
      }
    };
  }
}