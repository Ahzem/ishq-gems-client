'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  FileText, 
  Award, 
  Globe, 
  CheckCircle, 
  Clock, 
  XCircle,
  VideoIcon,
  Send,
  UserCheck
} from 'lucide-react'
import Spinner from '@/components/loading/Spinner'
import { AlertBox, ConfirmDialog } from '@/components/alerts'
import { useAuth } from '@/features/auth/hooks/useAuth'
import S3Image from '@/components/common/S3Image'
import PageTitle from '@/components/dashboard/PageTitle'
import adminService from '@/services/admin.service'
import type { AdminSellerApplication } from '@/types'

const statusConfig = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
  },
  verified: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  }
}

export default function SellerDetailPage() {
  const params = useParams()
  const sellerId = params.id as string
  const { isAuthenticated } = useAuth()

  const [application, setApplication] = useState<AdminSellerApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [actionLoading, setActionLoading] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  
  // Alert and confirmation states
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning'>('info')
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [showVideoCallConfirm, setShowVideoCallConfirm] = useState(false)
  const [showSendMeetConfirm, setShowSendMeetConfirm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectReasonInput, setShowRejectReasonInput] = useState(false)

  useEffect(() => {
    if (sellerId && isAuthenticated) {
      fetchApplication()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, isAuthenticated])

  const showAlertMessage = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setAlertType(type)
    setAlertMessage(message)
    setShowAlert(true)
  }

  const fetchApplication = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await adminService.getSellerApplication(sellerId)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch application')
      }

      setApplication(response.data)
    } catch (error) {
      console.error('Error fetching application:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load application'
      setError(errorMessage)
      showAlertMessage('error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMeetLinkClick = () => {
    setShowSendMeetConfirm(true)
  }

  const confirmSendMeetLink = async () => {
    try {
      setShowSendMeetConfirm(false)
      setActionLoading('meeting')
      
      const response = await adminService.sendMeetLink(sellerId)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to send meet link')
      }
      
      showAlertMessage('success', 'Google Meet link sent successfully!')
      setSuccessMessage('Google Meet link sent successfully!')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Error sending meet link:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send meet link'
      showAlertMessage('error', errorMessage)
      setError(errorMessage)
    } finally {
      setActionLoading('')
    }
  }

  const cancelSendMeetLink = () => {
    setShowSendMeetConfirm(false)
  }

  const handleVerifyVideoCallClick = () => {
    setShowVideoCallConfirm(true)
  }

  const confirmVerifyVideoCall = async () => {
    try {
      setShowVideoCallConfirm(false)
      setActionLoading('video-call')

      const response = await adminService.verifyVideoCall(sellerId)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to verify video call')
      }
      
      await fetchApplication() // Refresh data
      showAlertMessage('success', 'Video call verified successfully!')
      setSuccessMessage('Video call verified successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error verifying video call:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify video call'
      showAlertMessage('error', errorMessage)
      setError(errorMessage)
    } finally {
      setActionLoading('')
    }
  }

  const cancelVerifyVideoCall = () => {
    setShowVideoCallConfirm(false)
  }

  const handleApproveSellerClick = () => {
    if (!application?.videoCallVerified) {
      showAlertMessage('warning', 'Please verify the video call before approving the seller.')
      return
    }
    setShowApproveConfirm(true)
  }

  const confirmApproveSeller = async () => {
    try {
      setShowApproveConfirm(false)
      setActionLoading('approve')
      
      const response = await adminService.approveSeller(sellerId)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to approve seller')
      }
      
      showAlertMessage('success', 'Seller approved successfully! Account setup instructions sent via email.')
      setSuccessMessage('Seller approved successfully! Account setup instructions sent via email.')
      await fetchApplication() // Refresh data
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Error approving seller:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve seller'
      showAlertMessage('error', errorMessage)
      setError(errorMessage)
    } finally {
      setActionLoading('')
    }
  }

  const cancelApproveSeller = () => {
    setShowApproveConfirm(false)
  }

  const handleRejectSellerClick = () => {
    setShowRejectReasonInput(true)
  }

  const handleRejectReasonSubmit = () => {
    if (!rejectionReason.trim()) {
      showAlertMessage('warning', 'Please provide a reason for rejection.')
      return
    }
    setShowRejectReasonInput(false)
    setShowRejectConfirm(true)
  }

  const confirmRejectSeller = async () => {
    try {
      setShowRejectConfirm(false)
      setActionLoading('reject')
      
      const response = await adminService.rejectSeller(sellerId, rejectionReason)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to reject seller')
      }
      
      showAlertMessage('warning', 'Seller application rejected successfully.')
      setSuccessMessage('Seller application rejected successfully.')
      await fetchApplication() // Refresh data
      setTimeout(() => setSuccessMessage(''), 5000)
      setRejectionReason('') // Clear the reason
    } catch (error) {
      console.error('Error rejecting seller:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject seller'
      showAlertMessage('error', errorMessage)
      setError(errorMessage)
    } finally {
      setActionLoading('')
    }
  }

  const cancelRejectSeller = () => {
    setShowRejectConfirm(false)
    setRejectionReason('')
  }

  const cancelRejectReasonInput = () => {
    setShowRejectReasonInput(false)
    setRejectionReason('')
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

  const StatusBadge = ({ status }: { status: AdminSellerApplication['status'] }) => {
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.className}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    )
  }

  const FilePreview = ({ url, label, type = 'image' }: { url: string; label: string; type?: 'image' | 'document' }) => (
    <div className="bg-card border border-border/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-foreground">{label}</h4>
        <div className="flex gap-2">
          <button
            onClick={() => window.open(url, '_blank')}
            className="p-1.5 hover:bg-secondary/50 rounded-md transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4 text-muted-foreground" />
          </button>
          <a
            href={url}
            download
            className="p-1.5 hover:bg-secondary/50 rounded-md transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
          </a>
        </div>
      </div>
      
      {type === 'image' ? (
        <S3Image
          src={url}
          alt={label}
          width={400}
          height={128}
          className="w-full h-32 object-cover rounded-lg border border-border/20"
          fallbackText="Image"
        />
      ) : (
        <div className="w-full h-32 bg-secondary/30 rounded-lg border border-border/20 flex items-center justify-center">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" text="Loading application details..." />
      </div>
    )
  }

  if (error && !application) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-serif font-bold text-foreground">Application Not Found</h1>
        </div>
        
        <AlertBox
          type="error"
          message={error}
        />
      </div>
    )
  }

  if (!application) return null

  return (
    <>
      <PageTitle title="Seller Application Details" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">{application.fullName}</h1>
              <p className="text-muted-foreground">Seller Application Details</p>
            </div>
          </div>
          
          <StatusBadge status={application.status} />
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <AlertBox
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}
        
        {error && (
          <AlertBox
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-card border border-border/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-foreground font-medium">{application.fullName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">NIC Number</label>
                  <p className="text-foreground font-medium">{application.nicNumber}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {application.email}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {application.phone}
                  </p>
                </div>
                
                {application.dateOfBirth && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="text-foreground font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {application.dateOfBirth}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-card border border-border/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Business Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Years of Experience</label>
                  <p className="text-foreground font-medium">{application.yearsOfExperience}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Language</label>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    {application.preferredLanguage}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">NGJA License</label>
                  <p className="text-foreground font-medium">
                    {application.hasNGJALicense ? (
                      <span className="text-green-600 dark:text-green-400">
                        Yes - {application.ngjaLicenseNumber}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Gemstone Types</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {application.gemstoneTypes.map((type: string) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-md border border-primary/20"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Why Join */}
            <div className="bg-card border border-border/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Why They Want to Join</h3>
              <p className="text-foreground leading-relaxed">{application.whyJoin}</p>
            </div>

            {/* Supporting Documents */}
            <div className="bg-card border border-border/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Supporting Documents
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FilePreview url={application.nicFrontUrl} label="NIC Front Side" />
                <FilePreview url={application.nicBackUrl} label="NIC Back Side" />
                
                {application.ngjaLicenseUrl && (
                  <FilePreview 
                    url={application.ngjaLicenseUrl} 
                    label="NGJA License" 
                    type={application.ngjaLicenseUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "image" : "document"} 
                  />
                )}
                
                {application.sampleCertificateUrl && (
                  <FilePreview 
                    url={application.sampleCertificateUrl} 
                    label="Sample Certificate" 
                    type={application.sampleCertificateUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "image" : "document"} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Application Info */}
            <div className="bg-card border border-border/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Application Info</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                  <p className="text-foreground text-sm">{formatDate(application.applicationDate)}</p>
                </div>
                
                {application.reviewedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reviewed</label>
                    <p className="text-foreground text-sm">{formatDate(application.reviewedAt)}</p>
                  </div>
                )}
                
                {application.reviewedBy && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reviewed By</label>
                    <p className="text-foreground text-sm">{application.reviewedBy}</p>
                  </div>
                )}
                
                {application.rejectionReason && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rejection Reason</label>
                    <p className="text-red-600 dark:text-red-400 text-sm">{application.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Call Status */}
            {application.status === 'pending' && (
              <div className="bg-card border border-border/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <VideoIcon className="w-5 h-5 text-primary" />
                  Video Call
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">Video Call Verified</span>
                    <div className={`w-4 h-4 rounded-full ${application.videoCallVerified ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  
                  <button
                    onClick={handleSendMeetLinkClick}
                    disabled={actionLoading === 'meeting'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === 'meeting' ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Google Meet Link
                  </button>
                  
                  {!application.videoCallVerified && (
                    <button
                      onClick={handleVerifyVideoCallClick}
                      disabled={actionLoading === 'video-call'}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'video-call' ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Mark Video Call Complete
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {application.status === 'pending' && (
              <div className="bg-card border border-border/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleApproveSellerClick}
                    disabled={actionLoading === 'approve' || !application.videoCallVerified}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === 'approve' ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    Approve Seller
                  </button>
                  
                  <button
                    onClick={handleRejectSellerClick}
                    disabled={actionLoading === 'reject'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === 'reject' ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject Application
                  </button>
                </div>
                
                {!application.videoCallVerified && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Complete and verify the video call before approving the seller.
                  </p>
                )}
              </div>
            )}

            {/* Account Status */}
            {application.accountCreated && (
              <div className="bg-card border border-border/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Account Status</h3>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Account Created</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Seller has completed their account setup and can now access the platform.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Alert notification */}
        {showAlert && (
          <AlertBox
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
            placement="top"
          />
        )}

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          isOpen={showSendMeetConfirm}
          title="Send Google Meet Link"
          message="This will send a Google Meet link to the seller's email address for the video call verification. Are you sure you want to proceed?"
          confirmText="Yes, Send Link"
          cancelText="Cancel"
          type="info"
          onConfirm={confirmSendMeetLink}
          onCancel={cancelSendMeetLink}
        />

        <ConfirmDialog
          isOpen={showVideoCallConfirm}
          title="Mark Video Call Complete"
          message="Are you sure you want to mark the video call as verified? This will enable the seller approval process."
          confirmText="Yes, Mark Complete"
          cancelText="Cancel"
          type="info"
          onConfirm={confirmVerifyVideoCall}
          onCancel={cancelVerifyVideoCall}
        />

        <ConfirmDialog
          isOpen={showApproveConfirm}
          title="Approve Seller"
          message={`Are you sure you want to approve ${application?.fullName}'s seller application? This will send account setup instructions via email and grant them seller privileges on the platform.`}
          confirmText="Yes, Approve"
          cancelText="Cancel"
          type="info"
          onConfirm={confirmApproveSeller}
          onCancel={cancelApproveSeller}
        />

        <ConfirmDialog
          isOpen={showRejectConfirm}
          title="Reject Application"
          message={`Are you sure you want to reject ${application?.fullName}'s seller application? This action cannot be undone and the applicant will be notified.`}
          confirmText="Yes, Reject"
          cancelText="Cancel"
          type="danger"
          onConfirm={confirmRejectSeller}
          onCancel={cancelRejectSeller}
        />

        {/* Rejection Reason Input Dialog */}
        <ConfirmDialog
          isOpen={showRejectReasonInput}
          title="Rejection Reason" 
          message={
            <div className="space-y-4">
              <p>Please provide a detailed reason for rejecting this seller application. This will help the applicant understand the decision.</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] resize-vertical"
                rows={4}
              />
            </div>
          }
          confirmText="Continue"
          cancelText="Cancel"
          type="warning"
          onConfirm={handleRejectReasonSubmit}
          onCancel={cancelRejectReasonInput}
        />
      </div>
    </>
  )
} 