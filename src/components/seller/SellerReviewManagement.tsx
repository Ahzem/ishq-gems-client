'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Star, 
  MessageSquare, 
  Flag, 
  User,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Heart,
  ThumbsUp
} from 'lucide-react'
import { SellerReview } from '@/types/entities/seller'
import sellerService from '@/services/seller.service'
import Spinner from '@/components/loading/Spinner'
import { cn } from '@/lib/utils'

interface SellerReviewManagementProps {
  sellerId: string
  onRefresh?: () => void
  onStatsUpdate?: (stats: { totalReviews: number; needsReply: number; replied: number; flagged: number }) => void
}

// Enhanced review interface with status and action states
interface ReviewWithStatus extends SellerReview {
  status?: 'pending' | 'approved' | 'rejected' | 'flagged'
}

interface ReviewWithActions extends ReviewWithStatus {
  isReplying?: boolean
  replyText?: string
  isFlagging?: boolean
  flagReason?: string
  isProcessing?: boolean
}

type SortOption = 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'needs_reply'
type StatusFilter = 'all' | 'replied' | 'flagged' | 'needs_reply'

interface Toast {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function SellerReviewManagement({ sellerId, onRefresh, onStatsUpdate }: SellerReviewManagementProps) {
  const [reviews, setReviews] = useState<ReviewWithActions[]>([])
  const [isLoading, setIsLoading] = useState(true)


  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  
  // Filters and sorting
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [toast, setToast] = useState<Toast | null>(null)

