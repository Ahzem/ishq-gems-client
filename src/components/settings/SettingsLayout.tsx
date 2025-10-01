'use client'

import React, { useState, useEffect } from 'react'
import { Save, RefreshCw, AlertTriangle, CheckCircle, Settings, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import PageTitle from '@/components/dashboard/PageTitle'

interface SettingsLayoutProps {
  title: string
  description: string
  children: React.ReactNode
  onSave: () => Promise<void>
  onReset: () => void
  hasChanges: boolean
  hasErrors: boolean
  isSaving: boolean
  saveStatus?: 'idle' | 'saving' | 'success' | 'error'
  errorMessage?: string
  className?: string
}

export default function SettingsLayout({
  title,
  description,
  children,
  onSave,
  onReset,
  hasChanges,
  hasErrors,
  isSaving,
  saveStatus = 'idle',
  errorMessage,
  className
}: SettingsLayoutProps) {
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (saveStatus === 'success') {
      const timer = setTimeout(() => {
        // Reset save status would be handled by parent component
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  const handleSave = async () => {
    if (hasErrors) {
      setShowSaveConfirm(true)
      return
    }
    await onSave()
  }

  const confirmSave = async () => {
    setShowSaveConfirm(false)
    await onSave()
  }

  return (
    <>
      <PageTitle title={title} />
      
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  {title}
                  <Shield className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">{description}</p>
              </div>
            </div>
            
            {/* Status Indicators */}
            <div className="hidden sm:flex items-center gap-3">
              {hasChanges && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Unsaved Changes
                </div>
              )}
              
              {hasErrors && (
                <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Validation Errors
                </div>
              )}
              
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Settings Saved
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {children}
        </div>

        {/* Floating Action Bar */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-card border border-border/50 rounded-xl shadow-lg p-4 min-w-[360px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    You have unsaved changes
                  </span>
                </div>
                {hasErrors && (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={onReset}
                  disabled={isSaving}
                  className="flex-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  Reset
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50',
                    hasErrors
                      ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {hasErrors ? 'Save Anyway' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>

              {errorMessage && (
                <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Confirmation Modal */}
        {showSaveConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Save with Errors?</h3>
                  <p className="text-sm text-muted-foreground">
                    Some fields have validation errors. Save anyway?
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setShowSaveConfirm(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSave}
                  className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                >
                  Save Anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
