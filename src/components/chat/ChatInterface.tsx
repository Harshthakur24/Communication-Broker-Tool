'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    Paperclip,
    Smile,
    MoreHorizontal,
    Sparkles,
    Bot,
    User,
    Copy,
    ThumbsUp,
    ThumbsDown,
    RefreshCw
} from 'lucide-react'
import { Button, Avatar, Badge } from '@/components/ui'
import { cn, formatTime } from '@/lib/utils'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    sources?: string[]
    isTyping?: boolean
}

interface ChatInterfaceProps {
    className?: string
}

const MessageBubble: React.FC<{ message: Message; showAvatar?: boolean }> = ({
    message,
    showAvatar = false
}) => {
    const isUser = message.role === 'user'
    const [isHovered, setIsHovered] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
                'flex group',
                isUser ? 'justify-end' : 'justify-start'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={cn(
                'flex max-w-3xl',
                isUser ? 'flex-row-reverse' : 'flex-row',
                'items-start space-x-3'
            )}>
                {/* Avatar */}
                {showAvatar && !isUser && (
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                    </div>
                )}

                {/* Message Content */}
                <div className={cn(
                    'flex flex-col',
                    isUser ? 'items-end' : 'items-start'
                )}>
                    <div
                        className={cn(
                            'px-4 py-3 rounded-2xl shadow-soft transition-all duration-200',
                            isUser
                                ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
                                : 'bg-white border border-gray-200 text-gray-900'
                        )}
                    >
                        <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                    </div>

                    {/* Message Actions */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className={cn(
                                    'flex items-center space-x-1 mt-1',
                                    isUser ? 'flex-row-reverse' : 'flex-row'
                                )}
                            >
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Copy className="w-3 h-3" />
                                </Button>
                                {!isUser && (
                                    <>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <ThumbsUp className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <ThumbsDown className="w-3 h-3" />
                                        </Button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Message Metadata */}
                    <div className={cn(
                        'flex items-center space-x-2 mt-1',
                        isUser ? 'flex-row-reverse' : 'flex-row'
                    )}>
                        <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                        </span>
                        {message.sources && message.sources.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                                {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

const TypingIndicator: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3"
        >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-soft">
                <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">AI is thinking...</span>
                </div>
            </div>
        </motion.div>
    )
}

const WelcomeMessage: React.FC<{ onPromptClick: (prompt: string) => void }> = ({
    onPromptClick
}) => {
    const suggestedPrompts = [
        "What's the status of the Q4 planning project?",
        "Summarize yesterday's team updates",
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
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg ring-2 ring-purple-200">
                <Sparkles className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
                Welcome to your AI Communication Hub
            </h3>
            <p className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed text-lg">
                Ask me anything about projects, policies, or team updates. I'm always up-to-date with the latest information and can help you stay connected with your team.
            </p>
            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
                {suggestedPrompts.map((prompt, index) => (
                    <motion.button
                        key={prompt}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
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

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

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
            role: 'user',
            content: content.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I understand you're asking about "${content.trim()}". Let me help you with that information. This is a simulated response - in the real implementation, this would be powered by our RAG system with actual company data.`,
                timestamp: new Date(),
                sources: ['HR_Policy_v3.pdf', 'Project_Status_Report.pdf']
            }
            setMessages(prev => [...prev, aiMessage])
            setIsLoading(false)
        }, 2000)
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
            <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-purple-50/80 to-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-purple-200">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">AI Assistant</h1>
                            <p className="text-sm text-gray-600 font-medium">Always up-to-date company knowledge</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-700 font-medium">Online</span>
                        </div>
                        <Button variant="ghost" size="icon" className="hover:bg-purple-50">
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 ? (
                    <WelcomeMessage onPromptClick={handlePromptClick} />
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                showAvatar={
                                    index === 0 || messages[index - 1].role !== message.role
                                }
                            />
                        ))}
                        {isLoading && <TypingIndicator />}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
                <div className="relative">
                    <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything about projects, policies, or team updates..."
                        disabled={isLoading}
                        className="w-full px-4 py-3 pr-16 border border-gray-300/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 focus:bg-white shadow-sm"
                        rows={1}
                        style={{ minHeight: '52px', maxHeight: '120px' }}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-50">
                            <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-50">
                            <Smile className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() => handleSendMessage(inputValue)}
                            disabled={!inputValue.trim() || isLoading}
                            size="icon"
                            className="h-8 w-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <span className="mr-2">💡</span>
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    )
}
