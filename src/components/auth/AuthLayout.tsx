'use client'

import React, { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { ResetPasswordForm } from './ResetPasswordForm'
import { useSearchParams } from 'next/navigation'
import { MessageSquare, Zap, Shield, Users, TrendingUp, FileText } from 'lucide-react'

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password'

function AuthContent() {
    const [mode, setMode] = useState<AuthMode>('login')
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    // If there's a token in the URL, show reset password form
    React.useEffect(() => {
        if (token) {
            setMode('reset-password')
        }
    }, [token])

    const handleSuccess = () => {
        // Redirect to dashboard after successful authentication
        window.location.href = '/'
    }

    const renderForm = () => {
        switch (mode) {
            case 'login':
                return (
                    <LoginForm
                        onSuccess={handleSuccess}
                        onSwitchToRegister={() => setMode('register')}
                        onSwitchToForgotPassword={() => setMode('forgot-password')}
                    />
                )
            case 'register':
                return (
                    <RegisterForm
                        onSuccess={handleSuccess}
                        onSwitchToLogin={() => setMode('login')}
                    />
                )
            case 'forgot-password':
                return (
                    <ForgotPasswordForm
                        onSuccess={() => setMode('login')}
                        onBackToLogin={() => setMode('login')}
                    />
                )
            case 'reset-password':
                return (
                    <ResetPasswordForm
                        token={token || ''}
                    />
                )
            default:
                return null
        }
    }

    const features = [
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: "AI Chat Interface",
            description: "Natural language queries with instant, accurate answers from your knowledge base."
        },
        {
            icon: <FileText className="w-6 h-6" />,
            title: "Document Intelligence",
            description: "Upload PDFs, DOCX, and text files. AI automatically indexes and retrieves relevant info."
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Real-Time Updates",
            description: "Event-driven architecture ensures your knowledge base is always current."
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Enterprise Security",
            description: "Role-based access control, end-to-end encryption, and full audit logs."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Team Collaboration",
            description: "Shared knowledge base accessible to all team members with proper permissions."
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Integration Ready",
            description: "Connect with Slack, Teams, Jira, and Notion for seamless workflows."
        }
    ]

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left Side - Image Background with Overlays */}
            <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="/auth-image.jpeg"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    {/* Subtle overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Content Overlays */}
                <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white max-w-md mx-auto">
                    {/* Main Title */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <h1 className="text-2xl font-normal text-white leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                            This app will be able to:
                        </h1>
                    </motion.div>

                    {/* Capability Cards Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="grid grid-cols-2 gap-4 w-full"
                    >
                        {/* Top Left Card - Star Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                            className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg"
                            style={{ backdropFilter: 'blur(20px)', background: 'rgba(255, 255, 255, 0.15)' }}
                        >
                            <div className="flex flex-col items-start text-left gap-4">
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </div>
                                <p className="text-white text-sm font-normal leading-snug opacity-95" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 400 }}>
                                    Securely verify your identity
                                </p>
                            </div>
                        </motion.div>

                        {/* Top Right Card - Envelope Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                            className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg"
                            style={{ backdropFilter: 'blur(20px)', background: 'rgba(255, 255, 255, 0.15)' }}
                        >
                            <div className="flex flex-col items-start text-left gap-4">
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                    </svg>
                                </div>
                                <p className="text-white text-sm font-normal leading-snug opacity-95" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 400 }}>
                                    Retrieve your email information
                                </p>
                            </div>
                        </motion.div>

                        {/* Bottom Left Card - User Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                            className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg"
                            style={{ backdropFilter: 'blur(20px)', background: 'rgba(255, 255, 255, 0.15)' }}
                        >
                            <div className="flex flex-col items-start text-left gap-4">
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                    </svg>
                                </div>
                                <p className="text-white text-sm font-normal leading-snug opacity-95" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 400 }}>
                                    Access your basic profile details
                                </p>
                            </div>
                        </motion.div>

                        {/* Bottom Right Card - Layers Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
                            className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg"
                            style={{ backdropFilter: 'blur(20px)', background: 'rgba(255, 255, 255, 0.15)' }}
                        >
                            <div className="flex flex-col items-start text-left gap-4">
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" />
                                    </svg>
                                </div>
                                <p className="text-white text-sm font-normal leading-snug opacity-95" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 400 }}>
                                    Maintain your login sessions
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full lg:w-[50%] flex items-center justify-center p-6 bg-white overflow-hidden h-full">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                AI Hub
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderForm()}
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-8"
                    >
                        <p className="text-sm text-gray-500">
                            © 2025 AI Communication Hub. All rights reserved.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

interface AuthLayoutProps {
    suppressHydrationWarning?: boolean;
}

export default function AuthLayout({ suppressHydrationWarning }: AuthLayoutProps) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <div suppressHydrationWarning={suppressHydrationWarning}>
                <AuthContent />
            </div>
        </Suspense>
    )
}
