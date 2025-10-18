'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Bell,
    Search,
    Menu,
    Settings,
    HelpCircle,
    Zap,
    ChevronDown
} from 'lucide-react'
import { Button, Avatar, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'

interface TopNavbarProps {
    className?: string
    onMenuClick?: () => void
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
    className,
    onMenuClick
}) => {
    const [notifications, setNotifications] = React.useState(3)
    const [isSearchFocused, setIsSearchFocused] = React.useState(false)

    // Mock user data
    const user = {
        name: 'John Doe',
        email: 'john.doe@company.com',
        avatar: null
    }

    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
                'h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 shadow-sm',
                className
            )}
        >
            {/* Left Section */}
            <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                {/* Logo/Brand */}
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-purple-200">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">AI Hub</h1>
                        <p className="text-xs text-gray-500 font-medium">Communication Center</p>
                    </div>
                </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                <div className="relative">
                    <Search className={cn(
                        'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors',
                        isSearchFocused ? 'text-purple-600' : 'text-gray-400'
                    )} />
                    <input
                        type="text"
                        placeholder="Ask me anything about projects, policies, or team updates..."
                        className={cn(
                            'w-full pl-10 pr-4 py-3 text-sm border rounded-xl transition-all duration-300 shadow-sm',
                            isSearchFocused
                                ? 'border-purple-300 bg-purple-50/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-md'
                                : 'border-gray-300/50 bg-white/80 backdrop-blur-sm hover:border-purple-200 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                        )}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
                {/* Help Button */}
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <HelpCircle className="w-5 h-5" />
                </Button>

                {/* Notifications */}
                <div className="relative">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="w-5 h-5" />
                        {notifications > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                            >
                                {notifications}
                            </motion.div>
                        )}
                    </Button>
                </div>

                {/* Settings */}
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <Settings className="w-5 h-5" />
                </Button>

                {/* User Profile */}
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">Online</p>
                    </div>
                    <div className="relative">
                        <Button variant="ghost" className="p-0 h-auto">
                            <Avatar
                                src={user.avatar}
                                fallback={user.name}
                                size="md"
                                className="ring-2 ring-purple-100 hover:ring-purple-200 transition-all"
                            />
                        </Button>
                        <ChevronDown className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full p-0.5 text-gray-400" />
                    </div>
                </div>
            </div>
        </motion.header>
    )
}
