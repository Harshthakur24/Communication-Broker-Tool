export interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string;
  lead?: string;
  projectType: string;
  url: string;
  avatarUrls: {
    '16x16': string;
    '24x24': string;
    '32x32': string;
    '48x48': string;
  };
  projectCategory?: string;
  createdAt: Date;
}

export interface JiraIssue {
  id?: string;
  key?: string;
  projectKey: string;
  summary: string;
  description: string;
  issueType: string;
  assignee?: string;
  priority?: string;
  labels?: string[];
  status?: string;
  resolution?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JiraWebhook {
  webhookEvent: string;
  issue: any;
  user: any;
  timestamp: number;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  lead?: string;
  projectType?: string;
  projectCategory?: string;
}