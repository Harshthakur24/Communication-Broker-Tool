import { BaseHandler } from './baseHandler';
import { Command, UserContext, Response, CommandType } from '../commandRouter';

export class HelpHandler extends BaseHandler {
  canHandle(command: Command): boolean {
    return command.type === CommandType.HELP;
  }

  async execute(command: Command): Promise<Response> {
    try {
      const { subject } = command.parameters;
      
      if (subject) {
        // Provide specific help for a topic
        return await this.provideSpecificHelp(command);
      } else {
        // Provide general help
        return await this.provideGeneralHelp(command);
      }
    } catch (error) {
      console.error('Help handler error:', error);
      return this.createErrorResponse('Help request failed', { error: error.message });
    }
  }

  async validate(command: Command, user: UserContext): Promise<boolean> {
    // Help is always available to all users
    return true;
  }

  private async provideGeneralHelp(command: Command): Promise<Response> {
    try {
      const availableCommands = await this.getAvailableCommands(command.context);
      
      await this.logAction(
        command.context.userId,
        'help_request',
        { type: 'general' }
      );

      const helpMessage = this.formatGeneralHelpMessage(availableCommands);

      return this.createSuccessResponse(
        'Here are the available commands:',
        { commands: availableCommands },
        [{
          title: 'Command Help',
          type: 'help',
          confidence: 1.0
        }]
      );
    } catch (error) {
      console.error('General help error:', error);
      return this.createErrorResponse('Failed to provide general help', { error: error.message });
    }
  }

  private async provideSpecificHelp(command: Command): Promise<Response> {
    const { subject } = command.parameters;
    
    try {
      const helpInfo = await this.getSpecificHelpInfo(subject, command.context);
      
      await this.logAction(
        command.context.userId,
        'help_request',
        { type: 'specific', subject }
      );

      return this.createSuccessResponse(
        `Help for "${subject}":`,
        helpInfo,
        [{
          title: `Help: ${subject}`,
          type: 'help',
          confidence: 0.9
        }]
      );
    } catch (error) {
      console.error('Specific help error:', error);
      return this.createErrorResponse('Failed to provide specific help', { error: error.message });
    }
  }

  private async getAvailableCommands(userContext: UserContext): Promise<any[]> {
    // This would typically come from the command router
    // For now, we'll provide a static list based on user permissions
    const commands = [];

    // Always available
    commands.push({
      type: 'help',
      description: 'Get help and available commands',
      examples: ['help', 'what can you do', 'commands'],
      permissions: []
    });

    // Check permissions for other commands
    if (this.hasPermission(userContext, 'read:knowledge_base')) {
      commands.push({
        type: 'query',
        description: 'Ask questions about projects, policies, or procedures',
        examples: [
          'What is the status of project Alpha?',
          'Tell me about the remote work policy',
          'How do I submit a vacation request?'
        ],
        permissions: ['read:knowledge_base']
      });

      commands.push({
        type: 'search',
        description: 'Search for documents, projects, or information',
        examples: [
          'Search for HR policies',
          'Find documents about security',
          'Look for project documentation'
        ],
        permissions: ['read:knowledge_base']
      });
    }

    if (this.hasPermission(userContext, 'update:projects') || 
        this.hasPermission(userContext, 'update:documents')) {
      commands.push({
        type: 'update',
        description: 'Update project status, assign tasks, or modify data',
        examples: [
          'Mark project Alpha as in progress',
          'Assign task to John Smith',
          'Update status to completed'
        ],
        permissions: ['update:projects', 'update:documents']
      });
    }

    if (this.hasPermission(userContext, 'notify:users') || 
        this.hasPermission(userContext, 'notify:teams')) {
      commands.push({
        type: 'notify',
        description: 'Send notifications to team members or groups',
        examples: [
          'Notify engineering team about deployment',
          'Send update to project stakeholders',
          'Alert managers about policy change'
        ],
        permissions: ['notify:users', 'notify:teams']
      });
    }

    return commands;
  }

