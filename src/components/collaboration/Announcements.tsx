'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Megaphone,
    Pin,
    AlertCircle,
    Info,
    CheckCircle,
    X,
    Plus,
    Send,
    Users,
    Clock,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Announcement {
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'urgent'
    author: string
    department: string
    isPinned: boolean
    createdAt: string
    readBy: string[]
}

export const Announcements: React.FC = () => {
    const { user } = useAuth()
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        message: '',
        type: 'info' as const,
        isPinned: false,
    })

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/announcements', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setAnnouncements(data.announcements || [])
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error)
        } finally {
            setLoading(false)
        }
    }

    const createAnnouncement = async () => {
        if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) return

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newAnnouncement),
            })

            if (response.ok) {
                const data = await response.json()
                setAnnouncements([data.announcement, ...announcements])
                setNewAnnouncement({ title: '', message: '', type: 'info', isPinned: false })
                setShowCreateModal(false)
            }
        } catch (error) {
            console.error('Failed to create announcement:', error)
        }
    }

    const markAsRead = async (announcementId: string) => {
        try {
            const token = localStorage.getItem('auth_token')
            await fetch(`/api/announcements/${announcementId}/read`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            setAnnouncements((prev) =>
                prev.map((a) =>
                    a.id === announcementId
                        ? { ...a, readBy: [...a.readBy, user?.id || ''] }
                        : a
                )
            )
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'urgent':
                return {
                    icon: AlertCircle,
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    iconColor: 'text-red-600',
                    badge: 'bg-red-100 text-red-700',
                }
            case 'warning':
                return {
                    icon: AlertCircle,
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    iconColor: 'text-yellow-600',
                    badge: 'bg-yellow-100 text-yellow-700',
                }
            case 'success':
                return {
                    icon: CheckCircle,
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    iconColor: 'text-green-600',
                    badge: 'bg-green-100 text-green-700',
                }
            default:
                return {
                    icon: Info,
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    iconColor: 'text-blue-600',
                    badge: 'bg-blue-100 text-blue-700',
                }
        }
    }

    const formatTime = (date: string) => {
        const d = new Date(date)
        const now = new Date()
        const diff = now.getTime() - d.getTime()
        const hours = Math.floor(diff / 3600000)

        if (hours < 1) return `${Math.floor(diff / 60000)}m ago`
        if (hours < 24) return `${hours}h ago`
        return d.toLocaleDateString()
    }

    const pinnedAnnouncements = announcements.filter((a) => a.isPinned)
    const regularAnnouncements = announcements.filter((a) => !a.isPinned)

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Megaphone className="w-7 h-7 text-purple-600" />
                        Company Announcements
                    </h2>
                    <p className="text-gray-600 mt-1">Stay updated with important company news</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        New Announcement
                    </button>
                )}
            </div>

            {/* Announcements List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Pinned Announcements */}
                    {pinnedAnnouncements.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Pin className="w-4 h-4" />
                                Pinned
                            </h3>
                            <div className="space-y-3">
                                {pinnedAnnouncements.map((announcement) => {
                                    const config = getTypeConfig(announcement.type)
                                    const Icon = config.icon
                                    const isUnread = !announcement.readBy.includes(user?.id || '')

                                    return (
                                        <motion.div
                                            key={announcement.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-5 rounded-2xl border-2 ${config.border} ${config.bg} ${isUnread ? 'shadow-lg' : 'shadow-sm'
                                                } relative`}
                                        >
                                            {isUnread && (
                                                <div className="absolute top-2 right-2 w-3 h-3 bg-purple-600 rounded-full animate-pulse" />
                                            )}

                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 ${config.badge} rounded-xl`}>
                                                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-bold text-gray-900 text-lg">
                                                            {announcement.title}
                                                        </h4>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${config.badge} font-medium`}>
                                                            {announcement.type.toUpperCase()}
                                                        </span>
                                                    </div>

                                                    <p className="text-gray-700 mb-3 leading-relaxed">
                                                        {announcement.message}
                                                    </p>

                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-3 text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-4 h-4" />
                                                                {announcement.author}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{announcement.department}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                {formatTime(announcement.createdAt)}
                                                            </span>
                                                        </div>

                                                        {isUnread && (
                                                            <button
                                                                onClick={() => markAsRead(announcement.id)}
                                                                className="text-purple-600 hover:text-purple-700 font-medium"
                                                            >
                                                                Mark as read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Regular Announcements */}
                    {regularAnnouncements.length > 0 && (
                        <div>
                            {pinnedAnnouncements.length > 0 && (
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent</h3>
                            )}
                            <div className="space-y-3">
                                {regularAnnouncements.map((announcement) => {
                                    const config = getTypeConfig(announcement.type)
                                    const Icon = config.icon
                                    const isUnread = !announcement.readBy.includes(user?.id || '')

                                    return (
                                        <motion.div
                                            key={announcement.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-xl border ${config.border} bg-white hover:shadow-md transition-all relative ${isUnread ? 'border-l-4' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 ${config.badge} rounded-lg`}>
                                                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <h4 className="font-semibold text-gray-900">
                                                            {announcement.title}
                                                        </h4>
                                                        {isUnread && (
                                                            <div className="w-2 h-2 bg-purple-600 rounded-full" />
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {announcement.message}
                                                    </p>

                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{announcement.author}</span>
                                                        <span>•</span>
                                                        <span>{formatTime(announcement.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {announcements.length === 0 && (
                        <div className="text-center py-12">
                            <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No announcements yet</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white rounded-3xl shadow-2xl z-50 p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Create Announcement</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={newAnnouncement.title}
                                        onChange={(e) =>
                                            setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                                        }
                                        placeholder="Announcement title"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        value={newAnnouncement.message}
                                        onChange={(e) =>
                                            setNewAnnouncement({ ...newAnnouncement, message: e.target.value })
                                        }
                                        placeholder="Write your announcement..."
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['info', 'success', 'warning', 'urgent'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() =>
                                                    setNewAnnouncement({ ...newAnnouncement, type: type as any })
                                                }
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${newAnnouncement.type === type
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newAnnouncement.isPinned}
                                        onChange={(e) =>
                                            setNewAnnouncement({
                                                ...newAnnouncement,
                                                isPinned: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 text-purple-600"
                                    />
                                    <span className="text-sm text-gray-700">Pin this announcement</span>
                                </label>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createAnnouncement}
                                    disabled={
                                        !newAnnouncement.title.trim() || !newAnnouncement.message.trim()
                                    }
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Broadcast
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

