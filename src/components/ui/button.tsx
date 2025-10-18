import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
    {
        variants: {
            variant: {
                default: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-purple-800 focus-visible:ring-purple-500 transform hover:scale-105 active:scale-95',
                secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-md hover:shadow-lg hover:from-gray-200 hover:to-gray-300 focus-visible:ring-gray-500 transform hover:scale-105 active:scale-95',
                outline: 'border-2 border-gray-300 bg-white text-gray-700 shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:border-purple-400 focus-visible:ring-purple-500 transform hover:scale-105 active:scale-95',
                ghost: 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 focus-visible:ring-gray-500 transform hover:scale-105 active:scale-95',
                danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 focus-visible:ring-red-500 transform hover:scale-105 active:scale-95',
                success: 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 focus-visible:ring-green-500 transform hover:scale-105 active:scale-95',
            },
            size: {
                sm: 'h-8 px-3 text-xs',
                default: 'h-10 px-4 py-2',
                lg: 'h-12 px-6 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
        return (
            <motion.button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || loading}
                whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
                whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
                transition={{ duration: 0.2 }}
                {...props}
            >
                {/* Shimmer effect overlay */}
                <div className="absolute inset-0 -top-1 -left-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300" />

                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 scale-0 group-active:scale-100 transition-transform duration-150 ease-out" />
                </div>

                {loading && (
                    <motion.svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </motion.svg>
                )}
                <span className="relative z-10">{children}</span>
            </motion.button>
        )
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
