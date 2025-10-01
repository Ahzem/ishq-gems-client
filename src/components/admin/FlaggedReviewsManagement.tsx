'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Star, 
  MessageSquare, 
  Flag, 
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Eye,
  Clock,
  Search
} from 'lucide-react'
import { Spinner } from '@/components/loading'
import { Toast, ConfirmDialog } from '@/components/alerts'
import { cn } from '@/lib/utils'
import adminService from '@/services/admin.service'
import type { FlaggedReview } from '@/types'

interface FlaggedReviewsManagementProps {
  className?: string
}

interface PaginationState {
  page: number
  limit: number
  total: number
  pages: number
}

export default function FlaggedReviewsManagement({ className }: FlaggedReviewsManagementProps) {
  const [reviews, setReviews] = useState<FlaggedReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'resolved'>('flagged')
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'approve' | 'reject'
    reviewId: string
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'approve',
    reviewId: '',
    title: '',
    message: ''
  })
  
  // Toast state
  const [toastState, setToastState] = useState<{
    isVisible: boolean
    message: string
    type: 'success' | 'error' | 'info'
  }>({
    isVisible: false,
    message: '',
    type: 'info'
  })

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastState({
      isVisible: true,
      message,
      type
    })
  }, [])

  const hideToast = useCallback(() => {
    setToastState(prev => ({ ...prev, isVisible: false }))
  }, [])

  const fetchFlaggedReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const response = await adminService.getFlaggedReviews(
        pagination.page,
        pagination.limit,
        statusFilter
      )

      if (response.success && response.data) {
        setReviews(response.data.reviews)
        setPagination(response.data.pagination)
      } else {
        showToast(response.message || 'Failed to load flagged reviews', 'error')
      }
    } catch (error) {
      console.error('Error fetching flagged reviews:', error)
      showToast('Failed to load flagged reviews', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, showToast])

  useEffect(() => {
    fetchFlaggedReviews()
  }, [fetchFlaggedReviews])

  const handleApproveClick = useCallback((reviewId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'approve',
      reviewId,
      title: 'Approve Review',
      message: 'Are you sure you want to approve this review? It will be restored to public view and visible to all users.'
    })
  }, [])

  const handleRejectClick = useCallback((reviewId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'reject',
      reviewId,
      title: 'Reject Review',
      message: 'Are you sure you want to reject this review? It will be permanently removed from the platform and will not be visible to users.'
    })
  }, [])

  const handleConfirmAction = useCallback(async () => {
    if (!confirmDialog.reviewId) return

    try {
      let response
      
      if (confirmDialog.type === 'approve') {
        response = await adminService.approveReview(confirmDialog.reviewId)
        if (response.success) {
          setReviews(prev => prev.filter(r => r._id !== confirmDialog.reviewId))
          showToast('Review approved and restored to public view', 'success')
        }
      } else {
        response = await adminService.rejectReview(confirmDialog.reviewId)
        if (response.success) {
          setReviews(prev => prev.filter(r => r._id !== confirmDialog.reviewId))
          showToast('Review rejected and removed from platform', 'success')
        }
      }

      if (!response.success) {
        throw new Error(response.message || `Failed to ${confirmDialog.type} review`)
      }
    } catch (error) {
      console.error(`Error ${confirmDialog.type}ing review:`, error)
      showToast(`Failed to ${confirmDialog.type} review`, 'error')
    } finally {
      setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    }
  }, [confirmDialog, showToast])

  const handleCancelAction = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Filter reviews based on search query
  const filteredReviews = reviews.filter(review => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const reviewerName = (review.buyer?.displayName || review.reviewerName || '').toLowerCase()
    const sellerName = (review.seller?.fullName || '').toLowerCase()
    const reviewText = (review.text || review.comment || '').toLowerCase()
    const reviewTitle = (review.title || '').toLowerCase()
    
    return reviewerName.includes(query) || 
           sellerName.includes(query) || 
           reviewText.includes(query) ||
           reviewTitle.includes(query)
  })

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-4 h-4",
              star <= rating 
                ? "fill-amber-400 text-amber-400" 
                : "text-muted-foreground"
            )}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getFlagReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      'inappropriate_language': 'Inappropriate Language',
      'fake_review': 'Fake/Fraudulent Review',
      'spam': 'Spam Content',
      'personal_attack': 'Personal Attack',
      'misleading_information': 'Misleading Information',
      'other': 'Other Violation'
    }
    return reasons[reason] || reason
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner 
          size="lg" 
          text="Loading flagged reviews..." 
          variant="gem" 
        />
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Toast Notification */}
      {toastState.isVisible && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            message={toastState.message}
            type={toastState.type}
            isVisible={toastState.isVisible}
            onClose={hideToast}
            duration={5000}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border/30 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews by reviewer name, seller, or content..."
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'flagged' | 'resolved')}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[140px]"
            >
              <option value="flagged">Flagged Reviews</option>
              <option value="resolved">Resolved</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
            <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No Matching Reviews' : 'No Flagged Reviews'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `No reviews match your search: "${searchQuery}"`
                : statusFilter === 'flagged' 
                  ? "There are no reviews currently flagged for review."
                  : `No reviews match the selected filter: ${statusFilter}`
              }
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-card border border-border/50 rounded-xl p-6"
            >
              {/* Flag Alert */}
              { review.status === 'flagged' && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-3">
                  <Flag className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-amber-800 dark:text-amber-300">
                        Flagged as: {getFlagReasonLabel(review.flaggedReason || '')}
                      </span>
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {review.flaggedAt && formatDate(review.flaggedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      This review was flagged by the seller for violating community guidelines.
                    </p>
                  </div>
                </div>
              </div>
              )}
              { review.status === 'approved' && (
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-green-800 dark:text-green-300">
                          Review Approved
                        </span>
                        <span className="text-xs text-green-600">
                          {review.resolvedAt && formatDate(review.resolvedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        This review was approved by an admin.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              { review.status === 'rejected' && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-red-800 dark:text-red-300">
                          Review Rejected
                        </span>
                        <span className="text-xs text-red-600">
                          {review.resolvedAt && formatDate(review.resolvedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        This review was rejected by an admin.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">
                        {review.buyer?.displayName || review.reviewerName}
                      </h4>
                      {review.isVerified && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Verified Purchase</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Review for: <span className="font-medium">{review.seller?.fullName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                {review.title && (
                  <h5 className="font-medium text-foreground mb-2">{review.title}</h5>
                )}
                <p className="text-muted-foreground leading-relaxed">{review.text || review.comment}</p>
              </div>

              {/* Seller Reply */}
              {review.sellerReply && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Seller Reply</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.sellerReply.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground">{review.sellerReply.text}</p>
                </div>
              )}

              {/* Admin Actions */}
              <div className="flex gap-3 pt-4 border-t border-border/30">
                {review.status === 'flagged' && (
                  <button
                    onClick={() => handleApproveClick(review._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve & Restore
                  </button>
                )}
                {review.status === 'flagged' && (
                  <button
                    onClick={() => handleRejectClick(review._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject & Remove
                  </button>
                )}
                <button
                  onClick={() => window.open(`/seller/${review.seller?.id}`, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Seller Profile
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.type === 'approve' ? 'Approve Review' : 'Reject Review'}
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        type={confirmDialog.type === 'approve' ? 'info' : 'danger'}
      />
    </div>
  )
}