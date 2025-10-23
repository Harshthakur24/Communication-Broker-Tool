import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      const user = authenticatedRequest.user!
      const { searchParams } = new URL(request.url)
      const timeRange = searchParams.get('range') || 'month' // week, month, year

      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setDate(now.getDate() - 30)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      // Fetch tasks within range
      const tasks = await prisma.task.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          status: true,
          priority: true,
          aiAnalyzed: true,
          dueDate: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      // Calculate statistics
      const total = tasks.length
      const completed = tasks.filter((t) => t.status === 'completed').length
      const pending = tasks.filter((t) => t.status === 'pending').length
      const inProgress = tasks.filter((t) => t.status === 'in_progress').length
      const cancelled = tasks.filter((t) => t.status === 'cancelled').length

      // Completion rate
      const completionRate = total > 0 ? (completed / total) * 100 : 0

      // Average completion time (in days)
      const completedTasks = tasks.filter((t) => t.status === 'completed')
      const completionTimes = completedTasks
        .map((task) => {
          const created = new Date(task.createdAt).getTime()
          const updated = new Date(task.updatedAt).getTime()
          return (updated - created) / (1000 * 60 * 60 * 24)
        })
        .filter((time) => time > 0)

      const avgCompletionTime =
        completionTimes.length > 0
          ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
          : 0

      // Overdue tasks
      const overdueTasks = tasks.filter((task) => {
        if (task.status !== 'pending' || !task.dueDate) return false
        return new Date(task.dueDate) < now
      }).length

      // Priority distribution
      const priorityDistribution = {
        low: tasks.filter((t) => t.priority === 'low').length,
        medium: tasks.filter((t) => t.priority === 'medium').length,
        high: tasks.filter((t) => t.priority === 'high').length,
      }

      // Daily completion for last 7 days
      const dailyCompletion = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        const count = completedTasks.filter((task) => {
          const taskDate = new Date(task.updatedAt).toISOString().split('T')[0]
          return taskDate === dateStr
        }).length
        dailyCompletion.push({
          date: dateStr,
          count,
        })
      }

      // AI generated tasks
      const aiGeneratedTasks = tasks.filter((t) => t.aiAnalyzed).length

      // Status trend (last 4 weeks)
      const weeklyTrend = []
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        const weekTasks = tasks.filter((task) => {
          const taskDate = new Date(task.createdAt)
          return taskDate >= weekStart && taskDate < weekEnd
        })

        weeklyTrend.push({
          week: `Week ${4 - i}`,
          created: weekTasks.length,
          completed: weekTasks.filter((t) => t.status === 'completed').length,
        })
      }

      return NextResponse.json({
        analytics: {
          total,
          completed,
          pending,
          inProgress,
          cancelled,
          completionRate: parseFloat(completionRate.toFixed(2)),
          avgCompletionTime: parseFloat(avgCompletionTime.toFixed(2)),
          overdueTasks,
          aiGeneratedTasks,
          priorityDistribution,
          dailyCompletion,
          weeklyTrend,
        },
        timeRange,
        generatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Analytics error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

