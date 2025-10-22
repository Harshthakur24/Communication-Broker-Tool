# Quick Reference Guide - AI Communication Hub

## 🚀 Getting Started in 5 Minutes

### 1. Setup Environment
```bash
# Clone and install
git clone <repo-url>
cd communication-broker-tool
pnpm install

# Copy environment file
cp env.example .env.local

# Configure .env.local with:
DATABASE_URL="postgresql://user:pass@localhost:5432/ai_hub"
OPENAI_API_KEY="sk-your-key-here"
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
JWT_SECRET="your-secret-key"
```

### 2. Initialize Database
```bash
pnpm db:push      # Create database tables
pnpm db:generate  # Generate Prisma client
```

### 3. Start Development
```bash
pnpm dev          # Start at http://localhost:3000
```

---

## 📁 File Structure Cheat Sheet

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── chat/              # Chat & messaging
│   │   ├── dashboard/         # Dashboard data
│   │   ├── documents/         # Document management
│   │   └── notifications/     # Notification system
│   ├── auth/                  # Auth pages
│   ├── dashboard/             # Dashboard page
│   ├── knowledge-base/        # Knowledge base page
│   └── profile/               # User profile page
│
├── components/
│   ├── auth/                  # Auth components (Login, Register, etc.)
│   ├── chat/                  # Chat interface components
│   ├── documents/             # Document upload & management
│   ├── layout/                # Layout components (Sidebar, Navbar)
│   └── ui/                    # Reusable UI components
│
├── lib/
│   ├── ai.ts                  # OpenAI integration
│   ├── ragService.ts          # RAG implementation
│   ├── documentProcessor.ts   # Document processing
│   ├── auth.ts                # Authentication logic
│   ├── database.ts            # Prisma client
│   ├── email.ts               # Email service
│   └── utils.ts               # Utilities
│
├── hooks/
│   └── useApi.ts              # API hooks
│
└── contexts/
    └── AuthContext.tsx         # Auth state management
```

---

## 🔑 Key API Endpoints

### Authentication
```typescript
POST /api/auth/register        // Register new user
POST /api/auth/login           // Login user
POST /api/auth/logout          // Logout user
GET  /api/auth/me              // Get current user
POST /api/auth/forgot-password // Request password reset
POST /api/auth/reset-password  // Reset password
POST /api/auth/verify-email    // Verify email
```

### Chat
```typescript
GET  /api/chat/messages        // Get message history
POST /api/chat/messages        // Send message & get AI response
GET  /api/chat/suggestions     // Get suggested prompts
```

### Documents
```typescript
GET    /api/documents          // List documents
POST   /api/documents/upload   // Upload documents
DELETE /api/documents          // Delete document
GET    /api/documents/search   // Search documents
```

### Dashboard
```typescript
GET /api/dashboard/stats       // Get statistics
GET /api/dashboard/activity    // Get activity feed
```

### User Management
```typescript
GET  /api/users/profile        // Get profile
PUT  /api/users/profile        // Update profile
POST /api/users/change-password // Change password
```

---

## 🎨 UI Components Usage

### Button
```tsx
import { Button } from '@/components/ui/button'

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Variants: primary, secondary, outline, ghost, danger
// Sizes: sm, md, lg
```

### Input
```tsx
import { Input } from '@/components/ui/input'

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
/>
```

### Card
```tsx
import { Card } from '@/components/ui/card'

<Card title="Card Title" description="Card description">
  Card content here
</Card>
```

### Modal
```tsx
import { Modal } from '@/components/ui/modal'

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
  Modal content here
</Modal>
```

### Loading
```tsx
import { LoadingDots, LoadingSpinner } from '@/components/ui/loading'

<LoadingDots />
<LoadingSpinner size="lg" />
```

---

## 🔐 Authentication Flow

### Client-Side Auth
```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, login, logout, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/auth" />
  
  return <div>Welcome, {user.name}!</div>
}
```

### Protected Routes
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

<ProtectedRoute requireEmailVerification>
  <DashboardPage />
</ProtectedRoute>
```

### API Authentication
```typescript
// Server-side (API routes)
import { verifyAuth } from '@/lib/auth'

export async function GET(request: Request) {
  const user = await verifyAuth(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Your logic here
}
```

---

## 🤖 RAG System Usage

### Upload Documents
```typescript
// Client-side
const formData = new FormData()
formData.append('file', file)
formData.append('category', 'policies')
formData.append('tags', JSON.stringify(['hr', 'remote-work']))

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  body: formData,
})
```

### Search Documents
```typescript
// Server-side
import { searchDocuments } from '@/lib/ragService'

const results = await searchDocuments(
  'remote work policy',  // Query
  5,                     // Limit
  'policies',            // Category (optional)
  ['hr']                 // Tags (optional)
)
```

### Generate AI Response
```typescript
import { generateRAGResponse } from '@/lib/ai'

const response = await generateRAGResponse(
  'What is our remote work policy?',
  contextDocuments  // Retrieved from searchDocuments
)
```

---

## 💾 Database Operations

