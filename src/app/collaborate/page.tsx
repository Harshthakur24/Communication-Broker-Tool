'use client'

import React, { useState } from 'react'
import { AppNav } from '@/components/layout/AppNav'
import { UserPresence } from '@/components/collaboration/UserPresence'
import { TeamWorkspace } from '@/components/collaboration/TeamWorkspace'
import { Announcements } from '@/components/collaboration/Announcements'
import { QuickPolls } from '@/components/collaboration/QuickPolls'
import { motion } from 'framer-motion'
import {
    Users,
    Megaphone,
    BarChart3,
    Briefcase,
    Sparkles,
} from 'lucide-react'

export default function CollaboratePage() {
    const [activeTab, setActiveTab] = useState<'workspaces' | 'announcements' | 'polls'>('workspaces')

    const tabs = [
        { id: 'workspaces', name: 'Workspaces', icon: Briefcase },
        { id: 'announcements', name: 'Announcements', icon: Megaphone },
        { id: 'polls', name: 'Quick Polls', icon: BarChart3 },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            <AppNav />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Collaboration Hub
                            </h1>
                            <p className="text-gray-600">
                                Connect, communicate, and collaborate with your team
                            </p>
                        </div>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        <div className="px-3 py-1 bg-white rounded-full border border-purple-200 text-sm text-gray-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            Real-time presence
                        </div>
                        <div className="px-3 py-1 bg-white rounded-full border border-purple-200 text-sm text-gray-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            Team workspaces
                        </div>
                        <div className="px-3 py-1 bg-white rounded-full border border-purple-200 text-sm text-gray-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            Instant feedback
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar - User Presence */}
                    <div className="lg:col-span-1">
                        <UserPresence showDetails={true} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Tabs */}
                        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-2 mb-6">
                            <div className="flex gap-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {tab.name}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'workspaces' && <TeamWorkspace />}
                            {activeTab === 'announcements' && <Announcements />}
                            {activeTab === 'polls' && <QuickPolls />}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}

