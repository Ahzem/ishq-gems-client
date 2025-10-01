/**
 * Form types and interfaces
 */

// ============================================================================
// Generic Form Types
// ============================================================================

/**
 * Form field types
 */
export type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'file'

/**
 * Form field validation rules
 */
export interface FormFieldValidation {
  min?: number
  max?: number
  pattern?: string
  message?: string
}

/**
 * Form field option
 */
export interface FormFieldOption {
  value: string
  label: string
}

/**
 * Form field configuration
 */
export interface FormField {
  name: string
  label: string
  type: FormFieldType
  required: boolean
  placeholder?: string
  options?: FormFieldOption[]
  validation?: FormFieldValidation
}

/**
 * Form validation error
 */
export interface FormError {
  field: string
  message: string
}

/**
 * Form state interface
 */
export interface FormState<T = Record<string, unknown>> {
  values: T
  errors: FormError[]
  isSubmitting: boolean
  isValid: boolean
  touched: Record<string, boolean>
}

// ============================================================================
// Specific Form Type Exports
// ============================================================================

// Authentication forms
export * from './auth-form'

// Contact forms
export * from './contact-form'

// Gem forms
export * from './gem-form'

// Seller forms
export * from './seller-form'

// Re-export auth result types for form usage
export type { LoginResult, SignupResult } from '../auth' 