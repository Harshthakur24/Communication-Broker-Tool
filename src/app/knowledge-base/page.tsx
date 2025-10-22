'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppNav } from '@/components/layout/AppNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
    FileText,
    Upload,
    Trash2,
    File,
    Loader2,
    Search,
    Filter
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Document {
    id: string
    title: string
    fileType: string
    tags: string[]
    createdAt: string
    uploadedBy: string
}

export default function KnowledgeBasePage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(false)
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [tags, setTags] = useState('')
    const [uploading, setUploading] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string } | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            loadDocuments()
        }
    }, [user])

    const loadDocuments = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/documents', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            if (response.ok) {
                const data = await response.json()
                setDocuments(data.documents || [])
            }
        } catch (error) {
            console.error('Failed to load documents:', error)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            if (!title) {
                setTitle(file.name)
            }
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file')
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append('file', selectedFile)
        if (title) formData.append('title', title)
        if (tags) formData.append('tags', tags)

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            })

            if (response.ok) {
                const data = await response.json()
                alert(`Document uploaded: ${data.chunksIndexed || 0} chunks indexed`)
                setUploadDialogOpen(false)
                setSelectedFile(null)
                setTitle('')
                setTags('')
                loadDocuments()
            } else {
                alert('Upload failed')
            }
        } catch (error) {
            console.error('Upload failed:', error)
            alert('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = (documentId: string, documentTitle: string) => {
        setDocumentToDelete({ id: documentId, title: documentTitle })
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!documentToDelete) return

        setDeleting(true)
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`/api/documents/${documentToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                // Show success message
                alert('Document deleted successfully')
                loadDocuments()
            } else {
                alert('Failed to delete document')
            }
        } catch (error) {
            console.error('Delete failed:', error)
            alert('Failed to delete document')
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
            setDocumentToDelete(null)
        }
    }

    const cancelDelete = () => {
        setDeleteDialogOpen(false)
        setDocumentToDelete(null)
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div data-testid="documents-page" className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white">
            {/* Navigation */}
            <AppNav />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-3">
                                Knowledge Base
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Upload and manage your company documents
                            </p>
                        </div>
                        <Button
                            data-testid="upload-document-btn"
                            onClick={() => setUploadDialogOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-3 shadow-lg shadow-purple-200"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Document
                        </Button>
                    </div>
                </motion.div>

                {/* Documents Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    {documents.length === 0 ? (
                        <div className="text-center py-20 glass rounded-2xl shadow-xl border border-purple-100/50">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-lg">
                                <FileText className="w-12 h-12 text-purple-600" />
                            </div>
                            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                No Documents Yet
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                                Upload your first document to build your knowledge base and start chatting with your AI assistant
                            </p>
                            <Button
                                data-testid="empty-state-upload-btn"
                                onClick={() => setUploadDialogOpen(true)}
                                size="lg"
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 shadow-lg shadow-purple-200"
                            >
                                <Upload className="w-5 h-5 mr-2" />
                                Upload Your First Document
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {documents.map((doc, index) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className="group glass rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border border-purple-100/50"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                            <File className="w-7 h-7 text-purple-600" />
                                        </div>
                                        <Button
                                            data-testid={`delete-doc-${doc.id}-btn`}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(doc.id, doc.title)}
                                            className="text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 truncate text-gray-900">{doc.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3 font-medium">
                                        {doc.fileType?.toUpperCase() || 'Unknown'}
                                    </p>
                                    {doc.tags && doc.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {doc.tags.map((tag, i) => (
                                                <span key={i} className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-auto">
                                        {new Date(doc.createdAt).toLocaleDateString()}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Upload Dialog/Modal */}
            {uploadDialogOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setUploadDialogOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-purple-100/50"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUploadDialogOpen(false)}
                                className="hover:bg-gray-100 rounded-full"
                            >
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700">Select File</label>
                                <Input
                                    data-testid="file-input"
                                    type="file"
                                    accept=".pdf,.docx,.txt"
                                    onChange={handleFileSelect}
                                    className="cursor-pointer border-purple-200 focus:border-purple-400"
                                />
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <File className="w-3 h-3" />
                                    Supported formats: PDF, DOCX, TXT
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700">Document Title</label>
                                <Input
                                    data-testid="title-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter a descriptive title"
                                    className="border-purple-200 focus:border-purple-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700">Tags (Optional)</label>
                                <Input
                                    data-testid="tags-input"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="policy, hr, onboarding"
                                    className="border-purple-200 focus:border-purple-400"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Separate tags with commas to organize your documents
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setUploadDialogOpen(false)}
                                    className="flex-1"
                                    disabled={uploading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    data-testid="upload-submit-btn"
                                    onClick={handleUpload}
                                    disabled={uploading || !selectedFile}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload & Index
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Knowledge Base Document"
                description="This action cannot be undone. This will permanently delete the document and all its associated data."
                confirmText="Type the document name to confirm deletion"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                itemName={documentToDelete?.title || ''}
                confirmButtonText="Delete Document"
                cancelButtonText="Cancel"
                isLoading={deleting}
            />
        </div>
    )
}
