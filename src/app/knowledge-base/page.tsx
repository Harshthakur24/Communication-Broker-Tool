'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Upload,
    Database,
    Search,
    FileText,
    BarChart3,
    Plus,
    FolderOpen
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { DocumentUpload, DocumentManager } from '@/components/documents'
import { cn } from '@/lib/utils'

type TabType = 'upload' | 'manage' | 'analytics'

export default function KnowledgeBasePage() {
    const [activeTab, setActiveTab] = useState<TabType>('upload')
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const tabs = [
        {
            id: 'upload' as TabType,
            label: 'Upload Documents',
            icon: Upload,
            description: 'Add new documents to the knowledge base'
        },
        {
            id: 'manage' as TabType,
            label: 'Manage Documents',
            icon: Database,
            description: 'View, search, and organize existing documents'
        },
        {
            id: 'analytics' as TabType,
            label: 'Analytics',
            icon: BarChart3,
            description: 'View usage statistics and insights'
        }
    ]

    const handleUploadComplete = (documents: any[]) => {
        setRefreshTrigger(prev => prev + 1)
        setActiveTab('manage')
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'upload':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <DocumentUpload onUploadComplete={handleUploadComplete} />
                    </motion.div>
                )

            case 'manage':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <DocumentManager key={refreshTrigger} />
                    </motion.div>
                )

            case 'analytics':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">0</p>
                                                <p className="text-sm text-gray-600">Total Documents</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <Search className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">0</p>
                                                <p className="text-sm text-gray-600">Search Queries</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <FolderOpen className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">0</p>
                                                <p className="text-sm text-gray-600">Categories</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Knowledge Base Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <BarChart3 className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Analytics Coming Soon
                                        </h3>
                                        <p className="text-gray-600">
                                            Detailed analytics and insights will be available once you start uploading documents.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                        Knowledge Base
                    </h1>
                    <p className="text-gray-600">
                        Manage your company's documents and enable AI-powered search
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                            activeTab === tab.id
                                                ? 'border-purple-500 text-purple-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>
        </div>
    )
}
