'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Calendar,
    Target,
    BarChart3,
    PieChart,
    Activity,
} from 'lucide-react'

interface Task {
    id: string
    title: string
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    priority: 'low' | 'medium' | 'high'
    createdAt: string
    updatedAt: string
    dueDate?: string
    aiAnalyzed: boolean
}

interface TaskAnalyticsProps {
    tasks: Task[]
}

interface AnalyticsData {
    total: number
    completed: number
    pending: number
    inProgress: number
    cancelled: number
    completionRate: number
    avgCompletionTime: number
    overdueTasks: number
    priorityDistribution: { low: number; medium: number; high: number }
    dailyCompletion: { date: string; count: number }[]
    aiGeneratedTasks: number
}

export const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({ tasks }) => {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

    const analytics = useMemo((): AnalyticsData => {
        const now = new Date()
        const filtered = tasks.filter((task) => {
            const createdAt = new Date(task.createdAt)
            if (timeRange === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                return createdAt >= weekAgo
            } else if (timeRange === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                return createdAt >= monthAgo
            } else {
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
                return createdAt >= yearAgo
            }
        })

        const completed = filtered.filter((t) => t.status === 'completed')
        const pending = filtered.filter((t) => t.status === 'pending')
        const inProgress = filtered.filter((t) => t.status === 'in_progress')
        const cancelled = filtered.filter((t) => t.status === 'cancelled')

        // Calculate average completion time
        const completionTimes = completed
            .map((task) => {
                const created = new Date(task.createdAt).getTime()
                const updated = new Date(task.updatedAt).getTime()
                return (updated - created) / (1000 * 60 * 60 * 24) // days
            })
            .filter((time) => time > 0)

        const avgCompletionTime =
            completionTimes.length > 0
                ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
                : 0

        // Calculate overdue tasks
        const overdue = pending.filter((task) => {
            if (!task.dueDate) return false
            return new Date(task.dueDate) < now
        }).length

        // Priority distribution
        const priorityDistribution = {
            low: filtered.filter((t) => t.priority === 'low').length,
            medium: filtered.filter((t) => t.priority === 'medium').length,
            high: filtered.filter((t) => t.priority === 'high').length,
        }

        // Daily completion for last 7 days
        const dailyCompletion = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const dateStr = date.toISOString().split('T')[0]
            const count = completed.filter((task) => {
                const taskDate = new Date(task.updatedAt).toISOString().split('T')[0]
                return taskDate === dateStr
            }).length
            dailyCompletion.push({ date: dateStr, count })
        }

        // AI generated tasks
        const aiGenerated = filtered.filter((t) => t.aiAnalyzed).length

        return {
            total: filtered.length,
            completed: completed.length,
            pending: pending.length,
            inProgress: inProgress.length,
            cancelled: cancelled.length,
            completionRate: filtered.length > 0 ? (completed.length / filtered.length) * 100 : 0,
            avgCompletionTime,
            overdueTasks: overdue,
            priorityDistribution,
            dailyCompletion,
            aiGeneratedTasks: aiGenerated,
        }
    }, [tasks, timeRange])

    const StatCard = ({
        icon: Icon,
        title,
        value,
        subtitle,
        color,
        trend,
    }: {
        icon: any
        title: string
        value: string | number
        subtitle?: string
        color: string
        trend?: 'up' | 'down'
    }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </motion.div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-7 h-7 text-purple-600" />
                        Task Analytics
                    </h2>
                    <p className="text-gray-600 mt-1">Insights and performance metrics</p>
                </div>
                <div className="flex gap-2">
                    {(['week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Target}
                    title="Total Tasks"
                    value={analytics.total}
                    color="bg-purple-100 text-purple-600"
                />
                <StatCard
                    icon={CheckCircle2}
                    title="Completed"
                    value={analytics.completed}
                    subtitle={`${analytics.completionRate.toFixed(1)}% completion rate`}
                    color="bg-green-100 text-green-600"
                    trend="up"
                />
                <StatCard
                    icon={Clock}
                    title="Pending"
                    value={analytics.pending}
                    subtitle={`${analytics.overdueTasks} overdue`}
                    color="bg-yellow-100 text-yellow-600"
                />
                <StatCard
                    icon={Activity}
                    title="In Progress"
                    value={analytics.inProgress}
                    color="bg-blue-100 text-blue-600"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Completion Chart */}
                <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Daily Completion (Last 7 Days)
                    </h3>
                    <div className="flex items-end justify-between h-48 gap-2">
                        {analytics.dailyCompletion.map((day) => {
                            const maxCount = Math.max(...analytics.dailyCompletion.map((d) => d.count), 1)
                            const height = (day.count / maxCount) * 100
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg min-h-[4px] relative group"
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {day.count} tasks
                                        </div>
                                    </motion.div>
                                    <span className="text-xs text-gray-600">
                                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-600" />
                        Priority Distribution
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(analytics.priorityDistribution).map(([priority, count]) => {
                            const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0
                            const colorMap = {
                                high: 'bg-red-500',
                                medium: 'bg-yellow-500',
                                low: 'bg-green-500',
                            }
                            return (
                                <div key={priority}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {priority} Priority
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {count} ({percentage.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.5 }}
                                            className={`h-full ${colorMap[priority as keyof typeof colorMap]}`}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-6 h-6 text-purple-600" />
                        <h4 className="font-semibold text-purple-900">Avg. Completion Time</h4>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">
                        {analytics.avgCompletionTime.toFixed(1)} days
                    </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                        <h4 className="font-semibold text-orange-900">Overdue Tasks</h4>
                    </div>
                    <p className="text-3xl font-bold text-orange-900">{analytics.overdueTasks}</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-6 h-6 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">AI Generated</h4>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">
                        {analytics.aiGeneratedTasks}
                        <span className="text-lg text-blue-700 ml-2">
                            ({((analytics.aiGeneratedTasks / analytics.total) * 100 || 0).toFixed(0)}%)
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}

