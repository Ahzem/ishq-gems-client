/**
 * Review entity types and interfaces
 */

import { BaseEntity } from '../common/base'

/**
 * Platform review interface
 */
export interface PlatformReview extends BaseEntity {
  userId: string
  rating: number
  text: string
  name: string
  location: string
  isVerified: boolean
  helpfulVotes: number
  isLikedByCurrentUser?: boolean
  isOwnReview?: boolean
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  rejectionReason?: string
  metadata?: {
    userAgent?: string
    ipAddress?: string
    source?: string
  }
}

/**
 * Review statistics interface
 */
export interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  recentReviews: number
  verifiedReviews: number
}

/**
 * Review moderation interface
 */
export interface ReviewModeration {
  reviewId: string
  action: 'approve' | 'reject' | 'flag'
  reason?: string
  moderatorId: string
  moderatedAt: Date
  notes?: string
}

/**
 * Review filter options
 */
export interface ReviewFilters {
  rating?: number
  verified?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  status?: 'pending' | 'approved' | 'rejected'
  location?: string
  sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'
}

/**
 * Review analytics interface
 */
export interface ReviewAnalytics {
  period: 'week' | 'month' | 'quarter' | 'year'
  metrics: {
    totalReviews: number
    averageRating: number
    ratingTrend: number // percentage change
    responseRate: number
    averageResponseTime: number
  }
  breakdown: {
    byRating: Record<number, number>
    byLocation: Record<string, number>
    bySource: Record<string, number>
  }
  topReviews: PlatformReview[]
}

/**
 * Review notification interface
 */
export interface ReviewNotification {
  id: string
  type: 'new_review' | 'review_approved' | 'review_rejected' | 'review_flagged'
  reviewId: string
  review: PlatformReview
  message: string
  read: boolean
  createdAt: Date
} 

/**
 * Flagged review interface
 */
export interface FlaggedReview {
  _id: string
  rating: number
  comment: string
  reviewerName: string
  reviewerEmail: string
  gemId: string
  gemName: string
  createdAt: string
  flaggedAt?: string
  flaggedBy?: string
  flaggedReason?: string
  status: 'flagged' | 'resolved' | 'approved' | 'rejected'
  resolvedAt?: string
  resolvedBy?: string
  // Additional fields for UI compatibility
  title?: string
  text?: string
  isVerified?: boolean
  buyer?: {
    displayName: string
  }
  seller?: {
    id: string
    fullName: string
    email: string
  }
  sellerReply?: {
    text: string
    createdAt: string
  }
}

/**
 * Review service configuration
 */
export interface ReviewServiceConfig {
  baseUrl: string
  retryOptions: {
    maxRetries: number
    delay: number
    backoff: boolean
    retryCondition: (error: unknown) => boolean
  }
  cacheOptions: {
    reviewsTtl: number
    statsTtl: number
    platformReviewsTtl: number
  }
  validation: {
    maxReviewTextLength: number
    minReviewTextLength: number
    maxNameLength: number
    maxLocationLength: number
    minRating: number
    maxRating: number
    maxPageSize: number
    minPageSize: number
  }
}

/**
 * Review service internal state
 */
export interface ReviewServiceState {
  startTime: number
  lastError: Error | null
  requestCount: number
  cacheHits: number
  cacheMisses: number
}

/**
 * Review query parameters
 */
export interface ReviewQueryParams {
  page?: number
  limit?: number
  sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'
  rating?: number
  verified?: boolean
  status?: 'pending' | 'approved' | 'rejected'
  dateRange?: {
    start: string
    end: string
  }
}

/**
 * Create platform review response
 */
export interface CreatePlatformReviewResponse {
  reviewId: string
  rating: number
  createdAt: string
  status: 'pending' | 'approved'
  message?: string
}