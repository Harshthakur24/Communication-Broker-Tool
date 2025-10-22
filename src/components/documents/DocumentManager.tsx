'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Filter,
    FileText,
    Download,
    Trash2,
    Eye,
    Calendar,
    User,
    Tag,
    Folder
} from 'lucide-react'
import { Button, Input, Card, CardContent, Badge, useToast } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Document {
    id: string
    title: string
    type: string
    category?: string
    tags: string[]
    fileSize: string
    chunksCount: number
    uploadedBy: string
    uploadedAt: string
    updatedAt: string
}

interface DocumentManagerProps {
    className?: string
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ className }) => {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const { showToast } = useToast()

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'policies', label: 'Policies' },
        { value: 'procedures', label: 'Procedures' },
        { value: 'faq', label: 'FAQ' },
        { value: 'manuals', label: 'Manuals' },
        { value: 'meetings', label: 'Meetings' },
        { value: 'general', label: 'General' },
    ]

    const sortOptions = [
        { value: 'createdAt', label: 'Upload Date' },
        { value: 'title', label: 'Title' },
        { value: 'fileSize', label: 'File Size' },
        { value: 'uploadedBy', label: 'Uploaded By' },
    ]

    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(searchQuery && { search: searchQuery }),
                ...(selectedCategory !== 'all' && { category: selectedCategory }),
                sortBy,
                sortOrder,
            })

            const token = localStorage.getItem('auth_token')
            const response = await fetch(`/api/documents?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            const data = await response.json()

            if (response.ok) {
                setDocuments(data.documents)
                setTotalPages(data.pagination.pages)
            } else {
                showToast('Failed to fetch documents', 'error')
            }
        } catch (error) {
            showToast('Error loading documents', 'error')
        } finally {
            setLoading(false)
        }
    }, [currentPage, searchQuery, selectedCategory, sortBy, sortOrder, showToast])

    useEffect(() => {
        fetchDocuments()
    }, [fetchDocuments])

    const handleDelete = async (documentId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`/api/documents?id=${documentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                showToast('Document deleted successfully', 'success')
                fetchDocuments()
            } else {
                showToast('Failed to delete document', 'error')
            }
        } catch (error) {
            showToast('Error deleting document', 'error')
        }
    }

    const getFileIcon = (type: string) => {
        return <FileText className="w-5 h-5 text-blue-500" />
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <div className={cn('w-full', className)}>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Manager</h2>
                <p className="text-gray-600">Manage your company's knowledge base documents</p>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search documents..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="lg:w-48">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {categories.map(category => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="lg:w-48">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Order */}
                        <Button
                            variant="outline"
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="lg:w-auto"
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Documents List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : documents.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
                        <p className="text-gray-600">
                            {searchQuery || selectedCategory !== 'all'
                                ? 'Try adjusting your search criteria'
                                : 'Upload some documents to get started'
                            }
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {documents.map((doc, index) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 flex-1">
                                                {getFileIcon(doc.type)}

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                        {doc.title}
                                                    </h3>

                                                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <User className="w-3 h-3" />
                                                            <span>{doc.uploadedBy}</span>
                                                        </div>

                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{formatDate(doc.uploadedAt)}</span>
                                                        </div>

                                                        <span>{doc.fileSize}</span>
                                                        <span>{doc.chunksCount} chunks</span>
                                                    </div>

                                                    <div className="flex items-center space-x-2 mt-2">
                                                        {doc.category && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {doc.category}
                                                            </Badge>
                                                        )}

                                                        {doc.tags.slice(0, 3).map(tag => (
                                                            <Badge key={tag} variant="outline" className="text-xs">
                                                                <Tag className="w-2 h-2 mr-1" />
                                                                {tag}
                                                            </Badge>
                                                        ))}

                                                        {doc.tags.length > 3 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{doc.tags.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(`/documents/${doc.id}`, '_blank')}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>

                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}
