'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppNav } from '@/components/layout/AppNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/ui/loading'
import {
    MessageSquare,
    FileText,
    Send,
    Loader2,
    User,
    Sparkles,
    FileStack,
    Bell
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Message {
    role: 'user' | 'assistant'
    content: string
    sources?: { title: string; content: string }[]
    created_at: string
}

interface Document {
    id: string
    title: string
    uploadedBy: string
    uploadedAt: string
}

interface IntegrationEvent {
    id: string
    event_type: string
    source: string
    created_at: string
}

const SuggestedQuery: React.FC<{ text: string; onClick?: () => void }> = ({ text, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="p-4 rounded-xl glass border border-purple-100 hover:border-purple-300 cursor-pointer transition-all"
        >
            <p className="text-sm text-gray-700">{text}</p>
        </div>
    )
}

export default function Dashboard() {
    const router = useRouter()
    const { user, logout, loading: authLoading } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [chatHistory, setChatHistory] = useState<Message[]>([])
    const [documents, setDocuments] = useState<Document[]>([])
    const [integrationEvents, setIntegrationEvents] = useState<IntegrationEvent[]>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const sessionIdRef = useRef(Math.random().toString(36).substring(7))

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            loadChatHistory()
            loadDocuments()
            loadIntegrationEvents()
        }
    }, [user])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadChatHistory = async () => {
        try {
            const response = await fetch('/api/chat/messages')
            if (response.ok) {
                const data = await response.json()
                setChatHistory(data.messages || [])
            }
        } catch (error) {
            console.error('Failed to load chat history:', error)
        }
    }

    const loadDocuments = async () => {
        try {
            const response = await fetch('/api/documents')
            if (response.ok) {
                const data = await response.json()
                setDocuments(data.documents || [])
            }
        } catch (error) {
            console.error('Failed to load documents:', error)
        }
    }

    const loadIntegrationEvents = async () => {
        try {
            const response = await fetch('/api/notifications')
            if (response.ok) {
                const data = await response.json()
                setIntegrationEvents(data.notifications || [])
            }
        } catch (error) {
            console.error('Failed to load events:', error)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || loading) return

        const userMessage: Message = {
            role: 'user',
            content: inputMessage,
            created_at: new Date().toISOString()
        }

        setMessages([...messages, userMessage])
        setInputMessage('')
        setLoading(true)

        try {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    sessionId: sessionIdRef.current
                })
            })

            if (response.ok) {
                const data = await response.json()
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.response || data.message,
                    sources: data.sources,
                    created_at: new Date().toISOString()
                }

                setMessages(prev => [...prev, assistantMessage])
            } else {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.',
                    created_at: new Date().toISOString()
                }
                setMessages(prev => [...prev, errorMessage])
            }
        } catch (error) {
            console.error('Chat error:', error)
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleSuggestedQuery = (text: string) => {
        setInputMessage(text)
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div data-testid="dashboard" className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white">
            {/* Navigation */}
            <AppNav />

            {/* Main Content Container */}
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Chat Area */}
                    <div className="lg:col-span-3 flex flex-col">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="glass rounded-2xl shadow-xl border border-purple-100/50 flex flex-col h-[calc(100vh-12rem)]"
                        >
                            {/* Chat Header */}
                            <div className="p-6 border-b border-purple-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
                                        <p className="text-sm text-gray-500">Ask me anything about your company</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-6">
                                    {messages.length === 0 && chatHistory.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2, duration: 0.5 }}
                                            className="text-center py-12"
                                        >
                                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-lg">
                                                <MessageSquare className="w-10 h-10 text-purple-600" />
                                            </div>
                                            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                                Welcome to AI Hub
                                            </h2>
                                            <p className="text-gray-600 mb-8 text-lg">
                                                Ask me anything about your company knowledge base
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                                {[
                                                    "What are the latest project updates?",
                                                    "Show me the HR policies",
                                                    "Summarize yesterday's team updates",
                                                    "What's the status of ongoing projects?"
                                                ].map((query, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                                    >
                                                        <SuggestedQuery
                                                            text={query}
                                                            onClick={() => handleSuggestedQuery(query)}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Display chat history or current messages */}
                                    {(messages.length > 0 ? messages : chatHistory).map((msg, idx) => (
                                        <div key={idx} className={`fade-in flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'assistant' && (
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                                </div>
                                            )}
                                            <div className={`max-w-2xl ${msg.role === 'user'
                                                ? 'bg-purple-600 text-white rounded-2xl rounded-tr-sm'
                                                : 'glass rounded-2xl rounded-tl-sm'
                                                } p-4 shadow-sm`}>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                                {msg.sources && msg.sources.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-purple-100">
                                                        <p className="text-xs text-gray-500 mb-2">Sources:</p>
                                                        {msg.sources.map((source, i) => (
                                                            <div key={i} className="text-xs text-purple-600">
                                                                • {source.title}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {msg.role === 'user' && (
                                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {loading && (
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                                            </div>
                                            <div className="glass rounded-2xl rounded-tl-sm p-4">
                                                <p className="text-gray-600">Thinking...</p>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Input */}
                            <div className="p-6 border-t border-purple-100">
                                <div className="flex gap-3">
                                    <Input
                                        data-testid="chat-input"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask anything about your company..."
                                        className="flex-1 rounded-full border-purple-200 focus:border-purple-400"
                                        disabled={loading}
                                    />
                                    <Button
                                        data-testid="send-message-btn"
                                        onClick={handleSendMessage}
                                        disabled={loading || !inputMessage.trim()}
                                        className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6 shadow-lg shadow-purple-200"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Sidebar - Insights */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-1"
                    >
                        <div className="glass rounded-2xl shadow-xl border border-purple-100/50 flex flex-col h-[calc(100vh-12rem)]">
                            <div className="p-4 border-b border-purple-100">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Recent Activity
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-4">
                                    {/* Documents */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <FileStack className="w-4 h-4" />
                                            Recent Documents ({documents.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {documents.slice(0, 5).map((doc) => (
                                                <div key={doc.id} className="p-3 rounded-lg bg-white/50 border border-purple-100">
                                                    <p className="text-sm font-medium truncate">{doc.title}</p>
                                                    <p className="text-xs text-gray-500">by {doc.uploadedBy}</p>
                                                </div>
                                            ))}
                                            {documents.length === 0 && (
                                                <p className="text-sm text-gray-500">No documents yet</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-purple-100 my-4" />

                                    {/* Integration Events */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Integration Updates</h4>
                                        <div className="space-y-2">
                                            {integrationEvents.slice(0, 5).map((event) => (
                                                <div key={event.id} className="p-3 rounded-lg bg-white/50 border border-purple-100">
                                                    <p className="text-sm font-medium">{event.event_type}</p>
                                                    <p className="text-xs text-gray-500">{event.source}</p>
                                                </div>
                                            ))}
                                            {integrationEvents.length === 0 && (
                                                <p className="text-sm text-gray-500">No recent events</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
