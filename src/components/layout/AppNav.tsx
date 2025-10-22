'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    MessageSquare,
    FileText,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AppNavProps {
    className?: string
}

export const AppNav: React.FC<AppNavProps> = ({ className }) => {
    const router = useRouter()
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: MessageSquare },
        { name: 'Knowledge Base', href: '/knowledge-base', icon: FileText },
        { name: 'Profile', href: '/profile', icon: User },
    ]

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <nav className={cn('glass border-b border-purple-100', className)}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text hidden sm:block">AI Hub</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Button
                                    key={item.name}
                                    variant="ghost"
                                    onClick={() => router.push(item.href)}
                                    className={cn(
                                        'relative',
                                        isActive
                                            ? 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                                            : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                                    )}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                </Button>
                            )
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/50 border border-purple-100">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-purple-600 text-white font-semibold text-sm">
                                    {user?.name?.[0] || user?.email?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden lg:block">
                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-purple-100 bg-white/95 backdrop-blur-sm"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {/* User info */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 mb-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-purple-600 text-white font-semibold">
                                        {user?.name?.[0] || user?.email?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </div>

                            {/* Navigation items */}
                            {navigation.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                return (
                                    <Button
                                        key={item.name}
                                        variant="ghost"
                                        onClick={() => {
                                            router.push(item.href)
                                            setMobileMenuOpen(false)
                                        }}
                                        className={cn(
                                            'w-full justify-start',
                                            isActive
                                                ? 'text-purple-700 bg-purple-100'
                                                : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                                        )}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.name}
                                    </Button>
                                )
                            })}

                            {/* Logout */}
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="w-full justify-start text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

