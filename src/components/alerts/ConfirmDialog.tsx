'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'warning' | 'danger' | 'info'
  className?: string
}

const dialogStyles = {
  warning: {
    container: 'bg-amber-950/95 border-amber-500/50 text-amber-100',
    icon: 'text-amber-400',
    confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  danger: {
    container: 'bg-red-950/95 border-red-500/50 text-red-100',
    icon: 'text-red-400',
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
  },
  info: {
    container: 'bg-blue-950/95 border-blue-500/50 text-blue-100',
    icon: 'text-blue-400',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
  }
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning',
  className
}: ConfirmDialogProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const style = dialogStyles[type]

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleConfirm = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onConfirm()
    }, 150)
  }

  const handleCancel = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onCancel()
    }, 150)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleCancel}
      />
      
      {/* Dialog */}
      <div className={cn(
        'relative max-w-md w-full rounded-xl border backdrop-blur-sm shadow-2xl transition-all duration-300',
        isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4',
        style.container,
        className
      )}>
        {/* Decorative border gradient */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-transparent to-accent/20 p-[1px]">
          <div className={cn('h-full w-full rounded-xl', style.container.split(' ')[0])} />
        </div>
        
        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className={cn('h-6 w-6', style.icon)} />
              </div>
              <h3 className="text-lg font-semibold text-current">
                {title}
              </h3>
            </div>
            <button
              onClick={handleCancel}
              className={cn(
                'flex-shrink-0 p-1 rounded-full transition-all duration-200',
                'hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-primary/50',
                'text-current opacity-70 hover:opacity-100'
              )}
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message */}
          <div className="mb-6">
            {typeof message === 'string' ? (
              <p className="text-sm text-current/90 leading-relaxed">
                {message}
              </p>
            ) : (
              <div className="text-sm text-current/90 leading-relaxed">
                {message}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                'bg-transparent border border-current/30 text-current/80',
                'hover:bg-current/10 hover:text-current focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                style.confirmButton
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 