'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    Clock,
    Users,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    ArrowUpRight,
    Bell
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface LiveUpdateProps {
    id: string
    type: 'project' | 'policy' | 'team' | 'system'
    title: string
    description: string
    timestamp: string
    status: 'success' | 'warning' | 'error' | 'info'
}

const LiveUpdateCard: React.FC<LiveUpdateProps> = ({
    type,
    title,
    description,
    timestamp,
    status
}) => {
    const statusIcons = {
        success: CheckCircle,
        warning: AlertCircle,
        error: XCircle,
        info: FileText
    }

    const statusColors = {
        success: 'text-green-600 bg-green-100',
        warning: 'text-yellow-600 bg-yellow-100',
        error: 'text-red-600 bg-red-100',
        info: 'text-blue-600 bg-blue-100'
    }

    const Icon = statusIcons[status]

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
        >
            <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                statusColors[status]
            )}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                            {title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {description}
                        </p>
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-gray-400 mt-2">{timestamp}</p>
            </div>
        </motion.div>
    )
}

interface ProjectStatusProps {
    id: string
    name: string
    status: 'on-track' | 'at-risk' | 'delayed' | 'completed'
    progress: number
    team: string
    deadline: string
}

const ProjectStatusCard: React.FC<ProjectStatusProps> = ({
    name,
    status,
    progress,
    team,
    deadline
}) => {
    const statusConfig = {
        'on-track': { color: 'bg-green-500', label: 'On Track' },
        'at-risk': { color: 'bg-yellow-500', label: 'At Risk' },
        'delayed': { color: 'bg-red-500', label: 'Delayed' },
        'completed': { color: 'bg-purple-500', label: 'Completed' }
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-soft transition-all cursor-pointer"
        >
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">{name}</h4>
                <div className={cn(
                    'w-2 h-2 rounded-full',
                    statusConfig[status].color
                )} />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{statusConfig[status].label}</span>
                    <span className="text-gray-700 font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={cn('h-1.5 rounded-full', statusConfig[status].color)}
                    />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{team}</span>
                    <span>{deadline}</span>
                </div>
            </div>
        </motion.div>
    )
}

interface PolicyUpdateProps {
    id: string
    title: string
    department: string
    effectiveDate: string
    isNew: boolean
}

const PolicyUpdateCard: React.FC<PolicyUpdateProps> = ({
    title,
    department,
    effectiveDate,
    isNew
}) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3 rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-soft transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                            {title}
                        </h4>
                        {isNew && (
                            <Badge variant="success" className="text-xs">
                                New
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{department}</p>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-gray-500">Effective: {effectiveDate}</p>
        </motion.div>
    )
}

interface NotificationProps {
    id: string
    type: 'mention' | 'update' | 'reminder' | 'alert'
    title: string
    message: string
    timestamp: string
    unread: boolean
}

const NotificationCard: React.FC<NotificationProps> = ({
    type,
    title,
    message,
    timestamp,
    unread
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'p-3 rounded-xl transition-all cursor-pointer group',
                unread ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
            )}
        >
            <div className="flex items-start space-x-3">
                <div className={cn(
                    'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                    unread ? 'bg-purple-500' : 'bg-gray-300'
                )} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                            {title}
                        </h4>
                        <span className="text-xs text-gray-400">{timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{message}</p>
                </div>
            </div>
        </motion.div>
    )
}

interface RightPanelProps {
    className?: string
}

export const RightPanel: React.FC<RightPanelProps> = ({ className }) => {
    // Mock data - in real app, this would come from state management
    const liveUpdates: LiveUpdateProps[] = [
        {
            id: '1',
            type: 'project',
            title: 'Q4 Planning Updated',
            description: 'Project status changed to "In Progress" with 3 new tasks added',
            timestamp: '2 minutes ago',
            status: 'success'
        },
        {
            id: '2',
            type: 'policy',
            title: 'Remote Work Policy',
            description: 'New policy document published and distributed to all teams',
            timestamp: '15 minutes ago',
            status: 'info'
        },
        {
            id: '3',
            type: 'team',
            title: 'Engineering Team',
            description: 'Daily standup completed with 5 action items identified',
            timestamp: '1 hour ago',
            status: 'success'
        }
    ]

    const projects: ProjectStatusProps[] = [
        {
            id: '1',
            name: 'Q4 Planning',
            status: 'on-track',
            progress: 75,
            team: 'Product',
            deadline: 'Dec 15'
        },
        {
            id: '2',
            name: 'Mobile App Redesign',
            status: 'at-risk',
            progress: 45,
            team: 'Design',
            deadline: 'Jan 20'
        },
        {
            id: '3',
            name: 'API Migration',
            status: 'completed',
            progress: 100,
            team: 'Engineering',
            deadline: 'Nov 30'
        }
    ]

    const policyUpdates: PolicyUpdateProps[] = [
        {
            id: '1',
            title: 'Remote Work Guidelines',
            department: 'HR',
            effectiveDate: 'Dec 1, 2025',
            isNew: true
        },
        {
            id: '2',
            title: 'Security Protocols',
            department: 'IT',
            effectiveDate: 'Nov 15, 2025',
            isNew: false
        }
    ]

    const notifications: NotificationProps[] = [
        {
            id: '1',
            type: 'mention',
            title: 'You were mentioned',
            message: 'Sarah mentioned you in the Q4 planning discussion',
            timestamp: '5m',
            unread: true
        },
        {
            id: '2',
            type: 'update',
            title: 'Project Update',
            message: 'Mobile app redesign has new requirements',
            timestamp: '1h',
            unread: true
        },
        {
            id: '3',
            type: 'reminder',
            title: 'Meeting Reminder',
            message: 'Weekly team sync in 30 minutes',
            timestamp: '2h',
            unread: false
        }
    ]

    return (
        <motion.aside
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
            className={cn(
                'w-80 bg-gray-50/80 backdrop-blur-md border-l border-gray-200/50 flex flex-col h-full shadow-xl',
                className
            )}
        >
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-200/50 bg-white/90 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Insights</h2>
                    <Button variant="ghost" size="sm" className="text-xs hover:bg-purple-50">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Analytics
                    </Button>
                </div>
            </div>

            {/* Live Updates */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-purple-600" />
                        Live Updates
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                        {liveUpdates.length}
                    </Badge>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {liveUpdates.map((update) => (
                        <LiveUpdateCard key={update.id} {...update} />
                    ))}
                </div>
            </div>

            {/* Project Status */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-purple-600" />
                        Project Status
                    </h3>
                    <Button variant="ghost" size="sm" className="text-xs">
                        View All
                    </Button>
                </div>
                <div className="space-y-3">
                    {projects.map((project) => (
                        <ProjectStatusCard key={project.id} {...project} />
                    ))}
                </div>
            </div>

            {/* Policy Updates */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-purple-600" />
                        Policy Updates
                    </h3>
                    <Button variant="ghost" size="sm" className="text-xs">
                        View All
                    </Button>
                </div>
                <div className="space-y-2">
                    {policyUpdates.map((policy) => (
                        <PolicyUpdateCard key={policy.id} {...policy} />
                    ))}
                </div>
            </div>

            {/* Notifications */}
            <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-purple-600" />
                        Notifications
                    </h3>
                    <Button variant="ghost" size="sm" className="text-xs">
                        Mark All Read
                    </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                        <NotificationCard key={notification.id} {...notification} />
                    ))}
                </div>
            </div>
        </motion.aside>
    )
}
