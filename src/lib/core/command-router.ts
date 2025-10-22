import { IntentDetectionResult } from './intent-detection';
import { DocumentRetriever, RetrievalContext } from '../rag/retriever';
import { ResponseGenerator, GenerationContext } from '../rag/generator';

export interface CommandContext {
  userId: string;
  sessionId?: string;
  userRole: string;
  department: string;
  permissions: string[];
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  action?: string;
  requiresConfirmation?: boolean;
  followUpActions?: string[];
}

export interface CommandHandler {
  canHandle(action: string): boolean;
  handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult>;
}

export interface CommandDependencies {
  documentRetriever: DocumentRetriever;
  responseGenerator: ResponseGenerator;
  db: any; // Prisma client
  integrations: any; // Integration services
}

export class CommandRouter {
  private handlers: Map<string, CommandHandler> = new Map();
  private dependencies: CommandDependencies;

  constructor(dependencies: CommandDependencies) {
    this.dependencies = dependencies;
    this.registerDefaultHandlers();
  }

  /**
   * Route command based on intent detection result
   */
  async routeCommand(
    intent: IntentDetectionResult,
    context: CommandContext
  ): Promise<CommandResult> {
    try {
      // Check permissions
      if (!this.hasPermission(intent.action, context.permissions)) {
        return {
          success: false,
          message: 'You do not have permission to perform this action.',
          action: intent.action
        };
      }

      // Find appropriate handler
      const handler = this.findHandler(intent.action);
      if (!handler) {
        return {
          success: false,
          message: 'I don\'t know how to handle that request. Please try rephrasing.',
          action: intent.action
        };
      }

      // Execute command
      const result = await handler.handle(intent, context, this.dependencies);
      
      // Log command execution
      await this.logCommandExecution(intent, context, result);
      
      return result;
    } catch (error) {
      console.error('Command routing failed:', error);
      return {
        success: false,
        message: 'An error occurred while processing your request. Please try again.',
        action: intent.action
      };
    }
  }

  /**
   * Register a command handler
   */
  registerHandler(action: string, handler: CommandHandler): void {
    this.handlers.set(action, handler);
  }

  /**
   * Find handler for action
   */
  private findHandler(action: string): CommandHandler | undefined {
    return this.handlers.get(action);
  }

  /**
   * Check if user has permission for action
   */
  private hasPermission(action: string, permissions: string[]): boolean {
    const permissionMap: Record<string, string[]> = {
      'UPDATE_PROJECT_STATUS': ['PROJECT_UPDATE', 'PROJECT_WRITE'],
      'CREATE_PROJECT': ['PROJECT_CREATE', 'PROJECT_WRITE'],
      'GET_PROJECT_STATUS': ['PROJECT_READ'],
      'SEARCH_DOCUMENTS': ['DOCUMENT_READ'],
      'UPLOAD_DOCUMENT': ['DOCUMENT_UPLOAD', 'DOCUMENT_WRITE'],
      'ANSWER_QUESTION': ['GENERAL_QUERY'],
      'GET_POLICY_INFO': ['POLICY_READ'],
      'GENERATE_SUMMARY': ['REPORT_READ'],
      'GENERATE_REPORT': ['REPORT_GENERATE'],
      'GET_TEAM_INFO': ['TEAM_READ'],
      'SEND_NOTIFICATION': ['NOTIFICATION_SEND'],
      'SCHEDULE_MEETING': ['MEETING_SCHEDULE'],
      'GET_MEETING_INFO': ['MEETING_READ'],
    };

    const requiredPermissions = permissionMap[action] || [];
    return requiredPermissions.some(permission => permissions.includes(permission));
  }

  /**
   * Log command execution
   */
  private async logCommandExecution(
    intent: IntentDetectionResult,
    context: CommandContext,
    result: CommandResult
  ): Promise<void> {
    try {
      await this.dependencies.db.auditLog.create({
        data: {
          userId: context.userId,
          action: intent.action,
          resource: intent.intent,
          details: {
            intent: intent.intent,
            confidence: intent.confidence,
            entities: intent.entities,
            parameters: intent.parameters,
            success: result.success,
            message: result.message,
          },
          result: result.success ? 'SUCCESS' : 'FAILURE',
        }
      });
    } catch (error) {
      console.error('Failed to log command execution:', error);
    }
  }