  const fetchReviews = useCallback(async () => {
    // Don't fetch if sellerId is not available
    if (!sellerId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      // Use the management endpoint that includes flagged reviews
      const response = await sellerService.getSellerReviewsForManagement(
        sellerId, 
        pagination.page, 
        pagination.limit, 
        sortBy
      )

      if (response.success && response.data) {
        const reviewsWithActions = response.data.reviews.map(review => ({
          ...review,
          isReplying: false,
          replyText: review.sellerReply?.text || '',
          isFlagging: false,
          flagReason: '',
          isProcessing: false
        }))
        
        setReviews(reviewsWithActions)
        setPagination(response.data.pagination)
      } else {
        showToast(response.message || 'Failed to load reviews', 'error')
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      showToast('Failed to load reviews', 'error')
    } finally {
      setIsLoading(false)
      onRefresh?.()
    }
  }, [sellerId, pagination.page, pagination.limit, sortBy, onRefresh])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Update stats whenever reviews change
  useEffect(() => {
    if (reviews.length > 0 && onStatsUpdate) {
      const stats = {
        totalReviews: reviews.length,
        needsReply: reviews.filter(r => !r.sellerReply && (r as ReviewWithStatus).status !== 'flagged').length,
        replied: reviews.filter(r => r.sellerReply).length,
        flagged: reviews.filter(r => (r as ReviewWithStatus).status === 'flagged').length
      }
      onStatsUpdate(stats)
    }
  }, [reviews, onStatsUpdate])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusFilterChange = (newFilter: StatusFilter) => {
    setStatusFilter(newFilter)
  }

  const startReply = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { ...review, isReplying: true }
        : { ...review, isReplying: false, isFlagging: false }
    ))
  }

  const cancelReply = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { ...review, isReplying: false, replyText: review.sellerReply?.text || '' }
        : review
    ))
  }

  const updateReplyText = (reviewId: string, text: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { ...review, replyText: text }
        : review
    ))
  }

  const submitReply = async (reviewId: string) => {
    const review = reviews.find(r => r._id === reviewId)
    if (!review || !review.replyText?.trim()) {
      showToast('Please enter a reply message', 'error')
      return
    }

    const trimmedText = review.replyText.trim()
    if (trimmedText.length < 10) {
      showToast('Reply must be at least 10 characters long', 'error')
      return
    }

    if (trimmedText.length > 500) {
      showToast('Reply cannot exceed 500 characters', 'error')
      return
    }

    setReviews(prev => prev.map(r => 
      r._id === reviewId ? { ...r, isProcessing: true } : r
    ))

    try {
      // Use the seller service method
      const result = await sellerService.replyToReview(sellerId, reviewId, trimmedText)

      if (result.success) {
        setReviews(prev => prev.map(r => 
          r._id === reviewId 
            ? { 
                ...r, 
                isReplying: false,
                isProcessing: false,
                sellerReply: {
                  text: trimmedText,
                  createdAt: new Date()
                }
              }
            : r
        ))
        showToast('Reply posted successfully', 'success')
        
        // Refetch reviews to ensure we have the latest data
        setTimeout(() => {
          fetchReviews()
        }, 1000)
      } else {
        throw new Error(result.message || 'Failed to post reply')
      }
    } catch (error) {
      console.error('Error posting reply:', error)
      showToast('Failed to post reply', 'error')
      setReviews(prev => prev.map(r => 
        r._id === reviewId ? { ...r, isProcessing: false } : r
      ))
    }
  }

  const startFlag = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { ...review, isFlagging: true }
        : { ...review, isReplying: false, isFlagging: false }
    ))
  }

  const cancelFlag = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { ...review, isFlagging: false, flagReason: '' }
        : review
    ))
  }

  const updateFlagReason = (reviewId: string, reason: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { ...review, flagReason: reason }
        : review
    ))
  }

  const submitFlag = async (reviewId: string) => {
    const review = reviews.find(r => r._id === reviewId)
    if (!review || !review.flagReason?.trim()) {
      showToast('Please select a reason for flagging this review', 'error')
      return
    }

    setReviews(prev => prev.map(r => 
      r._id === reviewId ? { ...r, isProcessing: true } : r
    ))

    try {
      // Use the seller service method
      const result = await sellerService.flagReview(sellerId, reviewId, review.flagReason!)

      if (result.success) {
        setReviews(prev => prev.map(r => 
          r._id === reviewId 
            ? { 
                ...r, 
                isFlagging: false,
                isProcessing: false,
                // Mark as flagged with proper typing
                status: 'flagged' as const
              }
            : r
        ))
        showToast('Review flagged for admin review', 'success')
      } else {
        throw new Error(result.message || 'Failed to flag review')
      }
    } catch (error) {
      console.error('Error flagging review:', error)
      showToast('Failed to flag review', 'error')
      setReviews(prev => prev.map(r => 
        r._id === reviewId ? { ...r, isProcessing: false } : r
      ))
    }
  }

  const handleLikeReview = async (reviewId: string) => {
    const review = reviews.find(r => r._id === reviewId)
    if (!review) return

    // Prevent liking own reviews or during processing
    if (review.isOwnReview || review.isProcessing) return

    // Optimistic update
    setReviews(prev => prev.map(r => 
      r._id === reviewId 
        ? { 
            ...r, 
            isLikedByCurrentUser: !r.isLikedByCurrentUser,
            helpfulVotes: r.isLikedByCurrentUser ? r.helpfulVotes - 1 : r.helpfulVotes + 1,
            isProcessing: true
          }
        : r
    ))

    try {
      const response = await sellerService.likeReview(sellerId, reviewId)
      
      if (response.success && response.data) {
        setReviews(prev => prev.map(r => 
          r._id === reviewId 
            ? { 
                ...r, 
                isLikedByCurrentUser: response.data!.isLiked,
                helpfulVotes: response.data!.helpfulVotes,
                isProcessing: false
              }
            : r
        ))
        
        showToast(
          response.data.isLiked ? 'Review marked as helpful' : 'Removed helpful vote',
          'success'
        )
      } else {
        throw new Error(response.message || 'Failed to like review')
      }
    } catch (error) {
      console.error('Error liking review:', error)
      
      // Revert optimistic update on error
      setReviews(prev => prev.map(r => 
        r._id === reviewId 
          ? { 
              ...r, 
              isLikedByCurrentUser: review.isLikedByCurrentUser,
              helpfulVotes: review.helpfulVotes,
              isProcessing: false
            }
          : r
      ))
      
      showToast('Failed to update review like status', 'error')
    }
  }

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
        day: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getStatusDisplay = (review: ReviewWithActions) => {
    if (review.status === 'flagged') {
      return (
        <div className="flex items-center gap-1 text-amber-600">
          <Flag className="w-4 h-4" />
          <span className="text-xs">Flagged</span>
        </div>
      )
    }
    
    if (review.sellerReply) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs">Replied</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center gap-1 text-blue-600">
        <Clock className="w-4 h-4" />
        <span className="text-xs">Needs Reply</span>
      </div>
    )
  }

  const filteredReviews = reviews.filter(review => {
    switch (statusFilter) {
      case 'replied':
        return review.sellerReply
      case 'flagged':
        return review.status === 'flagged'
      case 'needs_reply':
        return !review.sellerReply && review.status !== 'flagged'
      default:
        return true
    }
  })

  // Show loading if sellerId is not available
  if (!sellerId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading seller information...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border transition-all duration-300 max-w-sm ${
          toast.type === 'success' 
            ? 'bg-green-500/10 text-green-600 border-green-500/20' 
            : toast.type === 'error'
            ? 'bg-red-500/10 text-red-600 border-red-500/20'
            : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)} 
              className="text-current hover:opacity-70 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border/30 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[120px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
              <option value="needs_reply">Needs Reply</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as StatusFilter)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[120px]"
            >
              <option value="all">All Reviews</option>
              <option value="needs_reply">Needs Reply</option>
              <option value="replied">Replied</option>
              <option value="flagged">Flagged</option>
            </select>

            {/* Results Count */}
            <div className="px-3 py-2 border border-border rounded-lg bg-secondary/10 text-foreground text-sm">
              {filteredReviews.length} of {reviews.length}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Reviews Found</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'all' 
                ? "You don't have any reviews yet. Keep providing excellent service to earn customer reviews!"
                : `No reviews match the selected filter: ${statusFilter.replace('_', ' ')}`
              }
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review._id}
              className={cn(
                "bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow",
                !review.sellerReply && review.status !== 'flagged'
                  ? "border-amber-200 dark:border-amber-800/30 bg-amber-50/30 dark:bg-amber-900/5"
                  : review.status === 'flagged'
                  ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10"
                  : "border-border"
              )}
            >
              <div className="p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">
                        {review.buyer.displayName}
                      </h4>
                      {review.isVerified && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Verified Purchase</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                      {review.helpfulVotes > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{review.helpfulVotes} helpful</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {/* Needs Reply Badge */}
                  {!review.sellerReply && review.status !== 'flagged' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                      <Clock className="w-3 h-3" />
                      Needs Reply
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    {/* Quick Reply Button */}
                    {!review.sellerReply && !review.isReplying && review.status !== 'flagged' && (
                      <button
                        onClick={() => startReply(review._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">Reply</span>
                      </button>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {getStatusDisplay(review)}
                      <div className="flex items-center gap-1" title={review.status === 'flagged' ? "Hidden from public" : "Visible to public"}>
                        {review.status === 'flagged' ? (
                          <EyeOff className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                {review.title && (
                  <h5 className="font-medium text-foreground mb-2">{review.title}</h5>
                )}
                <p className="text-muted-foreground leading-relaxed">{review.text}</p>
              </div>

              {/* Seller Reply */}
              {review.sellerReply && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Your Reply</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.sellerReply.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground">{review.sellerReply.text}</p>
                </div>
              )}

              {/* Reply Form */}
              {review.isReplying && (
                <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      Reply to this review
                    </label>
                    <textarea
                      value={review.replyText || ''}
                      onChange={(e) => updateReplyText(review._id, e.target.value)}
                      placeholder="Write a professional response to this review..."
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {(review.replyText || '').length}/500 characters
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => cancelReply(review._id)}
                          className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          disabled={review.isProcessing}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => submitReply(review._id)}
                          disabled={!review.replyText?.trim() || review.isProcessing}
                          className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {review.isProcessing ? (
                            <>
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              Post Reply
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Flag Form */}
              {review.isFlagging && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-amber-800 dark:text-amber-300">
                      Reason for flagging this review
                    </label>
                    <select
                      value={review.flagReason || ''}
                      onChange={(e) => updateFlagReason(review._id, e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="">Select a reason...</option>
                      <option value="inappropriate_language">Inappropriate Language</option>
                      <option value="fake_review">Fake/Fraudulent Review</option>
                      <option value="spam">Spam Content</option>
                      <option value="personal_attack">Personal Attack</option>
                      <option value="misleading_information">Misleading Information</option>
                      <option value="other">Other Violation</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => cancelFlag(review._id)}
                        className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        disabled={review.isProcessing}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => submitFlag(review._id)}
                        disabled={!review.flagReason || review.isProcessing}
                        className="flex items-center gap-1 px-3 py-1 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {review.isProcessing ? (
                          <>
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            Flagging...
                          </>
                        ) : (
                          <>
                            <Flag className="w-3 h-3" />
                            Flag Review
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!review.isReplying && !review.isFlagging && review.status !== 'flagged' && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLikeReview(review._id)}
                    disabled={review.isOwnReview || review.isProcessing}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors",
                      review.isLikedByCurrentUser
                        ? "text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20"
                        : "text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10",
                      review.isOwnReview && "opacity-50 cursor-not-allowed",
                      review.isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Heart 
                      className={cn(
                        "w-4 h-4 transition-colors",
                        review.isLikedByCurrentUser && "fill-current"
                      )} 
                    />
                    Helpful ({review.helpfulVotes})
                  </button>

                  {/* Reply Button */}
                  {!review.sellerReply ? (
                    <button
                      onClick={() => startReply(review._id)}
                      className="flex items-center gap-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Write Reply
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/10 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      Replied
                    </div>
                  )}

                  {/* Flag Button */}
                  <button
                    onClick={() => startFlag(review._id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-lg transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    Flag as Inappropriate
                  </button>
                </div>
              )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 text-sm border border-border rounded-lg bg-background hover:bg-secondary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 text-sm border border-border rounded-lg bg-background hover:bg-secondary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
} 