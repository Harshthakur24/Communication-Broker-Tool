import { BaseHandler } from './baseHandler';
import { Command, UserContext, Response, CommandType } from '../commandRouter';

export class NotifyHandler extends BaseHandler {
  canHandle(command: Command): boolean {
    return command.type === CommandType.NOTIFY;
  }

  async execute(command: Command): Promise<Response> {
    try {
      const { recipient, message } = command.parameters;
      
      if (!recipient || !message) {
        return this.createErrorResponse('Notify command requires recipient and message');
      }

      // Determine notification type and route accordingly
      const notificationType = this.determineNotificationType(recipient, message);
      
      switch (notificationType) {
        case 'team_notification':
          return await this.sendTeamNotification(command);
        case 'user_notification':
          return await this.sendUserNotification(command);
        case 'department_notification':
          return await this.sendDepartmentNotification(command);
        case 'project_notification':
          return await this.sendProjectNotification(command);
        default:
          return this.createErrorResponse('Unknown notification type');
      }
    } catch (error) {
      console.error('Notify handler error:', error);
      return this.createErrorResponse('Notification failed', { error: error.message });
    }
  }

  async validate(command: Command, user: UserContext): Promise<boolean> {
    // Check if user has notification permissions
    if (!this.hasPermission(user, 'notify:users') && 
        !this.hasPermission(user, 'notify:teams')) {
      return false;
    }

    // Check if user has role-based access
    if (!this.hasAnyRole(user, ['MANAGER', 'ADMIN', 'SYSTEM'])) {
      return false;
    }

    return true;
  }

  private determineNotificationType(recipient: string, message: string): string {
    const recipientLower = recipient.toLowerCase();

    if (recipientLower.includes('team') || recipientLower.includes('group')) {
      return 'team_notification';
    }

    if (recipientLower.includes('department') || recipientLower.includes('dept')) {
      return 'department_notification';
    }

    if (recipientLower.includes('project') || recipientLower.includes('project team')) {
      return 'project_notification';
    }

    // Check if it's a specific user (contains @ or specific name)
    if (recipientLower.includes('@') || this.isSpecificUser(recipient)) {
      return 'user_notification';
    }

    return 'team_notification'; // Default to team notification
  }

  private isSpecificUser(recipient: string): boolean {
    // Simple check - in production, this would be more sophisticated
    const userPatterns = [
      /^[a-zA-Z]+\s+[a-zA-Z]+$/, // First Last
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // Email
    ];
    
    return userPatterns.some(pattern => pattern.test(recipient));
  }

  private async sendTeamNotification(command: Command): Promise<Response> {
    const { recipient, message } = command.parameters;
    
    try {
      const teamName = this.extractTeamName(recipient);
      
      if (!teamName) {
        return this.createErrorResponse('Could not identify team to notify');
      }

      // Simulate API call to notification system
      const notificationResult = await this.simulateTeamNotification(teamName, message);
      
      await this.logAction(
        command.context.userId,
        'team_notification',
        { teamName, message, recipient }
      );

      return this.createSuccessResponse(
        `Notification sent to ${teamName} team`,
        { teamName, message, recipients: notificationResult.recipients },
        [{
          title: `${teamName} Team`,
          type: 'team',
          confidence: 0.9
        }]
      );
    } catch (error) {
      console.error('Team notification error:', error);
      return this.createErrorResponse('Failed to send team notification', { error: error.message });
    }
  }

  private async sendUserNotification(command: Command): Promise<Response> {
    const { recipient, message } = command.parameters;
    
    try {
      const userId = this.extractUserId(recipient);
      
      if (!userId) {
        return this.createErrorResponse('Could not identify user to notify');
      }

      // Simulate API call to notification system
      const notificationResult = await this.simulateUserNotification(userId, message);
      
      await this.logAction(
        command.context.userId,
        'user_notification',
        { userId, message, recipient }
      );

      return this.createSuccessResponse(
        `Notification sent to ${recipient}`,
        { userId, message, recipient },
        [{
          title: recipient,
          type: 'user',
          confidence: 0.95
        }]
      );
    } catch (error) {
      console.error('User notification error:', error);
      return this.createErrorResponse('Failed to send user notification', { error: error.message });
    }
  }

