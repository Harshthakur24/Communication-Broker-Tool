'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
    id: string
    name: string
    email: string
    department?: string
    role: string
    isEmailVerified: boolean
    avatar?: string
    lastLogin?: string
    createdAt: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
    register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
    updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

interface RegisterData {
    name: string
    email: string
    password: string
    department?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            if (!token) {
                setUser(null)
                setLoading(false)
                return
            }

            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            } else {
                setUser(null)
                localStorage.removeItem('auth_token')
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            setUser(null)
            localStorage.removeItem('auth_token')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                setUser(data.user)
                // Store JWT token in localStorage
                if (data.token) {
                    localStorage.setItem('auth_token', data.token)
                }
                return { success: true }
            } else {
                return { success: false, error: data.error || 'Login failed' }
            }
        } catch (error) {
            return { success: false, error: 'Network error' }
        }
    }

    const logout = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setUser(null)
            localStorage.removeItem('auth_token')
        }
    }

    const register = async (data: RegisterData) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const responseData = await response.json()

            if (response.ok) {
                return { success: true }
            } else {
                return { success: false, error: responseData.error || 'Registration failed' }
            }
        } catch (error) {
            return { success: false, error: 'Network error' }
        }
    }

    const updateProfile = async (data: Partial<User>) => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            })

            const responseData = await response.json()

            if (response.ok) {
                setUser(responseData.user)
                return { success: true }
            } else {
                return { success: false, error: responseData.error || 'Update failed' }
            }
        } catch (error) {
            return { success: false, error: 'Network error' }
        }
    }

    const changePassword = async (currentPassword: string, newPassword: string) => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('/api/users/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            })

            const data = await response.json()

            if (response.ok) {
                return { success: true }
            } else {
                return { success: false, error: data.error || 'Password change failed' }
            }
        } catch (error) {
            return { success: false, error: 'Network error' }
        }
    }

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        register,
        updateProfile,
        changePassword,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
