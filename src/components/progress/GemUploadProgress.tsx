'use client'

import { useState, useEffect } from 'react'
import { Check, Clock, AlertCircle, Sparkles, Package, FileText, Image as ImageIcon, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GemProgressStep {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export interface GemUploadProgressProps {
  jobId: string
  progress: number // 0-100
  status: 'pending' | 'processing' | 'completed' | 'failed'
  message: string
  steps: {
    validating: boolean
    creatingGem: boolean
    processingMedia: boolean
    finalizing: boolean
  }
  gemId?: string
  error?: string
  onComplete?: (gemId: string) => void
  onError?: (error: string) => void
  className?: string
}

const progressSteps: GemProgressStep[] = [
  {
    id: 'validating',
    label: 'Validating',
    description: 'Checking gem data integrity',
    icon: FileText
  },
  {
    id: 'creatingGem',
    label: 'Creating Record',
    description: 'Adding gem to database',
    icon: Package
  },
  {
    id: 'processingMedia',
    label: 'Processing Media',
    description: 'Optimizing images and videos',
    icon: ImageIcon
  },
  {
    id: 'finalizing',
    label: 'Finalizing',
    description: 'Completing gem listing',
    icon: Star
  }
]

export default function GemUploadProgress({
  jobId,
  progress,
  status,
  message,
  steps,
  gemId,
  error,
  onComplete,
  onError,
  className
}: GemUploadProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  // Handle completion
  useEffect(() => {
    if (status === 'completed' && gemId && onComplete) {
      onComplete(gemId)
    }
  }, [status, gemId, onComplete])

  // Handle errors
  useEffect(() => {
    if (status === 'failed' && error && onError) {
      onError(error)
    }
  }, [status, error, onError])

  const getStepStatus = (stepId: string): 'pending' | 'processing' | 'completed' => {
    if (status === 'failed') return 'pending'
    if (steps[stepId as keyof typeof steps]) return 'completed'
    
    // Check if this is the current step
    const stepIndex = progressSteps.findIndex(step => step.id === stepId)
    const currentStep = Object.entries(steps).findIndex(([, isCompleted]) => !isCompleted)
    
    if (stepIndex === currentStep && status === 'processing') return 'processing'
    if (stepIndex < currentStep) return 'completed'
    
    return 'pending'
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="w-6 h-6 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      case 'processing':
        return <Sparkles className="w-6 h-6 text-primary animate-pulse" />
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-green-600'
      case 'failed':
        return 'from-red-500 to-red-600'
      case 'processing':
        return 'from-primary to-accent'
      default:
        return 'from-yellow-500 to-yellow-600'
    }
  }

  return (
    <div className={cn(
      'bg-card border border-border rounded-xl p-6 shadow-lg',
      'transition-all duration-300 ease-out',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            {getStatusIcon()}
            {status === 'processing' && (
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {status === 'completed' ? 'Gem Created Successfully!' : 
               status === 'failed' ? 'Processing Failed' :
               status === 'processing' ? 'Processing Your Gem...' :
               'Gem Queued for Processing'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Job ID: {jobId}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={cn(
            'text-2xl font-bold',
            status === 'completed' ? 'text-green-500' :
            status === 'failed' ? 'text-red-500' :
            'text-primary'
          )}>
            {progress}%
          </div>
          <div className="text-xs text-muted-foreground">
            {status === 'completed' ? 'Complete' :
             status === 'failed' ? 'Failed' :
             status === 'processing' ? 'Processing' :
             'Queued'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium text-foreground">{message}</span>
        </div>
        
        <div className="relative h-3 bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-1000 ease-out',
              'bg-gradient-to-r shadow-sm',
              getStatusColor()
            )}
            style={{ width: `${animatedProgress}%` }}
          />
          
          {/* Animated shine effect */}
          {status === 'processing' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>

      {/* Processing Steps */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Processing Steps</h4>
        
        {progressSteps.map((step) => {
          const stepStatus = getStepStatus(step.id)
          const StepIcon = step.icon
          
          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-all duration-300',
                stepStatus === 'completed' && 'bg-green-50 dark:bg-green-900/20',
                stepStatus === 'processing' && 'bg-primary/10',
                stepStatus === 'pending' && 'bg-secondary/20'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full',
                stepStatus === 'completed' && 'bg-green-500 text-white',
                stepStatus === 'processing' && 'bg-primary text-primary-foreground animate-pulse',
                stepStatus === 'pending' && 'bg-secondary text-muted-foreground'
              )}>
                {stepStatus === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'font-medium text-sm',
                    stepStatus === 'completed' && 'text-green-700 dark:text-green-300',
                    stepStatus === 'processing' && 'text-primary',
                    stepStatus === 'pending' && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                  
                  {stepStatus === 'processing' && (
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Error Display */}
      {status === 'failed' && error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-800 dark:text-red-300">Processing Error</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success Actions */}
      {status === 'completed' && gemId && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.location.href = '/dashboard/listings'}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            View My Listings
          </button>
          <button
            onClick={() => window.location.href = `/gem/${gemId}`}
            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            View Gem Details
          </button>
        </div>
      )}
    </div>
  )
} 