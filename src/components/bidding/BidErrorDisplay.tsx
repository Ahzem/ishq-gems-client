'use client'

import { AlertCircle, RefreshCw, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BidError {
  type: 'validation' | 'network' | 'server' | 'permission' | 'auction' | 'unknown'
  message: string
  field?: string
  code?: string
  retryable?: boolean
}

interface BidErrorDisplayProps {
  error: BidError | null
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export default function BidErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className
}: BidErrorDisplayProps) {
  if (!error) return null

  const getErrorIcon = (type: BidError['type']) => {
    switch (type) {
      case 'validation':
        return <AlertCircle className="w-5 h-5 text-amber-600" />
      case 'network':
        return <RefreshCw className="w-5 h-5 text-blue-600" />
      case 'server':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'permission':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'auction':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getErrorStyles = (type: BidError['type']) => {
    switch (type) {
      case 'validation':
        return {
          container: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
          title: 'text-amber-800 dark:text-amber-200',
          message: 'text-amber-700 dark:text-amber-300',
          button: 'bg-amber-600 hover:bg-amber-700 text-white'
        }
      case 'network':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          title: 'text-blue-800 dark:text-blue-200',
          message: 'text-blue-700 dark:text-blue-300',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
      case 'server':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-700 dark:text-red-300',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        }
      case 'permission':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-700 dark:text-red-300',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        }
      case 'auction':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          title: 'text-blue-800 dark:text-blue-200',
          message: 'text-blue-700 dark:text-blue-300',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
      default:
        return {
          container: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
          title: 'text-gray-800 dark:text-gray-200',
          message: 'text-gray-700 dark:text-gray-300',
          button: 'bg-gray-600 hover:bg-gray-700 text-white'
        }
    }
  }

  const getErrorTitle = (type: BidError['type']) => {
    switch (type) {
      case 'validation':
        return 'Bid Validation Error'
      case 'network':
        return 'Connection Error'
      case 'server':
        return 'Server Error'
      case 'permission':
        return 'Permission Denied'
      case 'auction':
        return 'Auction Status Error'
      default:
        return 'Error'
    }
  }

  const styles = getErrorStyles(error.type)

  return (
    <div className={cn(
      'border rounded-xl p-4 transition-all duration-200',
      styles.container,
      className
    )}>
      <div className="flex items-start gap-3">
        {getErrorIcon(error.type)}
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-semibold text-sm', styles.title)}>
            {getErrorTitle(error.type)}
          </h4>
          <p className={cn('text-sm mt-1', styles.message)}>
            {error.message}
          </p>
          
          {/* Error Code */}
          {error.code && (
            <p className={cn('text-xs mt-1 opacity-75', styles.message)}>
              Error Code: {error.code}
            </p>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3">
            {error.retryable !== false && onRetry && (
              <button
                onClick={onRetry}
                className={cn(
                  'px-3 py-1 text-xs rounded-lg transition-colors',
                  styles.button
                )}
              >
                <RefreshCw className="w-3 h-3 inline mr-1" />
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility function to parse server errors into BidError format
export function parseBidError(error: unknown): BidError {
  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
      retryable: false
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        type: 'network',
        message: 'Network connection error. Please check your internet connection and try again.',
        retryable: true
      }
    }

    // Validation errors
    if (message.includes('reserve price') || message.includes('starting bid') || message.includes('higher than')) {
      return {
        type: 'validation',
        message: error.message,
        field: 'amount',
        retryable: false
      }
    }

    // Permission errors
    if (message.includes('cannot bid on your own') || message.includes('permission') || message.includes('unauthorized')) {
      return {
        type: 'permission',
        message: error.message,
        retryable: false
      }
    }

    // Auction status errors
    if (message.includes('auction has ended') || message.includes('auction has not started') || message.includes('finalized')) {
      return {
        type: 'auction',
        message: error.message,
        retryable: false
      }
    }

    // Server errors
    if (message.includes('server') || message.includes('internal') || message.includes('500')) {
      return {
        type: 'server',
        message: 'Server error occurred. Please try again later.',
        retryable: true
      }
    }

    return {
      type: 'unknown',
      message: error.message,
      retryable: false
    }
  }

  // Handle API response errors
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { response?: { data?: { message?: string } }; message?: string }
    
    if (errorObj.response?.data?.message) {
      return parseBidError(errorObj.response.data.message)
    }
    
    if (errorObj.message) {
      return parseBidError(errorObj.message)
    }
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred',
    retryable: false
  }
}
