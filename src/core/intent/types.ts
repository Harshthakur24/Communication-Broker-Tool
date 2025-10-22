export interface UserContext {
  userId: string;
  sessionId: string;
  role: UserRole;
  permissions: string[];
  department?: string;
  currentProject?: string;
  conversationHistory: ChatMessage[];
  preferences: UserPreferences;
}

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export enum MessageType {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  NOTIFICATION = 'notification'
}

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM'
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notificationSettings: NotificationSettings;
  uiPreferences: UIPreferences;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  slack: boolean;
  teams: boolean;
}

export interface UIPreferences {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  chatLayout: 'single' | 'split';
}

export interface Intent {
  type: CommandType;
  confidence: number;
  entities: Entity[];
  parameters: Record<string, any>;
  originalInput: string;
}

export enum CommandType {
  UPDATE = 'update',
  QUERY = 'query',
  NOTIFY = 'notify',
  SEARCH = 'search',
  HELP = 'help',
  UNKNOWN = 'unknown'
}

export interface Entity {
  type: EntityType;
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export enum EntityType {
  PROJECT = 'project',
  PERSON = 'person',
  DOCUMENT = 'document',
  DATE = 'date',
  STATUS = 'status',
  PRIORITY = 'priority',
  TEAM = 'team',
  DEPARTMENT = 'department'
}

export interface Command {
  type: CommandType;
  intent: Intent;
  context: UserContext;
  parameters: Record<string, any>;
  timestamp: Date;
}

export interface IntentDetectionResult {
  intent: Intent;
  confidence: number;
  processingTime: number;
  metadata: Record<string, any>;
}