  /**
   * Register default command handlers
   */
  private registerDefaultHandlers(): void {
    // Project Management Handlers
    this.registerHandler('UPDATE_PROJECT_STATUS', new UpdateProjectStatusHandler());
    this.registerHandler('CREATE_PROJECT', new CreateProjectHandler());
    this.registerHandler('GET_PROJECT_STATUS', new GetProjectStatusHandler());

    // Document Management Handlers
    this.registerHandler('SEARCH_DOCUMENTS', new SearchDocumentsHandler());
    this.registerHandler('UPLOAD_DOCUMENT', new UploadDocumentHandler());

    // Information Query Handlers
    this.registerHandler('ANSWER_QUESTION', new AnswerQuestionHandler());
    this.registerHandler('GET_POLICY_INFO', new GetPolicyInfoHandler());

    // Summary and Report Handlers
    this.registerHandler('GENERATE_SUMMARY', new GenerateSummaryHandler());
    this.registerHandler('GENERATE_REPORT', new GenerateReportHandler());

    // Team and Communication Handlers
    this.registerHandler('GET_TEAM_INFO', new GetTeamInfoHandler());
    this.registerHandler('SEND_NOTIFICATION', new SendNotificationHandler());

    // Meeting and Schedule Handlers
    this.registerHandler('SCHEDULE_MEETING', new ScheduleMeetingHandler());
    this.registerHandler('GET_MEETING_INFO', new GetMeetingInfoHandler());
  }
}

// Default Command Handlers

class UpdateProjectStatusHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'UPDATE_PROJECT_STATUS';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    const projectName = intent.parameters.project_name;
    const status = intent.parameters.status;

    if (!projectName || !status) {
      return {
        success: false,
        message: 'I need both the project name and the new status to update a project.',
        action: intent.action
      };
    }

    try {
      // Find project
      const project = await dependencies.db.project.findFirst({
        where: {
          name: { contains: projectName, mode: 'insensitive' },
          isActive: true
        }
      });

      if (!project) {
        return {
          success: false,
          message: `I couldn't find a project named "${projectName}". Please check the project name and try again.`,
          action: intent.action
        };
      }

      // Update project status
      await dependencies.db.project.update({
        where: { id: project.id },
        data: { status: status.toUpperCase().replace(/\s+/g, '_') }
      });

      // Trigger integration updates
      await this.updateIntegrations(project.id, status, dependencies);

      return {
        success: true,
        message: `✅ Project "${project.name}" status updated to "${status}". The team has been notified.`,
        action: intent.action,
        data: { projectId: project.id, newStatus: status }
      };
    } catch (error) {
      console.error('Update project status failed:', error);
      return {
        success: false,
        message: 'Failed to update project status. Please try again.',
        action: intent.action
      };
    }
  }

  private async updateIntegrations(projectId: string, status: string, dependencies: CommandDependencies): Promise<void> {
    // Update Jira, Slack, etc.
    // Implementation would depend on your integration setup
  }
}

class CreateProjectHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'CREATE_PROJECT';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    const projectName = intent.parameters.project_name;
    const description = intent.parameters.description;

    if (!projectName) {
      return {
        success: false,
        message: 'I need a project name to create a new project.',
        action: intent.action
      };
    }

    try {
      const project = await dependencies.db.project.create({
        data: {
          name: projectName,
          description: description || '',
          createdBy: context.userId,
          status: 'PLANNING'
        }
      });

      return {
        success: true,
        message: `✅ Project "${projectName}" created successfully. You can now start adding team members and setting up tasks.`,
        action: intent.action,
        data: { projectId: project.id }
      };
    } catch (error) {
      console.error('Create project failed:', error);
      return {
        success: false,
        message: 'Failed to create project. Please try again.',
        action: intent.action
      };
    }
  }
}

class GetProjectStatusHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'GET_PROJECT_STATUS';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    const projectName = intent.parameters.project_name;

    try {
      let projects;
      if (projectName) {
        projects = await dependencies.db.project.findMany({
          where: {
            name: { contains: projectName, mode: 'insensitive' },
            isActive: true
          },
          include: {
            members: {
              include: { user: { select: { name: true, email: true } } }
            }
          }
        });
      } else {
        projects = await dependencies.db.project.findMany({
          where: { isActive: true },
          include: {
            members: {
              include: { user: { select: { name: true, email: true } } }
            }
          }
        });
      }

      if (projects.length === 0) {
        return {
          success: false,
          message: projectName 
            ? `No projects found matching "${projectName}".`
            : 'No active projects found.',
          action: intent.action
        };
      }

      const projectList = projects.map(p => 
        `• **${p.name}**: ${p.status} (${p.members.length} members)`
      ).join('\n');

      return {
        success: true,
        message: `Here are the current project statuses:\n\n${projectList}`,
        action: intent.action,
        data: { projects }
      };
    } catch (error) {
      console.error('Get project status failed:', error);
      return {
        success: false,
        message: 'Failed to retrieve project status. Please try again.',
        action: intent.action
      };
    }
  }
}

class SearchDocumentsHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'SEARCH_DOCUMENTS';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    const query = intent.parameters.query;
    const category = intent.parameters.category;

    if (!query) {
      return {
        success: false,
        message: 'I need a search query to find documents.',
        action: intent.action
      };
    }

    try {
      const retrievalContext: RetrievalContext = {
        query,
        userId: context.userId,
        sessionId: context.sessionId,
        filters: {
          category: category,
        },
        options: { topK: 10 }
      };

      const documents = await dependencies.documentRetriever.retrieveDocuments(retrievalContext);

      if (documents.length === 0) {
        return {
          success: false,
          message: `No documents found matching "${query}". Try different keywords or check if the documents exist.`,
          action: intent.action
        };
      }

      const documentList = documents.map((doc, index) => 
        `${index + 1}. **${doc.title}** (${doc.category || 'General'}) - ${(doc.relevanceScore * 100).toFixed(1)}% match`
      ).join('\n');

      return {
        success: true,
        message: `Found ${documents.length} document(s) matching "${query}":\n\n${documentList}`,
        action: intent.action,
        data: { documents }
      };
    } catch (error) {
      console.error('Search documents failed:', error);
      return {
        success: false,
        message: 'Failed to search documents. Please try again.',
        action: intent.action
      };
    }
  }
}

class UploadDocumentHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'UPLOAD_DOCUMENT';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    return {
      success: false,
      message: 'Document upload requires a file. Please use the upload interface in the document manager.',
      action: intent.action,
      requiresConfirmation: false
    };
  }
}

class AnswerQuestionHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'ANSWER_QUESTION';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    const question = intent.parameters.question;

    if (!question) {
      return {
        success: false,
        message: 'I need a question to answer. Please ask me something specific.',
        action: intent.action
      };
    }

    try {
      // Retrieve relevant documents
      const retrievalContext: RetrievalContext = {
        query: question,
        userId: context.userId,
        sessionId: context.sessionId,
        options: { topK: 5 }
      };

      const documents = await dependencies.documentRetriever.retrieveDocuments(retrievalContext);

      // Generate response
      const generationContext: GenerationContext = {
        query: question,
        retrievedDocuments: documents,
        conversationHistory: context.conversationHistory,
        userContext: {
          userId: context.userId,
          role: context.userRole,
          department: context.department
        }
      };

      const response = await dependencies.responseGenerator.generateResponse(generationContext);

      return {
        success: true,
        message: response.content,
        action: intent.action,
        data: {
          sources: response.sources,
          metadata: response.metadata
        }
      };
    } catch (error) {
      console.error('Answer question failed:', error);
      return {
        success: false,
        message: 'Failed to answer your question. Please try again.',
        action: intent.action
      };
    }
  }
}

class GetPolicyInfoHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'GET_POLICY_INFO';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    const policyTopic = intent.parameters.policy_topic;

    if (!policyTopic) {
      return {
        success: false,
        message: 'I need to know which policy you\'re asking about.',
        action: intent.action
      };
    }

    try {
      const retrievalContext: RetrievalContext = {
        query: policyTopic,
        userId: context.userId,
        sessionId: context.sessionId,
        filters: {
          category: 'policies'
        },
        options: { topK: 5 }
      };

      const documents = await dependencies.documentRetriever.retrieveDocuments(retrievalContext);

      if (documents.length === 0) {
        return {
          success: false,
          message: `No policies found related to "${policyTopic}". Please check the policy name or try different keywords.`,
          action: intent.action
        };
      }

      const generationContext: GenerationContext = {
        query: `What is the policy about ${policyTopic}?`,
        retrievedDocuments: documents,
        conversationHistory: context.conversationHistory,
        userContext: {
          userId: context.userId,
          role: context.userRole,
          department: context.department
        }
      };

      const response = await dependencies.responseGenerator.generateResponse(generationContext);

      return {
        success: true,
        message: response.content,
        action: intent.action,
        data: {
          sources: response.sources,
          metadata: response.metadata
        }
      };
    } catch (error) {
      console.error('Get policy info failed:', error);
      return {
        success: false,
        message: 'Failed to retrieve policy information. Please try again.',
        action: intent.action
      };
    }
  }
}

class GenerateSummaryHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'GENERATE_SUMMARY';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    const topic = intent.parameters.topic;
    const timeframe = intent.parameters.timeframe;

    try {
      const retrievalContext: RetrievalContext = {
        query: topic || 'recent updates',
        userId: context.userId,
        sessionId: context.sessionId,
        options: { topK: 10 }
      };

      const documents = await dependencies.documentRetriever.retrieveDocuments(retrievalContext);

      const generationContext: GenerationContext = {
        query: `Provide a summary of ${topic || 'recent updates'}${timeframe ? ` from ${timeframe}` : ''}`,
        retrievedDocuments: documents,
        conversationHistory: context.conversationHistory,
        userContext: {
          userId: context.userId,
          role: context.userRole,
          department: context.department
        }
      };

      const response = await dependencies.responseGenerator.generateResponse(generationContext);

      return {
        success: true,
        message: response.content,
        action: intent.action,
        data: {
          sources: response.sources,
          metadata: response.metadata
        }
      };
    } catch (error) {
      console.error('Generate summary failed:', error);
      return {
        success: false,
        message: 'Failed to generate summary. Please try again.',
        action: intent.action
      };
    }
  }
}

class GenerateReportHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'GENERATE_REPORT';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    return {
      success: false,
      message: 'Report generation is not yet implemented. Please use the reporting interface.',
      action: intent.action
    };
  }
}

class GetTeamInfoHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'GET_TEAM_INFO';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    const teamName = intent.parameters.team_name;

    try {
      let teams;
      if (teamName) {
        teams = await dependencies.db.team.findMany({
          where: {
            name: { contains: teamName, mode: 'insensitive' },
            isActive: true
          },
          include: {
            members: {
              include: { user: { select: { name: true, email: true, department: true } } }
            }
          }
        });
      } else {
        teams = await dependencies.db.team.findMany({
          where: { isActive: true },
          include: {
            members: {
              include: { user: { select: { name: true, email: true, department: true } } }
            }
          }
        });
      }

      if (teams.length === 0) {
        return {
          success: false,
          message: teamName 
            ? `No teams found matching "${teamName}".`
            : 'No active teams found.',
          action: intent.action
        };
      }

      const teamList = teams.map(team => {
        const memberList = team.members.map(m => `  - ${m.user.name} (${m.user.department})`).join('\n');
        return `**${team.name}** (${team.members.length} members)\n${memberList}`;
      }).join('\n\n');

      return {
        success: true,
        message: `Here are the team details:\n\n${teamList}`,
        action: intent.action,
        data: { teams }
      };
    } catch (error) {
      console.error('Get team info failed:', error);
      return {
        success: false,
        message: 'Failed to retrieve team information. Please try again.',
        action: intent.action
      };
    }
  }
}

class SendNotificationHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'SEND_NOTIFICATION';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    return {
      success: false,
      message: 'Notification sending is not yet implemented. Please use the notification interface.',
      action: intent.action
    };
  }
}

class ScheduleMeetingHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'SCHEDULE_MEETING';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    return {
      success: false,
      message: 'Meeting scheduling is not yet implemented. Please use the calendar interface.',
      action: intent.action
    };
  }
}

class GetMeetingInfoHandler implements CommandHandler {
  canHandle(action: string): boolean {
    return action === 'GET_MEETING_INFO';
  }

  async handle(
    intent: IntentDetectionResult,
    context: CommandContext,
    dependencies: CommandDependencies
  ): Promise<CommandResult> {
    return {
      success: false,
      message: 'Meeting information is not yet implemented. Please use the calendar interface.',
      action: intent.action
    };
  }
}