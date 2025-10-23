'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    Search,
    Clock,
    X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ChatSession {
    id: string
    title: string
    lastMessage: string
    timestamp: string
    messageCount: number
}

interface RecentChatsProps {
    onSelectChat?: (sessionId: string) => void
    currentSessionId?: string
}

export const RecentChats: React.FC<RecentChatsProps> = ({
    onSelectChat,
    currentSessionId,
}) => {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const [chats, setChats] = useState<ChatSession[]>([])
    const [filteredChats, setFilteredChats] = useState<ChatSession[]>([])
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [mounted, setMounted] = useState(false)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Fetch all chat sessions
    const fetchChats = useCallback(async () => {
        if (!user) return

        setLoading(true)
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/chat/messages', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                // Group messages by session and create chat list
                const chatSessions: ChatSession[] = []
                // For now, showing recent messages as conversations
                if (data.messages && data.messages.length > 0) {
                    chatSessions.push({
                        id: 'current',
                        title: 'Current Conversation',
                        lastMessage: data.messages[data.messages.length - 1]?.content || '',
                        timestamp: new Date().toISOString(),
                        messageCount: data.messages.length,
                    })
                }
                setChats(chatSessions)
                setFilteredChats(chatSessions)
            }
        } catch (error) {
            console.error('Failed to fetch chats:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchChats()
    }, [fetchChats])

    // Search chat history when user stops typing
    const searchChatHistory = useCallback(async (query: string) => {
        if (!query.trim()) {
            setFilteredChats(chats)
            setSearching(false)
            return
        }

        setSearching(true)
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/chat/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ query }),
            })

            if (response.ok) {
                const data = await response.json()
                // Convert search results to chat sessions
                const searchResults: ChatSession[] = data.results?.map((result: any, index: number) => ({
                    id: result.sessionId || `search-${index}`,
                    title: result.content.substring(0, 50) + '...',
                    lastMessage: result.content,
                    timestamp: result.timestamp || new Date().toISOString(),
                    messageCount: 1,
                })) || []
                setFilteredChats(searchResults)
            }
        } catch (error) {
            console.error('Search error:', error)
            // Fallback to local filtering
            const filtered = chats.filter(
                (chat) =>
                    chat.title.toLowerCase().includes(query.toLowerCase()) ||
                    chat.lastMessage.toLowerCase().includes(query.toLowerCase())
            )
            setFilteredChats(filtered)
        } finally {
            setSearching(false)
        }
    }, [chats])

    // Handle search input with debouncing
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        // Show searching state immediately if query exists
        if (value.trim()) {
            setSearching(true)
        }

        // Set new timeout to search after user stops typing (800ms)
        searchTimeoutRef.current = setTimeout(() => {
            searchChatHistory(value)
        }, 800)
    }

    // Clear search
    const clearSearch = () => {
        setSearchQuery('')
        setFilteredChats(chats)
        setSearching(false)
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }
    }

    // Format timestamp (client-side only to prevent hydration mismatch)
    const formatTime = (timestamp: string) => {
        if (!mounted) return ''

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

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-600 rounded-2xl">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Chats</h2>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="tell me"
                        className="w-full pl-12 pr-12 py-3 rounded-2xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-base transition-all"
                    />
                    {searching && (
                        <div className="absolute right-12 top-1/2 -translate-y-1/2">
                            <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full" />
                        </div>
                    )}
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Results / Empty State */}
            {searchQuery && filteredChats.length === 0 && !searching && (
                <div className="text-center py-12 px-4">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No chats found</p>
                    <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                </div>
            )}

            {/* Recent Conversations */}
            <div className="flex-1 overflow-y-auto">
                {!searchQuery && (
                    <div className="p-4 bg-gray-50 border-b">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                RECENT CONVERSATIONS
                            </h3>
                            <button className="text-purple-600 hover:text-purple-700">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {loading || searching ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
                    </div>
                ) : filteredChats.length > 0 ? (
                    <AnimatePresence>
                        {filteredChats.map((chat) => (
                            <motion.div
                                key={chat.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => onSelectChat?.(chat.id)}
                                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-purple-50 ${currentSessionId === chat.id ? 'bg-purple-50' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                        <MessageSquare className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {chat.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {chat.lastMessage}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {chat.timestamp ? formatTime(chat.timestamp) : '10/23/2025'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : null}
            </div>
        </div>
    )
}

