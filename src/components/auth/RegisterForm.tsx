'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Building, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface RegisterFormProps {
    onSuccess?: () => void
    onSwitchToLogin?: () => void
    className?: string
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
    onSuccess,
    onSwitchToLogin,
    className
}) => {
    const { register } = useAuth()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const validatePassword = (password: string) => {
        const errors = []
        if (password.length < 8) errors.push('At least 8 characters')
        return errors
    }

    const passwordErrors = validatePassword(formData.password)
    const isPasswordValid = passwordErrors.length === 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccess('')

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            setIsLoading(false)
            return
        }

        // Basic password validation
        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long')
            setIsLoading(false)
            return
        }

        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,

        })

        if (result.success) {
            toast.success('Registration successful! Please check your email to verify your account.')
            setSuccess('Registration successful! Please check your email to verify your account.')
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',

            })
        } else {
            toast.error(result.error || 'Registration failed')
            setError(result.error || 'Registration failed')
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
            <div className="text-center mb-6">
                <h2 className="text-4xl font-bold bg-gray-900 bg-clip-text text-transparent mb-2">
                    Create Account
                </h2>
                <p className="text-gray-600 text-sm">Join the AI Communication Hub</p>
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

            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
                >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-700 text-sm">{success}</p>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="h-12 px-4 py-7 bg-white border-gray-200 rounded-full text-base placeholder:text-gray-400"
                    suppressHydrationWarning
                />

                <Input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="h-12 px-4 py-7 bg-white border-gray-200 rounded-full text-base placeholder:text-gray-400"
                    suppressHydrationWarning
                />


                <div className="relative">
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="h-12 px-4 py-7 pr-12 bg-white border-gray-200 rounded-full text-base placeholder:text-gray-400"
                        suppressHydrationWarning
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                        suppressHydrationWarning
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                <div className="relative">
                    <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="h-12 px-4 py-7 pr-12 bg-white border-gray-200 rounded-full text-base placeholder:text-gray-400"
                        suppressHydrationWarning
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                        suppressHydrationWarning
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-full text-base font-medium mt-4"
                    disabled={isLoading || !formData.name || !formData.email || !formData.password || !formData.confirmPassword}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                        disabled={isLoading}
                        suppressHydrationWarning
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </motion.div>
    )
}
