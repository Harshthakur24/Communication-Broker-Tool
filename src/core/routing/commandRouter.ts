import { Command, UserContext, CommandType } from '../intent/types';
import { UpdateHandler } from './handlers/updateHandler';
import { QueryHandler } from './handlers/queryHandler';
import { NotifyHandler } from './handlers/notifyHandler';
import { SearchHandler } from './handlers/searchHandler';
import { HelpHandler } from './handlers/helpHandler';

export interface Handler {
  canHandle(command: Command): boolean;
  execute(command: Command): Promise<Response>;
  validate(command: Command, user: UserContext): Promise<boolean>;
}

export interface Response {
  success: boolean;
  message: string;
  data?: any;
  metadata?: Record<string, any>;
  sources?: Array<{
    title: string;
    url?: string;
    type: string;
    confidence: number;
  }>;
}

export class CommandRouter {
  private handlers: Map<CommandType, Handler>;

  constructor() {
    this.handlers = new Map();
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    this.handlers.set(CommandType.UPDATE, new UpdateHandler());
    this.handlers.set(CommandType.QUERY, new QueryHandler());
    this.handlers.set(CommandType.NOTIFY, new NotifyHandler());
    this.handlers.set(CommandType.SEARCH, new SearchHandler());
    this.handlers.set(CommandType.HELP, new HelpHandler());
  }

  async route(command: Command): Promise<Handler> {
    const handler = this.handlers.get(command.type);
    
    if (!handler) {
      throw new Error(`No handler found for command type: ${command.type}`);
    }

    if (!handler.canHandle(command)) {
      throw new Error(`Handler cannot handle command: ${command.type}`);
    }

    return handler;
  }

  async execute(command: Command): Promise<Response> {
    try {
      // Validate command
      const isValid = await this.validate(command);
      if (!isValid) {
        return {
          success: false,
          message: 'Command validation failed',
          metadata: { validationError: 'Invalid command or insufficient permissions' }
        };
      }

      // Get appropriate handler
      const handler = await this.route(command);

      // Execute command
      const response = await handler.execute(command);

      // Log command execution
      await this.logCommandExecution(command, response);

      return response;
    } catch (error) {
      console.error('Command execution error:', error);
      return {
        success: false,
        message: 'Command execution failed',
        metadata: { error: error.message }
      };
    }
  }

  async validate(command: Command): Promise<boolean> {
    try {
      const handler = this.handlers.get(command.type);
      if (!handler) {
        return false;
      }

      return await handler.validate(command, command.context);
    } catch (error) {
      console.error('Command validation error:', error);
      return false;
    }
  }

  async getAvailableCommands(userContext: UserContext): Promise<Array<{
    type: CommandType;
    description: string;
    examples: string[];
    permissions: string[];
  }>> {
    const commands = [];

    for (const [type, handler] of this.handlers) {
      if (handler instanceof HelpHandler) {
        // Help handler is always available
        commands.push({
          type,
          description: 'Get help and available commands',
          examples: ['help', 'what can you do', 'commands'],
          permissions: []
        });
        continue;
      }

      // Check if user has permissions for this command type
      const hasPermission = await this.checkUserPermissions(userContext, type);
      if (hasPermission) {
        const commandInfo = this.getCommandInfo(type);
        commands.push(commandInfo);
      }
    }

    return commands;
  }

  private async checkUserPermissions(userContext: UserContext, commandType: CommandType): Promise<boolean> {
    const requiredPermissions = this.getRequiredPermissions(commandType);
    
    if (requiredPermissions.length === 0) {
      return true;
    }

    return requiredPermissions.some(permission => 
      userContext.permissions.includes(permission)
    );
  }

  private getRequiredPermissions(commandType: CommandType): string[] {
    const permissionMap: Record<CommandType, string[]> = {
      [CommandType.UPDATE]: ['update:projects', 'update:documents'],
      [CommandType.QUERY]: ['read:knowledge_base'],
      [CommandType.NOTIFY]: ['notify:users', 'notify:teams'],
      [CommandType.SEARCH]: ['read:knowledge_base'],
      [CommandType.HELP]: [],
      [CommandType.UNKNOWN]: []
    };

    return permissionMap[commandType] || [];
  }

  private getCommandInfo(commandType: CommandType): {
    type: CommandType;
    description: string;
    examples: string[];
    permissions: string[];
  } {
    const commandInfo: Record<CommandType, any> = {
      [CommandType.UPDATE]: {
        description: 'Update project status, assign tasks, or modify data',
        examples: [
          'Mark project Alpha as in progress',
          'Assign task to John Smith',
          'Update status to completed'
        ],
        permissions: ['update:projects', 'update:documents']
      },
      [CommandType.QUERY]: {
        description: 'Ask questions about projects, policies, or procedures',
        examples: [
          'What is the status of project Beta?',
          'Tell me about the remote work policy',
          'How do I submit a vacation request?'
        ],
        permissions: ['read:knowledge_base']
      },
      [CommandType.NOTIFY]: {
        description: 'Send notifications to team members or groups',
        examples: [
          'Notify engineering team about deployment',
          'Send update to project stakeholders',
          'Alert managers about policy change'
        ],
        permissions: ['notify:users', 'notify:teams']
      },
      [CommandType.SEARCH]: {
        description: 'Search for documents, projects, or information',
        examples: [
          'Search for HR policies',
          'Find documents about security',
          'Look for project documentation'
        ],
        permissions: ['read:knowledge_base']
      },
      [CommandType.HELP]: {
        description: 'Get help and available commands',
        examples: ['help', 'what can you do', 'commands'],
        permissions: []
      },
      [CommandType.UNKNOWN]: {
        description: 'Unknown command type',
        examples: [],
        permissions: []
      }
    };

    return {
      type: commandType,
      ...commandInfo[commandType]
    };
  }

  private async logCommandExecution(command: Command, response: Response): Promise<void> {
    try {
      // This would typically log to an audit system
      console.log('Command executed:', {
        userId: command.context.userId,
        commandType: command.type,
        success: response.success,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging command execution:', error);
    }
  }
}