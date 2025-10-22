'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppNav } from '@/components/layout/AppNav'
import { useMutation } from '@/hooks/useApi'
import { motion } from 'framer-motion'
import {
    User,
    Mail,
    Building,
    Shield,
    Key,
    Save,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
    const { user, updateProfile, changePassword } = useAuth()
    const { mutate: updateProfileMutation, loading: updateLoading } = useMutation('/api/users/profile')
    const { mutate: changePasswordMutation, loading: passwordLoading } = useMutation('/api/users/change-password')

    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        department: user?.department || '',
        avatar: user?.avatar || '',
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    const [profileError, setProfileError] = useState('')
    const [profileSuccess, setProfileSuccess] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')

    const validatePassword = (password: string) => {
        const errors = []
        if (password.length < 8) errors.push('At least 8 characters')
        if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
        if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
        if (!/\d/.test(password)) errors.push('One number')
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character')
        return errors
    }

    const passwordErrors = validatePassword(passwordData.newPassword)
    const isPasswordValid = passwordErrors.length === 0

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setProfileError('')
        setProfileSuccess('')

        const result = await updateProfile(profileData)
        if (result.success) {
            setProfileSuccess('Profile updated successfully!')
        } else {
            setProfileError(result.error || 'Failed to update profile')
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordError('')
        setPasswordSuccess('')

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }

        if (!isPasswordValid) {
            setPasswordError('Password does not meet requirements')
            return
        }

        const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
        if (result.success) {
            setPasswordSuccess('Password changed successfully!')
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            })
        } else {
            setPasswordError(result.error || 'Failed to change password')
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white">
            {/* Navigation */}
            <AppNav />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-3">
                        Profile Settings
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Manage your account settings and preferences
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-200/50">
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={cn(
                                        'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer',
                                        activeTab === 'profile'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    )}
                                >
                                    <User className="w-5 h-5" />
                                    <span>Profile</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={cn(
                                        'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer',
                                        activeTab === 'security'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    )}
                                >
                                    <Shield className="w-5 h-5" />
                                    <span>Security</span>
                                </button>
                            </nav>
                        </Card>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        {activeTab === 'profile' && (
                            <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-200/50">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-purple-600" />
                                    Profile Information
                                </h2>

                                {profileError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <p className="text-red-700 text-sm">{profileError}</p>
                                    </motion.div>
                                )}

                                {profileSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
                                    >
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <p className="text-green-700 text-sm">{profileSuccess}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div>
                                        <Input
                                            type="text"
                                            label="Full Name"
                                            placeholder="Enter your full name"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                            disabled={updateLoading}
                                            icon={<User className="w-4 h-4 text-gray-400" />}
                                        />
                                    </div>

                                    <div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <Input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={user.email}
                                                    disabled
                                                    className="pl-10"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <Input
                                            type="text"
                                            label="Department"
                                            placeholder="Enter your department"
                                            value={profileData.department}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                                            disabled={updateLoading}
                                            icon={<Building className="w-4 h-4 text-gray-400" />}
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            type="url"
                                            label="Avatar URL (Optional)"
                                            placeholder="https://example.com/avatar.jpg"
                                            value={profileData.avatar}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, avatar: e.target.value }))}
                                            disabled={updateLoading}
                                            icon={<User className="w-4 h-4 text-gray-400" />}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={updateLoading}
                                        loading={updateLoading}
                                        className="w-full"
                                    >
                                        {updateLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Updating Profile...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Card>
                        )}

                        {activeTab === 'security' && (
                            <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-200/50">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-purple-600" />
                                    Security Settings
                                </h2>

                                {passwordError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <p className="text-red-700 text-sm">{passwordError}</p>
                                    </motion.div>
                                )}

                                {passwordSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
                                    >
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <p className="text-green-700 text-sm">{passwordSuccess}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div>
                                        <div className="relative">
                                            <Input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                label="Current Password"
                                                placeholder="Enter your current password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                required
                                                disabled={passwordLoading}
                                                className="pr-10"
                                                icon={<Key className="w-4 h-4 text-gray-400" />}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                disabled={passwordLoading}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="relative">
                                            <Input
                                                type={showNewPassword ? 'text' : 'password'}
                                                label="New Password"
                                                placeholder="Enter your new password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                required
                                                disabled={passwordLoading}
                                                className="pr-10"
                                                icon={<Key className="w-4 h-4 text-gray-400" />}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                disabled={passwordLoading}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>

                                        {passwordData.newPassword && (
                                            <div className="mt-2">
                                                <div className="text-xs text-gray-600 mb-2">Password requirements:</div>
                                                <div className="space-y-1">
                                                    {[
                                                        { text: 'At least 8 characters', valid: passwordData.newPassword.length >= 8 },
                                                        { text: 'One uppercase letter', valid: /[A-Z]/.test(passwordData.newPassword) },
                                                        { text: 'One lowercase letter', valid: /[a-z]/.test(passwordData.newPassword) },
                                                        { text: 'One number', valid: /\d/.test(passwordData.newPassword) },
                                                        { text: 'One special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) },
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
                                                label="Confirm New Password"
                                                placeholder="Confirm your new password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                required
                                                disabled={passwordLoading}
                                                className="pr-10"
                                                icon={<Key className="w-4 h-4 text-gray-400" />}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                disabled={passwordLoading}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>

                                        {passwordData.confirmPassword && (
                                            <div className="mt-2 flex items-center space-x-2 text-xs">
                                                <div className={cn(
                                                    'w-3 h-3 rounded-full flex items-center justify-center',
                                                    passwordData.newPassword === passwordData.confirmPassword ? 'bg-green-500' : 'bg-red-500'
                                                )}>
                                                    {passwordData.newPassword === passwordData.confirmPassword && <CheckCircle className="w-2 h-2 text-white" />}
                                                </div>
                                                <span className={cn(
                                                    passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-600'
                                                )}>
                                                    {passwordData.newPassword === passwordData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={passwordLoading || !isPasswordValid || passwordData.newPassword !== passwordData.confirmPassword}
                                        loading={passwordLoading}
                                        className="w-full"
                                    >
                                        {passwordLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Changing Password...
                                            </>
                                        ) : (
                                            <>
                                                <Key className="w-4 h-4 mr-2" />
                                                Change Password
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
