'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ForgotPasswordFormProps {
    onSuccess?: () => void
    onBackToLogin?: () => void
    className?: string
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
    onSuccess,
    onBackToLogin,
    className
}) => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send reset email')
            }

            setSuccess(true)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to send reset email')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn('w-full max-w-md mx-auto', className)}
            >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Check Your Email
                    </h2>

                    <p className="text-gray-600 mb-6">
                        We've sent a password reset link to <strong>{email}</strong>.
                        Please check your email and click the link to reset your password.
                    </p>

                    <div className="space-y-4">
                        <Button
                            onClick={onBackToLogin}
                            variant="outline"
                            className="w-full"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Sign In
                        </Button>

                        <p className="text-sm text-gray-500">
                            Didn't receive the email? Check your spam folder or{' '}
                            <button
                                onClick={() => {
                                    setSuccess(false)
                                    setEmail('')
                                }}
                                className="text-purple-600 hover:text-purple-700 font-medium"
                            >
                                try again
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn('w-full max-w-md mx-auto', className)}
        >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Reset Password
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="pl-10"
                            icon={<Mail className="w-4 h-4 text-gray-400" />}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !email}
                        loading={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending Reset Link...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={onBackToLogin}
                        className="text-purple-600 hover:text-purple-700 font-medium transition-colors flex items-center justify-center space-x-2 mx-auto"
                        disabled={isLoading}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Sign In</span>
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
