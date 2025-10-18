'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    Paperclip,
    Smile,
    Bot,
    User,
    MoreHorizontal,
    Sparkles,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react'
import { Button, Input, LoadingDots, Tooltip } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useChatMessages, useChatSuggestions } from '@/hooks/useApi'

interface Message {
    id: string
    type: 'user' | 'assistant'
    content: string
    timestamp: Date
    userId?: string
    userName?: string
    userAvatar?: string
    sources?: Array<{ title: string; url: string }>
}

interface EnhancedChatInterfaceProps {
    className?: string
}

const WelcomeMessage: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => {
    const { data: suggestionsData } = useChatSuggestions()
    const suggestions = suggestionsData?.suggestions || []

    const suggestedPrompts = [
        "What are the current project priorities?",
        "Show me recent team updates",
        "Summarize yesterday's meetings",
        "Is the new remote work policy live?",
        "Show me recent changes to the API documentation"
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center py-16"
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg ring-2 ring-purple-200"
            >
                <Sparkles className="w-12 h-12 text-purple-600" />
            </motion.div>

            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4"
            >
                Welcome to your AI Communication Hub
            </motion.h3>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed text-lg"
            >
                Ask me anything about projects, policies, or team updates. I'm always up-to-date with the latest information and can help you stay connected with your team.
            </motion.p>

            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
                {suggestedPrompts.map((prompt, index) => (
                    <motion.button
                        key={prompt}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPromptClick(prompt)}
                        className="px-6 py-3 text-sm bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:border-purple-300 hover:bg-purple-50/80 transition-all duration-300 text-gray-700 hover:text-purple-700 shadow-md hover:shadow-lg font-medium"
                    >
                        {prompt}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    )
}

const MessageBubble: React.FC<{ message: Message; index: number }> = ({ message, index }) => {
    const isUser = message.type === 'user'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={cn(
                'flex items-start space-x-3 mb-6',
                isUser ? 'flex-row-reverse space-x-reverse' : ''
            )}
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    isUser
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                )}
            >
                {isUser ? (
                    <User className="w-4 h-4 text-white" />
                ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: isUser ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
                className={cn(
                    'max-w-3xl px-4 py-3 rounded-2xl shadow-sm',
                    isUser
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                )}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                {message.sources && message.sources.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="mt-3 pt-3 border-t border-gray-200"
                    >
                        <p className="text-xs text-gray-500 mb-2">Sources:</p>
                        <div className="space-y-1">
                            {message.sources.map((source, idx) => (
                                <a
                                    key={idx}
                                    href={source.url}
                                    className="text-xs text-purple-600 hover:text-purple-700 underline block"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {source.title}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className={cn(
                        'text-xs mt-2',
                        isUser ? 'text-purple-100' : 'text-gray-500'
                    )}
                >
                    {message.timestamp.toLocaleTimeString()}
                </motion.p>
            </motion.div>
        </motion.div>
    )
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ className }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const { data: messagesData, refetch: refetchMessages } = useChatMessages()

    useEffect(() => {
        if (messagesData?.messages) {
            setMessages(messagesData.messages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            })))
        }
    }, [messagesData])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: content.trim(),
            timestamp: new Date(),
            userId: 'current-user',
            userName: 'You'
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: content.trim() }),
            })

            const data = await response.json()

            if (response.ok && data.message) {
                const aiMessage: Message = {
                    ...data.message,
                    timestamp: new Date(data.message.timestamp)
                }
                setMessages(prev => [...prev, aiMessage])
            } else {
                throw new Error(data.error || 'Failed to send message')
            }
        } catch (error) {
            console.error('Error sending message:', error)
            // Add error message
            const errorMessage: Message = {
                id: Date.now().toString(),
                type: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage(inputValue)
        }
    }

    const handlePromptClick = (prompt: string) => {
        setInputValue(prompt)
        inputRef.current?.focus()
    }

    return (
        <div className={cn('flex flex-col h-full bg-white', className)}>
            {/* Chat Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-purple-50/80 to-white/80 backdrop-blur-sm"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-purple-200"
                        >
                            <Bot className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                AI Assistant
                            </h1>
                            <p className="text-sm text-gray-600 font-medium">Always up-to-date company knowledge</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200"
                        >
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-700 font-medium">Online</span>
                        </motion.div>
                        <Tooltip content="More options">
                            <Button variant="ghost" size="icon" className="hover:bg-purple-50">
                                <MoreHorizontal className="w-5 h-5" />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </motion.div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 ? (
                    <WelcomeMessage onPromptClick={handlePromptClick} />
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <MessageBubble key={message.id} message={message} index={index} />
                        ))}

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start space-x-3 mb-6"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <LoadingDots />
                                        <span className="text-sm text-gray-500">AI is thinking...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm"
            >
                <div className="relative">
                    <motion.textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything about projects, policies, or team updates..."
                        disabled={isLoading}
                        className="w-full px-4 py-3 pr-16 border border-gray-300/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 focus:bg-white shadow-sm"
                        rows={1}
                        style={{ minHeight: '52px', maxHeight: '120px' }}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <Tooltip content="Attach file">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-50">
                                <Paperclip className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Add emoji">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-50">
                                <Smile className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={() => handleSendMessage(inputValue)}
                                disabled={!inputValue.trim() || isLoading}
                                size="icon"
                                className="h-8 w-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-gray-500 mt-2 flex items-center"
                >
                    <span className="mr-2">💡</span>
                    Press Enter to send, Shift+Enter for new line
                </motion.p>
            </motion.div>
        </div>
    )
}
