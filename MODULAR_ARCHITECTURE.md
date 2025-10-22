# Modular Architecture Structure

## Project Structure

```
communication-broker-tool/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   └── callback/
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── chat/
│   │   │   ├── projects/
│   │   │   ├── settings/
│   │   │   └── admin/
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── integrations/
│   │   │   ├── rag/
│   │   │   └── webhooks/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/                   # UI Components
│   │   ├── ui/                       # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   └── index.ts
│   │   ├── chat/                     # Chat-specific components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── ChatHistory.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopNavbar.tsx
│   │   │   ├── NotificationDrawer.tsx
│   │   │   └── ContextSidebar.tsx
│   │   ├── dashboard/                # Dashboard components
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── StatusIndicator.tsx
│   │   │   ├── InsightPanel.tsx
│   │   │   └── ActivityFeed.tsx
│   │   └── common/                   # Shared components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── SearchBar.tsx
│   │       └── UserAvatar.tsx
│   │
│   ├── core/                         # Core business logic
│   │   ├── intent/                   # Intent detection
│   │   │   ├── IntentDetector.ts
│   │   │   ├── EntityExtractor.ts
│   │   │   ├── CommandClassifier.ts
│   │   │   └── types.ts
│   │   ├── context/                  # Context management
│   │   │   ├── ContextManager.ts
│   │   │   ├── SessionManager.ts
│   │   │   ├── MemoryStore.ts
│   │   │   └── UserContext.ts
│   │   ├── router/                   # Command routing
│   │   │   ├── CommandRouter.ts
│   │   │   ├── ActionDispatcher.ts
│   │   │   ├── PermissionValidator.ts
│   │   │   └── routes/
│   │   │       ├── UpdateRoute.ts
│   │   │       ├── QueryRoute.ts
│   │   │       └── NotifyRoute.ts
│   │   └── events/                   # Event handling
│   │       ├── EventBus.ts           # NATS/Redis Streams adapter
│   │       ├── EventHandler.ts
│   │       ├── WebhookProcessor.ts
│   │       ├── NotificationDispatcher.ts
│   │       └── OutboxStore.ts        # Postgres outbox for reliability
│   │
│   ├── rag/                         # RAG pipeline
│   │   ├── retrieval/               # Document retrieval
│   │   │   ├── VectorStore.ts       # pgvector-backed implementation
│   │   │   ├── DocumentRetriever.ts
│   │   │   ├── SimilaritySearch.ts
│   │   │   └── QueryProcessor.ts
│   │   ├── generation/              # Response generation
│   │   │   ├── ResponseGenerator.ts
│   │   │   ├── ContextCombiner.ts
│   │   │   ├── GroundingValidator.ts
│   │   │   └── ProvenanceTracker.ts
│   │   ├── indexing/                # Document indexing
│   │   │   ├── DocumentProcessor.ts
│   │   │   ├── ChunkingStrategy.ts
│   │   │   ├── EmbeddingGenerator.ts
│   │   │   └── IndexManager.ts
│   │   └── knowledge/               # Knowledge base
│   │       ├── DocumentRepository.ts
│   │       ├── VersionManager.ts
│   │       ├── SemanticTagger.ts
│   │       └── MetadataExtractor.ts
│   │
│   ├── integrations/                # External integrations
│   │   ├── jira/                    # Jira integration
│   │   │   ├── JiraClient.ts
│   │   │   ├── ProjectSync.ts
│   │   │   ├── IssueTracker.ts
│   │   │   └── WebhookHandler.ts
│   │   ├── notion/                  # Notion integration
│   │   │   ├── NotionClient.ts
│   │   │   ├── PageSync.ts
│   │   │   ├── DatabaseSync.ts
│   │   │   └── ContentExtractor.ts
│   │   ├── confluence/              # Confluence integration
│   │   │   ├── ConfluenceClient.ts
│   │   │   ├── SpaceSync.ts
│   │   │   ├── PageProcessor.ts
│   │   │   └── AttachmentHandler.ts
│   │   ├── slack/                   # Slack integration
│   │   │   ├── SlackClient.ts
│   │   │   ├── MessageSync.ts
│   │   │   ├── ChannelMonitor.ts
│   │   │   └── BotHandler.ts
│   │   ├── teams/                   # Microsoft Teams integration
│   │   │   ├── TeamsClient.ts
│   │   │   ├── ChatSync.ts
│   │   │   ├── MeetingProcessor.ts
│   │   │   └── NotificationSender.ts
│   │   └── common/                  # Shared integration utilities
│   │       ├── BaseClient.ts
│   │       ├── RateLimiter.ts
│   │       ├── RetryHandler.ts
│   │       └── WebhookValidator.ts
│   │
│   ├── security/                    # Security & access control
│   │   ├── auth/                    # Authentication
│   │   │   ├── AuthProvider.ts
│   │   │   ├── SSOHandler.ts
│   │   │   ├── TokenManager.ts
│   │   │   └── SessionValidator.ts
│   │   ├── permissions/             # Permission management
│   │   │   ├── RoleManager.ts
│   │   │   ├── PermissionMatrix.ts
│   │   │   ├── AccessValidator.ts
│   │   │   └── PolicyEngine.ts
│   │   ├── encryption/              # Data encryption
│   │   │   ├── EncryptionService.ts
│   │   │   ├── KeyManager.ts
│   │   │   ├── DataMasker.ts
│   │   │   └── SecureStorage.ts
│   │   └── audit/                   # Audit logging
│   │       ├── AuditLogger.ts       # append-only logs
│   │       ├── EventTracker.ts
│   │       ├── ComplianceChecker.ts
│   │       └── ReportGenerator.ts
│   │
│   ├── lib/                         # Utility libraries
│   │   ├── database/                # Database utilities
│   │   │   ├── prisma.ts            # Prisma client
│   │   │   ├── migrations/
│   │   │   ├── models/
│   │   │   └── queries/
│   │   ├── cache/                   # Caching utilities
│   │   │   ├── RedisClient.ts
│   │   │   ├── CacheManager.ts
│   │   │   └── InMemoryCache.ts
│   │   ├── validation/              # Input validation
│   │   │   ├── SchemaValidator.ts
│   │   │   ├── Sanitizer.ts
│   │   │   └── RateLimiter.ts
│   │   ├── monitoring/              # Monitoring & logging
│   │   │   ├── Logger.ts
│   │   │   ├── MetricsCollector.ts
│   │   │   ├── HealthChecker.ts
│   │   │   └── AlertManager.ts
│   │   └── utils/                   # General utilities
│   │       ├── date.ts
│   │       ├── string.ts
│   │       ├── array.ts
│   │       └── object.ts
│   │
│   ├── hooks/                       # React hooks
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useNotifications.ts
│   │   ├── useWebSocket.ts
│   │   ├── usePermissions.ts
│   │   └── useDebounce.ts
│   │
│   ├── store/                       # State management
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   ├── notificationStore.ts
│   │   ├── projectStore.ts
│   │   └── index.ts
│   │
│   ├── types/                       # TypeScript types
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── integrations.ts
│   │   ├── rag.ts
│   │   ├── security.ts
│   │   └── common.ts
│   │
│   └── styles/                      # Styling
│       ├── globals.css
│       ├── components.css
│       ├── themes/
│       │   ├── light.css
│       │   └── dark.css
│       └── animations.css
│
├── public/                          # Static assets
│   ├── icons/
│   ├── images/
│   └── favicon.ico
│
├── docs/                           # Documentation
│   ├── api/
│   ├── architecture/
│   ├── deployment/
│   └── user-guide/
│
├── tests/                          # Test files
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
│
├── scripts/                        # Build and deployment scripts
│   ├── build.sh
│   ├── deploy.sh
│   ├── migrate.sh
│   └── seed.sh
│
├── docker/                         # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
│
├── .env.example
├── .env.local
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Core Module Pseudocode

### 1. Intent Detection Module

```typescript
// src/core/intent/IntentDetector.ts
export class IntentDetector {
  private classifier: MLClassifier;
  private entityExtractor: EntityExtractor;

