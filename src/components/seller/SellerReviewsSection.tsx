'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Edit3, 
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Heart
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { SellerReview, CreateReviewRequest } from '@/types'
import sellerService from '@/services/seller.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Spinner from '@/components/loading/Spinner'
import { Toast } from '@/components/alerts'

interface SellerReviewsSectionProps {
  sellerId: string
  className?: string
}

type SortOption = 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating_high', label: 'Highest Rated' },
  { value: 'rating_low', label: 'Lowest Rated' },
  { value: 'helpful', label: 'Most Helpful' }
]

const ratingFilters = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' }
]

export default function SellerReviewsSection({ sellerId, className }: SellerReviewsSectionProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<SellerReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewFormData, setReviewFormData] = useState<CreateReviewRequest>({
    rating: 0,
    title: '',
    text: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info')

  const reviewsPerPage = 5

  // Toast helper function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message)
    setToastType(type)
  }

  const closeToast = () => {
    setToastMessage(null)
  }

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await sellerService.getSellerReviews(
        sellerId,
        currentPage,
        reviewsPerPage,
        sortBy
      )

      if (response.success && response.data) {
        setReviews(response.data.reviews)
        setTotalPages(response.data.pagination.pages)
        setTotalReviews(response.data.pagination.total)
      } else {
        setError(response.message || 'Failed to fetch reviews')
        showToast(response.message || 'Failed to fetch reviews', 'error')
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setError('Failed to fetch reviews')
      showToast('Failed to fetch reviews. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [sellerId, currentPage, sortBy])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  const handleRatingFilterChange = (newFilter: string) => {
    setRatingFilter(newFilter)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Filter reviews by rating
  const filteredReviews = ratingFilter === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === parseInt(ratingFilter))

  const validateReviewForm = () => {
    const errors: Record<string, string> = {}
    
    if (reviewFormData.rating === 0) {
      errors.rating = 'Please select a rating'
    }
    
    if (!reviewFormData.text.trim()) {
      errors.text = 'Review text is required'
    } else if (reviewFormData.text.trim().length < 10) {
      errors.text = 'Review must be at least 10 characters long'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateReviewForm()) return
    
    setIsSubmittingReview(true)
    
    try {
      const response = await sellerService.createReview(sellerId, reviewFormData)
      
      if (response.success) {
        setShowReviewForm(false)
        setReviewFormData({ rating: 0, title: '', text: '' })
        setFormErrors({})
        fetchReviews() // Refresh reviews
        showToast('Review submitted successfully!', 'success')
      } else {
        showToast(response.message || 'Failed to submit review', 'error')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          showToast('Please sign in to submit a review', 'info')
        } else if (error.message.includes('already reviewed')) {
          showToast('You have already reviewed this seller', 'info')
        } else {
          showToast(error.message || 'Failed to submit review', 'error')
        }
      } else {
        showToast('An unexpected error occurred. Please try again.', 'error')
      }
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const stars = []
    const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={cn(
            sizeClass,
            i <= rating ? 'text-primary fill-primary' : 'text-border'
          )}
        />
      )
    }
    
    return <div className="flex items-center gap-1">{stars}</div>
  }

  const renderInteractiveStars = (currentRating: number, onRate: (rating: number) => void) => {
    const stars = []
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => onRate(i)}
          className={cn(
            "w-8 h-8 transition-colors hover:scale-110",
            i <= currentRating ? 'text-primary' : 'text-border hover:text-primary/50'
          )}
        >
          <Star className={cn("w-full h-full", i <= currentRating && 'fill-current')} />
        </button>
      )
    }
    
    return <div className="flex items-center gap-1">{stars}</div>
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleLikeReview = async (reviewId: string) => {
    if (!user) {
      showToast('Please sign in to like reviews', 'info')
      return
    }

    try {
      const response = await sellerService.likeReview(sellerId, reviewId)
      
      if (response.success && response.data) {
        // Update the review in the local state
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === reviewId 
              ? { 
                  ...review, 
                  helpfulVotes: response.data!.helpfulVotes,
                  isLikedByCurrentUser: response.data!.isLiked
                }
              : review
          )
        )
        
        // Show success message
        const actionMessage = response.data.isLiked ? 'Review liked!' : 'Review unliked!'
        showToast(actionMessage, 'success')
      } else {
        // Handle API errors
        showToast(response.message || 'Failed to like review', 'error')
      }
    } catch (error) {
      console.error('Error liking review:', error)
      
      // Handle different error types
      if (error instanceof Error) {
        if (error.message.includes('cannot like your own review')) {
          showToast('You cannot like your own review', 'info')
        } else if (error.message.includes('Authentication required')) {
          showToast('Please sign in to like reviews', 'info')
        } else if (error.message.includes('not found')) {
          showToast('Review not found', 'error')
        } else {
          showToast(error.message || 'Failed to like review. Please try again.', 'error')
        }
      } else {
        showToast('An unexpected error occurred. Please try again.', 'error')
      }
    }
  }

  const renderReviewCard = (review: SellerReview) => {
    return (
      <div key={review._id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {review.buyer.avatar ? (
              <Image 
                src={review.buyer.avatar} 
                alt={review.buyer.fullName}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {review.buyer.fullName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground">
                  {review.buyer.fullName}
                </span>
                {review.isVerified && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium">
                    Verified Purchase
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {renderStars(review.rating, 'sm')}
                <span className="text-sm text-muted-foreground">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleLikeReview(review._id)}
              disabled={review.isOwnReview || !user}
              className={`flex items-center gap-1 px-3 py-1 text-sm transition-colors ${
                review.isOwnReview 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : review.isLikedByCurrentUser
                    ? 'text-blue-600 hover:text-blue-700'
                    : 'text-muted-foreground hover:text-foreground'
              }`}
              title={
                review.isOwnReview 
                  ? 'You cannot like your own review' 
                  : review.isLikedByCurrentUser 
                    ? 'Unlike this review' 
                    : 'Like this review'
              }
            >
              {review.isLikedByCurrentUser ? (
                <Heart className="w-4 h-4 fill-current text-red-500" />
              ) : (
                <ThumbsUp className="w-4 h-4" />
              )}
              {review.helpfulVotes}
            </button>
          </div>
        </div>

        {review.title && (
          <h4 className="font-semibold text-foreground mb-2">
            {review.title}
          </h4>
        )}

        <p className="text-foreground leading-relaxed mb-4">
          {review.text}
        </p>

        {review.sellerReply && (
          <div className="mt-4 p-4 bg-secondary/20 rounded-lg border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Seller Reply</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(review.sellerReply.createdAt)}
              </span>
            </div>
            <p className="text-foreground">
              {review.sellerReply.text}
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderReviewForm = () => {
    if (!user || user.role !== 'buyer') {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Please sign in as a buyer to leave a review
          </p>
        </div>
      )
    }

    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">Write a Review</h3>
        
        <form onSubmit={handleSubmitReview} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rating *
            </label>
            {renderInteractiveStars(reviewFormData.rating, (rating) => 
              setReviewFormData((prev: CreateReviewRequest) => ({ ...prev, rating }))
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {reviewFormData.rating > 0 ? `${reviewFormData.rating} star${reviewFormData.rating > 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
            {formErrors.rating && (
              <p className="text-red-500 text-sm mt-1">{formErrors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              value={reviewFormData.title}
              onChange={(e) => setReviewFormData((prev: CreateReviewRequest) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Summary of your experience"
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Review *
            </label>
            <textarea
              value={reviewFormData.text}
              onChange={(e) => setReviewFormData((prev: CreateReviewRequest) => ({ ...prev, text: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Share your experience with this seller..."
            />
            <div className="flex items-center justify-between mt-1">
              {formErrors.text && (
                <p className="text-red-500 text-sm">{formErrors.text}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {reviewFormData.text.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmittingReview ? (
                <Spinner size="sm" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const visiblePages = []
    const maxVisible = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i)
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={cn(
              "px-3 py-2 rounded-lg transition-colors",
              currentPage === page
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-secondary"
            )}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-foreground">
          Reviews ({ratingFilter === 'all' ? totalReviews : `${filteredReviews.length} of ${totalReviews}`})
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={ratingFilter}
              onChange={(e) => handleRatingFilterChange(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {ratingFilters.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Write Review Button */}
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Write Review
          </button>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && renderReviewForm()}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchReviews}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {ratingFilter === 'all' ? 'No reviews yet' : `No ${ratingFilter}-star reviews`}
          </h3>
          <p className="text-muted-foreground">
            {ratingFilter === 'all' 
              ? 'Be the first to review this seller'
              : 'Try selecting a different rating filter'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredReviews.map(renderReviewCard)}
          </div>
          
          {renderPagination()}
        </>
      )}

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={closeToast}
          duration={4000}
        />
      )}
    </div>
  )
} 