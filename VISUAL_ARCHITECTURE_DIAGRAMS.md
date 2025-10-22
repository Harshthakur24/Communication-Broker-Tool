# 🎨 Visual Architecture Diagrams

> **Comprehensive visual representations of the AI Communication Hub architecture**

---

## 📊 System Overview Diagram

```
                    ╔══════════════════════════════════════════════╗
                    ║    INTERNAL AI COMMUNICATION HUB            ║
                    ║         (RAG-Powered System)                ║
                    ╚══════════════════════════════════════════════╝
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   EMPLOYEES   │           │  INTEGRATIONS │           │  ADMIN USERS  │
│               │           │               │           │               │
│ • Natural Lang│           │ • Jira        │           │ • Manage KB   │
│ • Ask Questions│          │ • Notion      │           │ • Monitor     │
│ • Get Answers │           │ • Confluence  │           │ • Configure   │
│ • View Sources│           │ • Slack/Teams │           │ • Analytics   │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                                    ▼
        ┌─────────────────────────────────────────────────────────┐
        │                 API GATEWAY & AUTH                      │
        │  • JWT Authentication                                   │
        │  • Rate Limiting                                        │
        │  • Request Validation                                   │
        └─────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   CHAT API   │  │  DOCS API    │  │  ADMIN API   │
        │              │  │              │  │              │
        │ • Messages   │  │ • Upload     │  │ • Users      │
        │ • Sessions   │  │ • Search     │  │ • Settings   │
        │ • RAG Query  │  │ • Manage     │  │ • Analytics  │
        └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
               │                 │                 │
               └─────────────────┼─────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────────────────┐
        │              BUSINESS LOGIC LAYER                       │
        │                                                         │
        │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
        │  │   Intent     │  │   Context    │  │   Command    │  │
        │  │  Detection   │→ │   Manager    │→ │   Router     │  │
        │  └──────────────┘  └──────────────┘  └──────────────┘  │
        └─────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │  RAG ENGINE  │ │  INTEGRATIONS│ │  KNOWLEDGE   │
        │              │ │              │ │     BASE     │
        │ • Vector     │ │ • Jira Sync  │ │              │
        │   Search     │ │ • Notion     │ │ • Documents  │
        │ • Embeddings │ │ • Webhooks   │ │ • Chunks     │
        │ • LLM Gen.   │ │ • Events     │ │ • Metadata   │
        └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
               │                │                │
               └────────────────┼────────────────┘
                                │
                                ▼
        ┌─────────────────────────────────────────────────────────┐
        │               DATA PERSISTENCE LAYER                    │
        │                                                         │
        │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
        │  │  PostgreSQL  │  │    Redis     │  │  File Store  │  │
        │  │              │  │              │  │              │  │
        │  │ • Users      │  │ • Sessions   │  │ • Uploads    │  │
        │  │ • Documents  │  │ • Cache      │  │ • Backups    │  │
        │  │ • Embeddings │  │ • Queue      │  │ • Exports    │  │
        │  │ • Messages   │  │ • Pub/Sub    │  │              │  │
        │  └──────────────┘  └──────────────┘  └──────────────┘  │
        └─────────────────────────────────────────────────────────┘
```

---

## 🔄 RAG Pipeline Flow Diagram

