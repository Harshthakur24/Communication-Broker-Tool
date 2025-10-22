'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, FileText, Tag, Clock, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SearchResult {
    id: string
    title: string
    snippet: string
    category: string
    tags: string[]
    similarity: number
}

interface ChatSearchProps {
    onResultSelect: (result: SearchResult) => void
    onSearchQuery?: (query: string) => void
    className?: string
}

export const ChatSearch: React.FC<ChatSearchProps> = ({
    onResultSelect,
    onSearchQuery,
    className
}) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [availableCategories, setAvailableCategories] = useState<string[]>([])
    const [availableTags, setAvailableTags] = useState<string[]>([])

    const inputRef = useRef<HTMLInputElement>(null)

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('chatSearchHistory')
        if (saved) {
            setRecentSearches(JSON.parse(saved))
        }
    }, [])

    // Save recent searches to localStorage
    const saveRecentSearch = (searchQuery: string) => {
        if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
            const updated = [searchQuery, ...recentSearches.slice(0, 4)] // Keep last 5 searches
            setRecentSearches(updated)
            localStorage.setItem('chatSearchHistory', JSON.stringify(updated))
        }
    }

    // Handle search
    const handleSearch = async () => {
        if (query.trim().length < 2) return

        setIsLoading(true)
        saveRecentSearch(query.trim())

        try {
            const response = await fetch('/api/documents/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query.trim(),
                    category: selectedCategory || undefined,
                    tags: selectedTags.length > 0 ? selectedTags : undefined,
                }),
            })

            if (!response.ok) {
                throw new Error('Search failed')
            }

            const data = await response.json()
            setResults(data.results || [])
            setIsOpen(true)
            onSearchQuery?.(query.trim())
        } catch (error) {
            console.error('Search error:', error)
            setResults([])
        } finally {
            setIsLoading(false)
        }
    }

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    // Handle key down
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        } else if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    // Handle search input focus
    const handleInputFocus = () => {
        setIsOpen(true)
    }

    // Clear search
    const clearSearch = () => {
        setQuery('')
        setResults([])
        setIsOpen(false)
    }

    // Handle result click
    const handleResultClick = (result: SearchResult) => {
        onResultSelect(result)
        setIsOpen(false)
    }

    // Toggle category
    const toggleCategory = (category: string) => {
        setSelectedCategory(selectedCategory === category ? '' : category)
    }

    // Toggle tag
    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    // Format similarity score
    const formatSimilarity = (similarity: number) => {
        return `${Math.round(similarity * 100)}%`
    }

    // Get category color
    const getCategoryColor = (category: string) => {
        const colors = {
            technical: 'bg-blue-100 text-blue-800',
            business: 'bg-green-100 text-green-800',
            legal: 'bg-red-100 text-red-800',
            general: 'bg-gray-100 text-gray-800',
        }
        return colors[category as keyof typeof colors] || colors.general
    }

    return (
        <div className={cn('w-full', className)}>
            {/* Search Input and Button */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                    <Input
                        ref={inputRef}
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleInputFocus}
                        placeholder="Search company documents..."
                        className="pr-8"
                    />
                    {query && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button
                    onClick={handleSearch}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                >
                    <Search className="h-4 w-4 mr-1" />
                    Search
                </Button>
            </div>

            {/* Filters */}
            {(availableCategories.length > 0 || availableTags.length > 0) && (
                <div className="mb-4 space-y-2">
                    {/* Category Filter */}
                    {availableCategories.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                                Categories
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {availableCategories.map(category => (
                                    <Badge
                                        key={category}
                                        variant={selectedCategory === category ? 'default' : 'outline'}
                                        className={cn(
                                            'cursor-pointer text-xs',
                                            selectedCategory === category && getCategoryColor(category)
                                        )}
                                        onClick={() => setSelectedCategory(
                                            selectedCategory === category ? '' : category
                                        )}
                                    >
                                        {category}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags Filter */}
                    {availableTags.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {availableTags.slice(0, 8).map(tag => (
                                    <Badge
                                        key={tag}
                                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                                        className={cn(
                                            'cursor-pointer text-xs',
                                            selectedTags.includes(tag) && 'bg-purple-100 text-purple-800'
                                        )}
                                        onClick={() => setSelectedTags(prev =>
                                            prev.includes(tag)
                                                ? prev.filter(t => t !== tag)
                                                : [...prev, tag]
                                        )}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search Results */}
            {isLoading && (
                <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-purple-600"></div>
                        <span className="text-sm">Searching...</span>
                    </div>
                </div>
            )}

            {!isLoading && results.length === 0 && query.length >= 2 && (
                <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No documents found</p>
                </div>
            )}

            {!isLoading && results.length === 0 && query.length < 2 && recentSearches.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Recent searches</span>
                    </div>
                    <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                            <button
                                key={index}
                                onClick={() => setQuery(search)}
                                className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                            >
                                {search}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && results.length > 0 && (
                <div className="space-y-2">
                    {results.map((result, index) => (
                        <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleResultClick(result)}
                            className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                                    {result.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={cn('text-xs', getCategoryColor(result.category))}
                                    >
                                        {result.category}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                        {formatSimilarity(result.similarity)}
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {result.snippet}
                            </p>

                            {result.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <Tag className="h-3 w-3 text-gray-400" />
                                    <div className="flex gap-1">
                                        {result.tags.slice(0, 3).map(tag => (
                                            <span
                                                key={tag}
                                                className="text-xs text-gray-500 bg-gray-100 px-1 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {result.tags.length > 3 && (
                                            <span className="text-xs text-gray-400">
                                                +{result.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Search Footer */}
            {results.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{results.length} results found</span>
                        <div className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <span>AI-powered search</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}