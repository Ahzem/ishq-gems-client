'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  Building2, 
  User, 
  Hash, 
  MapPin, 
  FileText, 
  Edit3,
  Copy,
  CheckCircle,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react'
import { SellerPaymentDetails } from '@/types'

interface PaymentDetailsViewProps {
  paymentDetails: SellerPaymentDetails
  onEdit: () => void
  isLoading?: boolean
}

export default function PaymentDetailsView({
  paymentDetails,
  onEdit,
  isLoading = false
}: PaymentDetailsViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({
    accountNumber: false,
    iban: false,
    swiftCode: false
  })

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const toggleSensitiveField = (fieldName: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }))
  }

  const maskSensitiveData = (data: string, visibleChars: number = 4) => {
    if (!data) return ''
    if (data.length <= visibleChars) return data
    return data.slice(0, visibleChars) + '*'.repeat(Math.max(0, data.length - visibleChars))
  }

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'bank-transfer':
        return 'Bank Transfer'
      case 'paypal':
        return 'PayPal'
      case 'wise':
        return 'Wise (TransferWise)'
      default:
        return method
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className="p-2 hover:bg-secondary/50 rounded-lg transition-colors group"
      title={`Copy ${fieldName}`}
    >
      {copiedField === fieldName ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
      )}
    </button>
  )

  const SensitiveField = ({ 
    value, 
    fieldName, 
    label 
  }: { 
    value: string; 
    fieldName: string; 
    label: string 
  }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <span className="font-mono">
          {showSensitive[fieldName] ? value : maskSensitiveData(value)}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => toggleSensitiveField(fieldName)}
          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors group"
          title={showSensitive[fieldName] ? `Hide ${label}` : `Show ${label}`}
        >
          {showSensitive[fieldName] ? (
            <EyeOff className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          ) : (
            <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          )}
        </button>
        <CopyButton text={value} fieldName={fieldName} />
      </div>
    </div>
  )

  if (!paymentDetails.bankDetails) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Payment Details</h3>
        <p className="text-muted-foreground mb-4">
          No payment details found for this payment method.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Payment Details</h2>
            <p className="text-sm text-muted-foreground">
              Method: {formatPaymentMethod(paymentDetails.paymentMethod)}
            </p>
          </div>
        </div>
        <button
          onClick={onEdit}
          disabled={isLoading}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium
            ${isLoading
              ? 'bg-secondary/50 cursor-not-allowed text-muted-foreground'
              : 'bg-secondary hover:bg-secondary/80 text-foreground hover:text-primary'
            }
          `}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-300">Secure Information</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              Your payment details are encrypted and securely stored. Use the eye icon to reveal sensitive information and the copy button to copy details safely.
            </p>
          </div>
        </div>
      </div>

      {/* Bank Transfer Details */}
      {paymentDetails.paymentMethod === 'bank-transfer' && paymentDetails.bankDetails && (
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Bank Transfer Details</h3>
          </div>

          <div className="space-y-6">
            {/* Bank Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">Bank Name</label>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/30">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{paymentDetails.bankDetails.bankName}</span>
                </div>
                <CopyButton text={paymentDetails.bankDetails.bankName} fieldName="bankName" />
              </div>
            </div>

            {/* Account Holder Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">Account Holder Name</label>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/30">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{paymentDetails.bankDetails.accountHolderName}</span>
                </div>
                <CopyButton text={paymentDetails.bankDetails.accountHolderName} fieldName="accountHolderName" />
              </div>
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">Account Number</label>
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                <div className="flex items-center space-x-3">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <SensitiveField 
                    value={paymentDetails.bankDetails.accountNumber} 
                    fieldName="accountNumber" 
                    label="Account Number"
                  />
                </div>
              </div>
            </div>

            {/* SWIFT Code */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">SWIFT Code</label>
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                <div className="flex items-center space-x-3">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <SensitiveField 
                    value={paymentDetails.bankDetails.swiftCode} 
                    fieldName="swiftCode" 
                    label="SWIFT Code"
                  />
                </div>
              </div>
            </div>

            {/* IBAN (if provided) */}
            {paymentDetails.bankDetails.iban && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">IBAN</label>
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                  <div className="flex items-center space-x-3">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <SensitiveField 
                      value={paymentDetails.bankDetails.iban} 
                      fieldName="iban" 
                      label="IBAN"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bank Branch */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">Bank Branch</label>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/30">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{paymentDetails.bankDetails.bankBranch}</span>
                </div>
                <CopyButton text={paymentDetails.bankDetails.bankBranch} fieldName="bankBranch" />
              </div>
            </div>

            {/* Additional Notes (if provided) */}
            {paymentDetails.bankDetails.additionalNotes && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">Additional Notes</label>
                <div className="flex items-start justify-between p-3 bg-secondary/30 rounded-lg border border-border/30">
                  <div className="flex items-start space-x-3 flex-1">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-foreground">{paymentDetails.bankDetails.additionalNotes}</span>
                  </div>
                  <CopyButton text={paymentDetails.bankDetails.additionalNotes} fieldName="additionalNotes" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status and Timestamps */}
      <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Status:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              paymentDetails.isActive 
                ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                : 'bg-red-500/10 text-red-600 border border-red-500/20'
            }`}>
              {paymentDetails.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>
            <span className="ml-2 text-foreground">{formatDate(paymentDetails.createdAt)}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-muted-foreground">Last Updated:</span>
            <span className="ml-2 text-foreground">{formatDate(paymentDetails.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Copy Success Message */}
      {copiedField && (
        <div className="fixed bottom-4 right-4 bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-2 rounded-xl shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Copied to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  )
}
