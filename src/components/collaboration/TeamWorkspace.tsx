'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Plus,
    Settings,
    MessageSquare,
    FileText,
    Calendar,
    Target,
    TrendingUp,
    X,
    UserPlus,
    Bell,
} from 'lucide-react'

interface Workspace {
    id: string
    name: string
    description: string
    members: number
    unreadMessages: number
    activeTasks: number
    lastActivity: string
    color: string
}

interface TeamWorkspaceProps {
    onSelectWorkspace?: (workspaceId: string) => void
}

export const TeamWorkspace: React.FC<TeamWorkspaceProps> = ({ onSelectWorkspace }) => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' })

    useEffect(() => {
        fetchWorkspaces()
    }, [])

    const fetchWorkspaces = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/workspaces', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setWorkspaces(data.workspaces || [])
            }
        } catch (error) {
            console.error('Failed to fetch workspaces:', error)
        } finally {
            setLoading(false)
        }
    }

    const createWorkspace = async () => {
        if (!newWorkspace.name.trim()) return

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newWorkspace),
            })

            if (response.ok) {
                const data = await response.json()
                setWorkspaces([...workspaces, data.workspace])
                setNewWorkspace({ name: '', description: '' })
                setShowCreateModal(false)
            }
        } catch (error) {
            console.error('Failed to create workspace:', error)
        }
    }

    const formatLastActivity = (lastActivity: string) => {
        const date = new Date(lastActivity)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)

        if (minutes < 1) return 'Active now'
        if (minutes < 60) return `Active ${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `Active ${hours}h ago`
        return `Active ${Math.floor(hours / 24)}d ago`
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-7 h-7 text-purple-600" />
                        Team Workspaces
                    </h2>
                    <p className="text-gray-600 mt-1">Collaborate with your team in real-time</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Workspace
                </button>
            </div>

            {/* Workspaces Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
                </div>
            ) : workspaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {workspaces.map((workspace) => (
                            <motion.div
                                key={workspace.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => onSelectWorkspace?.(workspace.id)}
                                className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer"
                            >
                                {/* Workspace Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${workspace.color} flex items-center justify-center`}
                                    >
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    {workspace.unreadMessages > 0 && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                                            <Bell className="w-3 h-3" />
                                            {workspace.unreadMessages}
                                        </div>
                                    )}
                                </div>

                                {/* Workspace Info */}
                                <h3 className="font-bold text-gray-900 text-lg mb-2">
                                    {workspace.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {workspace.description}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                                            <Users className="w-4 h-4" />
                                            <span className="font-bold text-lg">{workspace.members}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Members</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                                            <MessageSquare className="w-4 h-4" />
                                            <span className="font-bold text-lg">
                                                {workspace.unreadMessages}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">Messages</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                                            <Target className="w-4 h-4" />
                                            <span className="font-bold text-lg">{workspace.activeTasks}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Tasks</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <span className="text-xs text-gray-500">
                                        {formatLastActivity(workspace.lastActivity)}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            // Open settings
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Settings className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-2">No workspaces yet</p>
                    <p className="text-sm text-gray-400 mb-4">
                        Create your first workspace to start collaborating
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Workspace
                    </button>
                </div>
            )}

            {/* Create Workspace Modal */}
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
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-3xl shadow-2xl z-50 p-6"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Create Workspace</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Workspace Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newWorkspace.name}
                                        onChange={(e) =>
                                            setNewWorkspace({ ...newWorkspace, name: e.target.value })
                                        }
                                        placeholder="e.g., Engineering Team"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={newWorkspace.description}
                                        onChange={(e) =>
                                            setNewWorkspace({
                                                ...newWorkspace,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="What's this workspace for?"
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createWorkspace}
                                    disabled={!newWorkspace.name.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                                >
                                    Create
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

