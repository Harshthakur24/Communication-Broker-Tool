'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckSquare,
    Square,
    Plus,
    X,
    Clock,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Trash2,
    Edit2,
    Sparkles,
    Loader2,
    StickyNote,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { notificationService } from '@/lib/notificationService'

interface Task {
    id: string
    title: string
    description?: string
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    priority: 'low' | 'medium' | 'high'
    tags: string[]
    dueDate?: string
    aiAnalyzed: boolean
    createdAt: string
    updatedAt: string
}

interface TaskListProps {
    isMinimized?: boolean
    onToggle?: () => void
}

export const TaskList: React.FC<TaskListProps> = ({ isMinimized = false, onToggle }) => {
    const { user } = useAuth()
    const [tasks, setTasks] = useState<Task[]>([])
    const [isExpanded, setIsExpanded] = useState(!isMinimized)
    const [newTaskText, setNewTaskText] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
    const [notification, setNotification] = useState<string | null>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
    const [agentMessage, setAgentMessage] = useState<string | null>(null)

    // Fetch tasks
    const fetchTasks = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token')
            const url = filter !== 'all' ? `/api/tasks?status=${filter}` : '/api/tasks'

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setTasks(data.tasks || [])
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
        }
    }, [filter])

    useEffect(() => {
        if (user) {
            fetchTasks()
        }
    }, [user, fetchTasks])

    // Show notification
    const showNotification = (message: string) => {
        setNotification(message)
        setTimeout(() => setNotification(null), 3000)
    }

    // Handle text input with debouncing
    const handleTextChange = (text: string) => {
        setNewTaskText(text)

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Set new timeout for AI analysis
        if (text.trim().length > 8) {
            setIsAnalyzing(true)
            typingTimeoutRef.current = setTimeout(() => {
                analyzeTextForTasks(text)
            }, 1200) // Wait 1.2 seconds after user stops typing
        } else {
            setIsAnalyzing(false)
            setAiSuggestion(null)
        }
    }

    // Analyze text with AI Agent
    const analyzeTextForTasks = async (text: string) => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text,
                    autoAnalyze: true,
                }),
            })

            if (response.ok) {
                const data = await response.json()

                if (data.success && data.tasks) {
                    // Tasks were created automatically
                    setTasks((prev) => [...data.tasks, ...prev])
                    setNewTaskText('')
                    setAiSuggestion(null)
                    setAgentMessage(data.agentMessage || 'Tasks created!')

                    // Show success notification with agent message
                    showNotification(`New task added`)

                    // Send notifications through notification service
                    data.tasks.forEach((task: Task) => {
                        notificationService.notifyTaskCreated(task.title, true)
                    })

                    // Clear agent message after 5 seconds
                    setTimeout(() => setAgentMessage(null), 5000)
                } else {
                    // No tasks detected - show agent feedback
                    setAiSuggestion(null)
                    setAgentMessage(data.agentMessage || 'No tasks detected')

                    // Clear agent message after 3 seconds
                    setTimeout(() => setAgentMessage(null), 3000)
                }
            }
        } catch (error) {
            console.error('AI analysis error:', error)
            setAgentMessage('AI Agent encountered an error')
            setTimeout(() => setAgentMessage(null), 3000)
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Manual task creation
    const createManualTask = async () => {
        if (!newTaskText.trim()) return

        setLoading(true)
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text: newTaskText,
                    autoAnalyze: false,
                    title: newTaskText,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                if (data.task) {
                    setTasks((prev) => [data.task, ...prev])
                    setNewTaskText('')
                    showNotification('✓ Task created successfully!')

                    // Send notification through notification service
                    notificationService.notifyTaskCreated(data.task.title, false)
                }
            }
        } catch (error) {
            console.error('Create task error:', error)
            showNotification('❌ Failed to create task')
        } finally {
            setLoading(false)
        }
    }

    // Update task status
    const updateTaskStatus = async (taskId: string, status: Task['status']) => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/tasks', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    taskId,
                    status,
                }),
            })

            if (response.ok) {
                const updatedTask = tasks.find(t => t.id === taskId)
                setTasks((prev) =>
                    prev.map((task) =>
                        task.id === taskId ? { ...task, status } : task
                    )
                )
                showNotification(
                    status === 'completed' ? '✓ Task completed!' : '↻ Task updated!'
                )

                // Send notification through notification service
                if (updatedTask) {
                    if (status === 'completed') {
                        notificationService.notifyTaskCompleted(updatedTask.title)
                    } else {
                        notificationService.notifyTaskUpdated(updatedTask.title)
                    }
                }
            }
        } catch (error) {
            console.error('Update task error:', error)
        }
    }

    // Delete task
    const deleteTask = async (taskId: string) => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`/api/tasks?taskId=${taskId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const deletedTask = tasks.find(t => t.id === taskId)
                setTasks((prev) => prev.filter((task) => task.id !== taskId))
                showNotification('🗑️ Task deleted!')

                // Send notification through notification service
                if (deletedTask) {
                    notificationService.notifyTaskDeleted(deletedTask.title)
                }
            }
        } catch (error) {
            console.error('Delete task error:', error)
        }
    }

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 border-red-300 text-red-700'
            case 'medium':
                return 'bg-yellow-100 border-yellow-300 text-yellow-700'
            case 'low':
                return 'bg-green-100 border-green-300 text-green-700'
            default:
                return 'bg-gray-100 border-gray-300 text-gray-700'
        }
    }

    // Filter tasks
    const filteredTasks = tasks.filter((task) => {
        if (filter === 'all') return true
        return task.status === filter
    })

    return (
        <>
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-20 right-6 z-50 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200"
                    >
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Task List Panel */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`fixed ${isExpanded ? 'right-6 top-20 w-96' : 'right-6 bottom-6 w-16'
                    } z-40 transition-all duration-300`}
            >
                <div
                    className={`glass rounded-3xl shadow-2xl border border-purple-200 overflow-hidden ${isExpanded ? 'h-[calc(100vh-120px)]' : 'h-16'
                        } transition-all duration-300`}
                    style={{ backdropFilter: 'blur(20px)' }}
                >
                    {/* Header */}
                    <div
                        className={`${isExpanded
                            ? 'p-4 bg-gradient-to-r from-purple-500 to-purple-600 cursor-pointer flex items-center justify-between'
                            : 'p-0 bg-gradient-to-br from-purple-500 to-purple-600 cursor-pointer flex items-center justify-center h-full rounded-3xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 hover:shadow-xl'
                            }`}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <StickyNote className="w-5 h-5 text-white" />
                                    <h3 className="font-bold text-white text-lg">Tasks</h3>
                                </div>
                                <button className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors">
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <StickyNote className="w-6 h-6 text-white" />

                            </div>
                        )}
                    </div>

                    {/* Content - Only show when expanded */}
                    {isExpanded && (
                        <div className="flex flex-col h-[calc(100%-64px)]">
                            {/* Input Area with AI Indicator */}
                            <div className="p-4 border-b border-purple-200 bg-white/50">
                                <div className="relative">
                                    <textarea
                                        value={newTaskText}
                                        onChange={(e) => handleTextChange(e.target.value)}
                                        placeholder="Type anything... AI Agent will auto-detect actionable task"
                                        className="w-full p-3 pr-20 rounded-xl border border-purple-200 focus:border-purple-400 focus:outline-none resize-none text-sm"
                                        rows={3}
                                        disabled={loading}
                                    />
                                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                                        {isAnalyzing && (
                                            <div className="bg-purple-100 text-purple-600 px-2 py-1 rounded-lg flex items-center gap-1 text-xs">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span>AI</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={createManualTask}
                                            disabled={!newTaskText.trim() || loading}
                                            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Plus className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {/* AI Agent Feedback */}
                                <AnimatePresence>
                                    {agentMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl flex items-start gap-2 text-xs shadow-sm"
                                        >
                                            <div className="p-1 bg-purple-100 rounded-full flex-shrink-0">
                                                <Sparkles className="w-3 h-3 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-purple-700 mb-0.5">AI Agent</div>
                                                <div className="text-gray-700">{agentMessage}</div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-2 p-3 bg-white/30 border-b border-purple-100">
                                {['all', 'pending', 'completed'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f as any)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === f
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/50 text-gray-600 hover:bg-white'
                                            }`}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Tasks List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                <AnimatePresence>
                                    {filteredTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`p-3 rounded-xl border-2 shadow-md hover:shadow-lg transition-all ${task.status === 'completed'
                                                ? 'bg-gray-50 border-gray-200 opacity-60'
                                                : 'bg-white border-purple-200'
                                                }`}
                                            style={{
                                                transform: 'rotate(-1deg)',
                                            }}
                                        >
                                            <div className="flex items-start gap-2">
                                                <button
                                                    onClick={() =>
                                                        updateTaskStatus(
                                                            task.id,
                                                            task.status === 'completed' ? 'pending' : 'completed'
                                                        )
                                                    }
                                                    className="mt-1 flex-shrink-0"
                                                >
                                                    {task.status === 'completed' ? (
                                                        <CheckSquare className="w-5 h-5 text-purple-600" />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-gray-400 hover:text-purple-600" />
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4
                                                            className={`font-semibold text-sm ${task.status === 'completed'
                                                                ? 'line-through text-gray-500'
                                                                : 'text-gray-900'
                                                                }`}
                                                        >
                                                            {task.title}
                                                        </h4>
                                                        {task.aiAnalyzed && (
                                                            <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    {task.description && (
                                                        <p className="text-xs text-gray-600 mb-2">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                                                                task.priority
                                                            )}`}
                                                        >
                                                            {task.priority}
                                                        </span>
                                                        {task.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {filteredTasks.length === 0 && (
                                    <div className="text-center py-8">
                                        <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No tasks yet</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Start typing to add tasks automatically!
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Stats Footer */}
                            <div className="p-3 border-t border-purple-200 bg-white/50">
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>
                                        Total: <strong>{tasks.length}</strong>
                                    </span>
                                    <span>
                                        Completed:{' '}
                                        <strong>
                                            {tasks.filter((t) => t.status === 'completed').length}
                                        </strong>
                                    </span>
                                    <span>
                                        Pending:{' '}
                                        <strong>
                                            {tasks.filter((t) => t.status === 'pending').length}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    )
}

