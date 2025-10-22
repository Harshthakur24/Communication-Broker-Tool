# 🚀 Developer Quick Start Guide

> **Get up and running with the AI Communication Hub in 15 minutes**

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** 18+ installed ([Download](https://nodejs.org/))
- ✅ **pnpm** installed (`npm install -g pnpm`)
- ✅ **PostgreSQL** 14+ running locally or remotely
- ✅ **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- ✅ **Git** for version control

---

## ⚡ Quick Setup (5 minutes)

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd communication-broker-tool

# Install dependencies (pnpm is faster than npm)
pnpm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local with your settings
nano .env.local  # or use your favorite editor
```

**Required Environment Variables:**

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/ai_hub"

# OpenAI API (REQUIRED for RAG)
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Email (for notifications)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@company.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@company.com"
```

### 3. Database Setup

```bash
# Push Prisma schema to database (creates tables)
pnpm db:push

# Generate Prisma Client
pnpm db:generate

# Optional: Seed with sample data
pnpm db:seed
```

### 4. Run Development Server

```bash
# Start the development server
pnpm dev

# Server runs on http://localhost:3000
```

✅ **Done!** Open your browser to `http://localhost:3000`

---

## 🏗️ Project Structure

```
communication-broker-tool/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── chat/          # Chat & messaging
│   │   │   └── documents/     # Document management
│   │   ├── auth/              # Auth pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── knowledge-base/    # KB management
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   ├── chat/              # Chat components
│   │   ├── layout/            # Layout components
│   │   ├── auth/              # Auth forms
│   │   └── documents/         # Document components
│   │
│   ├── lib/                   # Core libraries
│   │   ├── ai.ts              # OpenAI integration
│   │   ├── ragService.ts      # RAG pipeline
│   │   ├── documentProcessor.ts # Document processing
│   │   ├── auth.ts            # Authentication
│   │   ├── database.ts        # Prisma client
│   │   └── utils.ts           # Utilities
│   │
│   ├── hooks/                 # React hooks
│   │   └── useApi.ts          # API hooks
│   │
│   └── contexts/              # React contexts
│       └── AuthContext.tsx    # Auth context
│
├── prisma/
│   └── schema.prisma          # Database schema
│
├── public/                    # Static assets
├── scripts/                   # Setup scripts
└── package.json               # Dependencies
```

---

## 🔑 Key Files to Know

### **1. Database Schema** (`prisma/schema.prisma`)

Defines the database structure:

```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  name     String
  password String
  // ... other fields
}

model Document {
  id         String   @id @default(cuid())
  title      String
  content    String
  type       String
  uploadedBy String
  chunks     DocumentChunk[]
}

model DocumentChunk {
  id         String  @id @default(cuid())
  documentId String
  content    String
  embedding  String?  // Vector embedding as JSON
  document   Document @relation(fields: [documentId], references: [id])
}
```

**Commands:**
```bash
pnpm db:push      # Apply schema to database
pnpm db:generate  # Generate Prisma client
pnpm db:studio    # Open Prisma Studio (database GUI)
```

### **2. RAG Service** (`src/lib/ragService.ts`)

Core RAG functionality:

```typescript
import { searchDocuments, getRAGContext } from '@/lib/ragService'

// Search for relevant documents
const results = await searchDocuments("What's the policy on remote work?", 5)

// Get full RAG context for LLM
const context = await getRAGContext("remote work policy")
```

### **3. AI Service** (`src/lib/ai.ts`)

OpenAI integration:

```typescript
import { generateEmbedding, generateRAGResponse } from '@/lib/ai'

// Generate embedding for text
const embedding = await generateEmbedding("text to embed")

// Generate AI response with RAG
const response = await generateRAGResponse(
  "user query",
  contextDocuments
)
```

### **4. Document Processor** (`src/lib/documentProcessor.ts`)

Document handling:

```typescript
import { processDocument, extractTextFromFile } from '@/lib/documentProcessor'

// Process a document
const processed = await processDocument(
  title,
  content,
  type,
  category,
  tags
)
```

---

## 🎯 Common Development Tasks

### **Task 1: Add a New API Route**

Create a new file in `src/app/api/your-route/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'

// GET /api/your-route
export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    const user = authenticatedRequest.user!
    
    // Your logic here
    const data = await prisma.yourModel.findMany({
      where: { userId: user.id }
    })
    
    return NextResponse.json({ data })
  })
}

// POST /api/your-route
export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    const user = authenticatedRequest.user!
    const body = await request.json()
    
    // Your logic here
    const created = await prisma.yourModel.create({
      data: { ...body, userId: user.id }
    })
    
    return NextResponse.json({ created })
  })
}
```

### **Task 2: Create a New Component**

Create `src/components/your-component/YourComponent.tsx`:

```typescript
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button, Card } from '@/components/ui'

interface YourComponentProps {
  title: string
  onAction?: () => void
}

export const YourComponent: React.FC<YourComponentProps> = ({ 
  title, 
  onAction 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4"
    >
      <Card>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <Button onClick={onAction}>Take Action</Button>
      </Card>
    </motion.div>
  )
}
```

### **Task 3: Add a Database Model**

1. Edit `prisma/schema.prisma`:

```prisma
model YourNewModel {
  id        String   @id @default(cuid())
  name      String
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
  
  @@map("your_new_table")
}

// Don't forget to add the relation to User model
model User {
  // ... existing fields
  yourNewModels YourNewModel[]
}
```

2. Push changes:

```bash
pnpm db:push
pnpm db:generate
```

### **Task 4: Implement a New Integration**

Create `src/lib/integrations/yourService.ts`:

```typescript
interface YourServiceConfig {
  apiKey: string
  baseUrl: string
}

export class YourServiceClient {
  private config: YourServiceConfig
  
  constructor(config: YourServiceConfig) {
    this.config = config
  }
  
  async fetchData(query: string) {
    const response = await fetch(
      `${this.config.baseUrl}/api/data?q=${query}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      }
    )
    
    return response.json()
  }
  
  async handleWebhook(payload: any) {
    // Process webhook
    console.log('Webhook received:', payload)
    
    // Update knowledge base
    // Trigger re-indexing
    // Send notifications
  }
}
```

---

## 🧪 Testing Your Code

### **Run Tests**

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### **Write a Test**

Create `src/lib/__tests__/yourFunction.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals'
import { yourFunction } from '../yourFile'

