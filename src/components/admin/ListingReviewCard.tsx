'use client'

import { useState } from 'react'
import { 
  Check, 
  X, 
  Eye, 
  FileText, 
  User, 
  Calendar, 
  Package, 
  MapPin, 
  Weight, 
  DollarSign,
  Clock,
  Shield,
  ExternalLink,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import S3Image from '@/components/common/S3Image'
import ConfirmDialog from '@/components/alerts/ConfirmDialog'
import { cn } from '@/lib/utils'

interface ListingReviewCardProps {
  gem: {
    _id: string
    gemType: string
    color: string
    weight: { value: number; unit: string }
    price?: number
    listingType: 'direct-sale' | 'auction'
    startingBid?: number
    reservePrice?: number
    submittedAt: string
    reportNumber: string
    labName: string
    origin: string
    clarity: string
  sellerId: {
    _id: string
    email: string
    licenseNumber?: string
    storeSettings?: {
      storeName: string
      storeSlogan?: string
      storeDescription?: string
      primaryColor?: string
      secondaryColor?: string
      logoUrl?: string | null
      bannerUrl?: string | null
    }
  }
    media?: Array<{
      _id: string
      type: 'image' | 'video' | 'lab-report'
      url: string
      isPrimary: boolean
      order: number
    }>
    labReportId?: {
      _id: string
      url: string
      filename: string
    }
  }
  onApprove: (gemId: string) => Promise<void>
  onReject: (gemId: string, reason?: string) => Promise<void>
  onViewDetails: (gemId: string) => void
  onEdit?: (gemId: string) => void
  isProcessing?: boolean
}

export default function ListingReviewCard({
  gem,
  onApprove,
  onReject,
  onViewDetails,
  onEdit,
  isProcessing = false
}: ListingReviewCardProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionInProgress, setActionInProgress] = useState<'approve' | 'reject' | null>(null)

  const primaryImage = gem.media?.find(m => m.type === 'image' && m.isPrimary) || 
                      gem.media?.find(m => m.type === 'image')

  const labReport = gem.media?.find(m => m.type === 'lab-report') || gem.labReportId

  const handleApprove = async () => {
    setActionInProgress('approve')
    try {
      await onApprove(gem._id)
      setShowApproveDialog(false)
    } catch (error) {
      console.error('Error approving gem:', error)
    } finally {
      setActionInProgress(null)
    }
  }

  const handleReject = async () => {
    setActionInProgress('reject')
    try {
      await onReject(gem._id, rejectionReason.trim() || undefined)
      setShowRejectDialog(false)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting gem:', error)
    } finally {
      setActionInProgress(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Not set'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getListingTypeDisplay = () => {
    if (gem.listingType === 'direct-sale') {
      return {
        label: 'Fixed Price',
        value: formatPrice(gem.price),
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      }
    } else {
      return {
        label: 'Auction',
        value: `${formatPrice(gem.startingBid)} - ${formatPrice(gem.reservePrice)}`,
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
      }
    }
  }

  const listingTypeInfo = getListingTypeDisplay()

  return (
    <>
      <div className="bg-card border border-border/30 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
        {/* Header */}
        <div className="bg-secondary/20 p-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {gem.gemType} - {gem.color}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {gem.weight.value} {gem.weight.unit} • {gem.origin}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                listingTypeInfo.className
              )}>
                {listingTypeInfo.label}
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pending
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Image and Quick Info */}
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-secondary/20 rounded-lg overflow-hidden flex-shrink-0">
              {primaryImage?.url ? (
                <S3Image
                  src={primaryImage.url}
                  alt={`${gem.gemType} - ${gem.color}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  style={{ width: 'auto', height: 'auto' }}
                  fallbackText={gem.gemType.charAt(0)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <Package className="w-8 h-8 text-primary/60" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Weight className="w-4 h-4 text-muted-foreground" />
                  <span>{gem.weight.value} {gem.weight.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>{gem.clarity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{gem.origin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>{listingTypeInfo.value}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-secondary/10 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{gem.sellerId.storeSettings?.storeName || "Seller"}</span>
                </div>
                <p className="text-sm text-muted-foreground">{gem.sellerId.email}</p>
                {gem.sellerId.licenseNumber && (
                  <p className="text-xs text-muted-foreground">
                    License: {gem.sellerId.licenseNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(gem.submittedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Lab Report Information */}
          <div className="bg-secondary/10 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Lab Report</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {gem.labName} • {gem.reportNumber}
                </p>
              </div>
              {labReport && (
                <Link
                  href={labReport.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Report
                </Link>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onViewDetails(gem._id)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            
            {onEdit && (
              <button
                onClick={() => onEdit(gem._id)}
                disabled={isProcessing || actionInProgress !== null}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            
            <button
              onClick={() => setShowRejectDialog(true)}
              disabled={isProcessing || actionInProgress !== null}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {actionInProgress === 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
            
            <button
              onClick={() => setShowApproveDialog(true)}
              disabled={isProcessing || actionInProgress !== null}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {actionInProgress === 'approve' ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showApproveDialog}
        title="Approve Listing"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to approve this gem listing?</p>
            <div className="bg-secondary/20 rounded-lg p-3 text-sm">
              <div className="font-medium">{gem.gemType} - {gem.color}</div>
              <div className="text-muted-foreground">
                {gem.weight.value} {gem.weight.unit} • {formatPrice(gem.price)}
              </div>
              <div className="text-muted-foreground">
                Submitted by: {gem.sellerId.storeSettings?.storeName || gem.sellerId.email}
              </div>
            </div>
          </div>
        }
        confirmText={actionInProgress === 'approve' ? 'Approving...' : 'Approve'}
        cancelText="Cancel"
        onConfirm={handleApprove}
        onCancel={() => setShowApproveDialog(false)}
        type="info"
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRejectDialog}
        title="Reject Listing"
        message={
          <div className="space-y-4">
            <p>Are you sure you want to reject this gem listing?</p>
            <div className="bg-secondary/20 rounded-lg p-3 text-sm">
              <div className="font-medium">{gem.gemType} - {gem.color}</div>
              <div className="text-muted-foreground">
                {gem.weight.value} {gem.weight.unit} • {formatPrice(gem.price)}
              </div>
              <div className="text-muted-foreground">
                Submitted by: {gem.sellerId.storeSettings?.storeName || gem.sellerId.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                rows={3}
              />
            </div>
          </div>
        }
        confirmText={actionInProgress === 'reject' ? 'Rejecting...' : 'Reject'}
        cancelText="Cancel"
        onConfirm={handleReject}
        onCancel={() => {
          setShowRejectDialog(false)
          setRejectionReason('')
        }}
        type="danger"
      />
    </>
  )
} 