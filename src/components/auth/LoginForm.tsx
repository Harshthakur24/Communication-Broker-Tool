'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface LoginFormProps {
    onSuccess?: () => void
    onSwitchToRegister?: () => void
    onSwitchToForgotPassword?: () => void
    className?: string
}

export const LoginForm: React.FC<LoginFormProps> = ({
    onSuccess,
    onSwitchToRegister,
    onSwitchToForgotPassword,
    className
}) => {
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const result = await login(formData.email, formData.password)

        if (result.success) {
            toast.success('Login successful!')
            onSuccess?.()
        } else {
            toast.error(result.error || 'Login failed')
            setError(result.error || 'Login failed')
        }

        setIsLoading(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn('w-full', className)}
        >
            <div className="text-center mb-8 mt-14">

                <h2 className="text-4xl font-bold bg-gray-900 bg-clip-text text-transparent mb-3">
                    Welcome Back
                </h2>
                <p className="text-gray-800">Sign in to your AI Communication Hub</p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="px-4 py-7 bg-white border-gray-200 rounded-full text-base placeholder:text-gray-400"
                        suppressHydrationWarning
                    />
                </div>

                <div>
                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                            className="px-4 py-7 bg-white border-gray-200 rounded-full text-base placeholder:text-gray-400"
                            suppressHydrationWarning
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            disabled={isLoading}
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="text-left">
                    <button
                        type="button"
                        onClick={onSwitchToForgotPassword}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors cursor-pointer"
                        disabled={isLoading}
                    >
                        Forgot Password?
                    </button>
                </div>

                <Button
                    type="submit"
                    className="w-full px-4 py-7 bg-black hover:bg-gray-900 text-white rounded-full text-base font-medium"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Signing In...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-purple-600 hover:text-purple-700 font-medium transition-colors cursor-pointer"
                        disabled={isLoading}
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </motion.div>
    )
}