  private async getSpecificHelpInfo(subject: string, userContext: UserContext): Promise<any> {
    const subjectLower = subject.toLowerCase();

    // Help topics
    const helpTopics = {
      'update': {
        title: 'Update Commands',
        description: 'Commands for updating project status, assigning tasks, and modifying data',
        examples: [
          'Mark project Alpha as in progress',
          'Assign task to John Smith',
          'Update status to completed',
          'Move task to next sprint'
        ],
        permissions: ['update:projects', 'update:documents'],
        tips: [
          'Use specific project or task names for better results',
          'Include the new status or assignee in your command',
          'Check your permissions before attempting updates'
        ]
      },
      'query': {
        title: 'Query Commands',
        description: 'Commands for asking questions about projects, policies, and procedures',
        examples: [
          'What is the status of project Beta?',
          'Tell me about the remote work policy',
          'How do I submit a vacation request?',
          'Who is working on the security project?'
        ],
        permissions: ['read:knowledge_base'],
        tips: [
          'Be specific about what you want to know',
          'Use natural language - the AI understands context',
          'Ask follow-up questions for more details'
        ]
      },
      'notify': {
        title: 'Notification Commands',
        description: 'Commands for sending notifications to team members or groups',
        examples: [
          'Notify engineering team about deployment',
          'Send update to project stakeholders',
          'Alert managers about policy change',
          'Tell the design team about the new requirements'
        ],
        permissions: ['notify:users', 'notify:teams'],
        tips: [
          'Specify the recipient (team, department, or individual)',
          'Include a clear message about what you want to communicate',
          'Check that you have permission to notify the target audience'
        ]
      },
      'search': {
        title: 'Search Commands',
        description: 'Commands for searching documents, projects, and information',
        examples: [
          'Search for HR policies',
          'Find documents about security',
          'Look for project documentation',
          'Show me all projects in progress'
        ],
        permissions: ['read:knowledge_base'],
        tips: [
          'Use keywords that are likely to appear in the content',
          'Be specific about what type of information you need',
          'Try different search terms if you don\'t find what you need'
        ]
      },
      'permissions': {
        title: 'User Permissions',
        description: 'Understanding your access levels and permissions',
        content: `Your current role: ${userContext.role}
Your permissions: ${userContext.permissions.join(', ')}

Permission levels:
- read:knowledge_base - Access to search and query company information
- update:projects - Ability to update project status and assignments
- update:documents - Ability to modify document status and metadata
- notify:users - Send notifications to individual users
- notify:teams - Send notifications to teams and departments

Contact your administrator if you need additional permissions.`,
        tips: [
          'Check your permissions before attempting actions',
          'Some commands may not be available based on your role',
          'Contact IT support if you need access to additional features'
        ]
      }
    };

    // Find matching help topic
    for (const [key, topic] of Object.entries(helpTopics)) {
      if (subjectLower.includes(key) || 
          topic.title.toLowerCase().includes(subjectLower) ||
          topic.description.toLowerCase().includes(subjectLower)) {
        return topic;
      }
    }

    // Default help if no specific topic found
    return {
      title: `Help for "${subject}"`,
      description: 'I couldn\'t find specific help for that topic, but here are some general tips:',
      content: 'Try using one of the main command types: update, query, notify, or search. You can also ask me about specific topics like "permissions" or "commands".',
      tips: [
        'Use clear, specific language in your commands',
        'Check your permissions if a command doesn\'t work',
        'Ask for help with specific command types if you\'re unsure'
      ]
    };
  }

  private formatGeneralHelpMessage(commands: any[]): string {
    let message = 'Here are the available commands:\n\n';
    
    commands.forEach((cmd, index) => {
      message += `${index + 1}. **${cmd.type.toUpperCase()}**\n`;
      message += `   ${cmd.description}\n`;
      message += `   Examples: ${cmd.examples.join(', ')}\n\n`;
    });

    message += 'Type "help [command]" for more details about a specific command.';
    
    return message;
  }
}