'use client'

import { useState, useEffect } from 'react'

interface ApiResponse<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface DashboardStats {
  stats: {
    insights: {
      messagesToday: number
      projectsActive: number
      teamMembers: number
      responseTime: number
    }
  }
}

interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  user: {
    name: string
    avatar?: string
  }
}

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
  userId?: string
  userName?: string
  userAvatar?: string
  sources?: Array<{ title: string; url: string }>
}

interface ChatSuggestion {
  id: string
  text: string
  category: string
}

// Generic API hook
function useApi<T>(url: string, options?: RequestInit): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get auth token from localStorage
        const token = localStorage.getItem('auth_token')
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(options?.headers as Record<string, string>),
        }
        
        // Add authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        const response = await fetch(url, {
          credentials: 'include',
          headers,
          ...options,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('API Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}

// Dashboard Stats Hook
export function useDashboardStats() {
  return useApi<DashboardStats>('/api/dashboard/stats')
}

// Activity Hook
export function useActivity() {
  return useApi<{ activities: Activity[] }>('/api/dashboard/activity')
}

// Notifications Hook
export function useNotifications() {
  return useApi<{ notifications: Notification[]; unreadCount: number }>('/api/notifications')
}

// Chat Messages Hook
export function useChatMessages() {
  return useApi<{ messages: ChatMessage[] }>('/api/chat/messages')
}

// Chat Suggestions Hook
export function useChatSuggestions() {
  return useApi<{ suggestions: ChatSuggestion[] }>('/api/chat/suggestions')
}

// User Profile Hook
export function useUserProfile() {
  return useApi<{ user: any }>('/api/users/profile')
}

// Generic mutation hook for POST/PUT/DELETE
export function useMutation<T, P = any>(
  url: string,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
  }
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (data?: P, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => {
    try {
      setLoading(true)
      setError(null)

      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      options?.onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      options?.onError?.(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}