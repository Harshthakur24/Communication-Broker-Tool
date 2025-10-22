# Functional Flow - AI Communication Hub

## User Input to AI Response Flow

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant UI as UI (Web/Slack)
  participant S as Server (Logic)
  participant P as Permissions
  participant R as RAG Engine
  participant V as Vector DB
  participant DB as PostgreSQL (Prisma)

  U->>UI: Type message
  UI->>S: POST /api/chat/messages
  S->>P: Validate auth + RBAC
  P-->>S: Allowed/Denied
  alt Query
    S->>R: detectIntent(query) -> QUERY
    R->>V: similaritySearch(embedding)
    V-->>R: top-k chunks (+metadata)
    R->>DB: hydrate documents/metadata
    DB-->>R: docs
    R-->>S: grounded context
    S-->>UI: Answer + citations
  else Update (command)
    S->>R: detectIntent -> UPDATE
    S->>DB: fetch target state
    S->>Integrations: call API (e.g., Jira)
    Integrations-->>S: success
    S->>DB: persist change, enqueue events
    S->>V: upsert/reindex embeddings
    S-->>UI: Confirmation + provenance
  else Notify
    S->>R: detectIntent -> NOTIFY
    S->>Bus: publish notification event
    S-->>UI: Notification scheduled
  end
```

### 1. User Input Processing
```
User Types: "Mark this project as in progress"
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    INPUT VALIDATION                            │
├─────────────────────────────────────────────────────────────────┤
│  • Sanitize input text                                         │
│  • Check for malicious content                                 │
│  • Validate user permissions                                   │
│  • Extract user context (department, role, current project)    │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                   INTENT DETECTION                             │
├─────────────────────────────────────────────────────────────────┤
│  • Classify intent: UPDATE, QUERY, NOTIFY, or CHAT            │
│  • Extract entities: "project", "in progress"                 │
│  • Determine action type: Project Management Update            │
│  • Confidence score: 0.95                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Context Analysis & Memory Management
```
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 CONTEXT MANAGER                                │
├─────────────────────────────────────────────────────────────────┤
│  • Retrieve user session history                               │
│  • Load current project context                                │
│  • Check recent interactions                                   │
│  • Validate user has access to target project                 │
│  • Load project metadata and current status                    │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 COMMAND ROUTER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Intent: UPDATE                                                │
│  Action: Project Status Change                                 │
│  Target: Jira Integration                                      │
│  Permissions: ✓ User has write access to project              │
│  Route: → Integration Layer → Jira API                        │
└─────────────────────────────────────────────────────────────────┘
```

```mermaid
flowchart TD
  A[Load user/session] --> B[Fetch recent thread]
  B --> C[Resolve entities (projects, policies, teams)]
  C --> D[Check permissions]
  D -->|ok| E[Assemble context window]
  D -->|deny| F[Return 403 + suggestion]
```

### 3. Integration & Update Processing
```
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 JIRA INTEGRATION                               │
├─────────────────────────────────────────────────────────────────┤
│  • Authenticate with Jira API                                  │
│  • Find project by context/name                                │
│  • Update status to "In Progress"                              │
│  • Add comment: "Status updated via AI Hub"                    │
│  • Return success confirmation                                 │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 KNOWLEDGE BASE UPDATE                          │
├─────────────────────────────────────────────────────────────────┤
│  • Update project status in local KB                           │
│  • Re-index project document                                   │
│  • Update vector embeddings                                    │
│  • Trigger notification to project team                        │
│  • Log change in audit system                                  │
└─────────────────────────────────────────────────────────────────┘
```

```mermaid
flowchart LR
  I1[Command Router] --> I2{Which system?}
  I2 -->|Jira| J[Jira API]
  I2 -->|Confluence| C[Confluence API]
  I2 -->|Notion| N[Notion API]
  I2 -->|Slack/Teams| T[Messaging API]
  J --> R1{Success?}
  C --> R1
  N --> R1
  T --> R1
  R1 -->|yes| K[Persist change in Postgres]
  K --> X[Emit event → Reindex]
  R1 -->|no| E1[Retry/Queue + User notice]
```

### 4. Response Generation & Delivery
```
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 RESPONSE GENERATOR                             │
├─────────────────────────────────────────────────────────────────┤
│  • Generate confirmation message                               │
│  • Include project details and new status                      │
│  • Add relevant context and next steps                         │
│  • Format with markdown and styling                            │
│  • Include provenance: "Updated via Jira API"                 │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 UI UPDATE & NOTIFICATION                       │
├─────────────────────────────────────────────────────────────────┤
│  • Update chat interface with response                         │
│  • Send real-time notification to project team                 │
│  • Update right panel with project status change               │
│  • Log interaction in audit system                             │
│  • Store in conversation history                               │
└─────────────────────────────────────────────────────────────────┘
```

## Query Processing Flow

```mermaid
flowchart TD
  Q1[User asks: 'Is the new policy live?'] --> Q2[Intent: QUERY]
  Q2 --> Q3[Generate embedding]
  Q3 --> Q4[Vector search Top-K]
  Q4 --> Q5[RBAC filter + recency ranking]
  Q5 --> Q6[Compose context window]
  Q6 --> Q7[LLM generation (grounded)]
  Q7 --> Q8[Answer + provenance]
```

