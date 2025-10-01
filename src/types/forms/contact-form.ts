/**
 * Contact form types and interfaces
 */

// ============================================================================
// Contact Form Types
// ============================================================================

export interface ContactFormData {
  fullName: string
  email: string
  phone: string
  message: string
}

export interface ContactFormErrors {
  fullName?: string
  email?: string
  message?: string
}

// ============================================================================
// Turnstile Widget Types
// ============================================================================

export interface TurnstileOptions {
  sitekey: string
  callback?: (token: string) => void
  'error-callback'?: (error: string) => void
  'expired-callback'?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact' | 'invisible'
  tabindex?: number
  'response-field'?: boolean
  'response-field-name'?: string
  retry?: 'auto' | 'never'
  'retry-interval'?: number
  'refresh-expired'?: 'auto' | 'manual' | 'never'
}

export interface TurnstileWidgetProps {
  siteKey: string
  onVerify: (token: string) => void
  onError?: (error: string) => void
  onExpired?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact' | 'invisible'
  className?: string
  id?: string
}

export interface TurnstileElement extends HTMLDivElement {
  turnstileReset: () => void
  turnstileGetResponse: () => string | null
}

export interface TurnstileWidgetRef {
  reset: () => void
  getResponse: () => string | null
}

// Extend Window interface for Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: TurnstileOptions) => string
      remove: (widgetId: string) => void
      reset: (widgetId: string) => void
      getResponse: (widgetId: string) => string
      ready: (callback: () => void) => void
    }
  }
}