### Using Prisma Client
```typescript
import { prisma } from '@/lib/database'

// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword,
  }
})

// Read
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

// Update
const user = await prisma.user.update({
  where: { id: userId },
  data: { name: 'New Name' }
})

// Delete
await prisma.user.delete({
  where: { id: userId }
})
```

### Database Commands
```bash
pnpm db:push       # Push schema changes to database
pnpm db:generate   # Generate Prisma client
pnpm db:studio     # Open Prisma Studio (GUI)
```

---

## 🎨 Tailwind CSS Classes

### Color Scheme
```css
/* Purple Theme */
bg-purple-600      /* Primary buttons, active states */
bg-purple-100      /* Light backgrounds, hover states */
text-purple-700    /* Purple text */
border-purple-300  /* Purple borders */

/* Neutral Colors */
bg-white           /* Main background */
bg-gray-50         /* Secondary background */
bg-gray-100        /* Tertiary background */
text-gray-900      /* Primary text */
text-gray-600      /* Secondary text */
```

### Common Patterns
```css
/* Card */
bg-white rounded-xl shadow-lg border border-gray-200 p-6

/* Button Primary */
bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700

/* Input */
border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500

/* Layout */
min-h-screen bg-white flex
```

---

## 🔧 Environment Variables

### Required Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Authentication
JWT_SECRET="your-secret-key-min-32-chars"

# OpenAI (for RAG)
OPENAI_API_KEY="sk-..."

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### Optional Variables
```env
# Integrations
JIRA_API_URL="https://your-domain.atlassian.net"
JIRA_API_TOKEN="your-token"
NOTION_API_KEY="secret_..."
SLACK_BOT_TOKEN="xoxb-..."

# Environment
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🐛 Common Issues & Solutions

### Issue: Database Connection Failed
```bash
# Check DATABASE_URL format
postgresql://user:password@host:port/database

# Verify PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL
```

### Issue: OpenAI API Error
```bash
# Verify API key is set
echo $OPENAI_API_KEY

# Check API quota
# Visit: https://platform.openai.com/account/usage

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Issue: Email Not Sending
```bash
# For Gmail, use App Password (not regular password)
# 1. Enable 2FA on Google Account
# 2. Generate App Password at:
#    https://myaccount.google.com/apppasswords
# 3. Use App Password in EMAIL_PASS
```

### Issue: Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

---

## 📊 Useful Commands

### Development
```bash
pnpm dev           # Start dev server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run ESLint
```

### Database
```bash
pnpm db:push       # Update database schema
pnpm db:generate   # Generate Prisma client
pnpm db:studio     # Open Prisma Studio
```

### Testing
```bash
pnpm test          # Run tests
pnpm test:watch    # Run tests in watch mode
pnpm test:coverage # Run tests with coverage
```

---

## 📚 Documentation Links

| Document | Purpose |
|----------|---------|
| [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) | Complete system overview & navigation |
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | Detailed architecture diagrams |
| [FUNCTIONAL_FLOW.md](./FUNCTIONAL_FLOW.md) | User flows and processes |
| [MODULAR_ARCHITECTURE.md](./MODULAR_ARCHITECTURE.md) | Code structure and modules |
| [UI_DESIGN_SPECIFICATION.md](./UI_DESIGN_SPECIFICATION.md) | UI/UX design system |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference |
| [RAG_SYSTEM_GUIDE.md](./RAG_SYSTEM_GUIDE.md) | RAG implementation guide |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Project roadmap & timeline |
| [README.md](./README.md) | Project setup & quick start |

---

## 🎯 Next Steps After Setup

1. **Configure Authentication**
   - Set up company SSO integration
   - Configure email verification
   - Test login/logout flow

2. **Upload Sample Documents**
   - Navigate to Knowledge Base
   - Upload company policies, docs
   - Test document search

3. **Test Chat Interface**
   - Ask questions about uploaded documents
   - Verify AI responses include sources
   - Test message history

4. **Configure Integrations**
   - Set up Jira API credentials
   - Configure Notion integration
   - Test webhook endpoints

5. **Customize UI**
   - Update color scheme if needed
   - Add company logo
   - Customize welcome message

---

## 💡 Pro Tips

### Performance
- Use pagination for large datasets
- Implement Redis caching for frequent queries
- Optimize images and static assets
- Use React.memo for expensive components

### Security
- Always validate user input
- Use parameterized queries
- Implement rate limiting
- Keep dependencies updated
- Use environment variables for secrets

### Development
- Use TypeScript for type safety
- Write tests for critical paths
- Use ESLint and Prettier
- Follow React best practices
- Document complex logic

### Debugging
- Check browser console for client errors
- Check server logs for API errors
- Use Prisma Studio to inspect database
- Use React DevTools for component debugging

---

## 📞 Getting Help

### Internal Resources
1. Check this Quick Reference
2. Review [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)
3. Search [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
4. Check [RAG_SYSTEM_GUIDE.md](./RAG_SYSTEM_GUIDE.md)

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Troubleshooting
- Check GitHub Issues
- Review error logs
- Test in incognito mode
- Clear cache and rebuild

---

**🎉 You're all set! Start building amazing features with the AI Communication Hub!**
