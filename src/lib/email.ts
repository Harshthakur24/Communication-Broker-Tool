import * as nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || 'user@example.com',
        pass: process.env.EMAIL_PASS || 'password',
      },
    })
  }
  return transporter
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }

    const result = await getTransporter().sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to AI Communication Hub!</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up! To complete your registration and start using our AI Communication Hub, please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace;">${verificationUrl}</p>
          <p><strong>This link will expire in 24 hours.</strong></p>
        </div>
        <div class="footer">
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>© 2024 AI Communication Hub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: email,
    subject: 'Verify Your Email - AI Communication Hub',
    html,
  })
}

export const sendPasswordResetEmail = async (email: string, token: string): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password for your AI Communication Hub account. Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>
          <div class="warning">
            <p><strong>⚠️ Security Notice:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Your password will remain unchanged until you create a new one</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>© 2024 AI Communication Hub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: email,
    subject: 'Reset Your Password - AI Communication Hub',
    html,
  })
}

export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AI Communication Hub</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280; }
        .feature { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to AI Communication Hub!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Welcome to your new AI-powered communication hub! Your account has been successfully verified and you're ready to start using all the amazing features.</p>
          
          <h3>🚀 What you can do now:</h3>
          <div class="feature">
            <strong>💬 Chat with AI Assistant</strong><br>
            Ask questions about projects, policies, and team updates
          </div>
          <div class="feature">
            <strong>📊 Real-time Insights</strong><br>
            Get live updates on project statuses and notifications
          </div>
          <div class="feature">
            <strong>🔍 Smart Search</strong><br>
            Find information across all your company documents
          </div>
          
          <a href="${process.env.FRONTEND_URL}" class="button">Get Started</a>
        </div>
        <div class="footer">
          <p>Need help? Contact our support team anytime.</p>
          <p>© 2024 AI Communication Hub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: email,
    subject: 'Welcome to AI Communication Hub! 🎉',
    html,
  })
}
