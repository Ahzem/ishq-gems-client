'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Loader2,
  Shield,
  DollarSign
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ConfirmDialog } from '@/components/alerts'
import PaymentDetailsForm from '../forms/PaymentDetailsForm'
import PaymentDetailsView from './PaymentDetailsView'
import paymentService from '@/services/payment.service'
import { 
  SellerPaymentDetails as PaymentDetailsType, 
  PaymentDetailsFormData,
  CreatePaymentDetailsRequest,
  UpdatePaymentDetailsRequest 
} from '@/types'

// Toast notification component
const Toast = ({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: 'success' | 'error' | 'info'; 
  onClose: () => void 
}) => (
  <div className={`fixed top-4 right-4 z-[100] p-4 rounded-xl shadow-lg border transition-all duration-300 max-w-sm ${
    type === 'success' 
      ? 'bg-green-500/10 text-green-600 border-green-500/20' 
      : type === 'error'
      ? 'bg-red-500/10 text-red-600 border-red-500/20'
      : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  }`}>
    <div className="flex items-start gap-3">
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="text-current hover:opacity-70 transition-opacity"
      >
        ×
      </button>
    </div>
  </div>
)

export default function PaymentDetails() {
  const { user } = useAuth()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<PaymentDetailsFormData | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Fetch payment details
  const fetchPaymentDetails = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      // Use real API service
      const response = await paymentService.getPaymentDetails()
      
      if (response.success) {
        setPaymentDetails(response.data || null)
      } else {
        setToast({
          message: response.message || 'Failed to load payment details',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error fetching payment details:', error)
      setToast({
        message: 'Failed to load payment details',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPaymentDetails()
  }, [fetchPaymentDetails])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setPendingFormData(null)
  }

  const handleFormSubmit = async (formData: PaymentDetailsFormData) => {
    setPendingFormData(formData)
    setShowConfirmDialog(true)
  }

  const handleConfirmSave = async () => {
    if (!pendingFormData) return

    try {
      setIsSaving(true)
      setShowConfirmDialog(false)

      const requestData = {
        paymentMethod: pendingFormData.paymentMethod,
        bankDetails: {
          bankName: pendingFormData.bankName,
          accountHolderName: pendingFormData.accountHolderName,
          accountNumber: pendingFormData.accountNumber,
          iban: pendingFormData.iban,
          swiftCode: pendingFormData.swiftCode,
          bankBranch: pendingFormData.bankBranch,
          additionalNotes: pendingFormData.additionalNotes
        }
      }

      let response
      if (paymentDetails) {
        // Update existing payment details
        response = await paymentService.updatePaymentDetails(requestData as UpdatePaymentDetailsRequest)
      } else {
        // Create new payment details
        response = await paymentService.createPaymentDetails(requestData as CreatePaymentDetailsRequest)
      }

      if (response.success && response.data) {
        setPaymentDetails(response.data)
        setIsEditing(false)
        setPendingFormData(null)
        setToast({
          message: paymentDetails ? 'Payment details updated successfully' : 'Payment details saved successfully',
          type: 'success'
        })
      } else {
        setToast({
          message: response.message || 'Failed to save payment details',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error saving payment details:', error)
      setToast({
        message: 'Failed to save payment details',
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false)
    setPendingFormData(null)
  }

  const closeToast = () => {
    setToast(null)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                Payment Settings
                <DollarSign className="w-5 h-5 text-green-500" />
              </h1>
              <p className="text-muted-foreground">
                Manage your payment details for receiving <span className="font-semibold text-primary">Ishq Gems</span> revenue
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Secure</span>
          </div>
        </div>
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300">Revenue Transfers</h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              When buyers purchase your gems and confirm receipt, Ishq Gems will transfer your earnings to the account details provided here. 
              Ensure all information is accurate to avoid payment delays.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card border border-border/50 rounded-xl p-6">
        {!paymentDetails && !isEditing ? (
          /* No Payment Details - First Time Setup */
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Set Up Payment Details
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your payment information to receive revenue from gem sales. 
              Your details are encrypted and securely stored.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment Details</span>
            </button>
          </div>
        ) : isEditing ? (
          /* Edit/Create Form */
          <PaymentDetailsForm
            initialData={paymentDetails ? {
              paymentMethod: paymentDetails.paymentMethod,
              bankDetails: paymentDetails.bankDetails
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelEdit}
            isLoading={isSaving}
            isEditing={!!paymentDetails}
          />
        ) : paymentDetails ? (
          /* View Payment Details */
          <PaymentDetailsView
            paymentDetails={paymentDetails}
            onEdit={handleEdit}
            isLoading={isSaving}
          />
        ) : null}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onCancel={handleCancelConfirm}
          onConfirm={handleConfirmSave}
          title={paymentDetails ? "Update Payment Details" : "Save Payment Details"}
          message={
            paymentDetails 
              ? "Are you sure you want to update your payment details? This will affect how you receive future payments."
              : "Are you sure you want to save these payment details? Please verify all information is correct."
          }
          confirmText={paymentDetails ? "Update Details" : "Save Details"}
          cancelText="Cancel"
          type="warning"
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  )
}