```
                        USER QUERY: "What's the new policy?"
                                      │
                                      ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 1. INPUT PROCESSING                                     │
        │    • Sanitize and validate input                        │
        │    • Extract user context (role, department)            │
        └──────────────────────┬──────────────────────────────────┘
                               ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 2. INTENT DETECTION                                     │
        │    • Classify: QUERY (confidence 0.92)                  │
        │    • Entities: ["policy"]                               │
        └──────────────────────┬──────────────────────────────────┘
                               ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 3. EMBEDDING GENERATION                                 │
        │    Query → OpenAI API → 1536-dim vector                 │
        │    [0.012, -0.034, 0.156, ..., 0.089]                   │
        └──────────────────────┬──────────────────────────────────┘
                               ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 4. VECTOR SIMILARITY SEARCH                             │
        │                                                         │
        │    Query Embedding vs. All Document Chunk Embeddings    │
        │                                                         │
        │    Cosine Similarity Calculation:                       │
        │    ┌──────────────────────────────────────┐             │
        │    │ Doc Chunk 1: 0.89 (High Match)      │             │
        │    │ Doc Chunk 2: 0.85                   │             │
        │    │ Doc Chunk 3: 0.82                   │             │
        │    │ Doc Chunk 4: 0.78                   │             │
        │    │ Doc Chunk 5: 0.75                   │             │
        │    └──────────────────────────────────────┘             │
        └──────────────────────┬──────────────────────────────────┘
                               ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 5. PERMISSION FILTERING                                 │
        │    • Check user's department access                     │
        │    • Filter out confidential docs                       │
        │    • Apply role-based restrictions                      │
        └──────────────────────┬──────────────────────────────────┘
                               ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 6. CONTEXT BUILDING                                     │
        │                                                         │
        │    Build context for LLM:                               │
        │    ┌──────────────────────────────────────┐             │
        │    │ Title: Remote Work Policy v2.1      │             │
        │    │ Content: "Employees may work..."    │             │
        │    │ Source: HR_Policy_2024.pdf          │             │
        │    │ ─────────────────────────────────── │             │
        │    │ Title: Office Guidelines            │             │
        │    │ Content: "All employees must..."    │             │
        │    │ Source: Guidelines_v3.pdf           │             │
        │    └──────────────────────────────────────┘             │
        └──────────────────────┬──────────────────────────────────┘
                               ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 7. LLM RESPONSE GENERATION                              │
        │                                                         │
        │    System Prompt + Context + User Query                 │
        │              ↓                                          │
        │       GPT-3.5-turbo                                     │
        │              ↓                                          │
        │    Generated Response (max 1000 tokens)                 │
        └──────────────────────┬──────────────────────────────────┘
                               ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 8. GROUNDING VALIDATION                                 │
        │    • Verify response matches retrieved context          │
        │    • Check for hallucinations                           │
        │    • Ensure factual accuracy                            │
        └──────────────────────┬──────────────────────────────────┘
                               ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 9. SOURCE ATTRIBUTION                                   │
        │    • Add citations to response                          │
        │    • Link to source documents                           │
        │    • Display confidence scores                          │
        └──────────────────────┬──────────────────────────────────┘
                               ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 10. RESPONSE DELIVERY                                   │
        │                                                         │
        │    "Yes, the new remote work policy (v2.1) went live   │
        │    on March 15th. It includes updated guidelines for    │
        │    hybrid schedules and equipment reimbursement.        │
        │                                                         │
        │    Sources:                                             │
        │    📄 HR_Policy_Remote_Work_v2.1.pdf (similarity: 0.89) │
        │    📄 Employee_Handbook_2024.pdf (similarity: 0.85)     │
        └─────────────────────────────────────────────────────────┘
```

---

## 📐 Data Flow Architecture

