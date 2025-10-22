'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload,
    File,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    FileText,
    FileImage,
    FileSpreadsheet,
    FileVideo
} from 'lucide-react'
import { Button, Card, CardContent, useToast } from '@/components/ui'
import { cn } from '@/lib/utils'

interface UploadedFile {
    file: File
    id: string
    status: 'pending' | 'uploading' | 'success' | 'error'
    progress: number
    error?: string
    result?: any
}

interface DocumentUploadProps {
    onUploadComplete?: (documents: any[]) => void
    className?: string
}

const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
    if (type.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />
    if (type.includes('video')) return <FileVideo className="w-5 h-5 text-purple-500" />
    return <File className="w-5 h-5 text-gray-500" />
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
    onUploadComplete,
    className
}) => {
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [isDragOver, setIsDragOver] = useState(false)
    const [category, setCategory] = useState('')
    const [tags, setTags] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { showToast } = useToast()

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const droppedFiles = Array.from(e.dataTransfer.files)
        addFiles(droppedFiles)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            addFiles(selectedFiles)
        }
    }

    const addFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(file => {
            const validTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
                'application/rtf',
                'application/vnd.oasis.opendocument.text',
                'text/plain',
                'text/markdown'
            ]
            const validExtensions = ['.pdf', '.docx', '.doc', '.rtf', '.odt', '.txt', '.md']
            const extension = '.' + file.name.split('.').pop()?.toLowerCase()

            return validTypes.includes(file.type) || validExtensions.includes(extension)
        })

        if (validFiles.length !== newFiles.length) {
            showToast('Some files were skipped. Supported: PDF, DOCX, DOC, RTF, ODT, TXT, MD.', 'warning')
        }

        const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
            file,
            id: Math.random().toString(36).substring(7),
            status: 'pending',
            progress: 0,
        }))

        setFiles(prev => [...prev, ...uploadedFiles])
    }

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(file => file.id !== id))
    }

    const uploadFile = async (uploadedFile: UploadedFile) => {
        const formData = new FormData()
        formData.append('file', uploadedFile.file)
        if (category) formData.append('category', category)
        if (tags) formData.append('tags', tags)

        try {
            setFiles(prev => prev.map(f =>
                f.id === uploadedFile.id
                    ? { ...f, status: 'uploading', progress: 50 }
                    : f
            ))

            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (response.ok) {
                setFiles(prev => prev.map(f =>
                    f.id === uploadedFile.id
                        ? { ...f, status: 'success', progress: 100, result }
                        : f
                ))
                showToast(`Document "${uploadedFile.file.name}" uploaded successfully!`, 'success')
            } else {
                throw new Error(result.error || 'Upload failed')
            }
        } catch (error) {
            setFiles(prev => prev.map(f =>
                f.id === uploadedFile.id
                    ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
                    : f
            ))
            showToast(`Failed to upload "${uploadedFile.file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
        }
    }

    const uploadAllFiles = async () => {
        const pendingFiles = files.filter(f => f.status === 'pending')

        for (const file of pendingFiles) {
            await uploadFile(file)
        }

        const successfulUploads = files.filter(f => f.status === 'success')
        if (successfulUploads.length > 0 && onUploadComplete) {
            onUploadComplete(successfulUploads.map(f => f.result))
        }
    }

    const clearAll = () => {
        setFiles([])
        setCategory('')
        setTags('')
    }

    const hasPendingFiles = files.some(f => f.status === 'pending')
    const hasUploadingFiles = files.some(f => f.status === 'uploading')

    return (
        <div className={cn('w-full max-w-4xl mx-auto', className)}>
            <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
                <CardContent className="p-8">
                    {/* Upload Area */}
                    <div
                        className={cn(
                            'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
                            isDragOver
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                                <Upload className="w-8 h-8 text-purple-600" />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Upload Company Documents
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Drag and drop files here, or click to browse
                                </p>
                                <p className="text-sm text-gray-500">
                                    Supported formats: PDF, DOCX, TXT, MD (Max 10MB each)
                                </p>
                            </div>

                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="mt-4"
                            >
                                Choose Files
                            </Button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.docx,.txt,.md"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Metadata Fields */}
                    {(files.length > 0 || category || tags) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category (Optional)
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Select a category</option>
                                        <option value="policies">Policies</option>
                                        <option value="procedures">Procedures</option>
                                        <option value="faq">FAQ</option>
                                        <option value="manuals">Manuals</option>
                                        <option value="meetings">Meetings</option>
                                        <option value="general">General</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="e.g., hr, security, onboarding"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* File List */}
                    <AnimatePresence>
                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-semibold text-gray-900">
                                        Files to Upload ({files.length})
                                    </h4>
                                    <div className="flex space-x-2">
                                        {hasPendingFiles && (
                                            <Button
                                                onClick={uploadAllFiles}
                                                disabled={hasUploadingFiles}
                                                loading={hasUploadingFiles}
                                                size="sm"
                                            >
                                                Upload All
                                            </Button>
                                        )}
                                        <Button
                                            onClick={clearAll}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {files.map((uploadedFile) => (
                                        <motion.div
                                            key={uploadedFile.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                {getFileIcon(uploadedFile.file.type)}
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {uploadedFile.file.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatFileSize(uploadedFile.file.size)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {uploadedFile.status === 'pending' && (
                                                    <Button
                                                        onClick={() => uploadFile(uploadedFile)}
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        Upload
                                                    </Button>
                                                )}

                                                {uploadedFile.status === 'uploading' && (
                                                    <div className="flex items-center space-x-2">
                                                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                                        <span className="text-sm text-gray-600">Uploading...</span>
                                                    </div>
                                                )}

                                                {uploadedFile.status === 'success' && (
                                                    <div className="flex items-center space-x-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                        <span className="text-sm text-green-600">Success</span>
                                                    </div>
                                                )}

                                                {uploadedFile.status === 'error' && (
                                                    <div className="flex items-center space-x-2">
                                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                                        <span className="text-sm text-red-600">Error</span>
                                                    </div>
                                                )}

                                                <Button
                                                    onClick={() => removeFile(uploadedFile.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-gray-400 hover:text-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    )
}