describe('yourFunction', () => {
  it('should do something correctly', () => {
    const result = yourFunction('input')
    expect(result).toBe('expected output')
  })
  
  it('should handle edge cases', () => {
    expect(() => yourFunction(null)).toThrow()
  })
})
```

---

## 🔍 Debugging Tips

### **1. Check Logs**

```bash
# Development logs are in the terminal where you ran `pnpm dev`

# For API routes, use console.log
console.log('Debug:', { data, user, request })

# For client components, use browser DevTools
```

### **2. Prisma Studio**

Visual database browser:

```bash
pnpm db:studio
# Opens http://localhost:5555
```

### **3. API Testing**

Use tools like:
- **Thunder Client** (VS Code extension)
- **Postman**
- **curl**

```bash
# Example: Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### **4. Common Issues**

**Issue: Database connection error**
```bash
# Check if PostgreSQL is running
psql -U postgres -h localhost

# Verify DATABASE_URL in .env.local
# Reset database
pnpm db:push --force-reset
```

**Issue: OpenAI API errors**
```bash
# Verify your API key
echo $OPENAI_API_KEY

# Check quota at platform.openai.com
# Ensure billing is set up
```

**Issue: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
```

---

## 📊 Database Operations

### **Common Prisma Queries**

```typescript
import { prisma } from '@/lib/database'

// CREATE
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword
  }
})

// READ
const users = await prisma.user.findMany({
  where: { isActive: true },
  include: { documents: true }
})