### Example: "Is the new policy live?"

```
User Input: "Is the new policy live?"
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                   INTENT DETECTION                             │
├─────────────────────────────────────────────────────────────────┤
│  Intent: QUERY                                                 │
│  Entities: ["new policy", "live"]                              │
│  Action: Information Retrieval                                 │
│  Confidence: 0.92                                              │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                   RAG PIPELINE                                 │
├─────────────────────────────────────────────────────────────────┤
│  • Generate query embedding                                    │
│  • Search vector store for policy documents                    │
│  • Retrieve top 5 relevant chunks                             │
│  • Rank by relevance and recency                              │
│  • Filter by user permissions                                 │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 CONTEXT ENRICHMENT                             │
├─────────────────────────────────────────────────────────────────┤
│  • Load policy metadata (version, effective date)              │
│  • Check deployment status                                     │
│  • Verify current active policies                              │
│  • Cross-reference with HR systems                            │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 LLM GENERATION                                 │
├─────────────────────────────────────────────────────────────────┤
│  • Combine retrieved context with user query                   │
│  • Generate grounded response                                  │
│  • Include specific policy details and dates                   │
│  • Add source citations                                        │
│  • Ensure factual accuracy                                     │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 RESPONSE DELIVERY                              │
├─────────────────────────────────────────────────────────────────┤
│  Response: "Yes, the new remote work policy (v2.1) went live  │
│  on March 15th. It includes updated guidelines for hybrid     │
│  schedules and equipment reimbursement. [Source: HR_Policy_    │
│  Remote_Work_v2.1.pdf, last updated March 14th]"              │
└─────────────────────────────────────────────────────────────────┘
```

## Event-Driven Update Flow

```mermaid
sequenceDiagram
  participant W as Webhook (Jira)
  participant S as Server
  participant DB as Postgres
  participant V as Vector Index
  participant U as Users
  W->>S: Webhook payload + signature
  S->>S: Validate signature
  S->>DB: Upsert canonical record
  S->>V: Re-embed changed fields/chunks
  S->>U: Dispatch notifications (in-app/Slack)
  S->>DB: Write audit log
```

### Example: Jira Webhook Received

```
Jira Webhook: Project status changed to "Completed"
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 WEBHOOK PROCESSOR                              │
├─────────────────────────────────────────────────────────────────┤
│  • Validate webhook signature                                  │
│  • Parse payload and extract changes                           │
│  • Identify affected project and team                          │
│  • Queue for processing                                        │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 EVENT HANDLER                                  │
├─────────────────────────────────────────────────────────────────┤
│  • Update local knowledge base                                 │
│  • Re-index project documents                                  │
│  • Update vector embeddings                                    │
│  • Trigger notifications                                       │
│  • Log audit trail                                            │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 NOTIFICATION DISPATCHER                        │
├─────────────────────────────────────────────────────────────────┤
│  • Identify stakeholders (project team, managers)              │
│  • Generate personalized notifications                         │
│  • Send via multiple channels (in-app, email, Slack)          │
│  • Update real-time dashboard                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling & Fallback Flow

```
Error Detected: Jira API unavailable
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 ERROR HANDLER                                  │
├─────────────────────────────────────────────────────────────────┤
│  • Log error with context                                      │
│  • Attempt retry with exponential backoff                      │
│  • If retry fails, queue for later processing                  │
│  • Notify user of temporary limitation                         │
│  • Provide alternative actions                                 │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 FALLBACK RESPONSE                              │
├─────────────────────────────────────────────────────────────────┤
│  Response: "I'm having trouble connecting to Jira right now.   │
│  I've queued your request and will process it as soon as the   │
│  connection is restored. In the meantime, you can check the    │
│  project status directly in Jira or try again in a few minutes."│
└─────────────────────────────────────────────────────────────────┘
```

## Performance Optimization Flow

```
High-Load Scenario: Multiple concurrent queries
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 LOAD BALANCER                                  │
├─────────────────────────────────────────────────────────────────┤
│  • Distribute requests across multiple RAG instances           │
│  • Cache frequent queries                                      │
│  • Prioritize urgent requests                                  │
│  • Queue non-critical updates                                  │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 CACHE LAYER                                    │
├─────────────────────────────────────────────────────────────────┤
│  • Redis cache for frequent queries                            │
│  • CDN for static responses                                    │
│  • In-memory cache for user sessions                           │
│  • Vector cache for similar queries                            │
└─────────────────────────────────────────────────────────────────┘
```

## Security & Compliance Flow

```
Every Request: Security validation
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 SECURITY MIDDLEWARE                            │
├─────────────────────────────────────────────────────────────────┤
│  • Validate JWT token                                          │
│  • Check user permissions                                      │
│  • Rate limiting                                               │
│  • Input sanitization                                          │
│  • Audit logging                                               │
└─────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 DATA PRIVACY                                   │
├─────────────────────────────────────────────────────────────────┤
│  • Encrypt sensitive data                                      │
│  • Mask PII in logs                                            │
│  • Ensure data residency                                       │
│  • Apply retention policies                                    │
│  • GDPR compliance checks                                      │
└─────────────────────────────────────────────────────────────────┘
```
