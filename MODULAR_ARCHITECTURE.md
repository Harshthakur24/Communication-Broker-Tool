# Modular Architecture Structure

## Project Structure (modular)

```text
ai-communication-hub/
├── src/
│   ├── ui/                         # Frontend UI (Next.js/React)
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   ├── layout/
│   │   │   ├── ui/
│   │   │   └── insights/
│   │   ├── pages_or_app/
│   │   └── styles/
│   │
│   ├── core/                       # Core runtime logic
│   │   ├── intent/
│   │   ├── context/
│   │   ├── router/
│   │   └── events/
│   │
│   ├── rag/                        # RAG pipeline
│   │   ├── retrieval/
│   │   ├── generation/
│   │   ├── indexing/
│   │   └── knowledge/
│   │
│   ├── integrations/               # External systems
│   │   ├── jira/
│   │   ├── notion/
│   │   ├── confluence/
│   │   ├── slack/
│   │   ├── teams/
│   │   └── common/
│   │
│   ├── security/                   # Security & access control
│   │   ├── auth/
│   │   ├── permissions/
│   │   ├── encryption/
│   │   └── audit/
│   │
│   ├── api/                        # API route handlers (Next.js)
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── documents/
│   │   ├── users/
│   │   └── webhooks/
│   │
│   └── lib/                        # Shared libs: db, cache, utils
│       ├── db/
│       │   ├── client.ts           # Prisma client
│       │   ├── repositories/       # e.g., ChatRepo, DocRepo
│       │   └── migrations/
│       ├── cache/
│       ├── logging/
│       └── utils/
│
├── prisma/
│   └── schema.prisma
├── public/
├── scripts/
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

### Command Router (linking modules)

```typescript
// src/core/router/CommandRouter.ts
export class CommandRouter {
  constructor(
    private readonly permissionValidator: PermissionValidator,
    private readonly jiraClient: JiraClient,
    private readonly retriever: DocumentRetriever,
    private readonly responseGenerator: ResponseGenerator,
  ) {}

  async route(intent: IntentResult, context: UserContext) {
    await this.permissionValidator.ensure(intent, context.user);

    if (intent.intent === 'QUERY') {
      const docs = await this.retriever.retrieveRelevantDocuments(intent.normalizedQuery, { user: context.user });
      return this.responseGenerator.generate(docs, intent);
    }

    if (intent.intent === 'UPDATE') {
      // Example: project status update routed to Jira
      await this.jiraClient.updateProjectStatus(intent.entities.projectKey, intent.entities.status, context.user);
      return { type: 'CONFIRMATION', message: 'Project marked as In Progress', provenance: ['Jira'] };
    }

    if (intent.intent === 'NOTIFY') {
      // publish to event bus (omitted)
      return { type: 'NOTIFICATION', message: 'Notification scheduled' };
    }

    return { type: 'CHAT', message: 'How can I help?' };
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
    
    // 2. Perform similarity search
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
      
      // 5. Trigger knowledge base update
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
  
  // 3. Route command
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

```sql
-- Users and Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  role VARCHAR(50),
  access_level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id),
  content TEXT NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge Base Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  source VARCHAR(255),
  document_type VARCHAR(100),
  department VARCHAR(100),
  access_level INTEGER DEFAULT 1,
  version INTEGER DEFAULT 1,
  embedding VECTOR(1536), -- For vector similarity search
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Integration Configurations
CREATE TABLE integration_configs (
  id UUID PRIMARY KEY,
  integration_type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

This modular architecture provides:

1. **Separation of Concerns**: Each module has a specific responsibility
2. **Scalability**: Modules can be scaled independently
3. **Maintainability**: Clear boundaries and interfaces
4. **Testability**: Each module can be unit tested
5. **Extensibility**: New integrations and features can be added easily
6. **Security**: Centralized security and permission management
7. **Performance**: Optimized for fast retrieval and response generation
