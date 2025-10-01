'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, RefreshCw, FileText, Eye, Download, AlertCircle } from 'lucide-react'
import { Order } from '@/types/entities/order'
import orderService from '@/services/order.service'
import Image from 'next/image'

interface BankTransferVerificationProps {
  order: Order
  userRole: 'admin' | 'seller' | 'buyer' | string
  onVerificationComplete: () => void
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function BankTransferVerification({
  order,
  userRole,
  onVerificationComplete,
  onShowToast
}: BankTransferVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isRequestingReupload, setIsRequestingReupload] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showReuploadModal, setShowReuploadModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [reuploadNotes, setReuploadNotes] = useState('')
  const [showReceiptPreview, setShowReceiptPreview] = useState(false)

  // Only show for bank transfer orders
  if (order.paymentDetails.method !== 'bank-transfer') {
    return null
  }

  const isAdmin = userRole === 'admin'
  const paymentReceipt = (order as Order & { paymentReceipt?: { originalName?: string; uploadedAt: string; verifiedAt?: string; verificationNotes?: string; url: string } }).paymentReceipt
  const isVerified = order.paymentDetails.status === 'completed'
  const isRejected = order.paymentDetails.status === 'failed'
  const isPending = order.paymentDetails.status === 'pending' || order.paymentDetails.status === 'processing'

