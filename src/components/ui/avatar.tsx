import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string
    alt?: string
    fallback?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
        const [imageError, setImageError] = React.useState(false)

        const handleImageError = () => {
            setImageError(true)
        }

        const displayFallback = !src || imageError
        const initials = fallback
            ? fallback
                .split(' ')
                .map((name) => name[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : '?'

        return (
            <div
                ref={ref}
                className={cn(
                    'relative flex shrink-0 overflow-hidden rounded-full bg-purple-100',
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {!displayFallback && (
                    <img
                        src={src}
                        alt={alt}
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                    />
                )}
                {displayFallback && (
                    <div className="flex h-full w-full items-center justify-center bg-purple-600 text-white font-medium">
                        {initials}
                    </div>
                )}
            </div>
        )
    }
)
Avatar.displayName = 'Avatar'

export { Avatar }
