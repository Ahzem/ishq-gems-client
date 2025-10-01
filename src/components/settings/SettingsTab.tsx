'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsTabProps {
  id: string
  label: string
  icon: LucideIcon
  description?: string
  isActive: boolean
  onClick: () => void
  hasChanges?: boolean
  hasErrors?: boolean
  disabled?: boolean
  className?: string
}

export default function SettingsTab({
  label,
  icon: Icon,
  description,
  isActive,
  onClick,
  hasChanges = false,
  hasErrors = false,
  disabled = false,
  className
}: SettingsTabProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/20',
        isActive
          ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground',
        hasErrors && !isActive && 'border-destructive/30 text-destructive hover:border-destructive/50',
        className
      )}
    >
      <div className="relative">
        <Icon className={cn(
          'h-4 w-4 transition-colors duration-200',
          isActive ? 'text-primary' : 'text-current'
        )} />
        
        {/* Change indicator */}
        {hasChanges && !hasErrors && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
        
        {/* Error indicator */}
        {hasErrors && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={cn(
            'font-medium transition-colors duration-200',
            isActive ? 'text-primary' : 'text-current'
          )}>
            {label}
          </span>
          
          {/* Status badges */}
          <div className="flex items-center space-x-1">
            {hasChanges && !hasErrors && (
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            )}
            {hasErrors && (
              <div className="w-1.5 h-1.5 bg-destructive rounded-full" />
            )}
          </div>
        </div>
        
        {description && (
          <p className={cn(
            'text-xs mt-1 transition-colors duration-200 truncate',
            isActive ? 'text-primary/70' : 'text-muted-foreground/70'
          )}>
            {description}
          </p>
        )}
      </div>
    </button>
  )
}
