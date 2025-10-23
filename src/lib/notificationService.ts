// Notification Service for Task Updates and System Events

export interface Notification {
  id: string
  type: 'task' | 'system' | 'ai' | 'success' | 'warning' | 'error'
  title: string
  description: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
  icon?: string
  metadata?: any
}

class NotificationService {
  private static instance: NotificationService
  private listeners: Set<(notification: Notification) => void> = new Set()

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Subscribe to notifications
  subscribe(callback: (notification: Notification) => void) {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  // Send notification
  notify(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: Notification = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      read: false,
      ...notification,
    }

    // Broadcast to all listeners
    this.listeners.forEach((callback) => callback(fullNotification))

    // Store in localStorage for persistence
    this.storeNotification(fullNotification)

    return fullNotification
  }

  // Task-specific notifications
  notifyTaskCreated(taskTitle: string, aiGenerated: boolean = false) {
    return this.notify({
      type: aiGenerated ? 'ai' : 'task',
      title: aiGenerated ? '✨ AI Task Created' : '✓ Task Created',
      description: `New task: ${taskTitle}`,
      priority: 'medium',
      icon: aiGenerated ? '🤖' : '✓',
    })
  }

  notifyTaskCompleted(taskTitle: string) {
    return this.notify({
      type: 'success',
      title: '🎉 Task Completed',
      description: `Completed: ${taskTitle}`,
      priority: 'low',
      icon: '✓',
    })
  }

  notifyTaskUpdated(taskTitle: string) {
    return this.notify({
      type: 'task',
      title: '↻ Task Updated',
      description: `Updated: ${taskTitle}`,
      priority: 'low',
      icon: '↻',
    })
  }

  notifyTaskDeleted(taskTitle: string) {
    return this.notify({
      type: 'warning',
      title: '🗑️ Task Deleted',
      description: `Deleted: ${taskTitle}`,
      priority: 'low',
      icon: '🗑️',
    })
  }

  notifyAIAnalysis(tasksDetected: number) {
    return this.notify({
      type: 'ai',
      title: '🤖 AI Analysis Complete',
      description: `Detected ${tasksDetected} task${tasksDetected !== 1 ? 's' : ''} in your text`,
      priority: 'medium',
      icon: '✨',
    })
  }

  notifyKnowledgeBaseUpdate(documentTitle: string) {
    return this.notify({
      type: 'system',
      title: '📚 Knowledge Base Updated',
      description: `Added: ${documentTitle}`,
      priority: 'low',
      icon: '📚',
    })
  }

  // Store notification in localStorage
  private storeNotification(notification: Notification) {
    try {
      const stored = localStorage.getItem('notifications')
      const notifications: Notification[] = stored ? JSON.parse(stored) : []
      notifications.unshift(notification)
      
      // Keep only last 50 notifications
      const limited = notifications.slice(0, 50)
      localStorage.setItem('notifications', JSON.stringify(limited))
    } catch (error) {
      console.error('Failed to store notification:', error)
    }
  }

  // Get stored notifications
  getStoredNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem('notifications')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get notifications:', error)
      return []
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    try {
      const stored = localStorage.getItem('notifications')
      if (!stored) return

      const notifications: Notification[] = JSON.parse(stored)
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
      localStorage.setItem('notifications', JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Clear all notifications
  clearAll() {
    try {
      localStorage.removeItem('notifications')
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    }
  }
}

export const notificationService = NotificationService.getInstance()

