import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    }

    return (
        <motion.div
            className={cn('relative', sizeClasses[size], className)}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
            <div className="absolute inset-0 border-2 border-purple-200 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-purple-600 rounded-full" />
        </motion.div>
    )
}

interface LoadingDotsProps {
    className?: string
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ className }) => {
    return (
        <div className={cn('flex space-x-1', className)}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-600 rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    )
}

interface LoadingSkeletonProps {
    className?: string
    lines?: number
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    className,
    lines = 1
}) => {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <motion.div
                    key={i}
                    className="h-4 bg-gray-200 rounded animate-pulse"
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                    }}
                />
            ))}
        </div>
    )
}
