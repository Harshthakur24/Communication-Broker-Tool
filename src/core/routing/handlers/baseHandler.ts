import { Command, UserContext, Response } from '../commandRouter';

export abstract class BaseHandler {
  abstract canHandle(command: Command): boolean;
  abstract execute(command: Command): Promise<Response>;
  abstract validate(command: Command, user: UserContext): Promise<boolean>;

  protected hasPermission(user: UserContext, permission: string): boolean {
    return user.permissions.includes(permission);
  }

  protected hasRole(user: UserContext, role: string): boolean {
    return user.role === role;
  }

  protected hasAnyRole(user: UserContext, roles: string[]): boolean {
    return roles.includes(user.role);
  }

  protected createSuccessResponse(message: string, data?: any, sources?: any[]): Response {
    return {
      success: true,
      message,
      data,
      sources
    };
  }

  protected createErrorResponse(message: string, metadata?: Record<string, any>): Response {
    return {
      success: false,
      message,
      metadata
    };
  }

  protected async logAction(userId: string, action: string, details: any): Promise<void> {
    try {
      // This would typically log to an audit system
      console.log('Action logged:', {
        userId,
        action,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }
}