```
                    ╔═══════════════════════════════╗
                    ║      USER INTERFACE           ║
                    ╚═══════════════════════════════╝
                              │ HTTP/WebSocket
                              ▼
        ┌───────────────────────────────────────────────────┐
        │              NEXT.JS API ROUTES                   │
        │  /api/chat/messages      /api/documents/upload    │
        │  /api/auth/login         /api/notifications       │
        └───────────────┬───────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  AUTHENTICATION  │          │   AUTHORIZATION  │
│                  │          │                  │
│  • JWT Verify    │          │  • RBAC Check    │
│  • Session Valid │          │  • Permission    │
└────────┬─────────┘          └────────┬─────────┘
         │                              │
         └──────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────────────────┐
        │           BUSINESS LOGIC HANDLERS                 │
        │                                                   │
        │  ┌─────────────┐    ┌─────────────┐              │
        │  │   Intent    │ →  │   Context   │              │
        │  │  Detector   │    │   Manager   │              │
        │  └─────────────┘    └─────────────┘              │
        │                                                   │
        │           ┌─────────────┐                         │
        │           │   Command   │                         │
        │           │   Router    │                         │
        │           └──────┬──────┘                         │
        └──────────────────┼────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   RAG        │  │ INTEGRATIONS │  │   EVENTS     │
│   SERVICE    │  │              │  │              │
│              │  │ • Jira API   │  │ • Webhooks   │
│ • Search     │  │ • Notion API │  │ • Pub/Sub    │
│ • Embed      │  │ • Slack API  │  │ • Notifs     │
│ • Generate   │  └──────────────┘  └──────────────┘
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│              DATA ACCESS LAYER                   │
│                                                  │
│  ┌─────────────────┐      ┌─────────────────┐   │
│  │   PRISMA ORM    │      │   REDIS CLIENT  │   │
│  │                 │      │                 │   │
│  │ • Query Builder │      │ • Cache Get/Set │   │
│  │ • Migrations    │      │ • Pub/Sub       │   │
│  └────────┬────────┘      └────────┬────────┘   │
└───────────┼──────────────────────┼──────────────┘
            │                      │
            ▼                      ▼
  ┌──────────────────┐   ┌──────────────────┐
  │   PostgreSQL     │   │      Redis       │
  │                  │   │                  │
  │ • Users          │   │ • Sessions       │
  │ • Documents      │   │ • Cache          │
  │ • Embeddings     │   │ • Real-time      │
  │ • Messages       │   │   Events         │
  └──────────────────┘   └──────────────────┘
```

---

## 🎯 Event-Driven Architecture Flow

```
                        ╔═══════════════════════════╗
                        ║     EVENT SOURCES         ║
                        ╚═══════════════════════════╝
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│ User Actions │          │   Webhooks   │          │   Scheduled  │
│              │          │              │          │   (Future)   │
│ • Chat       │          │ • Jira       │          │              │
│ • Upload Doc │          │ • Notion     │          │ • Cleanup    │
│ • Update     │          │ • Slack      │          │ • Reports    │
└──────┬───────┘          └──────┬───────┘          └──────┬───────┘
       │                         │                         │
       └─────────────────────────┼─────────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────────────────────┐
        │              EVENT BUS / QUEUE                     │
        │                                                    │
        │  ┌────────────────────────────────────────┐        │
        │  │  Event Types:                          │        │
        │  │  • document.uploaded                   │        │
        │  │  • document.updated                    │        │
        │  │  • project.status.changed              │        │
        │  │  • user.query.received                 │        │
        │  │  • notification.triggered              │        │
        │  │  • integration.sync.completed          │        │
        │  └────────────────────────────────────────┘        │
        └────────────────────┬───────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   KB         │   │ Notification │   │ Integration  │
│   Updater    │   │  Dispatcher  │   │   Syncer     │
│              │   │              │   │              │
│ • Re-index   │   │ • Email      │   │ • Update     │
│ • Re-embed   │   │ • Slack      │   │   external   │
│ • Cache      │   │ • In-app     │   │   systems    │
│   invalidate │   │ • WebSocket  │   │ • Sync KB    │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                          ▼
        ┌────────────────────────────────────────────────────┐
        │            SIDE EFFECTS                            │
        │                                                    │
        │  • Database updates                                │
        │  • Cache invalidation                              │
        │  • Real-time UI updates (WebSocket)                │
        │  • Audit log entries                               │
        │  • Metrics collection                              │
        └────────────────────────────────────────────────────┘
```

### Example Event Flow: Document Upload

```
USER UPLOADS DOCUMENT
        │
        ▼
EVENT: "document.uploaded"
  data: {
    documentId: "doc_123",
    userId: "user_456",
    filename: "policy.pdf",
    size: 2048576
  }
        │
        ├──────────────┬──────────────┬──────────────┐
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐  ┌────────┐  ┌────────────┐  ┌───────────┐
│ KB Updater   │  │ Notif  │  │ Audit Log  │  │  Metrics  │
│              │  │        │  │            │  │           │
│ • Extract    │  │ • Email│  │ • Log      │  │ • Count   │
│   text       │  │   team │  │   upload   │  │ • Size    │
│ • Chunk      │  │ • Slack│  │ • Track    │  │ • Type    │
│ • Embed      │  │   msg  │  │   user     │  │           │
│ • Store      │  └────────┘  └────────────┘  └───────────┘
└──────┬───────┘
       │
       ▼
EMIT: "document.indexed"
  data: {
    documentId: "doc_123",
    chunksCount: 15,
    status: "ready"
  }
```

