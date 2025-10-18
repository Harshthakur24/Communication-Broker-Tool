# 🚀 API Documentation - AI Communication Hub

Complete API reference for the AI Communication Hub with authentication, user management, chat, and analytics.

## 📋 Table of Contents

- [Authentication APIs](#authentication-apis)
- [User Management APIs](#user-management-apis)
- [Dashboard APIs](#dashboard-apis)
- [Chat APIs](#chat-apis)
- [Notifications APIs](#notifications-apis)
- [Error Handling](#error-handling)
- [Client-Side Integration](#client-side-integration)

## 🔐 Authentication APIs

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "department": "Engineering"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "department": "Engineering",
    "role": "user",
    "isEmailVerified": false
  }
}
```

### POST `/api/auth/login`
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "department": "Engineering",
    "role": "user",
    "isEmailVerified": true,
    "avatar": null
  },
  "token": "jwt_token_here"
}
```

### POST `/api/auth/logout`
Logout user and destroy session.

**Response:**
```json
{
  "message": "Logout successful"
}
```

### POST `/api/auth/forgot-password`
Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email exists, we have sent a password reset link."
}
```

### POST `/api/auth/reset-password`
Reset password using token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "message": "Password reset successful. Please log in with your new password."
}
```

### POST `/api/auth/verify-email`
Verify email address using token.

**Request Body:**
```json
{
  "token": "verification_token_here"
}
```

**Response:**
```json
{
  "message": "Email verified successfully! Welcome to AI Communication Hub.",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

### GET `/api/auth/me`
Get current authenticated user.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "department": "Engineering",
    "role": "user",
    "isEmailVerified": true,
    "avatar": null,
    "lastLogin": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## 👤 User Management APIs

### GET `/api/users/profile`
Get user profile information.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "department": "Engineering",
    "role": "user",
    "isEmailVerified": true,
    "lastLogin": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT `/api/users/profile`
Update user profile information.

**Request Body:**
```json
{
  "name": "John Smith",
  "department": "Product",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "name": "John Smith",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "department": "Product",
    "role": "user",
    "isEmailVerified": true,
    "lastLogin": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### POST `/api/users/change-password`
Change user password.

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Response:**
```json
{
  "message": "Password changed successfully. Please log in again."
}
```

## 📊 Dashboard APIs

### GET `/api/dashboard/stats`
Get dashboard statistics and metrics.

**Response:**
```json
{
  "stats": {
    "user": {
      "accountAge": 15,
      "isEmailVerified": true,
      "lastLogin": "2024-01-15T10:30:00Z"
    },
    "system": {
      "totalUsers": 150,
      "recentLogins": 45,
      "activeSessions": 23
    },
    "insights": {
      "messagesToday": 25,
      "projectsActive": 8,
      "teamMembers": 12,
      "notificationsUnread": 5
    }
  }
}
```

### GET `/api/dashboard/activity?limit=10`
Get recent activity feed.

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 10)

**Response:**
```json
{
  "activities": [
    {
      "id": "1",
      "type": "message",
      "title": "New message from Sarah",
      "description": "Sarah sent a message about the Q4 project update",
      "timestamp": "2024-01-15T10:25:00Z",
      "read": false,
      "priority": "medium"
    }
  ]
}
```

## 💬 Chat APIs

### GET `/api/chat/messages?limit=50&offset=0`
Get chat messages.

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50)
- `offset` (optional): Number of messages to skip (default: 0)

**Response:**
```json
{
  "messages": [
    {
      "id": "1",
      "type": "user",
      "content": "What are the current project priorities?",
      "timestamp": "2024-01-15T10:20:00Z",
      "userId": "user_id",
      "userName": "John Doe",
      "userAvatar": null
    },
    {
      "id": "2",
      "type": "assistant",
      "content": "Based on the latest updates, here are the current priorities...",
      "timestamp": "2024-01-15T10:21:00Z",
      "sources": [
        {
          "title": "Q4 Project Plan",
          "url": "/docs/q4-plan"
        }
      ]
    }
  ],
  "hasMore": true,
  "total": 100
}
```

### POST `/api/chat/messages`
Send a new message to the AI assistant.

**Request Body:**
```json
{
  "message": "What are the current project priorities?"
}
```

**Response:**
```json
{
  "message": {
    "id": "1234567890",
    "type": "assistant",
    "content": "I understand you're asking about project priorities...",
    "timestamp": "2024-01-15T10:30:00Z",
    "sources": [
      {
        "title": "Company Knowledge Base",
        "url": "/docs/knowledge-base"
      }
    ]
  },
  "success": true
}
```

### GET `/api/chat/suggestions`
Get suggested prompts for the chat interface.

**Response:**
```json
{
  "suggestions": [
    {
      "id": "1",
      "title": "Project Status Update",
      "description": "Get the latest status on all active projects",
      "category": "projects",
      "icon": "📊"
    }
  ]
}
```

## 🔔 Notifications APIs

### GET `/api/notifications?limit=20&unreadOnly=false`
Get user notifications.

**Query Parameters:**
- `limit` (optional): Number of notifications to return (default: 20)
- `unreadOnly` (optional): Return only unread notifications (default: false)

**Response:**
```json
{
  "notifications": [
    {
      "id": "1",
      "type": "message",
      "title": "New message from Sarah",
      "description": "Sarah sent you a message about the Q4 project update",
      "timestamp": "2024-01-15T10:25:00Z",
      "read": false,
      "priority": "medium",
      "actionUrl": "/chat",
      "icon": "💬"
    }
  ],
  "unreadCount": 5,
  "total": 25
}
```

### PUT `/api/notifications`
Update notification read status.

**Request Body:**
```json
{
  "notificationId": "1",
  "read": true
}
```

**Response:**
```json
{
  "message": "Notification updated successfully"
}
```

## ⚠️ Error Handling

All APIs return consistent error responses:

```json
{
  "error": "Error message description",
  "details": ["Additional error details if available"]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🔧 Client-Side Integration

### Authentication Context

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, login, logout, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>
  
  return <div>Welcome, {user.name}!</div>
}
```

### API Hooks

```typescript
import { useApi, useApiMutation } from '@/hooks/useApi'

function Dashboard() {
  const { data: stats, loading, error } = useApi('/api/dashboard/stats')
  const { mutate, loading: updateLoading } = useApiMutation()
  
  const handleUpdate = async () => {
    const result = await mutate('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' })
    })
  }
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return <div>Stats: {JSON.stringify(stats)}</div>
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function AdminPage() {
  return (
    <ProtectedRoute requireEmailVerification allowedRoles={['admin']}>
      <div>Admin content here</div>
    </ProtectedRoute>
  )
}
```

## 🚀 Getting Started

1. **Set up environment variables** in `.env`:
   ```env
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secret-key"
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   ```

2. **Initialize database**:
   ```bash
   node scripts/setup-db.js
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

4. **Test authentication**:
   - Visit `http://localhost:3000/auth`
   - Register a new account
   - Verify email
   - Login and test features

## 📱 Available Pages

- `/` - Main chat interface (protected)
- `/auth` - Authentication page
- `/auth/reset-password?token=...` - Password reset
- `/auth/verify-email?token=...` - Email verification
- `/dashboard` - Dashboard with stats and activity
- `/profile` - User profile management

## 🔒 Security Features

- **JWT Authentication** with secure tokens
- **Session Management** with HTTP-only cookies
- **Password Hashing** with bcrypt (12 rounds)
- **Email Verification** required for account activation
- **Password Strength Validation** with real-time feedback
- **Rate Limiting** ready for implementation
- **CSRF Protection** with secure cookies
- **Role-based Access Control** for admin features

## 📧 Email Templates

The system includes beautiful HTML email templates for:
- Email verification
- Password reset
- Welcome messages
- Security alerts

All emails are responsive and branded with your company colors.

---

**🎉 Your API is now fully functional!** All endpoints are connected with the client-side components and ready for production use.
