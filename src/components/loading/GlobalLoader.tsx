'use client'

import { Gem } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export interface GlobalLoaderProps {
  isVisible: boolean
  message?: string
  progress?: number // 0-100
  subMessage?: string
  onCancel?: () => void
  className?: string
}

export default function GlobalLoader({
  isVisible,
  message = 'Loading...',
  progress,
  subMessage,
  onCancel,
  className
}: GlobalLoaderProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onCancel?.()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-300',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
      />
      
      {/* Loading Content */}
      <div className={cn(
        'relative z-10 flex flex-col items-center justify-center p-8 rounded-2xl',
        'bg-card/95 backdrop-blur-sm border border-border shadow-2xl',
        'transition-all duration-300 ease-out',
        isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4',
        className
      )}>
        {/* Decorative border gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-accent/20 p-[1px]">
          <div className="h-full w-full rounded-2xl bg-card" />
        </div>
        
        {/* Content */}
        <div className="relative flex flex-col items-center space-y-6 min-w-80">
          {/* Animated Gem Icon */}
          <div className="relative">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <Gem className="h-8 w-8 text-primary animate-spin" />
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg animate-pulse" />
            
            {/* Floating particles */}
            <div className="absolute -top-2 -right-2 w-2 h-2 bg-accent rounded-full animate-sparkle-1" />
            <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-primary rounded-full animate-sparkle-2" />
            <div className="absolute top-1/2 -left-4 w-1 h-1 bg-accent rounded-full animate-sparkle-3" />
            <div className="absolute top-1/2 -right-4 w-1 h-1 bg-primary rounded-full animate-sparkle-4" />
          </div>
          
          {/* Message */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-serif font-semibold text-foreground">
              {message}
            </h3>
            {subMessage && (
              <p className="text-sm text-muted-foreground">
                {subMessage}
              </p>
            )}
          </div>
          
          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                />
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          )}
          
          {/* Animated dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
          </div>
          
          {/* Cancel button */}
          {onCancel && (
            <button
              onClick={handleClose}
              className={cn(
                'px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground',
                'border border-border hover:border-primary/50',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 