---

## 🔒 Security Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LAYER 1: NETWORK SECURITY                        │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │     WAF      │  │    DDoS      │  │     VPN      │              │
│  │  Protection  │  │  Protection  │  │    Access    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│               LAYER 2: APPLICATION SECURITY                         │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │     SSL/     │  │     Rate     │  │    Input     │              │
│  │   TLS 1.3    │  │   Limiting   │  │  Validation  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│          LAYER 3: AUTHENTICATION & AUTHORIZATION                    │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                  Authentication Flow                       │    │
│  │                                                            │    │
│  │  User Login → SSO → JWT Token → Session Create            │    │
│  │                                                            │    │
│  │  Every Request:                                            │    │
│  │  JWT Verify → Session Valid → Permission Check → Allow    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   SSO/OAuth2 │  │     JWT      │  │     RBAC     │              │
│  │   (Company)  │  │   Tokens     │  │   Matrix     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                LAYER 4: DATA SECURITY                               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  AES-256     │  │     PII      │  │    Secure    │              │
│  │  Encryption  │  │   Masking    │  │   Backups    │              │
│  │  (At Rest)   │  │   (in logs)  │  │  (Encrypted) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│               LAYER 5: AUDIT & COMPLIANCE                           │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                  Audit Trail                               │    │
│  │  • Who: User ID, Role                                      │    │
│  │  • What: Action performed                                  │    │
│  │  • When: Timestamp (UTC)                                   │    │
│  │  • Where: IP address, location                             │    │
│  │  • How: Success/failure                                    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │    GDPR      │  │    SOC 2     │  │   Retention  │              │
│  │  Compliance  │  │  Compliance  │  │   Policies   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Database Schema Visualization

```
┌──────────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                             │
└──────────────────────────────────────────────────────────────────┘

┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│    USERS      │          │   SESSIONS    │          │  DOCUMENTS    │
├───────────────┤          ├───────────────┤          ├───────────────┤
│ id            │──────────│ id            │          │ id            │
│ email  (UNIQ) │          │ userId   (FK) │─────┐    │ title         │
│ name          │          │ token   (UNIQ)│     │    │ content       │
│ password      │     ┌────│ expiresAt     │     │    │ type          │
│ department    │     │    │ createdAt     │     │    │ category      │
│ role          │     │    └───────────────┘     │    │ tags[]        │
│ isActive      │     │                          │    │ uploadedBy(FK)│─┐
│ createdAt     │     │                          │    │ fileSize      │ │
│ updatedAt     │     │                          │    │ isActive      │ │
└───────┬───────┘     │                          │    │ createdAt     │ │
        │             │                          │    │ updatedAt     │ │
        │             │                          │    └───────┬───────┘ │
        │             │                          │            │         │
        │             │                          │            │         │
        │             │    ┌──────────────────┐  │            │         │
        │             └────│  CHAT SESSIONS   │  │            │         │
        │                  ├──────────────────┤  │            │         │
        │                  │ id               │  │            │         │
        │                  │ userId (FK) ─────┼──┘            │         │
        │                  │ title            │               │         │
        │                  │ isActive         │               │         │
        │                  │ createdAt        │               │         │
        │                  │ updatedAt        │               │         │
        │                  └────────┬─────────┘               │         │
        │                           │                         │         │
        │                           │                         │         │
        │                           │    ┌─────────────────┐  │         │
        │                           └────│ CHAT MESSAGES   │  │         │
        │                                ├─────────────────┤  │         │
        │                                │ id              │  │         │
        │                                │ sessionId  (FK) │  │         │
        │                                │ type            │  │         │
        │                                │ content         │  │         │
        │                                │ sources (JSON)  │  │         │
        │                                │ metadata (JSON) │  │         │
        │                                │ createdAt       │  │         │
        │                                └─────────────────┘  │         │
        │                                                     │         │
        │                                                     │         │
        │                                ┌─────────────────┐  │         │
        └────────────────────────────────│ DOCUMENT CHUNKS │◄─┘         │
                                         ├─────────────────┤            │
                                         │ id              │            │
                                         │ documentId (FK) │────────────┘
                                         │ content         │
                                         │ chunkIndex      │
                                         │ embedding (JSON)│ ← Vector!
                                         │ metadata (JSON) │
                                         │ createdAt       │
                                         └─────────────────┘

RELATIONSHIPS:
• users.id → sessions.userId (1:many)
• users.id → documents.uploadedBy (1:many)
• users.id → chat_sessions.userId (1:many)
• chat_sessions.id → chat_messages.sessionId (1:many)
• documents.id → document_chunks.documentId (1:many)

INDEXES:
• users: email (unique)
• sessions: token (unique)
• documents: category, tags, uploadedBy
• document_chunks: documentId, chunkIndex
• chat_messages: sessionId, createdAt
```

