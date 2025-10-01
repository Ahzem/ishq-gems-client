'use client'

import { useState, useEffect, useCallback } from 'react'
import { Building2, Copy, Check, CreditCard, Wallet, Upload, FileText, AlertCircle } from 'lucide-react'
import {checkoutService }from '@/services/checkout.service'
import { useUI } from '@/components/providers/UIProvider'

interface BankDetails {
  bankName: string
  accountName: string
  accountNumber: string
  swiftCode: string
  branch: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  available: boolean
  comingSoon?: boolean
}

interface PaymentMethodsProps {
  selectedMethod: string
  onMethodSelect: (method: string) => void
  paymentReceipt?: File | null
  onReceiptUpload?: (file: File | null) => void
  totalAmount?: number
  shippingFee?: number
  taxes?: number
}

export default function PaymentMethods({ selectedMethod, onMethodSelect, paymentReceipt, onReceiptUpload, totalAmount = 0, shippingFee = 0, taxes = 0 }: PaymentMethodsProps) {
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { showToast } = useUI()

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      icon: <Building2 className="w-6 h-6" />,
      description: 'Transfer to our bank account and upload receipt for verification',
      available: true
    },
    {
      id: 'credit-card',
      name: 'Credit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa, Mastercard, American Express',
      available: false,
      comingSoon: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Pay securely with your PayPal account',
      available: false,
      comingSoon: true
    }
  ]

  const fetchBankDetails = useCallback(async () => {
    try {
      const response = await checkoutService.getBankDetails()
      if (response.success) {
        setBankDetails(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch bank details:', error)
      showToast({ message: 'Failed to load payment details', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchBankDetails()
  }, [fetchBankDetails])

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      showToast({ message: `${fieldName} copied to clipboard`, type: 'success' })
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Clipboard copy failed:', error)
      showToast({ message: 'Failed to copy to clipboard', type: 'error' })
    }
  }

  const BankDetailRow = ({ label, value, fieldKey }: { label: string, value: string, fieldKey: string }) => (
    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-border/30 last:border-b-0 gap-3" data-field={fieldKey}>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-foreground font-mono text-xs sm:text-sm mt-1 break-all" id={`bank-${fieldKey}`}>{value}</p>
      </div>
      <button
        onClick={() => copyToClipboard(value, label)}
        className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        title={`Copy ${label}`}
        aria-describedby={`bank-${fieldKey}`}
        data-testid={`copy-${fieldKey}`}
      >
        {copiedField === label ? (
          <Check className="w-3 sm:w-4 h-3 sm:h-4 text-green-500" />
        ) : (
          <Copy className="w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground" />
        )}
      </button>
    </div>
  )

  return (
    <div className="bg-card rounded-lg sm:rounded-xl border border-border/30 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-serif font-semibold text-foreground mb-4 sm:mb-6">Payment Method</h2>
      
      {/* Payment Method Selection */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {paymentMethods.map((method) => (
          <div key={method.id} className="relative">
            <button
              onClick={() => method.available && onMethodSelect(method.id)}
              disabled={!method.available}
              className={`
                w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left
                ${method.available 
                  ? selectedMethod === method.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/30 hover:border-primary/30 hover:bg-secondary/30'
                  : 'border-border/20 bg-muted/30 cursor-not-allowed opacity-60'
                }
              `}
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className={`
                  p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0
                  ${method.available
                    ? selectedMethod === method.id 
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                    : 'bg-muted text-muted-foreground/50'
                  }
                `}>
                  <div className="w-5 sm:w-6 h-5 sm:h-6">{method.icon}</div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">{method.name}</h3>
                    {method.comingSoon && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-accent/20 text-accent rounded-full font-medium flex-shrink-0">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{method.description}</p>
                </div>
                
                {method.available && (
                  <div className={`
                    w-4 sm:w-5 h-4 sm:h-5 rounded-full border-2 transition-all duration-200 flex-shrink-0
                    ${selectedMethod === method.id
                      ? 'border-primary bg-primary'
                      : 'border-border'
                    }
                  `}>
                    {selectedMethod === method.id && (
                      <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Bank Transfer Details */}
      {selectedMethod === 'bank-transfer' && (
        <div className="border-t border-border/30 pt-4 sm:pt-6">
          <div className="bg-secondary/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-accent/20 rounded-lg flex-shrink-0">
                <Building2 className="w-4 sm:w-5 h-4 sm:h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm sm:text-base">Bank Transfer Instructions</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Transfer the exact amount to our bank account below. After payment, please upload your transfer receipt.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-secondary/50 rounded w-1/3 mb-2"></div>
                  <div className="h-6 bg-secondary/30 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : bankDetails ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-background/50 rounded-lg sm:rounded-xl border border-border/30 p-3 sm:p-4">
                <h4 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center space-x-2 text-sm sm:text-base">
                  <Building2 className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                  <span>Bank Account Details</span>
                </h4>
                
                <div className="space-y-0">
                  <BankDetailRow 
                    label="Bank Name" 
                    value={bankDetails.bankName} 
                    fieldKey="bankName"
                  />
                  <BankDetailRow 
                    label="Account Name" 
                    value={bankDetails.accountName} 
                    fieldKey="accountName"
                  />
                  <BankDetailRow 
                    label="Account Number" 
                    value={bankDetails.accountNumber} 
                    fieldKey="accountNumber"
                  />
                  <BankDetailRow 
                    label="SWIFT Code" 
                    value={bankDetails.swiftCode} 
                    fieldKey="swiftCode"
                  />
                  <BankDetailRow 
                    label="Branch" 
                    value={bankDetails.branch} 
                    fieldKey="branch"
                  />
                </div>
              </div>

              {/* Payment Receipt Upload */}
              <div className="bg-amber-50/30 dark:bg-amber-950/20 rounded-lg sm:rounded-xl border border-amber-200 dark:border-amber-900/30 p-3 sm:p-4">
                <h4 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center space-x-2 text-sm sm:text-base">
                  <Upload className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600" />
                  <span>Upload Payment Receipt</span>
                  <span className="text-red-500 text-xs sm:text-sm">*</span>
                </h4>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-2 sm:p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">Important Payment Instructions:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Transfer the exact amount: <strong>${((totalAmount + shippingFee + taxes) || 0).toFixed(2)}</strong></li>
                          <li>• Upload your bank transfer receipt or screenshot</li>
                          <li>• We&apos;ll verify your payment within 2-4 hours</li>
                          <li>• Your money is held in escrow until you receive the product</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className={`border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center transition-all duration-300 hover:border-primary/50 ${
                    paymentReceipt ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' : 'border-border'
                  }`}>
                    <div className="space-y-2 sm:space-y-3">
                      {paymentReceipt ? (
                        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                          <FileText className="w-6 sm:w-8 h-6 sm:h-8 text-green-600 flex-shrink-0" />
                          <div className="text-left min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200 truncate">
                              {paymentReceipt.name}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {(paymentReceipt.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <Upload className="w-6 sm:w-8 h-6 sm:h-8 mx-auto text-muted-foreground" />
                      )}
                      
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
                          {paymentReceipt ? 'Receipt Uploaded Successfully' : 'Upload Payment Receipt'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {paymentReceipt ? 'Click to change file' : 'PNG, JPG, PDF up to 5MB'}
                        </p>
                      </div>
                      
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => onReceiptUpload?.(e.target.files?.[0] || null)}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer text-xs sm:text-sm"
                      >
                        <Upload className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                        {paymentReceipt ? 'Change Receipt' : 'Choose File'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <p className="text-muted-foreground text-sm sm:text-base">Failed to load bank details. Please try again.</p>
              <button 
                onClick={fetchBankDetails}
                className="mt-2 text-primary hover:text-primary/80 transition-colors text-sm sm:text-base"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