  async detectIntent(userInput: string, context: UserContext): Promise<IntentResult> {
    // 1. Preprocess input
    const cleanedInput = this.preprocessInput(userInput);
    
    // 2. Extract entities
    const entities = await this.entityExtractor.extract(cleanedInput);
    
    // 3. Classify intent
    const intent = await this.classifier.classify(cleanedInput, context);
    
    // 4. Calculate confidence
    const confidence = this.calculateConfidence(intent, entities);
    
    // 5. Validate against user permissions
    const isValid = await this.validatePermissions(intent, context.user);
    
    return {
      intent: intent.type,
      entities,
      confidence,
      isValid,
      suggestedActions: this.getSuggestedActions(intent, entities)
    };
  }

  private preprocessInput(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  private calculateConfidence(intent: Intent, entities: Entity[]): number {
    // Weighted confidence calculation based on:
    // - Intent classification score
    // - Entity extraction completeness
    // - Context relevance
    return (intent.score * 0.6) + (entities.completeness * 0.3) + (context.relevance * 0.1);
  }
}
```

### 2. RAG Pipeline Module

```typescript
// src/rag/retrieval/DocumentRetriever.ts
export class DocumentRetriever {
  private vectorStore: VectorStore;
  private embeddingService: EmbeddingService;

  async retrieveRelevantDocuments(
    query: string, 
    context: QueryContext,
    limit: number = 5
  ): Promise<RetrievedDocument[]> {
    // 1. Generate query embedding
    const queryEmbedding = await this.embeddingService.embed(query);
    
    // 2. Perform similarity search (pgvector cosine distance)
    const similarChunks = await this.vectorStore.similaritySearch(
      queryEmbedding,
      {
        limit,
        filter: this.buildPermissionFilter(context.user),
        includeMetadata: true
      }
    );
    
    // 3. Rank by relevance and recency
    const rankedChunks = this.rankChunks(similarChunks, context);
    
    // 4. Group by document and deduplicate
    const groupedDocs = this.groupByDocument(rankedChunks);
    
    // 5. Load full document context
    const enrichedDocs = await this.enrichWithContext(groupedDocs);
    
    return enrichedDocs;
  }

