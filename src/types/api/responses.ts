/**
 * API Response types
 * 
 * Standardized response interfaces for all API endpoints
 */

import { GemMetadata, EnhancedGem, BidData, Notification, GemMedia, PlatformReview } from '../entities'
import { SellerGem, SellerReview } from '../entities/seller'

/**
 * Gem list response interface (flexible structure)
 */
export interface GemListResponse {
  total: number
  success: boolean
  data: {
    gems: EnhancedGem[]
    pagination: {
      total: number
      pages: number
      page: number
      limit: number
    }
    summary?: {
      totalGems: number
      statusBreakdown: Record<string, number>
    }
  }
  message?: string
}

/**
 * Alternative gem list response structure (direct format)
 * Used when API returns gems directly without nested pagination object
 */
export interface DirectGemListResponse {
  gems: EnhancedGem[]
  total: number
  page: number
  totalPages: number
}

/**
 * Flexible gem list response data that handles both structures
 */
export type FlexibleGemListResponseData = 
  | DirectGemListResponse  // Direct structure: { gems: [...], total: 1, page: 1, totalPages: 1 }
  | { data: { gems: EnhancedGem[]; pagination: { total: number; pages?: number; totalPages?: number } } } // Nested structure

/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message: string
  error?: string
}

/**
 * API response with validation error details
 */
export interface ApiValidationErrorResponse<T = unknown> extends ApiResponse<T> {
  details?: Array<{
    field?: string
    message: string
  }>
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    total: number
    page: number
    totalPages: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  message: string
}

/**
 * Admin gem response interface
 */
export interface AdminGemResponse {
  _id: string
  gemType: string
  color: string
  weight: { value: number; unit: string }
  price?: number
  status: 'pending' | 'verified' | 'rejected' | 'published' | 'sold'
  listingType: 'direct-sale' | 'auction'
  views: number
  submittedAt: string
  published?: boolean
  isPlatformGem: boolean
  sellerType: 'Ishq'
  seller: {
    id: string
    name: string
    verified: boolean
    rating: number
    totalReviews: number
    location: string
  }
  media?: Array<{
    _id: string
    type: 'image' | 'video' | 'lab-report'
    url: string
    isPrimary: boolean
    order: number
  }>
}

/**
 * Admin gems list response
 */
export interface AdminGemsListResponse {
  success: boolean
  data?: {
    gems: AdminGemResponse[]
    total: number
    page: number
    totalPages: number
  }
  message?: string
}

/**
 * Bid response interface
 */
export interface BidResponse {
  success: boolean
  data?: BidData
  message?: string
}

/**
 * Bid list response
 */
export interface BidListResponse {
  success: boolean
  data?: {
    bids: BidData[]
    total: number
    page: number
    totalPages: number
  }
  message?: string
}

/**
 * Bid statistics response
 */
export interface BidStatsResponse {
  success: boolean
  data?: {
    totalBids: number
    highestBid: number
    hasActiveBids: boolean
    isFinalized: boolean
  }
  message?: string
}



/**
 * Lab report extraction response
 */
export interface LabReportExtractionResponse {
  success: boolean
  data?: GemMetadata
  meta?: {
    filename: string
    s3Key: string
    s3Url: string
    extractedTextLength: number
    keyValuePairsCount: number
  }
  message?: string
  error?: string
}

/**
 * Extraction info response
 */
export interface ExtractionInfoResponse {
  success: boolean
  data?: {
    supportedFormats: string[]
    maxFileSize: string
    maxFileSizeBytes: number
    supportedLabs: string[]
    extractableFields: string[]
  }
  message?: string
}

/**
 * Job progress response
 */
export interface JobProgress {
  jobId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number // 0-100
  message: string
  gemId?: string
  error?: string
  steps: {
    validating: boolean
    creatingGem: boolean
    processingMedia: boolean
    finalizing: boolean
  }
}

/**
 * Notification response
 */
export interface NotificationResponse {
  success: boolean
  data?: {
    notifications: Notification[]
    total: number
    unreadCount: number
    page: number
    totalPages: number
  }
  message?: string
  error?: string
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  success: boolean
  data?: {
    count: number
  }
  message?: string
  error?: string
}

/**
 * Reviews response
 */
export interface ReviewsResponse {
  success: boolean
  message: string
  data?: {
    reviews: PlatformReview[]
    pagination?: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  error?: string
}

/**
 * Review stats response
 */
export interface ReviewStatsResponse {
  success: boolean
  message: string
  data?: {
    totalReviews: number
    averageRating: number
    ratingDistribution: {
      1: number
      2: number
      3: number
      4: number
      5: number
    }
  }
  error?: string
}

/**
 * Invoice data response
 */
export interface InvoiceDataResponse {
  orderNumber: string
  orderDate: string
  customer: {
    name: string
    email: string
    phone?: string
    address?: {
      street: string
      city: string
      state: string
      country: string
      zipCode: string
    }
  }
  items: Array<{
    name: string
    gemType: string
    color: string
    weight: number
    reportNumber?: string
    sellerName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  payment: {
    method: string
    status: string
    transactionId: string
    hasReceipt: boolean
  }
  totals: {
    subtotal: number
    shipping: number
    taxes: number
    total: number
  }
  status: string
} 

/**
 * Backend gem response interface
 */
export interface BackendGem {
  _id: string
  gemType: string
  variety?: string
  color: string
  weight: {
    value: number
    unit: string
  }
  dimensions?: {
    length: number
    width: number
    height: number
    unit: string
  }
  shapeCut?: string
  clarity: string
  origin: string
  treatments?: string
  price?: number
  startingBid?: number
  reservePrice?: number
  listingType: 'direct-sale' | 'auction'
  status: string
  reportNumber?: string
  labName?: string
  additionalComments?: string
  auctionStartTime?: string
  auctionEndTime?: string
  currentHighestBid?: number
  totalBids?: number
  auctionStatus?: string
  finalizedBidId?: string
  media?: GemMedia[]
  labReportId?: {
    _id: string
    url: string
    filename?: string
  } | string
  sellerId: {
    _id: string
    fullName: string
    email: string
    verified?: boolean
    sellerApplicationId?: {
      _id: string
    }
  }
  investmentGrade?: string
}

/**
 * Seller-specific API response interfaces
 */

/**
 * Seller reviews response interface
 */
export interface SellerReviewsResponse {
  reviews: SellerReview[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * Seller gems response interface  
 */
export interface SellerGemsResponse {
  gems: SellerGem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * Review like response interface
 */
export interface ReviewLikeResponse {
  reviewId: string
  isLiked: boolean
  helpfulVotes: number
}

/**
 * Follow response interface
 */
export interface FollowResponse {
  isFollowing: boolean
  followersCount: number
}

/**
 * Followers response interface
 */
export interface FollowersResponse {
  followers: Array<{
    id: string
    fullName: string
    avatar?: string
    followedAt: string
  }>
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}