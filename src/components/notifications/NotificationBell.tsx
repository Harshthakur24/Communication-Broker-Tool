'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check } from 'lucide-react'
import { notificationService, Notification } from '@/lib/notificationService'

export const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        // Load stored notifications
        const stored = notificationService.getStoredNotifications()
        setNotifications(stored)
        setUnreadCount(stored.filter((n) => !n.read).length)

        // Subscribe to new notifications
        const unsubscribe = notificationService.subscribe((notification) => {
            setNotifications((prev) => [notification, ...prev])
            setUnreadCount((prev) => prev + 1)
        })

        return unsubscribe
    }, [])

    const markAsRead = (notificationId: string) => {
        notificationService.markAsRead(notificationId)
        setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    const markAllAsRead = () => {
        notifications.forEach((n) => {
            if (!n.read) {
                notificationService.markAsRead(n.id)
            }
        })
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'task':
                return '✓'
            case 'ai':
                return '🤖'
            case 'success':
                return '🎉'
            case 'warning':
                return '⚠️'
            case 'error':
                return '❌'
            case 'system':
                return '⚙️'
            default:
                return '🔔'
        }
    }

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-purple-100 transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-700" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Notifications Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-12 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-purple-200 z-50 overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-transparent">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg text-gray-900">
                                        Notifications
                                    </h3>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-purple-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div className="flex-1 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No notifications</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-purple-100">
                                        {notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`p-4 hover:bg-purple-50 transition-colors cursor-pointer ${!notification.read ? 'bg-purple-50/50' : ''
                                                    }`}
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="text-2xl flex-shrink-0">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <h4 className="font-semibold text-sm text-gray-900">
                                                                {notification.title}
                                                            </h4>
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600 mb-1">
                                                            {notification.description}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {formatTimestamp(notification.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

function formatTimestamp(timestamp: Date): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
}

