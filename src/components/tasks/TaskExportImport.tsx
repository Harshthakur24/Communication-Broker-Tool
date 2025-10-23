'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Download,
    Upload,
    FileJson,
    FileText,
    Table,
    CheckCircle2,
    AlertCircle,
    X,
} from 'lucide-react'

interface Task {
    id: string
    title: string
    description?: string
    status: string
    priority: string
    tags: string[]
    dueDate?: string
    createdAt: string
}

interface TaskExportImportProps {
    tasks: Task[]
    onImport: (tasks: Omit<Task, 'id'>[]) => Promise<void>
}

export const TaskExportImport: React.FC<TaskExportImportProps> = ({
    tasks,
    onImport,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
    const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'markdown'>('json')
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState<{
        success: boolean
        message: string
        count?: number
    } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const exportToJSON = () => {
        const dataStr = JSON.stringify(tasks, null, 2)
        downloadFile(dataStr, `tasks-${new Date().toISOString()}.json`, 'application/json')
    }

    const exportToCSV = () => {
        const headers = ['Title', 'Description', 'Status', 'Priority', 'Tags', 'Due Date', 'Created At']
        const rows = tasks.map((task) => [
            task.title,
            task.description || '',
            task.status,
            task.priority,
            task.tags.join(';'),
            task.dueDate || '',
            task.createdAt,
        ])

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n')

        downloadFile(csv, `tasks-${new Date().toISOString()}.csv`, 'text/csv')
    }

    const exportToMarkdown = () => {
        const markdown = [
            '# Tasks Export',
            '',
            `Exported on: ${new Date().toLocaleString()}`,
            '',
            `Total Tasks: ${tasks.length}`,
            '',
            '---',
            '',
            ...tasks.map((task) => {
                const checkbox = task.status === 'completed' ? '[x]' : '[ ]'
                return [
                    `## ${checkbox} ${task.title}`,
                    '',
                    task.description ? `> ${task.description}` : '',
                    '',
                    `**Status:** ${task.status}`,
                    `**Priority:** ${task.priority}`,
                    task.tags.length > 0 ? `**Tags:** ${task.tags.join(', ')}` : '',
                    task.dueDate ? `**Due Date:** ${new Date(task.dueDate).toLocaleDateString()}` : '',
                    `**Created:** ${new Date(task.createdAt).toLocaleDateString()}`,
                    '',
                    '---',
                    '',
                ].filter(Boolean).join('\n')
            }),
        ].join('\n')

        downloadFile(markdown, `tasks-${new Date().toISOString()}.md`, 'text/markdown')
    }

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
    }

    const handleExport = () => {
        switch (exportFormat) {
            case 'json':
                exportToJSON()
                break
            case 'csv':
                exportToCSV()
                break
            case 'markdown':
                exportToMarkdown()
                break
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImporting(true)
        setImportResult(null)

        try {
            const text = await file.text()
            let parsedTasks: Omit<Task, 'id'>[] = []

            if (file.name.endsWith('.json')) {
                parsedTasks = JSON.parse(text)
            } else if (file.name.endsWith('.csv')) {
                const lines = text.split('\n')
                const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim())
                parsedTasks = lines.slice(1).map((line) => {
                    const values = line.split(',').map((v) => v.replace(/"/g, '').trim())
                    return {
                        title: values[0],
                        description: values[1] || undefined,
                        status: values[2] || 'pending',
                        priority: values[3] || 'medium',
                        tags: values[4] ? values[4].split(';') : [],
                        dueDate: values[5] || undefined,
                        createdAt: values[6] || new Date().toISOString(),
                    }
                }).filter((task) => task.title)
            }

            await onImport(parsedTasks)
            setImportResult({
                success: true,
                message: 'Tasks imported successfully!',
                count: parsedTasks.length,
            })
        } catch (error) {
            setImportResult({
                success: false,
                message: 'Failed to import tasks. Please check the file format.',
            })
        } finally {
            setImporting(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
            >
                <Download className="w-5 h-5" />
                Export / Import
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Export / Import Tasks
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-600" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 mt-4">
                                    {(['export', 'import'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => {
                                                setActiveTab(tab)
                                                setImportResult(null)
                                            }}
                                            className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === tab
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {tab === 'export' ? (
                                                <Download className="w-4 h-4 inline mr-2" />
                                            ) : (
                                                <Upload className="w-4 h-4 inline mr-2" />
                                            )}
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {activeTab === 'export' ? (
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-gray-600 mb-4">
                                                Export {tasks.length} tasks in your preferred format
                                            </p>

                                            <div className="space-y-3">
                                                {[
                                                    {
                                                        id: 'json',
                                                        name: 'JSON',
                                                        icon: FileJson,
                                                        desc: 'Best for backup and re-import',
                                                    },
                                                    {
                                                        id: 'csv',
                                                        name: 'CSV',
                                                        icon: Table,
                                                        desc: 'Open in Excel or Google Sheets',
                                                    },
                                                    {
                                                        id: 'markdown',
                                                        name: 'Markdown',
                                                        icon: FileText,
                                                        desc: 'Human-readable format',
                                                    },
                                                ].map((format) => {
                                                    const Icon = format.icon
                                                    return (
                                                        <button
                                                            key={format.id}
                                                            onClick={() =>
                                                                setExportFormat(format.id as any)
                                                            }
                                                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${exportFormat === format.id
                                                                    ? 'border-purple-400 bg-purple-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Icon className="w-6 h-6 text-purple-600" />
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        {format.name}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600">
                                                                        {format.desc}
                                                                    </p>
                                                                </div>
                                                                {exportFormat === format.id && (
                                                                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleExport}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Export Tasks
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-gray-600 mb-4">
                                                Import tasks from a JSON or CSV file
                                            </p>

                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
                                            >
                                                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <p className="font-semibold text-gray-900 mb-2">
                                                    Click to upload
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Supports JSON and CSV files
                                                </p>
                                            </div>

                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".json,.csv"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </div>

                                        {importing && (
                                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                                                    <span className="text-blue-900 font-medium">
                                                        Importing tasks...
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {importResult && (
                                            <div
                                                className={`p-4 rounded-xl border ${importResult.success
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-red-50 border-red-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {importResult.success ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                                    )}
                                                    <div>
                                                        <p
                                                            className={`font-medium ${importResult.success
                                                                    ? 'text-green-900'
                                                                    : 'text-red-900'
                                                                }`}
                                                        >
                                                            {importResult.message}
                                                        </p>
                                                        {importResult.count && (
                                                            <p className="text-sm text-green-700 mt-1">
                                                                {importResult.count} tasks imported
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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

