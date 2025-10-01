/**
 * Payment Components
 * 
 * This module exports payment-related components that are not forms.
 * For payment forms, see @/components/forms
 */

export { default as PaymentDetails } from './PaymentDetails'
export { default as PaymentDetailsView } from './PaymentDetailsView'

// Export types for external use
export type { SellerPaymentDetails, PaymentDetailsFormData } from '@/types'
