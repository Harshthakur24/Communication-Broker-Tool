# 🤖 AI Communication Hub

**What is this?** Think of it as your smart assistant for work - like having a really smart colleague who never sleeps and can instantly find any information you need from your company's documents.

**In simple terms:** This is a website where you can:
- Chat with an AI that knows everything about your company
- Upload your company documents (manuals, policies, guides) 
- Ask questions and get instant answers from those documents
- Have conversations that feel natural, like talking to a human expert

**Real-world example:** Imagine you work at a company and need to know "What's our vacation policy?" Instead of searching through 50 different documents, you just ask the AI chat, and it instantly gives you the exact answer from your company's handbook.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)

## 🎯 What This Does (In Plain English)

### For Regular Users:
- **Smart Chat**: Talk to an AI that understands your company's information
- **Instant Answers**: Ask questions like "How do I request time off?" and get immediate, accurate answers
- **Document Search**: Upload your company files and the AI learns from them
- **Easy Interface**: Simple, beautiful website that anyone can use

### For Companies:
- **Knowledge Management**: Turn all your scattered documents into a smart, searchable system
- **Employee Support**: Reduce repetitive questions to HR/IT by having an AI assistant
- **Training Tool**: New employees can ask questions and learn company policies instantly
- **Time Saver**: No more hunting through folders and files for information

### For IT Departments:
- **Modern Tech**: Built with the latest web technologies
- **Secure**: Proper user accounts and data protection
- **Scalable**: Can handle many users and lots of documents
- **Easy Setup**: Clear instructions for getting it running

## ✨ Key Features

### 🔐 **Enterprise-Grade Authentication**
- Secure user registration with email verification
- JWT-based authentication with HTTP-only cookies
- Password reset with email tokens
- Session management with automatic refresh
- Protected routes and API endpoints
- Role-based access control

### 💬 **AI-Powered Chat Interface**
- Real-time conversation with AI assistant
- Contextual responses based on knowledge base
- Message history with search and filtering
- Suggested prompts and quick actions
- File attachment support
- Conversation threading

### 📚 **Knowledge Base Management**
- Upload and process multiple document types (PDF, DOCX, TXT)
- AI-powered document indexing and embedding
- Semantic search across documents
- Document categorization and tagging
- Version control and history
- Bulk upload and management

### 📊 **Interactive Dashboard**
- Real-time statistics and analytics
- Activity feed with recent actions
- User engagement metrics
- System health monitoring
- Customizable widgets
- Export functionality

### 👤 **User Profile Management**
- Comprehensive profile editing
- Avatar upload and management
- Password change functionality
- Email preferences
- Activity history
- Two-factor authentication (coming soon)

### 🎨 **Modern UI/UX**
- Beautiful glassmorphism design
  - Smooth animations with Framer Motion
- Fully responsive across all devices
- Accessible components (WCAG compliant)
- Dark mode support
- Customizable themes

### 🚀 **Developer Experience**
- Full TypeScript support
- ESLint and Prettier configuration
  - Hot reload with Turbopack
  - Comprehensive API documentation
- Modular component architecture
- Built-in error handling

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form

### Backend
- **Runtime**: Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer
- **AI**: OpenAI API

### DevOps
- **Package Manager**: pnpm
- **Linting**: ESLint 9
- **Build**: Next.js with Turbopack
- **Deployment**: Vercel (recommended)

## 🔄 How It Works (Step by Step)

1. **You Sign Up**: Create an account with your email and password
2. **Upload Documents**: Add your company files (PDFs, Word docs, etc.)
3. **AI Learns**: The system reads and understands all your documents
4. **Ask Questions**: Type questions like "What's our sick leave policy?"
5. **Get Answers**: The AI instantly finds and explains the information
6. **Keep Learning**: The more documents you add, the smarter it gets