const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

// UPDATE
const updated = await prisma.user.update({
  where: { id: userId },
  data: { name: 'Jane Doe' }
})

// DELETE
await prisma.user.delete({
  where: { id: userId }
})

// TRANSACTION
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData })
  const doc = await tx.document.create({ 
    data: { ...docData, uploadedBy: user.id } 
  })
  return { user, doc }
})
```

---

## 🎨 Styling Guide

### **Tailwind CSS Classes**

```tsx
// White & Purple Theme
<div className="bg-white border border-gray-200 rounded-xl p-4">
  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
    Title
  </h2>
  <p className="text-gray-700">Content</p>
  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
    Action
  </button>
</div>
```

### **Framer Motion Animations**

```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Animated content
</motion.div>
```

---

## 🔐 Authentication Flow

### **Register a New User**

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "department": "Engineering"
}
```

### **Login**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "SecurePass123!"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "user@company.com",
    "name": "John Doe"
  }
}
```

### **Use Token in Requests**

```bash
GET /api/chat/messages
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📚 Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier

# Database
pnpm db:push          # Push schema to database
pnpm db:generate      # Generate Prisma client
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database with sample data
pnpm db:reset         # Reset database (⚠️ deletes all data)

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage

# Type checking
pnpm typecheck        # Check TypeScript types
```

---

## 🚀 Deployment

### **Build for Production**

```bash
# Build the application
pnpm build

# Test production build locally
pnpm start
```

### **Environment Variables for Production**

```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
JWT_SECRET="production-secret-min-32-chars"
NEXTAUTH_SECRET="production-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### **Docker Deployment**

```bash
# Build Docker image
docker build -t ai-hub:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e OPENAI_API_KEY="sk-..." \
  ai-hub:latest
```

---

## 🤝 Contributing Guidelines

### **Code Style**

- Use **TypeScript** for all new code
- Follow **ESLint** rules (run `pnpm lint`)
- Format code with **Prettier** (run `pnpm format`)
- Write **tests** for new features
- Update **documentation** when needed

### **Commit Messages**

Follow conventional commits:

```bash
feat: add new document search feature
fix: resolve authentication bug
docs: update API documentation
refactor: improve RAG service performance
test: add tests for chat functionality
```

### **Pull Request Process**

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes
3. Run tests: `pnpm test`
4. Commit your changes: `git commit -m "feat: your feature"`
5. Push to branch: `git push origin feat/your-feature`
6. Create a Pull Request

---

## 📖 Additional Resources

### **Documentation**

- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [Functional Flow](./FUNCTIONAL_FLOW.md)
- [RAG System Guide](./RAG_SYSTEM_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [UI Design Spec](./UI_DESIGN_SPECIFICATION.md)

### **External Links**

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

---

## 🆘 Getting Help

### **Common Questions**

**Q: How do I add a new document type?**
A: Update the `extractTextFromFile` function in `documentProcessor.ts` to handle the new type.

**Q: How do I change the UI theme colors?**
A: Edit `tailwind.config.ts` and `src/app/globals.css` to customize colors.

**Q: How do I add a new integration (e.g., Jira)?**
A: Create a new client in `src/lib/integrations/` following the pattern in the examples.

**Q: How do I improve RAG accuracy?**
A: Adjust chunking size, overlap, and similarity thresholds in `ragService.ts`.

### **Support Channels**

- **Internal Wiki:** [Link]
- **Slack:** #ai-hub-dev
- **Email:** dev-team@company.com

---

## ✅ Checklist: First Contribution

- [ ] Set up development environment
- [ ] Run the application successfully
- [ ] Understand the project structure
- [ ] Read the architecture documentation
- [ ] Make a small code change
- [ ] Run tests and ensure they pass
- [ ] Create a Pull Request
- [ ] Get code review from team

---

**Welcome to the AI Communication Hub development team! 🎉**

*Last Updated: 2025-10-22*