---

## 🚦 User Journey Flowchart

### Journey 1: New Employee Onboarding

```
START: New Employee Joins
        │
        ▼
┌─────────────────┐
│  Receive Login  │
│  Credentials    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│  Login via SSO  │────→  │  Setup Profile  │
│  (First Time)   │       │  • Name         │
└────────┬────────┘       │  • Department   │
         │                │  • Role         │
         │                └─────────────────┘
         ▼
┌──────────────────────────────┐
│  Welcome Screen              │
│  • Tutorial walkthrough      │
│  • Suggested first questions │
│  • Knowledge base intro      │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Ask First Question          │
│  "Where can I find the       │
│   employee handbook?"        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  RAG System Retrieves        │
│  • Employee Handbook PDF     │
│  • Onboarding Guide          │
│  • Benefits Overview         │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  AI Response with Sources    │
│  "You can find the employee  │
│   handbook at..."            │
│  [Link to PDF]               │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Employee Productive ✓       │
│  • Found information         │
│  • Saved time                │
│  • Positive experience       │
└──────────────────────────────┘
```

### Journey 2: Manager Project Update

```
START: Manager needs to update project
        │
        ▼
┌─────────────────┐
│  Open AI Hub    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│  Type Command                │
│  "Mark Project Alpha as      │
│   in progress"               │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Intent Detection            │
│  • Type: UPDATE              │
│  • Entity: Project Alpha     │
│  • Action: Status Change     │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐       ┌─────────────┐
│  Permission Check            │─NO──→ │  Error Msg  │
│  Can user update this        │       │  No Access  │
│  project?                    │       └─────────────┘
└──────────┬───────────────────┘
           │ YES
           ▼
┌──────────────────────────────┐
│  Integration: Jira API       │
│  • Authenticate              │
│  • Find project              │
│  • Update status             │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Local Knowledge Base Update │
│  • Update DB                 │
│  • Re-index vectors          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Notify Team Members         │
│  • Slack message             │
│  • Email notification        │
│  • In-app notification       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Confirmation to Manager     │
│  "Project Alpha has been     │
│   updated to In Progress.    │
│   Team has been notified."   │
└──────────┬───────────────────┘
           │
           ▼
       SUCCESS ✓
```

---

