'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    useEffect(() => {
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
    }, [token])

    const handleContinue = () => {
        router.push('/auth')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        {status === 'loading' && (
                            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                        )}
                        {status === 'success' && (
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        )}
                        {status === 'error' && (
                            <XCircle className="w-12 h-12 text-red-600" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {status === 'loading' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'loading' && 'Please wait while we verify your email address.'}
                        {status === 'success' && 'Your email has been successfully verified.'}
                        {status === 'error' && 'There was a problem verifying your email address.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">{message}</p>
                    </div>

                    {status === 'success' && (
                        <Button
                            onClick={handleContinue}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            Continue to Login
                        </Button>
                    )}

                    {status === 'error' && (
                        <div className="space-y-2">
                            <Button
                                onClick={() => router.push('/auth')}
                                variant="outline"
                                className="w-full"
                            >
                                Back to Login
                            </Button>
                            <Button
                                onClick={() => router.push('/auth')}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