  private buildPermissionFilter(user: User): Filter {
    // Row-level security style filter
    return {
      department: { $in: user.departments },
      accessLevel: { $lte: user.accessLevel },
      isPublic: true
    };
  }

  private rankChunks(chunks: VectorChunk[], context: QueryContext): VectorChunk[] {
    return chunks
      .map(chunk => ({
        ...chunk,
        score: this.calculateRelevanceScore(chunk, context)
      }))
      .sort((a, b) => b.score - a.score);
  }

  private calculateRelevanceScore(chunk: VectorChunk, context: QueryContext): number {
    const similarityScore = chunk.similarity;
    const recencyScore = this.calculateRecencyScore(chunk.metadata.updatedAt);
    const authorityScore = this.calculateAuthorityScore(chunk.metadata.source);
    
    return (similarityScore * 0.5) + (recencyScore * 0.3) + (authorityScore * 0.2);
  }
}
```

### 3. Integration Module

```typescript
// src/integrations/jira/JiraClient.ts
export class JiraClient {
  private apiClient: APIClient;
  private rateLimiter: RateLimiter;
  private retryHandler: RetryHandler;

  async updateProjectStatus(
    projectKey: string, 
    status: string, 
    user: User
  ): Promise<UpdateResult> {
    try {
      // 1. Validate permissions
      await this.validateProjectAccess(projectKey, user);
      
      // 2. Get current project state
      const project = await this.getProject(projectKey);
      
      // 3. Update status
      const updateResult = await this.rateLimiter.execute(async () => {
        return await this.apiClient.post(`/issue/${projectKey}/transitions`, {
          transition: { name: status },
          comment: {
            body: `Status updated via AI Communication Hub by ${user.name}`
          }
        });
      });
      
      // 4. Log audit trail
      await this.auditLogger.log({
        action: 'PROJECT_STATUS_UPDATE',
        projectKey,
        oldStatus: project.status,
        newStatus: status,
        userId: user.id,
        timestamp: new Date()
      });
      
      // 5. Trigger knowledge base update via Event Bus
      await this.eventBus.emit('project.updated', {
        projectKey,
        changes: { status },
        updatedBy: user.id
      });
      
      return {
        success: true,
        projectKey,
        newStatus: status,
        updatedAt: new Date()
      };
      
    } catch (error) {
      await this.errorHandler.handle(error, { projectKey, status, user });
      throw error;
    }
  }