## 📱 UI Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP ROOT                                 │
│                      (layout.tsx)                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AUTH PROVIDER                                 │
│                  (AuthContext.tsx)                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MAIN LAYOUT                                   │
│                 (MainLayout.tsx)                                │
├─────────────────────┬───────────────────────┬───────────────────┤
│                     │                       │                   │
│   LEFT SIDEBAR      │   CENTER CONTENT      │   RIGHT PANEL     │
│  (LeftSidebar)      │                       │  (RightPanel)     │
│                     │                       │                   │
│  ┌──────────────┐   │   ┌────────────────┐  │  ┌─────────────┐  │
│  │ User Profile │   │   │  TOP NAVBAR    │  │  │ Live        │  │
│  ├──────────────┤   │   │ (TopNavbar)    │  │  │ Insights    │  │
│  │ Quick Actions│   │   └────────────────┘  │  ├─────────────┤  │
│  ├──────────────┤   │           │           │  │ Project     │  │
│  │ Navigation   │   │           ▼           │  │ Status      │  │
│  │ • Teams      │   │   ┌────────────────┐  │  ├─────────────┤  │
│  │ • Projects   │   │   │ CHAT INTERFACE │  │  │ Policy      │  │
│  │ • KB         │   │   │  (Enhanced)    │  │  │ Updates     │  │
│  │ • Settings   │   │   │                │  │  ├─────────────┤  │
│  ├──────────────┤   │   │ ┌────────────┐ │  │  │ Notifs      │  │
│  │ Recent Chats │   │   │ │ Messages   │ │  │  │             │  │
│  │ • Chat 1     │   │   │ │ Container  │ │  │  └─────────────┘  │
│  │ • Chat 2     │   │   │ └────────────┘ │  │                   │
│  └──────────────┘   │   │                │  │                   │
│                     │   │ ┌────────────┐ │  │                   │
│                     │   │ │ Message    │ │  │                   │
│                     │   │ │ Input      │ │  │                   │
│                     │   │ └────────────┘ │  │                   │
│                     │   └────────────────┘  │                   │
└─────────────────────┴───────────────────────┴───────────────────┘

COMPONENT TREE:

App
└── AuthProvider
    └── MainLayout
        ├── LeftSidebar
        │   ├── UserAvatar
        │   ├── Button (Quick Actions)
        │   ├── NavItem (x5)
        │   └── RecentChatItem (xN)
        │
        ├── TopNavbar
        │   ├── SearchBar
        │   ├── NotificationBell
        │   └── UserMenu
        │
        ├── EnhancedChatInterface
        │   ├── ChatHeader
        │   │   ├── StatusIndicator
        │   │   └── OptionsButton
        │   │
        │   ├── MessagesContainer
        │   │   ├── WelcomeMessage (if empty)
        │   │   │   └── SuggestedPrompt (x5)
        │   │   │
        │   │   └── MessageBubble (xN)
        │   │       ├── Avatar
        │   │       ├── MessageContent
        │   │       └── SourceCitation (xN)
        │   │
        │   └── MessageInput
        │       ├── TextArea
        │       └── SendButton
        │
        └── RightPanel
            ├── LiveUpdateCard (xN)
            ├── ProjectStatusCard (xN)
            ├── PolicyUpdateCard (xN)
            └── NotificationCard (xN)
```

---

## 🎭 State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GLOBAL STATE                                 │
│                  (React Context)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │   AuthState    │  │   ChatState    │  │   UIState      │    │
│  ├────────────────┤  ├────────────────┤  ├────────────────┤    │
│  │ • user         │  │ • messages     │  │ • sidebarOpen  │    │
│  │ • token        │  │ • sessionId    │  │ • panelOpen    │    │
│  │ • isAuth       │  │ • isLoading    │  │ • theme        │    │
│  │ • permissions  │  │ • error        │  │ • notifications│    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐                        │
│  │  DocsState     │  │  NotifState    │                        │
│  ├────────────────┤  ├────────────────┤                        │
│  │ • documents    │  │ • notifications│                        │
│  │ • categories   │  │ • unreadCount  │                        │
│  │ • uploadQueue  │  │ • preferences  │                        │
│  └────────────────┘  └────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Components  │  │   Hooks      │  │   Actions    │
│              │  │              │  │              │
│ • Chat UI    │  │ • useAuth    │  │ • login()    │
│ • Sidebar    │  │ • useChat    │  │ • sendMsg()  │
│ • Documents  │  │ • useApi     │  │ • upload()   │
└──────────────┘  └──────────────┘  └──────────────┘

STATE UPDATE FLOW:

User Action → Component Handler → Action Function → API Call
    ↓
API Response → State Update (Context) → Re-render Components
    ↓
UI Updated ✓
```

---

**Last Updated:** 2025-10-22  
**Version:** 1.0.0  
**Maintained By:** AI Hub Development Team
