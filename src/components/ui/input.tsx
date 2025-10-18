import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string
    label?: string
    helperText?: string
    icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, label, helperText, icon, id, ...props }, ref) => {
        const inputId = id || React.useId()

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <motion.div
                            className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            {icon}
                        </motion.div>
                    )}
                    <motion.input
                        type={type}
                        id={inputId}
                        className={cn(
                            'flex h-10 w-full rounded-xl border border-gray-300 bg-white py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
                            icon ? 'pl-10 pr-3' : 'px-3',
                            error && 'border-red-300 focus:ring-red-500',
                            className
                        )}
                        ref={ref}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        )
    }
)
Input.displayName = 'Input'

export { Input }