  private async validateProjectAccess(projectKey: string, user: User): Promise<void> {
    const permissions = await this.permissionService.getProjectPermissions(projectKey, user.id);
    
    if (!permissions.canWrite) {
      throw new PermissionError(`User ${user.id} does not have write access to project ${projectKey}`);
    }
  }
}
```

### 4. Security Module

```typescript
// src/security/auth/AuthProvider.ts
export class AuthProvider {
  private ssoHandler: SSOHandler;
  private tokenManager: TokenManager;
  private sessionValidator: SessionValidator;

  async authenticateUser(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // 1. Validate credentials with SSO
      const ssoResult = await this.ssoHandler.authenticate(credentials);
      
      // 2. Generate JWT token
      const token = await this.tokenManager.generateToken({
        userId: ssoResult.user.id,
        email: ssoResult.user.email,
        roles: ssoResult.user.roles,
        departments: ssoResult.user.departments
      });
      
      // 3. Create session
      const session = await this.createSession(ssoResult.user, token);
      
      // 4. Log authentication
      await this.auditLogger.log({
        action: 'USER_LOGIN',
        userId: ssoResult.user.id,
        timestamp: new Date(),
        ipAddress: credentials.ipAddress
      });
      
      return {
        success: true,
        user: ssoResult.user,
        token,
        sessionId: session.id,
        expiresAt: session.expiresAt
      };
      
    } catch (error) {
      await this.auditLogger.log({
        action: 'LOGIN_FAILED',
        email: credentials.email,
        error: error.message,
        timestamp: new Date()
      });
      throw error;
    }
  }

  async validateSession(sessionId: string): Promise<SessionValidationResult> {
    const session = await this.sessionValidator.validate(sessionId);
    
    if (!session.isValid) {
      return { isValid: false, reason: session.reason };
    }
    
    // Refresh session if needed
    if (session.needsRefresh) {
      await this.refreshSession(sessionId);
    }
    
    return {
      isValid: true,
      user: session.user,
      permissions: await this.getUserPermissions(session.user.id)
    };
  }
}
```

## API Structure

### REST API Endpoints

```typescript
// src/app/api/chat/route.ts
export async function POST(request: Request) {
  const { message, context } = await request.json();
  
  // 1. Authenticate user
  const user = await authProvider.authenticateRequest(request);
  
  // 2. Detect intent
  const intent = await intentDetector.detectIntent(message, user.context);
  
  // 3. Route command (RBAC enforced)
  const result = await commandRouter.route(intent, user);
  
  // 4. Generate response
  const response = await responseGenerator.generate(result, user);
  
  return Response.json(response);
}

// src/app/api/integrations/jira/webhook/route.ts
export async function POST(request: Request) {
  const payload = await request.json();
  
  // 1. Validate webhook signature
  const isValid = await webhookValidator.validate(request, payload);
  if (!isValid) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // 2. Process webhook
  await webhookProcessor.process('jira', payload);
  
  return Response.json({ success: true });
}
```

## Database Schema

```prisma
// Prisma schema highlights (PostgreSQL + pgvector via raw SQL migrations)

model Document {
  id         String          @id @default(cuid())
  title      String
  content    String
  type       String
  category   String?
  tags       String[]
  fileUrl    String?
  fileSize   Int?
  uploadedBy String
  isActive   Boolean         @default(true)
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt

  user   User                @relation(fields: [uploadedBy], references: [id])
  chunks DocumentChunk[]
}

model DocumentChunk {
  id         String   @id @default(cuid())
  documentId String
  content    String
  chunkIndex Int
  embedding  Bytes?   // stored as vector via custom migration; mirrored here
  metadata   Json?
  createdAt  DateTime @default(now())

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
}

// Raw SQL migration example:
// ALTER TABLE "DocumentChunk" ADD COLUMN embedding vector(1536);
```

This modular architecture provides:

1. **Separation of Concerns**: Each module has a specific responsibility
2. **Scalability**: Modules can be scaled independently
3. **Maintainability**: Clear boundaries and interfaces
4. **Testability**: Each module can be unit tested
5. **Extensibility**: New integrations and features can be added easily
6. **Security**: Centralized security and permission management
7. **Performance**: Optimized for fast retrieval and response generation
