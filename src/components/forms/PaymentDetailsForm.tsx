'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Building2, 
  User, 
  Hash, 
  MapPin, 
  FileText, 
  Save, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import type { 
  SellerPaymentMethod, 
  PaymentDetailsFormData, 
  PaymentDetailsFormErrors,
  PaymentDetailsFormProps,
  PaymentMethodOption
} from '@/types'

// PaymentDetailsFormProps is now imported from @/types

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    value: 'bank-transfer',
    label: 'Bank Transfer',
    description: 'Direct bank transfer to your account'
  }
  // Future payment methods can be added here
  // {
  //   value: 'paypal',
  //   label: 'PayPal',
  //   description: 'Receive payments via PayPal'
  // },
  // {
  //   value: 'wise',
  //   label: 'Wise (TransferWise)',
  //   description: 'International transfers via Wise'
  // }
]

export default function PaymentDetailsForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false
}: PaymentDetailsFormProps) {
  const [formData, setFormData] = useState<PaymentDetailsFormData>({
    paymentMethod: initialData?.paymentMethod || 'bank-transfer',
    bankName: initialData?.bankDetails?.bankName || '',
    accountHolderName: initialData?.bankDetails?.accountHolderName || '',
    accountNumber: initialData?.bankDetails?.accountNumber || '',
    iban: initialData?.bankDetails?.iban || '',
    swiftCode: initialData?.bankDetails?.swiftCode || '',
    bankBranch: initialData?.bankDetails?.bankBranch || '',
    additionalNotes: initialData?.bankDetails?.additionalNotes || ''
  })

  const [errors, setErrors] = useState<PaymentDetailsFormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Validate form when initial data changes
  useEffect(() => {
    if (initialData) {
      // Pre-validate fields that have initial data
      const fieldsToValidate: (keyof PaymentDetailsFormData)[] = [
        'paymentMethod', 'bankName', 'accountHolderName', 'accountNumber', 'swiftCode', 'bankBranch'
      ]
      
      const newErrors: PaymentDetailsFormErrors = {}
      fieldsToValidate.forEach(field => {
        const value = formData[field]
        if (value) {
          const error = validateField(field, value)
          if (error) {
            newErrors[field] = error
          }
        }
      })
      
      setErrors(newErrors)
    }
  }, [initialData, formData])

  // Validation functions
  const validateField = (name: keyof PaymentDetailsFormData, value: string): string | undefined => {
    switch (name) {
      case 'paymentMethod':
        return !value ? 'Payment method is required' : undefined
      
      case 'bankName':
        return !value.trim() ? 'Bank name is required' : undefined
      
      case 'accountHolderName':
        if (!value.trim()) return 'Account holder name is required'
        if (value.trim().length < 2) return 'Account holder name must be at least 2 characters'
        if (!/^[a-zA-Z\s\-'\.]+$/.test(value)) return 'Account holder name contains invalid characters'
        return undefined
      
      case 'accountNumber':
        if (!value.trim()) return 'Account number is required'
        if (!/^[0-9\-\s]+$/.test(value)) return 'Account number can only contain numbers, hyphens, and spaces'
        if (value.replace(/[\-\s]/g, '').length < 8) return 'Account number must be at least 8 digits'
        return undefined
      
      case 'swiftCode':
        if (!value.trim()) return 'SWIFT code is required'
        if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(value.toUpperCase())) {
          return 'Invalid SWIFT code format (e.g., HBUKGB4B)'
        }
        return undefined
      
      case 'bankBranch':
        return !value.trim() ? 'Bank branch is required' : undefined
      
      case 'iban':
        if (value.trim() && !/^[A-Z]{2}[0-9]{2}[A-Z0-9\s]{4,32}$/.test(value.replace(/\s/g, ''))) {
          return 'Invalid IBAN format'
        }
        return undefined
      
      default:
        return undefined
    }
  }

  const validateForm = (): boolean => {
    const newErrors: PaymentDetailsFormErrors = {}
    
    // Validate all required fields
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof PaymentDetailsFormData
      const error = validateField(fieldName, formData[fieldName])
      if (error) {
        newErrors[fieldName] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFieldChange = (field: keyof PaymentDetailsFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFieldBlur = (field: keyof PaymentDetailsFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    const error = validateField(field, formData[field])
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
    setTouched(allTouched)

    if (validateForm()) {
      await onSubmit(formData)
    }
  }

  const formatIBAN = (value: string) => {
    // Remove spaces and convert to uppercase
    const cleaned = value.replace(/\s/g, '').toUpperCase()
    // Add spaces every 4 characters
    return cleaned.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatAccountNumber = (value: string) => {
    // Remove non-numeric characters except hyphens and spaces
    return value.replace(/[^0-9\-\s]/g, '')
  }

  const formatSWIFT = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-2 sm:space-y-3">
        <label className="block text-sm font-medium text-foreground">
          Payment Method <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.value}
              className={`
                flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200
                ${formData.paymentMethod === method.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={formData.paymentMethod === method.value}
                onChange={(e) => handleFieldChange('paymentMethod', e.target.value as SellerPaymentMethod)}
                className="mt-0.5 sm:mt-1 w-4 h-4 text-primary border-border focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground text-sm sm:text-base">{method.label}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{method.description}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.paymentMethod && touched.paymentMethod && (
          <div className="flex items-center space-x-2 text-red-600 text-xs sm:text-sm">
            <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
            <span>{errors.paymentMethod}</span>
          </div>
        )}
        {!errors.paymentMethod && touched.paymentMethod && formData.paymentMethod && (
          <div className="flex items-center space-x-2 text-green-600 text-xs sm:text-sm">
            <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
            <span>Payment method selected</span>
          </div>
        )}
      </div>

      {/* Bank Transfer Details */}
      {formData.paymentMethod === 'bank-transfer' && (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-secondary/30 rounded-lg sm:rounded-xl border border-border/50">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <Building2 className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Bank Transfer Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Bank Name */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleFieldChange('bankName', e.target.value)}
                  onBlur={() => handleFieldBlur('bankName')}
                  placeholder="e.g., HSBC Bank"
                  className={`
                    w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-200 text-sm sm:text-base
                    ${errors.bankName && touched.bankName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                    }
                    bg-background focus:ring-4 focus:outline-none
                  `}
                />
              </div>
              {errors.bankName && touched.bankName && (
                <div className="flex items-center space-x-2 text-red-600 text-xs sm:text-sm">
                  <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span>{errors.bankName}</span>
                </div>
              )}
            </div>

            {/* Account Holder Name */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Account Holder Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => handleFieldChange('accountHolderName', e.target.value)}
                  onBlur={() => handleFieldBlur('accountHolderName')}
                  placeholder="Full name as on bank account"
                  className={`
                    w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-200 text-sm sm:text-base
                    ${errors.accountHolderName && touched.accountHolderName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                    }
                    bg-background focus:ring-4 focus:outline-none
                  `}
                />
              </div>
              {errors.accountHolderName && touched.accountHolderName && (
                <div className="flex items-center space-x-2 text-red-600 text-xs sm:text-sm">
                  <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="break-words">{errors.accountHolderName}</span>
                </div>
              )}
            </div>

            {/* Account Number */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Account Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleFieldChange('accountNumber', formatAccountNumber(e.target.value))}
                  onBlur={() => handleFieldBlur('accountNumber')}
                  placeholder="1234567890"
                  className={`
                    w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-200 text-sm sm:text-base
                    ${errors.accountNumber && touched.accountNumber
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                    }
                    bg-background focus:ring-4 focus:outline-none font-mono
                  `}
                />
              </div>
              {errors.accountNumber && touched.accountNumber && (
                <div className="flex items-center space-x-2 text-red-600 text-xs sm:text-sm">
                  <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="break-words">{errors.accountNumber}</span>
                </div>
              )}
            </div>

            {/* SWIFT Code */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-foreground">
                SWIFT Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.swiftCode}
                  onChange={(e) => handleFieldChange('swiftCode', formatSWIFT(e.target.value))}
                  onBlur={() => handleFieldBlur('swiftCode')}
                  placeholder="HBUKGB4B"
                  maxLength={11}
                  className={`
                    w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-200 text-sm sm:text-base
                    ${errors.swiftCode && touched.swiftCode
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                    }
                    bg-background focus:ring-4 focus:outline-none font-mono uppercase
                  `}
                />
              </div>
              {errors.swiftCode && touched.swiftCode && (
                <div className="flex items-center space-x-2 text-red-600 text-xs sm:text-sm">
                  <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="break-words">{errors.swiftCode}</span>
                </div>
              )}
            </div>

            {/* IBAN (Optional) */}
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-foreground">
                IBAN (Optional)
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => handleFieldChange('iban', formatIBAN(e.target.value))}
                  onBlur={() => handleFieldBlur('iban')}
                  placeholder="GB29 NWBK 6016 1331 9268 19"
                  maxLength={35}
                  className={`
                    w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-200 text-sm sm:text-base
                    ${errors.iban && touched.iban
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                    }
                    bg-background focus:ring-4 focus:outline-none font-mono uppercase
                  `}
                />
              </div>
              {errors.iban && touched.iban && (
                <div className="flex items-center space-x-2 text-red-600 text-xs sm:text-sm">
                  <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="break-words">{errors.iban}</span>
                </div>
              )}
            </div>

            {/* Bank Branch */}
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-foreground">
                Bank Branch <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.bankBranch}
                  onChange={(e) => handleFieldChange('bankBranch', e.target.value)}
                  onBlur={() => handleFieldBlur('bankBranch')}
                  placeholder="e.g., London Main Branch"
                  className={`
                    w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-200 text-sm sm:text-base
                    ${errors.bankBranch && touched.bankBranch
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                    }
                    bg-background focus:ring-4 focus:outline-none
                  `}
                />
              </div>
              {errors.bankBranch && touched.bankBranch && (
                <div className="flex items-center space-x-2 text-red-600 text-xs sm:text-sm">
                  <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="break-words">{errors.bankBranch}</span>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-foreground">
                Additional Notes (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 sm:top-3 w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground" />
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleFieldChange('additionalNotes', e.target.value)}
                  onBlur={() => handleFieldBlur('additionalNotes')}
                  placeholder="Any special instructions for transfers..."
                  rows={3}
                  className={`
                    w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-200 text-sm sm:text-base
                    ${errors.additionalNotes && touched.additionalNotes
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                    }
                    bg-background focus:ring-4 focus:outline-none resize-none
                  `}
                />
              </div>
              {errors.additionalNotes && touched.additionalNotes && (
                <div className="flex items-center space-x-2 text-red-600 text-xs sm:text-sm">
                  <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="break-words">{errors.additionalNotes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-border/30">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 text-foreground hover:text-muted-foreground transition-colors font-medium disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
        >
          <X className="w-3 sm:w-4 h-3 sm:h-4" />
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`
            flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-sm sm:text-base order-1 sm:order-2
            ${isLoading
              ? 'bg-primary/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25'
            }
            text-primary-foreground
          `}
        >
          {isLoading ? (
            <>
              <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">{isEditing ? 'Updating...' : 'Saving...'}</span>
              <span className="sm:hidden">{isEditing ? 'Updating' : 'Saving'}</span>
            </>
          ) : (
            <>
              <Save className="w-3 sm:w-4 h-3 sm:h-4" />
              <span className="hidden sm:inline">{isEditing ? 'Update Details' : 'Save Details'}</span>
              <span className="sm:hidden">{isEditing ? 'Update' : 'Save'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
