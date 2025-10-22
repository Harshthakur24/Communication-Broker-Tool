# Modular Architecture - Internal AI Communication Hub

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── chat/                 # Chat and messaging
│   │   ├── documents/            # Document management
│   │   ├── integrations/         # External integrations
│   │   ├── notifications/        # Notification system
│   │   └── projects/             # Project management
│   ├── dashboard/                # Main dashboard
│   ├── auth/                     # Authentication pages
│   ├── profile/                  # User profile
│   └── knowledge-base/           # Knowledge base interface
├── components/                   # React Components
│   ├── ui/                       # Base UI components
│   ├── auth/                     # Authentication components
│   ├── chat/                     # Chat interface components
│   ├── documents/                # Document management components
│   ├── layout/                   # Layout components
│   └── integrations/             # Integration components
├── core/                         # Core business logic
│   ├── intent/                   # Intent detection and classification
│   ├── context/                  # Context management
│   ├── commands/                 # Command processing
│   ├── memory/                   # Memory and session management
│   └── routing/                  # Command routing
├── rag/                          # RAG Pipeline
│   ├── retrieval/                # Document retrieval
│   ├── embedding/                # Vector embeddings
│   ├── indexing/                 # Vector indexing
│   └── generation/               # Response generation
├── integrations/                 # External integrations
│   ├── jira/                     # Jira integration
│   ├── notion/                   # Notion integration
│   ├── confluence/               # Confluence integration
│   ├── slack/                    # Slack integration
│   ├── teams/                    # Teams integration
│   └── webhooks/                 # Webhook handlers
├── security/                     # Security and access control
│   ├── auth/                     # Authentication
│   ├── permissions/              # Authorization
│   ├── encryption/               # Data encryption
│   └── audit/                    # Audit logging
├── lib/                          # Utilities and shared code
│   ├── database/                 # Database utilities
│   ├── ai/                       # AI/LLM utilities
│   ├── email/                    # Email utilities
│   ├── utils/                    # General utilities
│   └── types/                    # TypeScript types
├── hooks/                        # React hooks
├── contexts/                     # React contexts
└── styles/                       # Global styles and themes
```

## Core Modules

### 1. Intent Detection Module (`/core/intent/`)

**Purpose**: Classify user input into actionable commands

**Files**:
- `intentDetector.ts` - Main intent detection logic
- `classifiers/` - Different classification strategies
- `types.ts` - Intent type definitions

**Key Functions**:
```typescript
interface IntentDetector {
  detectIntent(input: string, context: UserContext): Promise<Intent>
  classifyCommand(input: string): CommandType
  extractEntities(input: string): Entity[]
}

