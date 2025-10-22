import { JiraProject, JiraIssue, JiraWebhook, ProjectUpdate } from './types';

export interface JiraIntegration {
  getProject(projectId: string): Promise<JiraProject>;
  updateProject(projectId: string, updates: ProjectUpdate): Promise<void>;
  createIssue(issue: JiraIssue): Promise<JiraIssue>;
  handleWebhook(payload: JiraWebhook): Promise<void>;
}

export class JiraClient implements JiraIntegration {
  constructor(
    private baseUrl: string,
    private username: string,
    private apiToken: string
  ) {}

  async getProject(projectId: string): Promise<JiraProject> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/3/project/${projectId}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.apiToken}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Jira API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapToJiraProject(data);
    } catch (error) {
      console.error('Jira getProject error:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: ProjectUpdate): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/3/project/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.apiToken}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Jira update error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Jira updateProject error:', error);
      throw error;
    }
  }

  async createIssue(issue: JiraIssue): Promise<JiraIssue> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.apiToken}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            project: { key: issue.projectKey },
            summary: issue.summary,
            description: issue.description,
            issuetype: { name: issue.issueType },
            assignee: issue.assignee ? { name: issue.assignee } : undefined,
            priority: issue.priority ? { name: issue.priority } : undefined,
            labels: issue.labels
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Jira create issue error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...issue,
        id: data.id,
        key: data.key
      };
    } catch (error) {
      console.error('Jira createIssue error:', error);
      throw error;
    }
  }

  async handleWebhook(payload: JiraWebhook): Promise<void> {
    try {
      const { webhookEvent, issue, user } = payload;
      
      switch (webhookEvent) {
        case 'jira:issue_created':
          await this.handleIssueCreated(issue);
          break;
        case 'jira:issue_updated':
          await this.handleIssueUpdated(issue);
          break;
        case 'jira:issue_deleted':
          await this.handleIssueDeleted(issue);
          break;
        default:
          console.log(`Unhandled webhook event: ${webhookEvent}`);
      }
    } catch (error) {
      console.error('Jira webhook handling error:', error);
      throw error;
    }
  }

  private async handleIssueCreated(issue: any): Promise<void> {
    try {
      // Update knowledge base with new issue
      await this.updateKnowledgeBase('issue_created', issue);
      
      // Send notifications if needed
      await this.sendNotifications('issue_created', issue);
    } catch (error) {
      console.error('Handle issue created error:', error);
    }
  }

  private async handleIssueUpdated(issue: any): Promise<void> {
    try {
      // Update knowledge base with issue changes
      await this.updateKnowledgeBase('issue_updated', issue);
      
      // Send notifications if needed
      await this.sendNotifications('issue_updated', issue);
    } catch (error) {
      console.error('Handle issue updated error:', error);
    }
  }

  private async handleIssueDeleted(issue: any): Promise<void> {
    try {
      // Remove from knowledge base
      await this.updateKnowledgeBase('issue_deleted', issue);
    } catch (error) {
      console.error('Handle issue deleted error:', error);
    }
  }

  private async updateKnowledgeBase(eventType: string, issue: any): Promise<void> {
    try {
      // This would typically update the knowledge base
      console.log(`Updating knowledge base for ${eventType}:`, issue.key);
    } catch (error) {
      console.error('Knowledge base update error:', error);
    }
  }

  private async sendNotifications(eventType: string, issue: any): Promise<void> {
    try {
      // This would typically send notifications
      console.log(`Sending notifications for ${eventType}:`, issue.key);
    } catch (error) {
      console.error('Notification sending error:', error);
    }
  }

  private mapToJiraProject(data: any): JiraProject {
    return {
      id: data.id,
      key: data.key,
      name: data.name,
      description: data.description,
      lead: data.lead?.displayName,
      projectType: data.projectTypeKey,
      url: data.self,
      avatarUrls: data.avatarUrls,
      projectCategory: data.projectCategory?.name,
      createdAt: new Date(data.createdAt || data.created)
    };
  }
}