export interface SellerPaymentDetails {
  id: string
  sellerId: string
  paymentMethod: SellerPaymentMethod
  bankDetails?: BankDetails
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BankDetails {
  bankName: string
  accountHolderName: string
  accountNumber: string
  iban?: string
  swiftCode: string
  bankBranch: string
  additionalNotes?: string
}

export type SellerPaymentMethod = 'bank-transfer' | 'paypal' | 'wise' // Extensible for future methods

export interface CreatePaymentDetailsRequest {
  paymentMethod: SellerPaymentMethod
  bankDetails?: BankDetails
}

export interface UpdatePaymentDetailsRequest {
  paymentMethod?: SellerPaymentMethod
  bankDetails?: BankDetails
  isActive?: boolean
}

export interface PaymentDetailsResponse {
  success: boolean
  data?: SellerPaymentDetails
  message?: string
}

// Form validation types
export interface PaymentDetailsFormData {
  paymentMethod: SellerPaymentMethod
  bankName: string
  accountHolderName: string
  accountNumber: string
  iban: string
  swiftCode: string
  bankBranch: string
  additionalNotes: string
}

export interface PaymentDetailsFormErrors {
  paymentMethod?: string
  bankName?: string
  accountHolderName?: string
  accountNumber?: string
  iban?: string
  swiftCode?: string
  bankBranch?: string
  additionalNotes?: string
}

/**
 * Payment service configuration interface
 */
export interface PaymentServiceConfig {
  baseUrl: string
  retryOptions: {
    maxRetries: number
    retryCondition: (error: unknown) => boolean
  }
  cacheOptions: {
    paymentDetailsTtl: number
  }
  validation: {
    maxBankNameLength: number
    maxAccountHolderNameLength: number
    maxAccountNumberLength: number
    maxIbanLength: number
    maxSwiftCodeLength: number
    maxBankBranchLength: number
    maxAdditionalNotesLength: number
  }
}

/**
 * Payment service state interface
 */
export interface PaymentServiceState {
  startTime: number
  lastError?: string
}