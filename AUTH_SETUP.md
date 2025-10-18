# 🔐 Authentication System Setup Guide

This guide will help you set up the complete authentication system for the AI Communication Hub.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in your project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/communication_hub?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Email Configuration (Nodemailer)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="AI Communication Hub <noreply@yourcompany.com>"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
FRONTEND_URL="http://localhost:3000"
```

### 2. Database Setup

Run the setup script to initialize your database:

```bash
node scripts/setup-db.js
```

Or manually:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 3. Start the Application

```bash
pnpm dev
```

Visit `http://localhost:3000/auth` to test the authentication system.

## 📧 Email Configuration

### Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the app password in your `.env` file

### Other Email Providers

Update the email configuration in `.env`:

```env
# For Outlook/Hotmail
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_PORT=587

# For Yahoo
EMAIL_HOST="smtp.mail.yahoo.com"
EMAIL_PORT=587

# For custom SMTP
EMAIL_HOST="your-smtp-server.com"
EMAIL_PORT=587
```

## 🗄️ Database Schema

The authentication system includes the following models:

### User Model
- `id`: Unique identifier
- `email`: User's email address (unique)
- `name`: User's full name
- `password`: Hashed password
- `avatar`: Optional avatar URL
- `department`: User's department
- `role`: User role (user, admin, etc.)
- `isActive`: Account status
- `isEmailVerified`: Email verification status
- `lastLogin`: Last login timestamp
- `createdAt`/`updatedAt`: Timestamps

### Session Model
- `id`: Session identifier
- `userId`: Reference to user
- `token`: Session token
- `expiresAt`: Session expiration
- `createdAt`/`updatedAt`: Timestamps

### Password Reset Model
- `id`: Reset request identifier
- `email`: User's email
- `token`: Reset token
- `expiresAt`: Token expiration
- `used`: Whether token was used

### Email Verification Model
- `id`: Verification identifier
- `email`: User's email
- `token`: Verification token
- `expiresAt`: Token expiration
- `used`: Whether token was used

## 🔌 API Endpoints

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/verify-email` | Verify email address |
| GET | `/api/auth/me` | Get current user |

### Request/Response Examples

#### Register User
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "department": "Engineering"
}

Response:
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

#### Login
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
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

## 🎨 UI Components

### Available Components

- `LoginForm`: User login form
- `RegisterForm`: User registration form
- `ForgotPasswordForm`: Password reset request form
- `ResetPasswordForm`: Password reset form
- `AuthPage`: Main authentication page

### Usage Example

```tsx
import { LoginForm } from '@/components/auth'

export default function LoginPage() {
  const handleLoginSuccess = () => {
    // Redirect to dashboard
    window.location.href = '/dashboard'
  }

  return (
    <LoginForm
      onSuccess={handleLoginSuccess}
      onSwitchToRegister={() => setMode('register')}
      onSwitchToForgotPassword={() => setMode('forgot-password')}
    />
  )
}
```

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Security Measures
- Password hashing with bcrypt (12 rounds)
- JWT tokens for authentication
- Session management with expiration
- Email verification required
- Password reset tokens with expiration
- CSRF protection
- Rate limiting (recommended)

### Middleware

Use the authentication middleware to protect routes:

```typescript
import { withAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    const user = authenticatedRequest.user
    // Handle authenticated request
  })
}
```

## 📱 Pages

### Authentication Pages

- `/auth` - Main authentication page (login/register/forgot password)
- `/auth/reset-password?token=...` - Password reset page
- `/auth/verify-email?token=...` - Email verification page

## 🧪 Testing

### Test the Authentication Flow

1. **Registration**:
   - Visit `/auth`
   - Click "Sign up"
   - Fill in the registration form
   - Check your email for verification

2. **Email Verification**:
   - Click the verification link in your email
   - You should see a success message

3. **Login**:
   - Use your verified credentials to log in
   - You should be redirected to the main app

4. **Password Reset**:
   - Click "Forgot Password?" on the login form
   - Enter your email address
   - Check your email for the reset link
   - Follow the link to reset your password

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check your `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify database credentials

2. **Email Not Sending**:
   - Check email configuration in `.env`
   - Verify SMTP credentials
   - Check spam folder
   - Ensure 2FA is enabled for Gmail

3. **JWT Token Issues**:
   - Verify `JWT_SECRET` is set in `.env`
   - Check token expiration settings

4. **Prisma Errors**:
   - Run `npx prisma generate`
   - Check database schema
   - Verify migrations are up to date

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
```

## 🔧 Customization

### Custom Email Templates

Modify email templates in `src/lib/email.ts`:

- `sendVerificationEmail()` - Email verification template
- `sendPasswordResetEmail()` - Password reset template
- `sendWelcomeEmail()` - Welcome email template

### Custom Validation

Modify password validation in `src/lib/auth.ts`:

```typescript
export const validatePassword = (password: string) => {
  // Add your custom validation rules
}
```

### Custom User Roles

Add custom roles in the database schema and update the middleware accordingly.

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Nodemailer Documentation](https://nodemailer.com/about/)

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console logs for errors
3. Verify your environment configuration
4. Test with a fresh database setup

---

**🎉 Your authentication system is now ready!** The system provides enterprise-grade security with a beautiful, modern UI that matches your AI Communication Hub design.
