/**
 * Seller form types and interfaces
 */

import type { 
  SellerPaymentMethod, 
  PaymentDetailsFormData, 
  PaymentDetailsFormErrors, 
  BankDetails 
} from '../entities/payment'

// ============================================================================
// Seller Registration Form Types
// ============================================================================

export interface SellerFormData {
  // Personal Information
  fullName: string
  email: string
  phone: string
  nicNumber: string
  dateOfBirth: string
  
  // Business Details
  hasNGJALicense: boolean
  ngjaLicenseNumber: string
  yearsOfExperience: string
  gemstoneTypes: string[]
  
  // Documents
  nicFront: File | null
  nicBack: File | null
  ngjaLicense: File | null
  sampleCertificate: File | null
  
  // Additional
  whyJoin: string
  preferredLanguage: string
  confirmAccuracy: boolean
}

export interface SellerFormErrors {
  [key: string]: string
}

export interface SellerFormProps {
  mode?: 'new' | 'buyer-upgrade'
  existingEmail?: string
  existingFullName?: string
}

// ============================================================================
// Payment Details Form Types (Re-exported from entities)
// ============================================================================

export type { 
  SellerPaymentMethod, 
  PaymentDetailsFormData, 
  PaymentDetailsFormErrors, 
  BankDetails 
}

export interface PaymentDetailsFormProps {
  initialData?: {
    paymentMethod: SellerPaymentMethod
    bankDetails?: BankDetails
  }
  onSubmit: (data: PaymentDetailsFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  isEditing?: boolean
}

export interface PaymentMethodOption {
  value: SellerPaymentMethod
  label: string
  description: string
}
