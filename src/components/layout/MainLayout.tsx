'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LeftSidebar } from './LeftSidebar'
import { TopNavbar } from './TopNavbar'
import { RightPanel } from './RightPanel'
import { EnhancedChatInterface } from '../chat/EnhancedChatInterface'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
    className?: string
}

export const MainLayout: React.FC<MainLayoutProps> = ({ className }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [rightPanelOpen, setRightPanelOpen] = useState(true)

    return (
        <div className={cn('min-h-screen bg-gradient-to-br from-purple-50 to-white', className)}>
            <div className="flex h-screen">
                {/* Left Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="lg:hidden fixed inset-y-0 left-0 z-50 w-64"
                        >
                            <LeftSidebar />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Desktop Sidebar */}
                <div className="hidden lg:block">
                    <LeftSidebar />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Navigation */}
                    <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                    {/* Content */}
                    <main className="flex-1 flex overflow-hidden">
                        {/* Center Panel - Chat Interface */}
                        <div className="flex-1 flex flex-col min-w-0">
                            <EnhancedChatInterface />
                        </div>

                        {/* Right Panel */}
                        <AnimatePresence>
                            {rightPanelOpen && (
                                <motion.div
                                    initial={{ x: 300, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 300, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="hidden xl:block"
                                >
                                    <RightPanel />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
