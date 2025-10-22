import { BaseHandler } from './baseHandler';
import { Command, UserContext, Response, CommandType } from '../commandRouter';

export class QueryHandler extends BaseHandler {
  canHandle(command: Command): boolean {
    return command.type === CommandType.QUERY;
  }

  async execute(command: Command): Promise<Response> {
    try {
      const { subject } = command.parameters;
      
      if (!subject) {
        return this.createErrorResponse('Query command requires a subject to search for');
      }

      // Determine query type and route accordingly
      const queryType = this.determineQueryType(subject);
      
      switch (queryType) {
        case 'project_status':
          return await this.queryProjectStatus(command);
        case 'policy_info':
          return await this.queryPolicyInfo(command);
        case 'procedure_help':
          return await this.queryProcedureHelp(command);
        case 'user_info':
          return await this.queryUserInfo(command);
        case 'general_knowledge':
          return await this.queryGeneralKnowledge(command);
        default:
          return this.createErrorResponse('Unknown query type');
      }
    } catch (error) {
      console.error('Query handler error:', error);
      return this.createErrorResponse('Query failed', { error: error.message });
    }
  }

  async validate(command: Command, user: UserContext): Promise<boolean> {
    // Check if user has read permissions
    if (!this.hasPermission(user, 'read:knowledge_base')) {
      return false;
    }

    return true;
  }

  private determineQueryType(subject: string): string {
    const subjectLower = subject.toLowerCase();

    if (subjectLower.includes('project') || subjectLower.includes('task')) {
      return 'project_status';
    }

    if (subjectLower.includes('policy') || subjectLower.includes('rule')) {
      return 'policy_info';
    }

    if (subjectLower.includes('how') || subjectLower.includes('procedure') || subjectLower.includes('process')) {
      return 'procedure_help';
    }

    if (subjectLower.includes('user') || subjectLower.includes('employee') || subjectLower.includes('team member')) {
      return 'user_info';
    }

    return 'general_knowledge';
  }

  private async queryProjectStatus(command: Command): Promise<Response> {
    const { subject } = command.parameters;
    
    try {
      const projectId = this.extractProjectId(subject);
      
      if (!projectId) {
        return this.createErrorResponse('Could not identify project to query');
      }

      // Simulate API call to project management system
      const projectInfo = await this.simulateProjectQuery(projectId);
      
      await this.logAction(
        command.context.userId,
        'project_status_query',
        { projectId, subject }
      );

      return this.createSuccessResponse(
        `Project ${projectId} is currently ${projectInfo.status}`,
        projectInfo,
        [{
          title: `Project ${projectId}`,
          type: 'project',
          confidence: 0.95
        }]
      );
    } catch (error) {
      console.error('Project status query error:', error);
      return this.createErrorResponse('Failed to query project status', { error: error.message });
    }
  }

  private async queryPolicyInfo(command: Command): Promise<Response> {
    const { subject } = command.parameters;
    
    try {
      // Simulate search in knowledge base
      const policyInfo = await this.simulatePolicyQuery(subject);
      
      await this.logAction(
        command.context.userId,
        'policy_query',
        { subject }
      );

      return this.createSuccessResponse(
        `Here's what I found about ${subject}:`,
        policyInfo,
        [{
          title: policyInfo.title,
          type: 'policy',
          confidence: 0.9
        }]
      );
    } catch (error) {
      console.error('Policy query error:', error);
      return this.createErrorResponse('Failed to query policy information', { error: error.message });
    }
  }

  private async queryProcedureHelp(command: Command): Promise<Response> {
    const { subject } = command.parameters;
    
    try {
      // Simulate search in knowledge base
      const procedureInfo = await this.simulateProcedureQuery(subject);
      
      await this.logAction(
        command.context.userId,
        'procedure_query',
        { subject }
      );

      return this.createSuccessResponse(
        `Here's how to ${subject}:`,
        procedureInfo,
        [{
          title: procedureInfo.title,
          type: 'procedure',
          confidence: 0.85
        }]
      );
    } catch (error) {
      console.error('Procedure query error:', error);
      return this.createErrorResponse('Failed to query procedure information', { error: error.message });
    }
  }

  private async queryUserInfo(command: Command): Promise<Response> {
    const { subject } = command.parameters;
    
    try {
      const userId = this.extractUserId(subject);
      
      if (!userId) {
        return this.createErrorResponse('Could not identify user to query');
      }

      // Simulate API call to user management system
      const userInfo = await this.simulateUserQuery(userId);
      
      await this.logAction(
        command.context.userId,
        'user_query',
        { userId, subject }
      );

      return this.createSuccessResponse(
        `Here's information about ${userInfo.name}:`,
        userInfo,
        [{
          title: userInfo.name,
          type: 'user',
          confidence: 0.9
        }]
      );
    } catch (error) {
      console.error('User query error:', error);
      return this.createErrorResponse('Failed to query user information', { error: error.message });
    }
  }

  private async queryGeneralKnowledge(command: Command): Promise<Response> {
    const { subject } = command.parameters;
    
    try {
      // Simulate search in knowledge base
      const knowledgeInfo = await this.simulateKnowledgeQuery(subject);
      
      await this.logAction(
        command.context.userId,
        'general_knowledge_query',
        { subject }
      );

      return this.createSuccessResponse(
        `Here's what I found about ${subject}:`,
        knowledgeInfo,
        [{
          title: knowledgeInfo.title,
          type: 'knowledge',
          confidence: 0.8
        }]
      );
    } catch (error) {
      console.error('General knowledge query error:', error);
      return this.createErrorResponse('Failed to query knowledge base', { error: error.message });
    }
  }

  private extractProjectId(subject: string): string | null {
    // Simple extraction - in production, this would be more sophisticated
    const match = subject.match(/(?:project\s+)?([a-zA-Z0-9\-_]+)/i);
    return match ? match[1] : null;
  }

  private extractUserId(subject: string): string | null {
    // Simple extraction - in production, this would be more sophisticated
    const match = subject.match(/(?:user\s+)?([a-zA-Z0-9\-_]+)/i);
    return match ? match[1] : null;
  }

  private async simulateProjectQuery(projectId: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      id: projectId,
      name: `Project ${projectId}`,
      status: 'In Progress',
      progress: 65,
      team: ['John Doe', 'Jane Smith'],
      deadline: '2024-02-15'
    };
  }

  private async simulatePolicyQuery(subject: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      title: `${subject} Policy`,
      content: `This policy covers ${subject} and includes guidelines for...`,
      version: '2.1',
      lastUpdated: '2024-01-15',
      department: 'HR'
    };
  }

  private async simulateProcedureQuery(subject: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      title: `How to ${subject}`,
      steps: [
        'Step 1: Access the system',
        'Step 2: Navigate to the appropriate section',
        'Step 3: Follow the outlined process',
        'Step 4: Submit your request'
      ],
      estimatedTime: '15 minutes',
      requiredPermissions: ['read:system']
    };
  }

  private async simulateUserQuery(userId: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      id: userId,
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      role: 'Senior Developer',
      status: 'Active',
      lastLogin: '2024-01-20'
    };
  }

  private async simulateKnowledgeQuery(subject: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      title: `Information about ${subject}`,
      content: `Here's comprehensive information about ${subject}...`,
      sources: ['Company Wiki', 'Internal Documentation'],
      lastUpdated: '2024-01-10'
    };
  }
}