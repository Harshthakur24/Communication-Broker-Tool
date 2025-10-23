'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    MessageSquare,
    FolderOpen,
    Users,
    FileText,
    Settings,
    Plus,
    Search,
    Clock,
    Star
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'

interface NavItemProps {
    icon: React.ComponentType<{ className?: string }>
    label: string
    active?: boolean
    count?: number
    onClick?: () => void
    href?: string
}

const NavItem: React.FC<NavItemProps> = ({
    icon: Icon,
    label,
    active = false,
    count,
    onClick,
    href
}) => {
    const handleClick = () => {
        if (href) {
            window.location.href = href
        } else if (onClick) {
            onClick()
        }
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className={cn(
                'flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left transition-all duration-200 group',
                active
                    ? 'bg-purple-100 text-purple-700 shadow-soft'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
        >
            <div className="flex items-center space-x-3">
                <Icon className={cn(
                    'w-5 h-5 transition-colors',
                    active ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                )} />
                <span className="font-medium text-sm">{label}</span>
            </div>
            {count !== undefined && count > 0 && (
                <Badge variant="secondary" className="text-xs">
                    {count}
                </Badge>
            )}
        </motion.button>
    )
}

interface RecentChatProps {
    id: string
    title: string
    lastMessage: string
    timestamp: string
    unread?: boolean
}

const RecentChatItem: React.FC<RecentChatProps> = ({
    title,
    lastMessage,
    timestamp,
    unread = false
}) => {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                    <span className="text-xs text-gray-500">{timestamp}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{lastMessage}</p>
            </div>
            {unread && (
                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
            )}
        </motion.div>
    )
}

interface LeftSidebarProps {
    className?: string
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ className }) => {
    // Mock data - in real app, this would come from state management
    const user = {
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        avatar: null
    }

    const projects = [
        { id: '1', name: 'Q4 Planning', count: 12 },
        { id: '2', name: 'Mobile App', count: 8 },
        { id: '3', name: 'API Redesign', count: 5 }
    ]

    const teams = [
        { id: '1', name: 'Engineering', count: 24 },
        { id: '2', name: 'Design', count: 8 },
        { id: '3', name: 'Product', count: 6 }
    ]

    const recentChats = [
        {
            id: '1',
            title: 'Project Status Update',
            lastMessage: 'Can you check the current status of...',
            timestamp: '2m',
            unread: true
        },
        {
            id: '2',
            title: 'Policy Questions',
            lastMessage: 'What is the new remote work policy?',
            timestamp: '1h',
            unread: false
        },
        {
            id: '3',
            title: 'Team Meeting Summary',
            lastMessage: 'Summarize yesterday\'s standup',
            timestamp: '3h',
            unread: false
        }
    ]

    return (
        <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
                'w-64 bg-white/90 backdrop-blur-md border-r border-gray-200/50 flex flex-col h-full shadow-xl',
                className
            )}
        >
            {/* User Profile Section */}
            <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-white">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold ring-2 ring-purple-200 shadow-lg">
                            {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-sm text-purple-600 font-medium truncate">{user.department}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200/50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white/80 focus:bg-white"
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-200">
                <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => console.log('New chat')}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                </Button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2">
                <div className="space-y-1">
                    <NavItem
                        icon={MessageSquare}
                        label="All Chats"
                        active={true}
                    />
                    <NavItem
                        icon={FolderOpen}
                        label="Projects"
                        count={projects.length}
                    />
                    <NavItem
                        icon={Users}
                        label="Teams"
                        count={teams.length}
                    />
                    <NavItem
                        icon={FileText}
                        label="Knowledge Base"
                        href="/knowledge-base"
                    />
                    <NavItem
                        icon={Settings}
                        label="Settings"
                    />
                </div>
            </nav>

            {/* Recent Chats */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Recent</h3>
                    <Button variant="ghost" size="sm" className="text-xs">
                        View All
                    </Button>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                    {recentChats.map((chat) => (
                        <RecentChatItem key={chat.id} {...chat} />
                    ))}
                </div>
            </div>

            {/* Favorites */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Favorites</h3>
                    <Star className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Quick Actions</span>
                    </div>
                </div>
            </div>
        </motion.aside>
    )
}
