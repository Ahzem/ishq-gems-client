'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AlertBoxProps {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  onClose?: () => void
  autoDismiss?: boolean
  duration?: number
  placement?: 'top' | 'inline'
  className?: string
}

const alertStyles = {
  success: {
    container: 'bg-green-950/90 border-green-500/50 text-green-100',
    icon: 'text-green-400',
    iconComponent: CheckCircle
  },
  error: {
    container: 'bg-red-950/90 border-red-500/50 text-red-100', 
    icon: 'text-red-400',
    iconComponent: XCircle
  },
  info: {
    container: 'bg-blue-950/90 border-blue-500/50 text-blue-100',
    icon: 'text-blue-400', 
    iconComponent: Info
  },
  warning: {
    container: 'bg-amber-950/90 border-amber-500/50 text-amber-100',
    icon: 'text-amber-400',
    iconComponent: AlertTriangle
  }
}

export default function AlertBox({
  type,
  message,
  onClose,
  autoDismiss = true,
  duration = 5000,
  placement = 'inline',
  className
}: AlertBoxProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  const style = alertStyles[type]
  const IconComponent = style.iconComponent

  const handleClose = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }, [onClose])

  useEffect(() => {
    if (autoDismiss && duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoDismiss, duration, handleClose])

  if (!isVisible) return null

  const baseClasses = cn(
    // Base styling
    'relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg',
    // Animation classes
    'transition-all duration-300 ease-out',
    isAnimating ? 'opacity-0 translate-y-[-10px] scale-95' : 'opacity-100 translate-y-0 scale-100',
    // Container styling
    style.container,
    // Placement specific
    placement === 'top' && 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 min-w-[300px] max-w-md',
    placement === 'inline' && 'w-full',
    className
  )

  return (
    <div className={baseClasses}>
      {/* Decorative border gradient */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-transparent to-accent/20 p-[1px]">
        <div className={cn('h-full w-full rounded-xl', style.container.split(' ')[0])} />
      </div>
      
      {/* Content */}
      <div className="relative flex items-start gap-3 w-full">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent className={cn('h-5 w-5', style.icon)} />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 p-1 rounded-full transition-all duration-200',
              'hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary/50',
              'text-current opacity-70 hover:opacity-100'
            )}
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Auto-dismiss progress bar */}
      {autoDismiss && duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-current/20 rounded-b-xl overflow-hidden">
          <div 
            className="h-full bg-current/60 transition-all ease-linear"
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  )
}

// CSS-in-JS for the shrink animation
const styles = `
  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = styles
  document.head.appendChild(styleElement)
} 