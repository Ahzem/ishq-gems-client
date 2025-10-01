/**
 * Component types and interfaces
 */

import { ReactNode } from 'react'

// Export component-specific types
export * from './gems'
export * from './auth'
export * from './notifications'

/**
 * SEO props interface
 */
export interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  keywords?: string
}

/**
 * Modal props interface
 */
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/**
 * Pagination props interface
 */
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
}

/**
 * Navigation item interface
 */
export interface NavigationItem {
  href: string
  label: string
  requiresAuth: boolean
  icon?: string
}

/**
 * Alert/Toast types
 */
export type AlertType = 'success' | 'error' | 'info' | 'warning'

/**
 * Alert placement options
 */
export type AlertPlacement = 'top' | 'inline'

/**
 * Alert configuration
 */
export interface AlertConfig {
  type: AlertType
  message: string
  title?: string
  duration?: number
  placement?: AlertPlacement
}

/**
 * Toast configuration
 */
export interface ToastConfig {
  type: AlertType
  message: string
  title?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Confirm dialog configuration
 */
export interface ConfirmConfig {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'danger' | 'primary' | 'success'
}

/**
 * Loader configuration
 */
export interface LoaderConfig {
  message?: string
  progress?: number
  isIndeterminate?: boolean
}


/**
 * Invoice types
 */
export * from './invoice.types'

/**
 * UI Context type
 */
export interface UIContextType {
  showAlert: (config: AlertConfig) => void
  showConfirm: (config: ConfirmConfig) => Promise<boolean>
  showLoader: (config?: LoaderConfig) => void
  hideLoader: () => void
  updateLoader: (config: Partial<LoaderConfig>) => void
  showToast: (config: ToastConfig) => void
  clearAll: () => void
} 