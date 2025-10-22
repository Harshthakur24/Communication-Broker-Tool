'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VerifyEmailPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const [mounted, setMounted] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    const token = mounted ? searchParams.get('token') : null

    useEffect(() => {
        if (!mounted) return

        if (!token) {
            setStatus('error')
            setMessage('No verification token provided')
            return
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                })

                const data = await response.json()

                if (response.ok) {
                    setStatus('success')
                    setMessage(data.message)
                } else {
                    setStatus('error')
                    setMessage(data.error || 'Verification failed')
                }
            } catch (error) {
                setStatus('error')
                setMessage('An error occurred during verification')
            }
        }

        verifyEmail()
    }, [mounted, token])

    const handleContinue = () => {
        router.push('/auth')
    }

    // Show loading state until component is mounted
    if (!mounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="w-full max-w-md">
                    <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
                        <CardHeader className="text-center pb-6">
                            <div className="mx-auto mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-lg">
                                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                Loading...
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md"
            >
                <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
                    <CardHeader className="text-center pb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.2
                            }}
                            className="mx-auto mb-6 relative"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-lg">
                                <AnimatePresence mode="wait">
                                    {status === 'loading' && (
                                        <motion.div
                                            key="loading"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: 180 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                                        </motion.div>
                                    )}
                                    {status === 'success' && (
                                        <motion.div
                                            key="success"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: 180 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <CheckCircle className="w-10 h-10 text-green-600" />
                                        </motion.div>
                                    )}
                                    {status === 'error' && (
                                        <motion.div
                                            key="error"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: 180 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <XCircle className="w-10 h-10 text-red-600" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Success animation rings */}
                            {status === 'success' && (
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-green-400"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                />
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                {status === 'loading' && 'Verifying Email...'}
                                {status === 'success' && 'Email Verified!'}
                                {status === 'error' && 'Verification Failed'}
                            </CardTitle>
                            <CardDescription className="text-gray-600 text-base">
                                {status === 'loading' && 'Please wait while we verify your email address.'}
                                {status === 'success' && 'Your email has been successfully verified. You can now access all features.'}
                                {status === 'error' && 'There was a problem verifying your email address.'}
                            </CardDescription>
                        </motion.div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="text-center"
                        >
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border">
                                {message}
                            </p>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {status === 'success' && (
                                <motion.div
                                    key="success-actions"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-3"
                                >
                                    <Button
                                        onClick={handleContinue}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                                    >
                                        <span>Continue to Login</span>
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <motion.div
                                    key="error-actions"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-3"
                                >
                                    <Button
                                        onClick={() => router.push('/auth')}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        <span>Try Again</span>
                                    </Button>
                                    <Button
                                        onClick={() => router.push('/auth')}
                                        variant="outline"
                                        className="w-full border-gray-300 hover:bg-gray-50 font-medium py-3 rounded-xl transition-all duration-300"
                                    >
                                        Back to Login
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