**Example Conversation:**
- You: "How many vacation days do I get?"
- AI: "According to your employee handbook, you get 15 vacation days per year, which can be taken after 90 days of employment. You can request time off through the HR portal or by emailing hr@company.com."

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher (recommended)
- PostgreSQL 14.x or higher
- OpenAI API key
- Email service (Gmail, SendGrid, AWS SES, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/communication-broker-tool.git
   cd communication-broker-tool
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_communication_hub"

   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # OpenAI
   OPENAI_API_KEY="sk-your-openai-api-key"

   # Email Configuration
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-specific-password"
   EMAIL_FROM="AI Hub <noreply@aihub.com>"

   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm prisma generate

   # Push schema to database
   pnpm prisma db push

   # (Optional) Seed database with sample data
   pnpm prisma db seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
communication-broker-tool/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
├── public/
│   ├── auth-image.jpeg        # Auth page background
│   └── ...                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── chat/         # Chat functionality
│   │   │   ├── dashboard/    # Dashboard data
│   │   │   ├── documents/    # Document management
│   │   │   ├── notifications/# Notification system
│   │   │   └── users/        # User management
│   │   ├── auth/             # Auth pages
│   │   │   ├── verify-email/ # Email verification
│   │   │   └── reset-password/# Password reset
│   │   ├── dashboard/        # Main dashboard
│   │   ├── knowledge-base/   # Knowledge base UI
│   │   ├── profile/          # User profile
│   │   ├── page.tsx          # Landing page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── auth/             # Auth components
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   └── ResetPasswordForm.tsx
│   │   ├── chat/             # Chat components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── documents/        # Document components
│   │   │   └── DocumentManager.tsx
│   │   ├── layout/           # Layout components
│   │   │   └── AppNav.tsx
│   │   └── ui/               # Reusable UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── toast.tsx
│   │       └── ...
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Auth state management
│   ├── hooks/                # Custom hooks
│   │   ├── useApi.ts         # API interaction
│   │   └── use-toast.ts      # Toast notifications
│   ├── lib/                  # Utility functions
│   │   ├── ai.ts            # OpenAI integration
│   │   ├── auth.ts          # Auth utilities
│   │   ├── database.ts      # Prisma client
│   │   ├── documentProcessor.ts # Document parsing
│   │   ├── email.ts         # Email sending
│   │   ├── vectorStore.ts   # Vector embeddings
│   │   └── utils.ts         # General utilities
│   └── types/               # TypeScript types
├── .env                     # Environment variables
├── .eslintrc.json          # ESLint configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
└── tailwind.config.ts      # Tailwind configuration
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm type-check` | Run TypeScript compiler check |
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:push` | Push schema to database |
| `pnpm prisma:studio` | Open Prisma Studio |
| `pnpm prisma:migrate` | Run database migrations |

## 🗄️ Database Schema

### Core Models

#### User
```prisma
- id: String (UUID)
- email: String (unique)
- name: String
- password: String (hashed)
- emailVerified: Boolean
- verificationToken: String?
- resetToken: String?
- resetTokenExpiry: DateTime?
- department: String?
- role: UserRole
- createdAt: DateTime
- updatedAt: DateTime
```

#### Document
```prisma
- id: String (UUID)
- title: String
- content: String
- fileType: String
- fileSize: Int
- category: String?
- uploadedById: String
- embedding: Json?
- metadata: Json?
- createdAt: DateTime
- updatedAt: DateTime
```

#### Message
```prisma
- id: String (UUID)
- content: String
- role: MessageRole (user/assistant/system)
- userId: String
- conversationId: String?
- metadata: Json?
- createdAt: DateTime
```

#### Notification
```prisma
- id: String (UUID)
- userId: String
- type: NotificationType
- title: String
- message: String
- read: Boolean
- createdAt: DateTime
```

## 🔐 Authentication Flow

### Registration
1. User submits email and password
2. System validates and hashes password
3. Verification email sent with token
4. User clicks link to verify email
5. Account activated

### Login
1. User submits credentials
2. System validates against database
3. JWT token generated and set as HTTP-only cookie
4. User redirected to dashboard

### Password Reset
1. User requests password reset
2. Reset token generated and emailed
3. User clicks link with token
4. New password submitted
5. Password updated and user notified

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate App Password
3. Use in `.env`:
   ```env
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   ```

### SendGrid Setup
```env
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USER="apikey"
EMAIL_PASS="your-sendgrid-api-key"
```

## 🤖 AI Integration

### OpenAI Configuration
The app uses OpenAI for:
- **Chat Completions**: GPT-4 for intelligent responses
- **Embeddings**: text-embedding-ada-002 for document indexing
- **Semantic Search**: Vector similarity for knowledge retrieval

### Document Processing
1. Upload document (PDF, DOCX, TXT)
2. Extract text content
3. Generate embeddings
4. Store in vector database
5. Enable semantic search

## 🎨 UI Components Library

### Core Components
- **Button**: Multiple variants (default, outline, ghost)
- **Input**: Form inputs with validation states
- **Card**: Content containers with glass effect
- **Toast**: Notification system
- **Modal**: Overlay dialogs
- **Dropdown**: Select menus
- **Avatar**: User profile images
- **Badge**: Status indicators
- **Spinner**: Loading states

### Layout Components
- **AppNav**: Main navigation bar
- **Sidebar**: Collapsible sidebar
- **Header**: Page headers
- **Footer**: Page footers

## 🔌 API Reference

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "department": "Engineering"
}
```

#### POST `/api/auth/login`
Authenticate user
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### GET `/api/auth/me`
Get current user (requires authentication)

#### POST `/api/auth/logout`
Logout user and clear session

### Chat Endpoints

#### GET `/api/chat/messages`
Get chat history
Query params: `conversationId`, `limit`, `offset`

#### POST `/api/chat/messages`
Send a new message
```json
{
  "content": "What is the company policy on remote work?",
  "conversationId": "optional-conversation-id"
}
```

#### GET `/api/chat/suggestions`
Get AI-powered suggestions

### Document Endpoints

#### POST `/api/documents/upload`
Upload a document (multipart/form-data)

#### GET `/api/documents`
List all documents
Query params: `category`, `search`, `limit`, `offset`

#### GET `/api/documents/search`
Semantic search across documents
Query params: `query`, `category`, `limit`

#### DELETE `/api/documents/:id`
Delete a document

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import project to Vercel
   - Connect GitHub repository

2. **Configure Environment**
   - Add all environment variables
   - Set up PostgreSQL database (Vercel Postgres or external)

3. **Deploy**
   - Push to main branch
   - Automatic deployment on every commit

### Docker Deployment

```bash
# Build image
docker build -t ai-communication-hub .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e OPENAI_API_KEY="..." \
  ai-communication-hub
