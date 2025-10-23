'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Filter,
    X,
    Calendar,
    Tag,
    FileText,
    Clock,
    SlidersHorizontal,
    Download,
} from 'lucide-react'

interface SearchFilters {
    query: string
    type: 'all' | 'documents' | 'tasks' | 'messages'
    dateFrom?: string
    dateTo?: string
    tags: string[]
    category?: string
    priority?: 'low' | 'medium' | 'high'
    status?: 'pending' | 'in_progress' | 'completed'
}

interface SearchResult {
    id: string
    title: string
    content: string
    type: 'document' | 'task' | 'message'
    date: string
    tags?: string[]
    priority?: string
    status?: string
    relevance: number
}

interface AdvancedSearchProps {
    onSearch: (filters: SearchFilters) => void
    results?: SearchResult[]
    loading?: boolean
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
    onSearch,
    results = [],
    loading = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        type: 'all',
        tags: [],
        priority: undefined,
        status: undefined,
    })
    const [showFilters, setShowFilters] = useState(false)
    const [tagInput, setTagInput] = useState('')

    // Debounced search
    useEffect(() => {
        if (filters.query.length > 2) {
            const timer = setTimeout(() => {
                onSearch(filters)
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [filters, onSearch])

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            setFilters((prev) => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()],
            }))
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) => {
        setFilters((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tag),
        }))
    }

    const clearFilters = () => {
        setFilters({
            query: '',
            type: 'all',
            tags: [],
            priority: undefined,
            status: undefined,
        })
    }

    const exportResults = () => {
        const dataStr = JSON.stringify(results, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `search-results-${new Date().toISOString()}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="w-full">
            {/* Search Bar */}
            <div className="relative">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={filters.query}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, query: e.target.value }))
                            }
                            onFocus={() => setIsExpanded(true)}
                            placeholder="Search documents, tasks, messages..."
                            className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-base transition-all shadow-sm"
                        />
                        {loading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full" />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-4 rounded-2xl border-2 transition-all ${showFilters
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'
                            }`}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-lg"
                        >
                            <div className="space-y-4">
                                {/* Type Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <div className="flex gap-2">
                                        {['all', 'documents', 'tasks', 'messages'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        type: type as any,
                                                    }))
                                                }
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filters.type === type
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            From
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.dateFrom || ''}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    dateFrom: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-400 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            To
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.dateTo || ''}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    dateTo: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-400 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Tag className="w-4 h-4 inline mr-1" />
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder="Add tag and press Enter"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-400 focus:outline-none"
                                    />
                                    {filters.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {filters.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
                                                >
                                                    {tag}
                                                    <button onClick={() => handleRemoveTag(tag)}>
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Priority & Status (for tasks) */}
                                {filters.type === 'tasks' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Priority
                                            </label>
                                            <select
                                                value={filters.priority || ''}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        priority: e.target.value as any,
                                                    }))
                                                }
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-400 focus:outline-none"
                                            >
                                                <option value="">All</option>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={filters.status || ''}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        status: e.target.value as any,
                                                    }))
                                                }
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-400 focus:outline-none"
                                            >
                                                <option value="">All</option>
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-between pt-2">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Clear Filters
                                    </button>
                                    {results.length > 0 && (
                                        <button
                                            onClick={exportResults}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export Results
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Search Results */}
            <AnimatePresence>
                {isExpanded && filters.query.length > 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-lg max-h-96 overflow-y-auto"
                    >
                        {results.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-800">
                                        {results.length} results found
                                    </h3>
                                    <button
                                        onClick={() => setIsExpanded(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                {results.map((result) => (
                                    <div
                                        key={result.id}
                                        className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span
                                                        className={`px-2 py-1 rounded-lg text-xs font-medium ${result.type === 'document'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : result.type === 'task'
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}
                                                    >
                                                        {result.type}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(result.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {result.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {result.content}
                                                </p>
                                                {result.tags && result.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {result.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4 text-sm font-medium text-purple-600">
                                                {Math.round(result.relevance * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No results found</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

