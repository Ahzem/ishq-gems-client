'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  className?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export default class BiddingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('BiddingErrorBoundary caught an error:', error, errorInfo)
    }

    // Update state with error info
    this.setState({ error, errorInfo })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReportingService.captureException(error, { extra: errorInfo })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className={cn(
          'min-h-[400px] flex items-center justify-center p-8',
          this.props.className
        )}>
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Bidding System Error
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Something went wrong with the bidding system. This might be a temporary issue.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Error Details:
                </h3>
                <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
                  {this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-red-700 dark:text-red-300 mt-1 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Additional Help */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                If this problem persists, please:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Check your internet connection</li>
                <li>• Refresh the page</li>
                <li>• Contact support if the issue continues</li>
              </ul>
            </div>

            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Bug className="w-3 h-3" />
                  <span>Development Mode - Error Boundary Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component wrapper for easier usage
export function withBiddingErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <BiddingErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </BiddingErrorBoundary>
  )

  WrappedComponent.displayName = `withBiddingErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for error boundary context (if needed)
export function useBiddingErrorBoundary() {
  return {
    // This could be extended to provide error boundary utilities
    reportError: (error: Error, context?: Record<string, unknown>) => {
      console.error('Bidding Error:', error, context)
      // In production, this could send to error reporting service
    }
  }
}