enum CommandType {
  UPDATE = 'update',
  QUERY = 'query',
  NOTIFY = 'notify',
  SEARCH = 'search'
}
```

### 2. Context Management Module (`/core/context/`)

**Purpose**: Manage user context, session state, and conversation history

**Files**:
- `contextManager.ts` - Main context management
- `sessionManager.ts` - Session state management
- `conversationManager.ts` - Conversation history
- `userContext.ts` - User-specific context

**Key Functions**:
```typescript
interface ContextManager {
  getContext(userId: string): Promise<UserContext>
  updateContext(userId: string, updates: Partial<UserContext>): Promise<void>
  addToHistory(sessionId: string, message: ChatMessage): Promise<void>
  getConversationHistory(sessionId: string): Promise<ChatMessage[]>
}
```

### 3. Command Routing Module (`/core/routing/`)

**Purpose**: Route commands to appropriate handlers

**Files**:
- `commandRouter.ts` - Main routing logic
- `handlers/` - Command handlers
- `middleware/` - Command processing middleware

**Key Functions**:
```typescript
interface CommandRouter {
  route(command: Command, context: UserContext): Promise<Handler>
  execute(command: Command, handler: Handler): Promise<Response>
  validate(command: Command, user: User): Promise<boolean>
}
```

### 4. Memory Management Module (`/core/memory/`)

**Purpose**: Manage conversation memory and user preferences

**Files**:
- `memoryManager.ts` - Main memory management
- `preferences.ts` - User preferences
- `cache.ts` - Caching layer

**Key Functions**:
```typescript
interface MemoryManager {
  storeMemory(key: string, value: any): Promise<void>
  retrieveMemory(key: string): Promise<any>
  clearMemory(userId: string): Promise<void>
  getPreferences(userId: string): Promise<UserPreferences>
}
```

## RAG Pipeline Module (`/rag/`)

### 1. Document Retrieval (`/rag/retrieval/`)

**Purpose**: Retrieve relevant documents from knowledge base

**Files**:
- `documentRetriever.ts` - Main retrieval logic
- `semanticSearch.ts` - Semantic search implementation
- `ranking.ts` - Document ranking algorithms

**Key Functions**:
```typescript
interface DocumentRetriever {
  retrieveDocuments(query: string, filters?: SearchFilters): Promise<Document[]>
  searchSemantic(query: string, limit?: number): Promise<SearchResult[]>
  rankDocuments(documents: Document[], query: string): Promise<RankedDocument[]>
}
```

### 2. Vector Embeddings (`/rag/embedding/`)

**Purpose**: Generate and manage vector embeddings

**Files**:
- `embeddingService.ts` - Main embedding service
- `vectorStore.ts` - Vector store interface
- `pinecone.ts` - Pinecone implementation
- `faiss.ts` - FAISS implementation

**Key Functions**:
```typescript
interface EmbeddingService {
  generateEmbedding(text: string): Promise<number[]>
  storeEmbedding(id: string, embedding: number[], metadata: any): Promise<void>
  searchSimilar(embedding: number[], limit: number): Promise<SearchResult[]>
}
```

### 3. Response Generation (`/rag/generation/`)

**Purpose**: Generate AI responses using retrieved context

**Files**:
- `responseGenerator.ts` - Main response generation
- `llmService.ts` - LLM integration
- `grounding.ts` - Response grounding
- `provenance.ts` - Source attribution

**Key Functions**:
```typescript
interface ResponseGenerator {
  generateResponse(query: string, context: Document[]): Promise<Response>
  groundResponse(response: string, sources: Document[]): Promise<GroundedResponse>
  addProvenance(response: string, sources: Document[]): Promise<string>
}
```

## Integration Layer (`/integrations/`)

### 1. Jira Integration (`/integrations/jira/`)

**Files**:
- `jiraClient.ts` - Jira API client
- `projectSync.ts` - Project synchronization
- `webhookHandler.ts` - Webhook processing
- `types.ts` - Jira-specific types

**Key Functions**:
```typescript
interface JiraIntegration {
  getProject(projectId: string): Promise<JiraProject>
  updateProject(projectId: string, updates: ProjectUpdate): Promise<void>
  createIssue(issue: JiraIssue): Promise<JiraIssue>
  handleWebhook(payload: JiraWebhook): Promise<void>
}
```

### 2. Notion Integration (`/integrations/notion/`)

**Files**:
- `notionClient.ts` - Notion API client
- `documentSync.ts` - Document synchronization
- `pageProcessor.ts` - Page processing
- `types.ts` - Notion-specific types

**Key Functions**:
```typescript
interface NotionIntegration {
  getPage(pageId: string): Promise<NotionPage>
  updatePage(pageId: string, updates: PageUpdate): Promise<void>
  searchPages(query: string): Promise<NotionPage[]>
  syncDatabase(databaseId: string): Promise<void>
}
```

### 3. Slack Integration (`/integrations/slack/`)

**Files**:
- `slackClient.ts` - Slack API client
- `messageHandler.ts` - Message processing
- `notificationService.ts` - Notification sending
- `bot.ts` - Slack bot implementation

**Key Functions**:
```typescript
interface SlackIntegration {
  sendMessage(channel: string, message: string): Promise<void>
  sendNotification(userId: string, notification: Notification): Promise<void>
  handleCommand(command: SlackCommand): Promise<SlackResponse>
  getChannelHistory(channelId: string): Promise<SlackMessage[]>
}
```

## Security Module (`/security/`)

### 1. Authentication (`/security/auth/`)

**Files**:
- `authService.ts` - Main authentication service
- `sso.ts` - SSO integration
- `jwt.ts` - JWT token management
- `middleware.ts` - Auth middleware

**Key Functions**:
```typescript
interface AuthService {
  authenticate(credentials: Credentials): Promise<AuthResult>
  validateToken(token: string): Promise<User>
  refreshToken(refreshToken: string): Promise<TokenPair>
  logout(userId: string): Promise<void>
}
```

### 2. Authorization (`/security/permissions/`)

**Files**:
- `permissionService.ts` - Permission checking
- `roleManager.ts` - Role management
- `accessControl.ts` - Access control lists
- `middleware.ts` - Authorization middleware

**Key Functions**:
```typescript
interface PermissionService {
  checkPermission(user: User, resource: string, action: string): Promise<boolean>
  getUserPermissions(userId: string): Promise<Permission[]>
  grantPermission(userId: string, permission: Permission): Promise<void>
  revokePermission(userId: string, permission: Permission): Promise<void>
}
```

### 3. Audit Logging (`/security/audit/`)

**Files**:
- `auditLogger.ts` - Main audit logging
- `eventTracker.ts` - Event tracking
- `compliance.ts` - Compliance reporting
- `encryption.ts` - Log encryption

**Key Functions**:
```typescript
interface AuditLogger {
  logAction(userId: string, action: string, resource: string, details?: any): Promise<void>
  getAuditTrail(userId: string, filters?: AuditFilters): Promise<AuditLog[]>
  exportLogs(filters: ExportFilters): Promise<Buffer>
}
```

## UI Components (`/components/`)

### 1. Base UI Components (`/components/ui/`)

**Files**:
- `button.tsx` - Button component
- `input.tsx` - Input component
- `modal.tsx` - Modal component
- `toast.tsx` - Toast notification
- `loading.tsx` - Loading spinner
- `card.tsx` - Card component
- `badge.tsx` - Badge component
- `avatar.tsx` - Avatar component
- `tooltip.tsx` - Tooltip component

### 2. Chat Components (`/components/chat/`)

**Files**:
- `ChatInterface.tsx` - Main chat interface
- `MessageBubble.tsx` - Individual message
- `MessageThread.tsx` - Message threading
- `TypingIndicator.tsx` - Typing animation
- `CommandHistory.tsx` - Command history
- `SourceAttribution.tsx` - Source display

### 3. Layout Components (`/components/layout/`)

**Files**:
- `MainLayout.tsx` - Main application layout
- `TopNavbar.tsx` - Top navigation
- `LeftSidebar.tsx` - Left sidebar
- `RightPanel.tsx` - Right panel
- `MobileMenu.tsx` - Mobile navigation

### 4. Document Components (`/components/documents/`)

**Files**:
- `DocumentManager.tsx` - Document management
- `DocumentUpload.tsx` - File upload
- `DocumentViewer.tsx` - Document display
- `DocumentSearch.tsx` - Document search
- `DocumentTags.tsx` - Tag management

## API Routes (`/app/api/`)

### 1. Authentication Routes (`/app/api/auth/`)

**Files**:
- `login/route.ts` - Login endpoint
- `logout/route.ts` - Logout endpoint
- `register/route.ts` - Registration endpoint
- `me/route.ts` - Current user info
- `forgot-password/route.ts` - Password reset
- `reset-password/route.ts` - Password reset confirmation
- `verify-email/route.ts` - Email verification

### 2. Chat Routes (`/app/api/chat/`)

**Files**:
- `messages/route.ts` - Message CRUD
- `suggestions/route.ts` - Command suggestions
- `stream/route.ts` - Streaming responses
- `history/route.ts` - Chat history

### 3. Document Routes (`/app/api/documents/`)

**Files**:
- `route.ts` - Document CRUD
- `upload/route.ts` - File upload
- `search/route.ts` - Document search
- `process/route.ts` - Document processing
- `sync/route.ts` - External sync

### 4. Integration Routes (`/app/api/integrations/`)

**Files**:
- `jira/route.ts` - Jira integration
- `notion/route.ts` - Notion integration
- `slack/route.ts` - Slack integration
- `webhooks/route.ts` - Webhook handlers
- `sync/route.ts` - Data synchronization

## Configuration Files

### 1. Environment Configuration
- `.env.local` - Local environment variables
- `.env.example` - Environment template
- `next.config.ts` - Next.js configuration

### 2. Database Configuration
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Database migrations
- `scripts/setup-db.sql` - Database setup

### 3. TypeScript Configuration
- `tsconfig.json` - TypeScript configuration
- `types/` - Global type definitions

### 4. Styling Configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `styles/globals.css` - Global styles

## Key Design Principles

### 1. Modularity
- Each module has a single responsibility
- Clear interfaces between modules
- Easy to test and maintain

### 2. Scalability
- Stateless design where possible
- Horizontal scaling support
- Efficient resource utilization

### 3. Security
- Defense in depth
- Principle of least privilege
- Comprehensive audit logging

### 4. Performance
- Caching at multiple levels
- Lazy loading
- Optimized database queries

### 5. Maintainability
- Clear code organization
- Comprehensive documentation
- Automated testing