  private async sendDepartmentNotification(command: Command): Promise<Response> {
    const { recipient, message } = command.parameters;
    
    try {
      const departmentName = this.extractDepartmentName(recipient);
      
      if (!departmentName) {
        return this.createErrorResponse('Could not identify department to notify');
      }

      // Simulate API call to notification system
      const notificationResult = await this.simulateDepartmentNotification(departmentName, message);
      
      await this.logAction(
        command.context.userId,
        'department_notification',
        { departmentName, message, recipient }
      );

      return this.createSuccessResponse(
        `Notification sent to ${departmentName} department`,
        { departmentName, message, recipients: notificationResult.recipients },
        [{
          title: `${departmentName} Department`,
          type: 'department',
          confidence: 0.9
        }]
      );
    } catch (error) {
      console.error('Department notification error:', error);
      return this.createErrorResponse('Failed to send department notification', { error: error.message });
    }
  }

  private async sendProjectNotification(command: Command): Promise<Response> {
    const { recipient, message } = command.parameters;
    
    try {
      const projectId = this.extractProjectId(recipient);
      
      if (!projectId) {
        return this.createErrorResponse('Could not identify project to notify');
      }

      // Simulate API call to notification system
      const notificationResult = await this.simulateProjectNotification(projectId, message);
      
      await this.logAction(
        command.context.userId,
        'project_notification',
        { projectId, message, recipient }
      );

      return this.createSuccessResponse(
        `Notification sent to project ${projectId} team`,
        { projectId, message, recipients: notificationResult.recipients },
        [{
          title: `Project ${projectId}`,
          type: 'project',
          confidence: 0.9
        }]
      );
    } catch (error) {
      console.error('Project notification error:', error);
      return this.createErrorResponse('Failed to send project notification', { error: error.message });
    }
  }

  private extractTeamName(recipient: string): string | null {
    // Simple extraction - in production, this would be more sophisticated
    const match = recipient.match(/(?:team\s+)?([a-zA-Z0-9\s\-_]+)/i);
    return match ? match[1].trim() : null;
  }

  private extractUserId(recipient: string): string | null {
    // Simple extraction - in production, this would be more sophisticated
    const match = recipient.match(/(?:user\s+)?([a-zA-Z0-9\-_]+)/i);
    return match ? match[1] : null;
  }

  private extractDepartmentName(recipient: string): string | null {
    // Simple extraction - in production, this would be more sophisticated
    const match = recipient.match(/(?:department\s+)?([a-zA-Z0-9\s\-_]+)/i);
    return match ? match[1].trim() : null;
  }

  private extractProjectId(recipient: string): string | null {
    // Simple extraction - in production, this would be more sophisticated
    const match = recipient.match(/(?:project\s+)?([a-zA-Z0-9\-_]+)/i);
    return match ? match[1] : null;
  }

  private async simulateTeamNotification(teamName: string, message: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      success: true,
      teamName,
      message,
      recipients: [`${teamName} Team`],
      channels: ['slack', 'email']
    };
  }

  private async simulateUserNotification(userId: string, message: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      success: true,
      userId,
      message,
      channels: ['slack', 'email', 'push']
    };
  }

  private async simulateDepartmentNotification(departmentName: string, message: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      success: true,
      departmentName,
      message,
      recipients: [`${departmentName} Department`],
      channels: ['slack', 'email']
    };
  }

  private async simulateProjectNotification(projectId: string, message: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      success: true,
      projectId,
      message,
      recipients: [`Project ${projectId} Team`],
      channels: ['slack', 'email']
    };
  }
}