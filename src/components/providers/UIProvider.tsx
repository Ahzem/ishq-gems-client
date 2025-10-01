'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import AlertBox from '@/components/alerts/AlertBox'
import ConfirmDialog from '@/components/alerts/ConfirmDialog'
import GlobalLoader from '@/components/loading/GlobalLoader'
import Toast from '@/components/alerts/Toast'

// Types for the UI context
interface AlertConfig {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  title?: string
  duration?: number
  placement?: 'top' | 'inline'
}

interface ConfirmConfig {
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
}

interface LoaderConfig {
  message?: string
  progress?: number
  subMessage?: string
  onCancel?: () => void
}

interface ToastConfig {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

interface UIContextType {
  // Alert methods
  showAlert: (config: AlertConfig) => void
  
  // Confirm methods
  showConfirm: (config: ConfirmConfig) => Promise<boolean>
  
  // Loader methods
  showLoader: (config?: LoaderConfig) => void
  hideLoader: () => void
  updateLoader: (config: Partial<LoaderConfig>) => void
  
  // Toast methods
  showToast: (config: ToastConfig) => void
  
  // Utility methods
  clearAll: () => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

interface UIProviderProps {
  children: ReactNode
}

export default function UIProvider({ children }: UIProviderProps) {
  // Alert state
  const [alerts, setAlerts] = useState<Array<{ id: string; config: AlertConfig }>>([])
  
  // Confirm state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    config: ConfirmConfig
    resolve: (value: boolean) => void
  } | null>(null)
  
  // Loader state
  const [loaderState, setLoaderState] = useState<{
    isVisible: boolean
    config: LoaderConfig
  }>({
    isVisible: false,
    config: {}
  })
  
  // Toast state
  const [toasts, setToasts] = useState<Array<{ id: string; config: ToastConfig }>>([])

  // Alert methods
  const showAlert = useCallback((config: AlertConfig) => {
    const id = Math.random().toString(36).substring(7)
    setAlerts(prev => [...prev, { id, config }])
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  // Confirm methods
  const showConfirm = useCallback((config: ConfirmConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        config,
        resolve
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (confirmState) {
      confirmState.resolve(true)
      setConfirmState(null)
    }
  }, [confirmState])

  const handleCancel = useCallback(() => {
    if (confirmState) {
      confirmState.resolve(false)
      setConfirmState(null)
    }
  }, [confirmState])

  // Loader methods
  const showLoader = useCallback((config: LoaderConfig = {}) => {
    setLoaderState({
      isVisible: true,
      config
    })
  }, [])

  const hideLoader = useCallback(() => {
    setLoaderState(prev => ({
      ...prev,
      isVisible: false
    }))
  }, [])

  const updateLoader = useCallback((config: Partial<LoaderConfig>) => {
    setLoaderState(prev => ({
      ...prev,
      config: { ...prev.config, ...config }
    }))
  }, [])

  // Toast methods
  const showToast = useCallback((config: ToastConfig) => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, config }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Utility methods
  const clearAll = useCallback(() => {
    setAlerts([])
    setToasts([])
    setConfirmState(null)
    hideLoader()
  }, [hideLoader])

  const value: UIContextType = {
    showAlert,
    showConfirm,
    showLoader,
    hideLoader,
    updateLoader,
    showToast,
    clearAll
  }

  return (
    <UIContext.Provider value={value}>
      {children}
      
      {/* Render all alerts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {alerts.map(({ id, config }) => (
          <AlertBox
            key={id}
            {...config}
            placement="top"
            onClose={() => removeAlert(id)}
          />
        ))}
      </div>
      
      {/* Render confirm dialog */}
      {confirmState && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          {...confirmState.config}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      
      {/* Render global loader */}
      <GlobalLoader
        isVisible={loaderState.isVisible}
        {...loaderState.config}
      />
      
      {/* Render all toasts */}
      <div className="fixed top-4 left-4 z-50 space-y-2">
        {toasts.map(({ id, config }) => (
          <Toast
            key={id}
            {...config}
            onClose={() => removeToast(id)}
          />
        ))}
      </div>
    </UIContext.Provider>
  )
}

// Custom hook to use the UI context
export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}

// Convenience hooks for individual components
export function useAlert() {
  const { showAlert } = useUI()
  return showAlert
}

export function useConfirm() {
  const { showConfirm } = useUI()
  return showConfirm
}

export function useLoader() {
  const { showLoader, hideLoader, updateLoader } = useUI()
  return { showLoader, hideLoader, updateLoader }
}

export function useToast() {
  const { showToast } = useUI()
  return showToast
} 