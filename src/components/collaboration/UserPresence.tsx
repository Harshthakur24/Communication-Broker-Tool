'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Circle,
    MessageCircle,
    Eye,
    Clock,
    Activity,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface OnlineUser {
    id: string
    name: string
    email: string
    department: string
    status: 'online' | 'away' | 'busy' | 'offline'
    currentActivity?: string
    lastSeen: string
}

interface UserPresenceProps {
    showDetails?: boolean
    maxUsers?: number
}

export const UserPresence: React.FC<UserPresenceProps> = ({
    showDetails = true,
    maxUsers = 10,
}) => {
    const { user } = useAuth()
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
    const [loading, setLoading] = useState(true)
    const [currentStatus, setCurrentStatus] = useState<string>('online')

    useEffect(() => {
        fetchOnlineUsers()

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchOnlineUsers, 30000)

        // Update own status
        updateUserStatus('online')

        // Cleanup
        return () => {
            clearInterval(interval)
            updateUserStatus('offline')
        }
    }, [])

    const fetchOnlineUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/users/presence', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setOnlineUsers(data.users || [])
            }
        } catch (error) {
            console.error('Failed to fetch online users:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateUserStatus = async (status: string) => {
        try {
            const token = localStorage.getItem('auth_token')
            await fetch('/api/users/presence', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            })
            setCurrentStatus(status)
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
                return 'bg-green-500'
            case 'away':
                return 'bg-yellow-500'
            case 'busy':
                return 'bg-red-500'
            default:
                return 'bg-gray-400'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online':
                return <Circle className="w-3 h-3 fill-green-500 text-green-500" />
            case 'away':
                return <Clock className="w-3 h-3 text-yellow-500" />
            case 'busy':
                return <Activity className="w-3 h-3 text-red-500" />
            default:
                return <Circle className="w-3 h-3 text-gray-400" />
        }
    }

    const formatLastSeen = (lastSeen: string) => {
        const date = new Date(lastSeen)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        return date.toLocaleDateString()
    }

    if (!showDetails) {
        // Compact view - just avatars
        return (
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <div className="flex -space-x-2">
                    {onlineUsers.slice(0, maxUsers).map((u) => (
                        <div
                            key={u.id}
                            className="relative w-8 h-8 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                            title={u.name}
                        >
                            {u.name.split(' ').map(n => n[0]).join('')}
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(u.status)} border-2 border-white rounded-full`} />
                        </div>
                    ))}
                </div>
                {onlineUsers.length > maxUsers && (
                    <span className="text-sm text-gray-600">
                        +{onlineUsers.length - maxUsers}
                    </span>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Team Online</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                        {onlineUsers.filter(u => u.status === 'online').length}
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
            </div>

            {/* Online Users List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full" />
                    </div>
                ) : onlineUsers.length > 0 ? (
                    <AnimatePresence>
                        {onlineUsers.map((u) => (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                        {u.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(u.status)} border-2 border-white rounded-full flex items-center justify-center`}>
                                        {u.status === 'online' && (
                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        )}
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-gray-900 text-sm truncate">
                                            {u.name}
                                        </h4>
                                        {u.id === user?.id && (
                                            <span className="text-xs text-purple-600 font-medium">(You)</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500">{u.department}</span>
                                        {u.currentActivity && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {u.currentActivity}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Status & Actions */}
                                <div className="flex items-center gap-2">
                                    {u.status !== 'online' && (
                                        <span className="text-xs text-gray-500">
                                            {formatLastSeen(u.lastSeen)}
                                        </span>
                                    )}
                                    <button
                                        className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
                                        title="Send message"
                                    >
                                        <MessageCircle className="w-4 h-4 text-purple-600" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No one online</p>
                    </div>
                )}
            </div>

            {/* Quick Status Selector */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Your status:</p>
                <div className="flex gap-2">
                    {['online', 'away', 'busy'].map((status) => (
                        <button
                            key={status}
                            onClick={() => updateUserStatus(status)}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${currentStatus === status
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-1">
                                {getStatusIcon(status)}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

