'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Zap,
    Plus,
    Check,
    X,
    Star,
    Copy,
    Edit2,
    Trash2,
    Sparkles,
} from 'lucide-react'

interface Template {
    id: string
    name: string
    description: string
    tasks: {
        title: string
        description?: string
        priority: 'low' | 'medium' | 'high'
        estimatedDays?: number
    }[]
    category: string
    icon: string
}

interface TaskTemplatesProps {
    onApplyTemplate?: (template: Template) => void
}

const defaultTemplates: Template[] = [
    {
        id: '1',
        name: 'Project Kickoff',
        description: 'Standard project initiation tasks',
        category: 'Project Management',
        icon: '🚀',
        tasks: [
            {
                title: 'Define project scope and objectives',
                priority: 'high',
                estimatedDays: 2,
            },
            {
                title: 'Identify stakeholders and assign roles',
                priority: 'high',
                estimatedDays: 1,
            },
            {
                title: 'Create project timeline and milestones',
                priority: 'medium',
                estimatedDays: 2,
            },
            {
                title: 'Set up project communication channels',
                priority: 'medium',
                estimatedDays: 1,
            },
            {
                title: 'Schedule kickoff meeting',
                priority: 'low',
                estimatedDays: 1,
            },
        ],
    },
    {
        id: '2',
        name: 'Weekly Review',
        description: 'Personal productivity weekly review',
        category: 'Personal',
        icon: '📋',
        tasks: [
            {
                title: 'Review last week\'s achievements',
                priority: 'high',
                estimatedDays: 1,
            },
            {
                title: 'Identify incomplete tasks',
                priority: 'medium',
                estimatedDays: 1,
            },
            {
                title: 'Set priorities for upcoming week',
                priority: 'high',
                estimatedDays: 1,
            },
            {
                title: 'Clear inbox and organize files',
                priority: 'low',
                estimatedDays: 1,
            },
        ],
    },
    {
        id: '3',
        name: 'Code Review',
        description: 'Standard code review checklist',
        category: 'Development',
        icon: '💻',
        tasks: [
            {
                title: 'Review code for bugs and errors',
                priority: 'high',
                estimatedDays: 1,
            },
            {
                title: 'Check code style and conventions',
                priority: 'medium',
                estimatedDays: 1,
            },
            {
                title: 'Verify test coverage',
                priority: 'high',
                estimatedDays: 1,
            },
            {
                title: 'Review documentation and comments',
                priority: 'medium',
                estimatedDays: 1,
            },
            {
                title: 'Test functionality in staging',
                priority: 'high',
                estimatedDays: 2,
            },
        ],
    },
    {
        id: '4',
        name: 'Sprint Planning',
        description: 'Agile sprint planning workflow',
        category: 'Agile',
        icon: '🎯',
        tasks: [
            {
                title: 'Review and prioritize backlog',
                priority: 'high',
                estimatedDays: 1,
            },
            {
                title: 'Estimate story points',
                priority: 'high',
                estimatedDays: 1,
            },
            {
                title: 'Define sprint goals',
                priority: 'high',
                estimatedDays: 1,
            },
            {
                title: 'Assign tasks to team members',
                priority: 'medium',
                estimatedDays: 1,
            },
            {
                title: 'Schedule daily standups',
                priority: 'low',
                estimatedDays: 1,
            },
        ],
    },
    {
        id: '5',
        name: 'Onboarding',
        description: 'New team member onboarding',
        category: 'HR',
        icon: '👋',
        tasks: [
            {
                title: 'Set up workspace and equipment',
                priority: 'high',
                estimatedDays: 1,
            },
            {
                title: 'Provide access to tools and systems',
                priority: 'high',
                estimatedDays: 1,
            },
            {
                title: 'Introduce to team members',
                priority: 'medium',
                estimatedDays: 1,
            },
            {
                title: 'Review company policies and culture',
                priority: 'medium',
                estimatedDays: 2,
            },
            {
                title: 'Assign mentor and schedule check-ins',
                priority: 'low',
                estimatedDays: 1,
            },
        ],
    },
    {
        id: '6',
        name: 'Bug Fix',
        description: 'Standard bug fixing workflow',
        category: 'Development',
        icon: '🐛',
        tasks: [
            {
                title: 'Reproduce the bug',
                priority: 'high',
                estimatedDays: 1,
            },
            {
                title: 'Identify root cause',
                priority: 'high',
                estimatedDays: 2,
            },
            {
                title: 'Implement fix',
                priority: 'high',
                estimatedDays: 2,
            },
            {
                title: 'Write regression tests',
                priority: 'medium',
                estimatedDays: 1,
            },
            {
                title: 'Update documentation',
                priority: 'low',
                estimatedDays: 1,
            },
        ],
    },
]

export const TaskTemplates: React.FC<TaskTemplatesProps> = ({ onApplyTemplate }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [customTemplates, setCustomTemplates] = useState<Template[]>([])
    const [showCreateForm, setShowCreateForm] = useState(false)

    const categories = ['all', ...new Set(defaultTemplates.map((t) => t.category))]

    const filteredTemplates =
        selectedCategory === 'all'
            ? [...defaultTemplates, ...customTemplates]
            : [...defaultTemplates, ...customTemplates].filter(
                (t) => t.category === selectedCategory
            )

    const handleApplyTemplate = (template: Template) => {
        onApplyTemplate?.(template)
        setIsOpen(false)
    }

    return (
        <>
            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
                <Zap className="w-5 h-5" />
                Quick Templates
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[800px] md:max-h-[80vh] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            <Zap className="w-7 h-7 text-purple-600" />
                                            Task Templates
                                        </h2>
                                        <p className="text-gray-600 mt-1">
                                            Start with pre-built workflows
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-600" />
                                    </button>
                                </div>

                                {/* Category Filter */}
                                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Templates Grid */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredTemplates.map((template) => (
                                        <motion.div
                                            key={template.id}
                                            whileHover={{ scale: 1.02 }}
                                            className="p-5 border-2 border-gray-200 rounded-2xl hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer"
                                            onClick={() => handleApplyTemplate(template)}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">{template.icon}</span>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">
                                                            {template.name}
                                                        </h3>
                                                        <span className="text-xs text-purple-600 font-medium">
                                                            {template.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {template.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                                <span className="text-xs text-gray-500">
                                                    {template.tasks.length} tasks
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">
                                                        ~
                                                        {template.tasks.reduce(
                                                            (sum, t) => sum + (t.estimatedDays || 0),
                                                            0
                                                        )}{' '}
                                                        days
                                                    </span>
                                                    <button className="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {filteredTemplates.length === 0 && (
                                    <div className="text-center py-12">
                                        <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No templates found</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

