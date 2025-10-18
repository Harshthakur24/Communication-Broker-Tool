'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ResetPasswordFormProps {
    token: string
    onSuccess?: () => void
    className?: string
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
    token,
    onSuccess,
    className
}) => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const validatePassword = (password: string) => {
        const errors = []
        if (password.length < 8) errors.push('At least 8 characters')
        if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
        if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
        if (!/\d/.test(password)) errors.push('One number')
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character')
        return errors
    }

    const passwordErrors = validatePassword(formData.password)
    const isPasswordValid = passwordErrors.length === 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        // Validate password strength
        if (!isPasswordValid) {
            setError('Password does not meet requirements')
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Password reset failed')
            }

            setSuccess(true)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Password reset failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }))
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
                        Password Reset Successful
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Your password has been successfully reset. You can now sign in with your new password.
                    </p>

                    <Button
                        onClick={onSuccess}
                        className="w-full"
                    >
                        Continue to Sign In
                    </Button>
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
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Set New Password
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Enter your new password below.
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
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                label="New Password"
                                placeholder="Enter your new password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                                className="pl-10 pr-10"
                                icon={<Lock className="w-4 h-4 text-gray-400" />}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        {formData.password && (
                            <div className="mt-2">
                                <div className="text-xs text-gray-600 mb-2">Password requirements:</div>
                                <div className="space-y-1">
                                    {[
                                        { text: 'At least 8 characters', valid: formData.password.length >= 8 },
                                        { text: 'One uppercase letter', valid: /[A-Z]/.test(formData.password) },
                                        { text: 'One lowercase letter', valid: /[a-z]/.test(formData.password) },
                                        { text: 'One number', valid: /\d/.test(formData.password) },
                                        { text: 'One special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
                                    ].map((req, index) => (
                                        <div key={index} className="flex items-center space-x-2 text-xs">
                                            <div className={cn(
                                                'w-3 h-3 rounded-full flex items-center justify-center',
                                                req.valid ? 'bg-green-500' : 'bg-gray-300'
                                            )}>
                                                {req.valid && <CheckCircle className="w-2 h-2 text-white" />}
                                            </div>
                                            <span className={cn(
                                                req.valid ? 'text-green-600' : 'text-gray-500'
                                            )}>
                                                {req.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                label="Confirm New Password"
                                placeholder="Confirm your new password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                                className="pl-10 pr-10"
                                icon={<Lock className="w-4 h-4 text-gray-400" />}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        {formData.confirmPassword && (
                            <div className="mt-2 flex items-center space-x-2 text-xs">
                                <div className={cn(
                                    'w-3 h-3 rounded-full flex items-center justify-center',
                                    formData.password === formData.confirmPassword ? 'bg-green-500' : 'bg-red-500'
                                )}>
                                    {formData.password === formData.confirmPassword && <CheckCircle className="w-2 h-2 text-white" />}
                                </div>
                                <span className={cn(
                                    formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                </span>
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !isPasswordValid || formData.password !== formData.confirmPassword}
                        loading={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Resetting Password...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>
            </div>
        </motion.div>
    )
}
