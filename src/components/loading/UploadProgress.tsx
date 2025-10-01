'use client'

import { Cloud, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadProgressProps {
  progress: number // 0-100
  text?: string
  fileName?: string
  className?: string
  showIcon?: boolean
}

export default function UploadProgress({
  progress,
  text = 'Uploading...',
  fileName,
  className,
  showIcon = true
}: UploadProgressProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  const isComplete = clampedProgress >= 100

  return (
    <div className={cn(
      'w-full p-6 bg-card/90 backdrop-blur-sm border border-border rounded-xl shadow-lg',
      'transition-all duration-300 ease-out',
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {showIcon && (
          <div className="relative">
            <div className={cn(
              'p-2 rounded-full transition-all duration-300',
              isComplete 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-primary/20 text-primary'
            )}>
              {isComplete ? (
                <Cloud className="h-5 w-5" />
              ) : (
                <Upload className={cn(
                  'h-5 w-5 transition-transform duration-1000',
                  progress > 0 ? 'animate-pulse' : ''
                )} />
              )}
            </div>
            {/* Decorative glow */}
            <div className={cn(
              'absolute inset-0 rounded-full blur-md transition-opacity duration-300',
              isComplete 
                ? 'bg-green-400/30 opacity-60' 
                : 'bg-primary/30 opacity-40'
            )} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground">
            {isComplete ? 'Upload Complete' : text}
          </h3>
          {fileName && (
            <p className="text-sm text-muted-foreground truncate">
              {fileName}
            </p>
          )}
        </div>
        
        <div className="text-right">
          <span className={cn(
            'text-lg font-bold',
            isComplete ? 'text-green-400' : 'text-primary'
          )}>
            {clampedProgress}%
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Background Track */}
        <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
          {/* Progress Fill */}
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              'bg-gradient-to-r shadow-sm',
              isComplete 
                ? 'from-green-400 to-green-500' 
                : 'from-primary to-accent'
            )}
            style={{ width: `${clampedProgress}%` }}
          />
          
          {/* Animated Shine Effect */}
          <div 
            className={cn(
              'absolute top-0 h-full w-full rounded-full',
              'bg-gradient-to-r from-transparent via-white/20 to-transparent',
              progress > 0 && progress < 100 ? 'animate-shimmer' : 'opacity-0'
            )}
          />
        </div>
        
        {/* Progress Segments (Luxury Touch) */}
        <div className="absolute inset-0 flex">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i}
              className="flex-1 border-r border-background/30 last:border-r-0"
              style={{ height: '12px' }}
            />
          ))}
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-4 text-center">
        <p className={cn(
          'text-sm transition-colors duration-300',
          isComplete 
            ? 'text-green-400 font-medium' 
            : 'text-muted-foreground'
        )}>
          {isComplete 
            ? '✨ Upload successful! Your gem is being processed.' 
            : 'Please wait while we upload your gem images...'
          }
        </p>
      </div>
    </div>
  )
} 