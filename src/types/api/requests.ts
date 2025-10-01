/**
 * API Request types
 * 
 * Standardized request interfaces for all API endpoints
 */

import { MediaType, ListingType, MarketTrend, InvestmentGrade, NotificationMetadata } from '../entities'

/**
 * Base query parameters
 */
export interface BaseQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Bid request interfaces
 */
export interface PlaceBidRequest {
  gemId: string
  amount: number
  isProxy?: boolean
  maxAmount?: number
  proxyMaxBid?: number
}

export interface UpdateBidRequest {
  amount?: number
  maxAmount?: number
  notes?: string
}

/**
 * Gem query interface
 */
export interface GemListQuery extends BaseQuery {
  status?: string
  gemType?: string
  gemTypes?: string[]
  color?: string
  colors?: string[]
  shapeCut?: string
  shapes?: string[]
  clarity?: string
  origin?: string
  origins?: string[]
  minPrice?: number
  maxPrice?: number
  minWeight?: number
  maxWeight?: number
  minCarat?: number
  maxCarat?: number
  rarity?: string
  rarities?: string[]
  labCertified?: boolean
  treatments?: string
  investmentGrade?: string
  investmentGrades?: string[]
  fluorescence?: string
  polish?: string
  symmetry?: string
  listingType?: ListingType
  featured?: boolean
}

/**
 * Gem creation request
 */
export interface CreateGemRequest {
  // Lab Report Information
  reportNumber: string
  labName: string
  certificateDate?: string
  
  // Basic Gem Information
  gemType: string
  variety?: string
  weight: { value: number; unit: 'ct' | 'g' }
  dimensions?: { length: string; width: string; height: string; unit: 'mm' | 'cm' }
  shapeCut?: string
  color: string
  clarity: string
  origin: string
  treatments?: string
  additionalComments?: string
  
  // Advanced Certificate Details (optional)
  fluorescence?: string
  fluorescenceColor?: string
  polish?: string
  symmetry?: string
  girdle?: string
  culet?: string
  depth?: string
  table?: string
  crownAngle?: string
  pavilionAngle?: string
  crownHeight?: string
  pavilionDepth?: string
  starLength?: string
  lowerHalf?: string
  
  // Market Information (optional)
  pricePerCarat?: string
  marketTrend?: MarketTrend
  investmentGrade?: InvestmentGrade
  rapnetPrice?: string
  discount?: string
  
  // Additional Details (optional)
  laserInscription?: string
  memo?: boolean
  consignment?: boolean
  stockNumber?: string
  
  // Listing Information
  listingType: ListingType
  price?: number
  startingBid?: number
  reservePrice?: number
  auctionDuration?: string
  shippingMethod: 'seller-fulfilled' | 'ishq-gems-logistics' | 'in-person-via-ishq-gems'
  
  // Media information
  mediaFiles: Array<{
    s3Key: string
    type: MediaType
    filename: string
    fileSize: number
    mimeType: string
    isPrimary?: boolean
    order?: number
  }>
}

/**
 * Gem update request
 */
export interface UpdateGemRequest extends Partial<CreateGemRequest> {
  // Edit mode: media deletion support
  deletedMediaIds?: string[]
}

/**
 * File upload request
 */
export interface FileUploadRequest {
  fileName: string
  fileType: string
  fileSize: number
  mediaType: MediaType
  gemId: string
}

/**
 * S3 upload response
 */
export interface S3UploadResponse {
  fileName: string
  uploadUrl: string
  s3Key: string
  mediaType: string
}

/**
 * Notification creation request
 */
export interface CreateNotificationRequest {
  recipientId: string
  type: 'order' | 'bid' | 'message' | 'listing' | 'system' | 'seller' | 'admin'
  title: string
  message: string
  link?: string
  icon?: string
  metadata?: NotificationMetadata
}

/**
 * User profile update request
 */
export interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  bio?: string
}

/**
 * Review creation requests
 */
export interface CreateReviewRequest {
  rating: number
  title?: string
  text: string
  orderId?: string
}

export interface CreatePlatformReviewRequest {
  rating: number
  text: string
  name: string
  location: string
}

/**
 * Seller review queries
 */
export interface SellerReviewQuery extends BaseQuery {
  sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'
}

/**
 * Seller gems query
 */
export interface SellerGemsQuery extends BaseQuery {
  sort?: 'newest' | 'oldest' | 'price_high' | 'price_low'
}

/**
 * Admin bid filters
 */
export interface AdminBidFilters extends BaseQuery {
  gemId?: string
  userId?: string
  status?: string
  sortBy?: 'amount' | 'placedAt'
}

/**
 * Auction options
 */
export interface AuctionOptions {
  includeAdminData?: boolean
}

/**
 * Notification query options
 */
export interface NotificationQuery extends BaseQuery {
  unreadOnly?: boolean
  type?: string
} 