import { BaseHandler } from './baseHandler';
import { Command, UserContext, Response, CommandType } from '../commandRouter';

export class SearchHandler extends BaseHandler {
  canHandle(command: Command): boolean {
    return command.type === CommandType.SEARCH;
  }

  async execute(command: Command): Promise<Response> {
    try {
      const { query } = command.parameters;
      
      if (!query) {
        return this.createErrorResponse('Search command requires a query');
      }

      // Determine search type and route accordingly
      const searchType = this.determineSearchType(query);
      
      switch (searchType) {
        case 'document_search':
          return await this.searchDocuments(command);
        case 'project_search':
          return await this.searchProjects(command);
        case 'user_search':
          return await this.searchUsers(command);
        case 'knowledge_search':
          return await this.searchKnowledge(command);
        default:
          return this.createErrorResponse('Unknown search type');
      }
    } catch (error) {
      console.error('Search handler error:', error);
      return this.createErrorResponse('Search failed', { error: error.message });
    }
  }

  async validate(command: Command, user: UserContext): Promise<boolean> {
    // Check if user has read permissions
    if (!this.hasPermission(user, 'read:knowledge_base')) {
      return false;
    }

    return true;
  }

  private determineSearchType(query: string): string {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('document') || queryLower.includes('file') || queryLower.includes('pdf')) {
      return 'document_search';
    }

    if (queryLower.includes('project') || queryLower.includes('task')) {
      return 'project_search';
    }

    if (queryLower.includes('user') || queryLower.includes('employee') || queryLower.includes('team member')) {
      return 'user_search';
    }

    return 'knowledge_search';
  }

  private async searchDocuments(command: Command): Promise<Response> {
    const { query } = command.parameters;
    
    try {
      // Simulate search in document repository
      const searchResults = await this.simulateDocumentSearch(query);
      
      await this.logAction(
        command.context.userId,
        'document_search',
        { query }
      );

      return this.createSuccessResponse(
        `Found ${searchResults.length} documents matching "${query}"`,
        searchResults,
        searchResults.map(result => ({
          title: result.title,
          type: 'document',
          confidence: result.confidence
        }))
      );
    } catch (error) {
      console.error('Document search error:', error);
      return this.createErrorResponse('Failed to search documents', { error: error.message });
    }
  }

  private async searchProjects(command: Command): Promise<Response> {
    const { query } = command.parameters;
    
    try {
      // Simulate search in project repository
      const searchResults = await this.simulateProjectSearch(query);
      
      await this.logAction(
        command.context.userId,
        'project_search',
        { query }
      );

      return this.createSuccessResponse(
        `Found ${searchResults.length} projects matching "${query}"`,
        searchResults,
        searchResults.map(result => ({
          title: result.name,
          type: 'project',
          confidence: result.confidence
        }))
      );
    } catch (error) {
      console.error('Project search error:', error);
      return this.createErrorResponse('Failed to search projects', { error: error.message });
    }
  }

  private async searchUsers(command: Command): Promise<Response> {
    const { query } = command.parameters;
    
    try {
      // Simulate search in user directory
      const searchResults = await this.simulateUserSearch(query);
      
      await this.logAction(
        command.context.userId,
        'user_search',
        { query }
      );

      return this.createSuccessResponse(
        `Found ${searchResults.length} users matching "${query}"`,
        searchResults,
        searchResults.map(result => ({
          title: result.name,
          type: 'user',
          confidence: result.confidence
        }))
      );
    } catch (error) {
      console.error('User search error:', error);
      return this.createErrorResponse('Failed to search users', { error: error.message });
    }
  }

  private async searchKnowledge(command: Command): Promise<Response> {
    const { query } = command.parameters;
    
    try {
      // Simulate search in knowledge base
      const searchResults = await this.simulateKnowledgeSearch(query);
      
      await this.logAction(
        command.context.userId,
        'knowledge_search',
        { query }
      );

      return this.createSuccessResponse(
        `Found ${searchResults.length} knowledge items matching "${query}"`,
        searchResults,
        searchResults.map(result => ({
          title: result.title,
          type: 'knowledge',
          confidence: result.confidence
        }))
      );
    } catch (error) {
      console.error('Knowledge search error:', error);
      return this.createErrorResponse('Failed to search knowledge base', { error: error.message });
    }
  }

  private async simulateDocumentSearch(query: string): Promise<any[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock search results
    return [
      {
        id: 'doc1',
        title: 'Company Policy Document',
        content: 'This document contains company policies...',
        type: 'PDF',
        confidence: 0.95,
        lastModified: '2024-01-15'
      },
      {
        id: 'doc2',
        title: 'Employee Handbook',
        content: 'Employee handbook with guidelines...',
        type: 'PDF',
        confidence: 0.88,
        lastModified: '2024-01-10'
      },
      {
        id: 'doc3',
        title: 'Technical Documentation',
        content: 'Technical documentation for developers...',
        type: 'MD',
        confidence: 0.82,
        lastModified: '2024-01-20'
      }
    ].filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  private async simulateProjectSearch(query: string): Promise<any[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock search results
    return [
      {
        id: 'proj1',
        name: 'Alpha Project',
        description: 'Main product development project',
        status: 'In Progress',
        confidence: 0.92,
        team: ['John Doe', 'Jane Smith']
      },
      {
        id: 'proj2',
        name: 'Beta Project',
        description: 'Secondary product development',
        status: 'Planning',
        confidence: 0.85,
        team: ['Bob Johnson', 'Alice Brown']
      },
      {
        id: 'proj3',
        name: 'Gamma Project',
        description: 'Research and development project',
        status: 'Completed',
        confidence: 0.78,
        team: ['Charlie Wilson', 'Diana Davis']
      }
    ].filter(proj => 
      proj.name.toLowerCase().includes(query.toLowerCase()) ||
      proj.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  private async simulateUserSearch(query: string): Promise<any[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock search results
    return [
      {
        id: 'user1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        role: 'Senior Developer',
        confidence: 0.95
      },
      {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        department: 'Marketing',
        role: 'Marketing Manager',
        confidence: 0.88
      },
      {
        id: 'user3',
        name: 'Bob Johnson',
        email: 'bob.johnson@company.com',
        department: 'HR',
        role: 'HR Specialist',
        confidence: 0.82
      }
    ].filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.department.toLowerCase().includes(query.toLowerCase())
    );
  }

  private async simulateKnowledgeSearch(query: string): Promise<any[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock search results
    return [
      {
        id: 'kb1',
        title: 'How to Submit a Vacation Request',
        content: 'Step-by-step guide for submitting vacation requests...',
        category: 'HR',
        confidence: 0.90,
        lastUpdated: '2024-01-15'
      },
      {
        id: 'kb2',
        title: 'Company Security Guidelines',
        content: 'Security best practices and guidelines...',
        category: 'IT',
        confidence: 0.85,
        lastUpdated: '2024-01-10'
      },
      {
        id: 'kb3',
        title: 'Project Management Best Practices',
        content: 'Guidelines for effective project management...',
        category: 'Management',
        confidence: 0.88,
        lastUpdated: '2024-01-20'
      }
    ].filter(kb => 
      kb.title.toLowerCase().includes(query.toLowerCase()) ||
      kb.content.toLowerCase().includes(query.toLowerCase()) ||
      kb.category.toLowerCase().includes(query.toLowerCase())
    );
  }
}