  const handleVerifyPayment = async () => {
    try {
      setIsVerifying(true)
      const response = await orderService.verifyBankTransferPayment(
        order.orderNumber,
        'Payment verified by admin'
      )
      
      if (response.success) {
        onShowToast('Payment verified successfully! Order is now ready to ship.', 'success')
        onVerificationComplete()
      } else {
        onShowToast(response.message || 'Failed to verify payment', 'error')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      onShowToast('Failed to verify payment. Please try again.', 'error')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleRejectPayment = async () => {
    if (!rejectionReason.trim()) {
      onShowToast('Please provide a rejection reason', 'error')
      return
    }

    try {
      setIsRejecting(true)
      const response = await orderService.rejectBankTransferPayment(
        order.orderNumber,
        rejectionReason
      )
      
      if (response.success) {
        onShowToast('Payment rejected. Customer will be notified to upload a new slip.', 'info')
        setShowRejectModal(false)
        setRejectionReason('')
        onVerificationComplete()
      } else {
        onShowToast(response.message || 'Failed to reject payment', 'error')
      }
    } catch (error) {
      console.error('Error rejecting payment:', error)
      onShowToast('Failed to reject payment. Please try again.', 'error')
    } finally {
      setIsRejecting(false)
    }
  }

  const handleRequestReupload = async () => {
    if (!reuploadNotes.trim()) {
      onShowToast('Please provide notes for the re-upload request', 'error')
      return
    }

    try {
      setIsRequestingReupload(true)
      const response = await orderService.requestPaymentReupload(
        order.orderNumber,
        reuploadNotes
      )
      
      if (response.success) {
        onShowToast('Re-upload request sent. Customer will be notified.', 'info')
        setShowReuploadModal(false)
        setReuploadNotes('')
        onVerificationComplete()
      } else {
        onShowToast(response.message || 'Failed to request re-upload', 'error')
      }
    } catch (error) {
      console.error('Error requesting re-upload:', error)
      onShowToast('Failed to request re-upload. Please try again.', 'error')
    } finally {
      setIsRequestingReupload(false)
    }
  }

  const isImageFile = (filename: string | undefined) => {
    if (!filename) return false
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
  }

  const isPDFFile = (filename: string | undefined) => {
    if (!filename) return false
    return /\.pdf$/i.test(filename)
  }

  const getStatusBadge = () => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="w-4 h-4" />
          Verified
        </span>
      )
    } else if (isRejected) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <XCircle className="w-4 h-4" />
          Rejected
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <AlertCircle className="w-4 h-4" />
          Pending Verification
        </span>
      )
    }
  }

  return (
    <>
      {/* Bank Transfer Verification Section */}
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Bank Transfer Verification
          </h2>
          {getStatusBadge()}
        </div>

        {paymentReceipt ? (
          <div className="space-y-6">
            {/* Receipt Info */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Uploaded File</p>
                  <p className="font-medium">{paymentReceipt.originalName || 'Unknown filename'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Upload Date</p>
                  <p className="font-medium">
                    {new Date(paymentReceipt.uploadedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {paymentReceipt.verifiedAt && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Verified Date</p>
                      <p className="font-medium">
                        {new Date(paymentReceipt.verifiedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Verification Notes</p>
                      <p className="font-medium">{paymentReceipt.verificationNotes || 'No notes provided'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="border border-border/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Payment Receipt</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReceiptPreview(!showReceiptPreview)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {showReceiptPreview ? 'Hide' : 'Preview'}
                  </button>
                  <a
                    href={paymentReceipt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>

              {showReceiptPreview && (
                <div className="mt-4">
                  {isImageFile(paymentReceipt.originalName) ? (
                    <div className="relative max-w-2xl mx-auto">
                      <div className="relative group">
                        <Image
                          src={paymentReceipt.url}
                          alt="Bank Transfer Receipt"
                          width={800}
                          height={600}
                          className="w-full h-auto rounded-lg border border-border/30 shadow-lg"
                          unoptimized
                        />
                        {/* Image overlay with full-screen option */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => window.open(paymentReceipt.url, '_blank')}
                            className="px-4 py-2 bg-black/70 text-white rounded-lg text-sm font-medium hover:bg-black/80 transition-colors"
                          >
                            View Full Size
                          </button>
                        </div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        Click image to view full size
                      </p>
                    </div>
                  ) : isPDFFile(paymentReceipt.originalName) ? (
                    <div className="space-y-4">
                      {/* PDF Embed Preview */}
                      <div className="bg-secondary/30 rounded-lg overflow-hidden border border-border/30">
                        <iframe
                          src={`${paymentReceipt.url}#view=FitH`}
                          className="w-full h-96 border-none"
                          title="Payment Receipt PDF Preview"
                          onError={() => {
                            // Fallback if iframe fails
                            console.log('PDF iframe failed to load')
                          }}
                        />
                      </div>
                      
                      {/* PDF Action Buttons */}
                      <div className="flex justify-center gap-3">
                        <a
                          href={paymentReceipt.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Open in New Tab
                        </a>
                        <a
                          href={paymentReceipt.url}
                          download={paymentReceipt.originalName || 'payment-receipt'}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </a>
                      </div>
                      
                      <p className="text-center text-sm text-muted-foreground">
                        If the preview doesn&apos;t load properly, use the buttons above to view or download the PDF.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-secondary/50 rounded-lg p-8 text-center">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-foreground mb-2">Unsupported File Type</h3>
                      <p className="text-muted-foreground mb-4">
                        Preview not available for this file type: {paymentReceipt.originalName?.split('.').pop()?.toUpperCase() || 'Unknown'}
                      </p>
                      <a
                        href={paymentReceipt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Actions */}
            {isAdmin && isPending && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleVerifyPayment}
                  disabled={isVerifying}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isVerifying ? 'Verifying...' : 'Verify Payment'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isRejecting}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg font-medium transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Payment
                </button>
                <button
                  onClick={() => setShowReuploadModal(true)}
                  disabled={isRequestingReupload}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Request Re-upload
                </button>
              </div>
            )}

            {/* Non-admin info */}
            {!isAdmin && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {isPending && 'Payment receipt is pending admin verification.'}
                  {isVerified && 'Payment has been verified by admin. Order is ready to ship.'}
                  {isRejected && 'Payment was rejected. Customer needs to upload a new receipt.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Receipt Uploaded</h3>
            <p className="text-muted-foreground mb-4">
              Customer has not uploaded their bank transfer receipt yet.
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowReuploadModal(true)}
                className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Request Receipt Upload
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-serif font-bold mb-4 text-foreground">Reject Payment</h3>
            <p className="text-muted-foreground mb-4">
              Please provide a reason for rejecting this payment. The customer will be notified.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full h-24 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground resize-none"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectPayment}
                disabled={isRejecting || !rejectionReason.trim()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg font-medium transition-colors"
              >
                {isRejecting ? 'Rejecting...' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-upload Modal */}
      {showReuploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-serif font-bold mb-4 text-foreground">Request Re-upload</h3>
            <p className="text-muted-foreground mb-4">
              Request the customer to upload a new receipt. Please provide specific instructions.
            </p>
            <textarea
              value={reuploadNotes}
              onChange={(e) => setReuploadNotes(e.target.value)}
              placeholder="Enter instructions for re-upload..."
              className="w-full h-24 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground resize-none"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReuploadModal(false)
                  setReuploadNotes('')
                }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestReupload}
                disabled={isRequestingReupload || !reuploadNotes.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors"
              >
                {isRequestingReupload ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