```

### Traditional Hosting

```bash
# Build application
pnpm build

# Start production server
pnpm start
```

## 🔒 Security Best Practices

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with HTTP-only cookies
- ✅ CSRF protection
- ✅ Rate limiting on API routes
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ Secure headers configuration

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

## 📈 Performance Optimization

- Server-side rendering (SSR)
- Static site generation (SSG) where applicable
- Image optimization with Next.js Image
- Code splitting and lazy loading
- API route caching
- Database query optimization
- CDN for static assets

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

- 📚 [Full Documentation](./docs)
- 🐛 [Report Issues](https://github.com/yourusername/communication-broker-tool/issues)
- 💬 [Discussions](https://github.com/yourusername/communication-broker-tool/discussions)
- 📧 Email: support@aihub.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Vercel](https://vercel.com/) - Deployment platform
- [OpenAI](https://openai.com/) - AI capabilities
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Radix UI](https://www.radix-ui.com/) - UI primitives

## 🔄 Changelog

### Version 1.0.0 (Current)
- ✨ Initial release
- 🔐 Complete authentication system
- 💬 AI-powered chat interface
- 📚 Knowledge base management
- 📊 Interactive dashboard
- 👤 User profile management
- 🎨 Modern UI with glassmorphism

## 🗺️ Roadmap

- [ ] Real-time collaboration features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Voice and video chat
- [ ] Integration marketplace
- [ ] Advanced AI features (RAG improvements)
- [ ] Team and workspace management
- [ ] API webhooks
- [ ] Admin panel

---

<div align="center">
  <strong>Built with ❤️ using Next.js, TypeScript, and cutting-edge AI technology</strong>
  <br />
  <sub>© 2025 AI Communication Hub. All rights reserved.</sub>
</div>
