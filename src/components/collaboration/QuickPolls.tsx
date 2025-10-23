'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BarChart3,
    Plus,
    X,
    Check,
    Users,
    Clock,
    TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Poll {
    id: string
    question: string
    options: {
        id: string
        text: string
        votes: number
        voters: string[]
    }[]
    createdBy: string
    createdAt: string
    expiresAt?: string
    totalVotes: number
    isActive: boolean
}

export const QuickPolls: React.FC = () => {
    const { user } = useAuth()
    const [polls, setPolls] = useState<Poll[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newPoll, setNewPoll] = useState({
        question: '',
        options: ['', ''],
    })

    useEffect(() => {
        fetchPolls()
    }, [])

    const fetchPolls = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/polls', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setPolls(data.polls || [])
            }
        } catch (error) {
            console.error('Failed to fetch polls:', error)
        } finally {
            setLoading(false)
        }
    }

    const createPoll = async () => {
        if (!newPoll.question.trim()) return
        if (newPoll.options.filter(o => o.trim()).length < 2) return

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/polls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    question: newPoll.question,
                    options: newPoll.options.filter(o => o.trim()),
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setPolls([data.poll, ...polls])
                setNewPoll({ question: '', options: ['', ''] })
                setShowCreateModal(false)
            }
        } catch (error) {
            console.error('Failed to create poll:', error)
        }
    }

    const vote = async (pollId: string, optionId: string) => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`/api/polls/${pollId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ optionId }),
            })

            if (response.ok) {
                const data = await response.json()
                setPolls((prev) =>
                    prev.map((p) => (p.id === pollId ? data.poll : p))
                )
            }
        } catch (error) {
            console.error('Failed to vote:', error)
        }
    }

    const addOption = () => {
        setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })
    }

    const removeOption = (index: number) => {
        if (newPoll.options.length <= 2) return
        setNewPoll({
            ...newPoll,
            options: newPoll.options.filter((_, i) => i !== index),
        })
    }

    const updateOption = (index: number, value: string) => {
        const updated = [...newPoll.options]
        updated[index] = value
        setNewPoll({ ...newPoll, options: updated })
    }

    const hasVoted = (poll: Poll) => {
        return poll.options.some(option => option.voters.includes(user?.id || ''))
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-7 h-7 text-purple-600" />
                        Quick Polls
                    </h2>
                    <p className="text-gray-600 mt-1">Get instant feedback from your team</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Poll
                </button>
            </div>

            {/* Polls List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
                </div>
            ) : polls.length > 0 ? (
                <div className="space-y-4">
                    <AnimatePresence>
                        {polls.map((poll) => {
                            const userHasVoted = hasVoted(poll)
                            const maxVotes = Math.max(...poll.options.map(o => o.votes), 1)

                            return (
                                <motion.div
                                    key={poll.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-all"
                                >
                                    {/* Poll Header */}
                                    <div className="mb-4">
                                        <h3 className="font-bold text-gray-900 text-lg mb-2">
                                            {poll.question}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {poll.totalVotes} votes
                                            </span>
                                            <span>•</span>
                                            <span>by {poll.createdBy}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(poll.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Poll Options */}
                                    <div className="space-y-3">
                                        {poll.options.map((option) => {
                                            const percentage = poll.totalVotes > 0
                                                ? (option.votes / poll.totalVotes) * 100
                                                : 0
                                            const isSelected = option.voters.includes(user?.id || '')

                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => !userHasVoted && vote(poll.id, option.id)}
                                                    disabled={userHasVoted}
                                                    className={`relative w-full p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                            ? 'border-purple-400 bg-purple-50'
                                                            : userHasVoted
                                                                ? 'border-gray-200 bg-gray-50 cursor-default'
                                                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer'
                                                        }`}
                                                >
                                                    {/* Progress Bar */}
                                                    {userHasVoted && (
                                                        <div
                                                            className={`absolute inset-0 ${isSelected ? 'bg-purple-100' : 'bg-gray-100'
                                                                } rounded-xl transition-all`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    )}

                                                    <div className="relative flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {isSelected && (
                                                                <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                            <span className="font-medium text-gray-900">
                                                                {option.text}
                                                            </span>
                                                        </div>

                                                        {userHasVoted && (
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm text-gray-600">
                                                                    {option.votes} votes
                                                                </span>
                                                                <span className="font-bold text-purple-600">
                                                                    {percentage.toFixed(0)}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {userHasVoted && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-2 text-sm text-green-600">
                                                <Check className="w-4 h-4" />
                                                <span>You've already voted in this poll</span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-2">No polls yet</p>
                    <p className="text-sm text-gray-400 mb-4">
                        Create a poll to get quick feedback from your team
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Poll
                    </button>
                </div>
            )}

            {/* Create Poll Modal */}
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
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">Create Quick Poll</h3>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Poll Question
                                    </label>
                                    <input
                                        type="text"
                                        value={newPoll.question}
                                        onChange={(e) =>
                                            setNewPoll({ ...newPoll, question: e.target.value })
                                        }
                                        placeholder="What would you like to ask?"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Options
                                    </label>
                                    <div className="space-y-2">
                                        {newPoll.options.map((option, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateOption(index, e.target.value)}
                                                    placeholder={`Option ${index + 1}`}
                                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                                                />
                                                {newPoll.options.length > 2 && (
                                                    <button
                                                        onClick={() => removeOption(index)}
                                                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={addOption}
                                        className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Option
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createPoll}
                                        disabled={
                                            !newPoll.question.trim() ||
                                            newPoll.options.filter(o => o.trim()).length < 2
                                        }
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                                    >
                                        Create Poll
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

