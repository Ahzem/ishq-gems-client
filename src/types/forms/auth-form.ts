/**
 * Authentication form types and interfaces
 */

// ============================================================================
// Sign In Form Types
// ============================================================================

export interface SignInFormData {
  email: string
  password: string
}

export interface SignInFormErrors {
  email?: string
  password?: string
  general?: string
}

// ============================================================================
// Sign Up Form Types
// ============================================================================

export interface SignUpFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  captchaToken: string
}

export interface SignUpFormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  phone?: string
  captchaToken?: string
  general?: string
}

// ============================================================================
// Form Button States
// ============================================================================

export interface FormButtonState {
  text: string
  disabled: boolean
}

// ============================================================================
// Form Layout Types
// ============================================================================

export interface FormLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  className?: string
}

export interface GemDisplayItem {
  name: string
  icon: any // eslint-disable-line @typescript-eslint/no-explicit-any
  color: string
}
