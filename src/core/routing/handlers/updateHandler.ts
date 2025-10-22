import { BaseHandler } from './baseHandler';
import { Command, UserContext, Response, CommandType } from '../commandRouter';

export class UpdateHandler extends BaseHandler {
  canHandle(command: Command): boolean {
    return command.type === CommandType.UPDATE;
  }

  async execute(command: Command): Promise<Response> {
    try {
      const { target, newValue } = command.parameters;
      
      if (!target || !newValue) {
        return this.createErrorResponse('Update command requires target and new value');
      }

      // Determine what type of update this is
      const updateType = this.determineUpdateType(target, newValue);
      
      switch (updateType) {
        case 'project_status':
          return await this.updateProjectStatus(command);
        case 'task_assignment':
          return await this.assignTask(command);
        case 'document_status':
          return await this.updateDocumentStatus(command);
        case 'user_role':
          return await this.updateUserRole(command);
        default:
          return this.createErrorResponse('Unknown update type');
      }
    } catch (error) {
      console.error('Update handler error:', error);
      return this.createErrorResponse('Update failed', { error: error.message });
    }
  }

  async validate(command: Command, user: UserContext): Promise<boolean> {
    // Check if user has update permissions
    if (!this.hasPermission(user, 'update:projects') && 
        !this.hasPermission(user, 'update:documents') &&
        !this.hasPermission(user, 'update:users')) {
      return false;
    }

    // Check if user has role-based access
    if (!this.hasAnyRole(user, ['MANAGER', 'ADMIN', 'SYSTEM'])) {
      return false;
    }

    return true;
  }

  private determineUpdateType(target: string, newValue: string): string {
    const targetLower = target.toLowerCase();
    const valueLower = newValue.toLowerCase();

    if (targetLower.includes('project') || targetLower.includes('task')) {
      if (valueLower.includes('assign') || valueLower.includes('to')) {
        return 'task_assignment';
      }
      return 'project_status';
    }

    if (targetLower.includes('document') || targetLower.includes('file')) {
      return 'document_status';
    }

    if (targetLower.includes('user') || targetLower.includes('role')) {
      return 'user_role';
    }

    return 'unknown';
  }

  private async updateProjectStatus(command: Command): Promise<Response> {
    const { target, newValue } = command.parameters;
    
    try {
      // This would integrate with project management systems
      // For now, we'll simulate the update
      const projectId = this.extractProjectId(target);
      
      if (!projectId) {
        return this.createErrorResponse('Could not identify project to update');
      }

      // Simulate API call to project management system
      const updateResult = await this.simulateProjectUpdate(projectId, newValue);
      
      await this.logAction(
        command.context.userId,
        'project_status_update',
        { projectId, newValue, target }
      );

      return this.createSuccessResponse(
        `Project ${projectId} status updated to ${newValue}`,
        { projectId, newStatus: newValue },
        [{
          title: `Project ${projectId}`,
          type: 'project',
          confidence: 0.95
        }]
      );
    } catch (error) {
      console.error('Project status update error:', error);
      return this.createErrorResponse('Failed to update project status', { error: error.message });
    }
  }

  private async assignTask(command: Command): Promise<Response> {
    const { target, newValue } = command.parameters;
    
    try {
      const assignee = this.extractAssignee(newValue);
      const taskId = this.extractTaskId(target);
      
      if (!assignee || !taskId) {
        return this.createErrorResponse('Could not identify task or assignee');
      }

      // Simulate API call to task management system
      const assignmentResult = await this.simulateTaskAssignment(taskId, assignee);
      
      await this.logAction(
        command.context.userId,
        'task_assignment',
        { taskId, assignee, target }
      );

      return this.createSuccessResponse(
        `Task ${taskId} assigned to ${assignee}`,
        { taskId, assignee },
        [{
          title: `Task ${taskId}`,
          type: 'task',
          confidence: 0.9
        }]
      );
    } catch (error) {
      console.error('Task assignment error:', error);
      return this.createErrorResponse('Failed to assign task', { error: error.message });
    }
  }

  private async updateDocumentStatus(command: Command): Promise<Response> {
    const { target, newValue } = command.parameters;
    
    try {
      const documentId = this.extractDocumentId(target);
      
      if (!documentId) {
        return this.createErrorResponse('Could not identify document to update');
      }

      // Simulate API call to document management system
      const updateResult = await this.simulateDocumentUpdate(documentId, newValue);
      
      await this.logAction(
        command.context.userId,
        'document_status_update',
        { documentId, newValue, target }
      );

      return this.createSuccessResponse(
        `Document ${documentId} status updated to ${newValue}`,
        { documentId, newStatus: newValue },
        [{
          title: `Document ${documentId}`,
          type: 'document',
          confidence: 0.9
        }]
      );
    } catch (error) {
      console.error('Document status update error:', error);
      return this.createErrorResponse('Failed to update document status', { error: error.message });
    }
  }

  private async updateUserRole(command: Command): Promise<Response> {
    const { target, newValue } = command.parameters;
    
    try {
      const userId = this.extractUserId(target);
      const newRole = newValue;
      
      if (!userId || !newRole) {
        return this.createErrorResponse('Could not identify user or role');
      }

      // Check if user has permission to update roles
      if (!this.hasPermission(command.context, 'update:users')) {
        return this.createErrorResponse('Insufficient permissions to update user roles');
      }

      // Simulate API call to user management system
      const updateResult = await this.simulateUserRoleUpdate(userId, newRole);
      
      await this.logAction(
        command.context.userId,
        'user_role_update',
        { userId, newRole, target }
      );

      return this.createSuccessResponse(
        `User ${userId} role updated to ${newRole}`,
        { userId, newRole },
        [{
          title: `User ${userId}`,
          type: 'user',
          confidence: 0.95
        }]
      );
    } catch (error) {
      console.error('User role update error:', error);
      return this.createErrorResponse('Failed to update user role', { error: error.message });
    }
  }

  private extractProjectId(target: string): string | null {
    // Simple extraction - in production, this would be more sophisticated
    const match = target.match(/(?:project\s+)?([a-zA-Z0-9\-_]+)/i);
    return match ? match[1] : null;
  }

  private extractTaskId(target: string): string | null {
    // Simple extraction - in production, this would be more sophisticated
    const match = target.match(/(?:task\s+)?([a-zA-Z0-9\-_]+)/i);
    return match ? match[1] : null;
  }

  private extractDocumentId(target: string): string | null {
    // Simple extraction - in production, this would be more sophisticated
    const match = target.match(/(?:document\s+)?([a-zA-Z0-9\-_]+)/i);
    return match ? match[1] : null;
  }

  private extractUserId(target: string): string | null {
    // Simple extraction - in production, this would be more sophisticated
    const match = target.match(/(?:user\s+)?([a-zA-Z0-9\-_]+)/i);
    return match ? match[1] : null;
  }

  private extractAssignee(value: string): string | null {
    // Simple extraction - in production, this would be more sophisticated
    const match = value.match(/(?:to\s+)?([a-zA-Z0-9\s\-_]+)/i);
    return match ? match[1].trim() : null;
  }

  private async simulateProjectUpdate(projectId: string, newStatus: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, projectId, newStatus };
  }

  private async simulateTaskAssignment(taskId: string, assignee: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, taskId, assignee };
  }

  private async simulateDocumentUpdate(documentId: string, newStatus: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, documentId, newStatus };
  }

  private async simulateUserRoleUpdate(userId: string, newRole: string): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, userId, newRole };
  }
}