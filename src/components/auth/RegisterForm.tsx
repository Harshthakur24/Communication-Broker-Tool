'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Building, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

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
        department: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

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
        setSuccess('')

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

        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            department: formData.department || undefined,
        })

        if (result.success) {
            setSuccess('Registration successful! Please check your email to verify your account.')
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                department: '',
            })
        } else {
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
            className={cn('w-full max-w-md mx-auto', className)}
        >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Create Account
                    </h2>
                    <p className="text-gray-600 mt-2">Join the AI Communication Hub</p>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Input
                            type="text"
                            name="name"
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                            className="pl-10"
                            icon={<User className="w-4 h-4 text-gray-400" />}
                        />
                    </div>

                    <div>
                        <Input
                            type="email"
                            name="email"
                            label="Email Address"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                            className="pl-10"
                            icon={<Mail className="w-4 h-4 text-gray-400" />}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            name="department"
                            label="Department (Optional)"
                            placeholder="e.g., Engineering, Marketing"
                            value={formData.department}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="pl-10"
                            icon={<Building className="w-4 h-4 text-gray-400" />}
                        />
                    </div>

                    <div>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                label="Password"
                                placeholder="Create a strong password"
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
                                label="Confirm Password"
                                placeholder="Confirm your password"
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
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
