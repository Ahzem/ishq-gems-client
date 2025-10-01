'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
  isVisible?: boolean
}

const toastStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
    icon: CheckCircle,
    iconColor: 'text-green-500 dark:text-green-400'
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
    icon: AlertCircle,
    iconColor: 'text-red-500 dark:text-red-400'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
    icon: Info,
    iconColor: 'text-blue-500 dark:text-blue-400'
  }
}

export default function Toast({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  isVisible = true
}: ToastProps) {
  const [show, setShow] = useState(isVisible)

  const style = toastStyles[type]
  const Icon = style.icon

  useEffect(() => {
    setShow(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  const handleClose = () => {
    setShow(false)
    onClose?.()
  }

  if (!show) return null

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 min-w-80 max-w-md border rounded-lg shadow-lg p-4 transition-all duration-300',
      'animate-in slide-in-from-top-2 fade-in',
      style.container
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', style.iconColor)} />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast context and hook for global usage
import { createContext, useContext, ReactNode } from 'react'

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
} 