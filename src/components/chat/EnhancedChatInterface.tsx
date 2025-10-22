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
    AlertCircle,
    Upload,
    FileText,
    X,
    Copy,
    File
} from 'lucide-react'
import { Button, Input, LoadingDots } from '@/components/ui'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useChatMessages, useChatSuggestions } from '@/hooks/useApi'
import { ChatSearch } from './ChatSearch'

interface Message {
    id: string
    type: 'user' | 'assistant'
    content: string
    timestamp: Date
    userId?: string
    userName?: string
    userAvatar?: string
    sources?: Array<{ title: string; url: string }>
    attachments?: Array<{ name: string; type: string; content?: string }>
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
                        className="px-6 py-3 text-sm bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:border-purple-300 hover:bg-purple-50/80 transition-all duration-300 text-gray-700 hover:text-purple-700 shadow-md hover:shadow-lg font-medium cursor-pointer"
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
    const [showAllSources, setShowAllSources] = React.useState(false)

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

                {message.attachments && message.attachments.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="mt-3 pt-3 border-t border-gray-200"
                    >
                        <p className="text-xs text-gray-500 mb-2">Attachments:</p>
                        <div className="space-y-1">
                            {message.attachments.map((attachment, idx) => (
                                <div key={idx} className="flex items-center space-x-2 text-xs text-purple-600">
                                    <File className="w-3 h-3" />
                                    <span>{attachment.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {message.sources && message.sources.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="mt-3 pt-3 border-t border-gray-200"
                    >
                        <p className="text-xs text-gray-500 mb-2">Sources:</p>
                        <div className="space-y-1">
                            {(showAllSources ? message.sources : message.sources.slice(0, 3)).map((source, idx) => (
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
                            {message.sources.length > 3 && (
                                <button
                                    onClick={() => setShowAllSources(!showAllSources)}
                                    className="text-xs text-purple-500 hover:text-purple-600 underline"
                                >
                                    {showAllSources
                                        ? 'Hide sources'
                                        : `See all ${message.sources.length} sources`
                                    }
                                </button>
                            )}
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
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showPasteModal, setShowPasteModal] = useState(false)
    const [pasteContent, setPasteContent] = useState('')
    const [attachments, setAttachments] = useState<Array<{ name: string; type: string; content?: string }>>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { data: messagesData } = useChatMessages()

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
            userName: 'You',
            attachments: attachments.length > 0 ? attachments : undefined
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setAttachments([]) // Clear attachments after sending
        setIsLoading(true)

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: content.trim(),
                    attachments: attachments.length > 0 ? attachments : undefined
                }),
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

    const handleFileUpload = async (file: File) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            const token = localStorage.getItem('auth_token')

            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.ok) {
                const result = await response.json()
                toast({
                    title: "Success",
                    description: `File "${file.name}" uploaded successfully!`,
                })

                // Add to attachments
                const attachment = {
                    name: file.name,
                    type: file.type,
                    content: result.document?.content || ''
                }
                setAttachments(prev => [...prev, attachment])

                // Add to input message
                setInputValue(prev => prev + `\n\n[Attached: ${file.name}]`)
            } else {
                const error = await response.json()
                throw new Error(error.error || 'Upload failed')
            }
        } catch (error) {
            console.error('File upload error:', error)
            toast({
                title: "Error",
                description: `Failed to upload "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
            })
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            handleFileUpload(file)
        }
    }

    const handlePasteData = () => {
        if (pasteContent.trim()) {
            const attachment = {
                name: 'Pasted Content',
                type: 'text/plain',
                content: pasteContent
            }
            setAttachments(prev => [...prev, attachment])
            setInputValue(prev => prev + `\n\n[Pasted Content]\n${pasteContent}`)
            setPasteContent('')
            setShowPasteModal(false)
            toast({
                title: "Success",
                description: "Content pasted successfully!",
            })
        }
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <div className={cn('flex flex-col h-full bg-white', className)} style={{ height: '100vh', maxHeight: '100vh' }}>
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
                        <ChatSearch
                            onResultSelect={(result) => {
                                // Add search result as context to the chat
                                setInputValue(prev => prev + `\n\n[Found: ${result.title}]\n${result.snippet}`)
                            }}
                            onSearchQuery={(query) => {
                                // Optional: Handle search query changes
                                console.log('Search query:', query)
                            }}
                        />
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200"
                        >
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-700 font-medium">Online</span>
                        </motion.div>
                        <Button variant="ghost" size="icon" className="hover:bg-purple-50" title="More options">
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 chat-container min-h-0" style={{ maxHeight: 'calc(100vh - 200px)' }}>
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-purple-50"
                            title="Upload file"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-purple-50"
                            title="Paste content"
                            onClick={() => setShowPasteModal(true)}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-50" title="Add emoji">
                            <Smile className="w-4 h-4" />
                        </Button>
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

                {/* Attachments Display */}
                {attachments.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 space-y-2"
                    >
                        <p className="text-xs text-gray-500 font-medium">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                            {attachments.map((attachment, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center space-x-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2"
                                >
                                    <FileText className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm text-purple-700">{attachment.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeAttachment(index)}
                                        className="h-6 w-6 p-0 hover:bg-red-100"
                                    >
                                        <X className="w-3 h-3 text-red-500" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.rtf,.odt,.txt,.md"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Paste Modal */}
            <AnimatePresence>
                {showPasteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowPasteModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Paste Content</h3>
                            <textarea
                                value={pasteContent}
                                onChange={(e) => setPasteContent(e.target.value)}
                                placeholder="Paste your content here..."
                                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            />
                            <div className="flex justify-end space-x-3 mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPasteModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePasteData}
                                    disabled={!pasteContent.trim()}
                                >
                                    Add Content
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
