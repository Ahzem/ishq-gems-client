'use client'

import { Gem } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  variant?: 'default' | 'gem' | 'minimal'
  className?: string
}

const sizeClasses = {
  sm: {
    spinner: 'w-4 h-4',
    text: 'text-xs',
    container: 'gap-2'
  },
  md: {
    spinner: 'w-6 h-6', 
    text: 'text-sm',
    container: 'gap-3'
  },
  lg: {
    spinner: 'w-8 h-8',
    text: 'text-base', 
    container: 'gap-4'
  },
  xl: {
    spinner: 'w-12 h-12',
    text: 'text-lg',
    container: 'gap-4'
  }
}

export default function Spinner({
  size = 'md',
  text,
  variant = 'default',
  className
}: SpinnerProps) {
  const sizeClass = sizeClasses[size]

  if (variant === 'gem') {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center',
        sizeClass.container,
        className
      )}>
        <div className="relative">
          <Gem className={cn(
            sizeClass.spinner,
            'text-primary animate-spin',
            'drop-shadow-lg'
          )} />
          {/* Glow effect */}
          <div className={cn(
            'absolute inset-0 blur-sm',
            sizeClass.spinner,
            'animate-pulse'
          )}>
            <Gem className={cn(sizeClass.spinner, 'text-primary/50')} />
          </div>
        </div>
        {text && (
          <span className={cn(
            'font-medium text-foreground/80 animate-pulse',
            sizeClass.text
          )}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={cn(
        'flex items-center justify-center',
        sizeClass.container,
        className
      )}>
        <div className={cn(
          'border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin',
          sizeClass.spinner
        )} />
        {text && (
          <span className={cn(
            'font-medium text-muted-foreground',
            sizeClass.text
          )}>
            {text}
          </span>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-6 bg-card/80 backdrop-blur-sm rounded-xl border border-border shadow-lg',
      sizeClass.container,
      className
    )}>
      {/* Spinning Ring */}
      <div className="relative">
        <div className={cn(
          'border-4 border-muted/30 rounded-full animate-spin',
          sizeClass.spinner
        )}>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary border-r-accent rounded-full" />
        </div>
        
        {/* Inner glow */}
        <div className={cn(
          'absolute inset-2 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-sm',
          'animate-pulse'
        )} />
      </div>
      
      {text && (
        <div className="text-center mt-4">
          <p className={cn(
            'font-medium text-foreground',
            sizeClass.text
          )}>
            {text}
          </p>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 