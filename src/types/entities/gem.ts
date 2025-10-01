/**
 * Gem entity types and interfaces
 */

import { BaseEntity } from '../common/base'
import { JobProgress } from '../api/responses'

/**
 * Gem categories
 */
export type GemCategory = 
  | 'precious_stones'
  | 'semi_precious'
  | 'jewelry'
  | 'vintage'
  | 'custom'

/**
 * Gem types
 */
export type GemType = 
  | 'diamond'
  | 'emerald'
  | 'ruby'
  | 'sapphire'
  | 'pearl'
  | 'amethyst'
  | 'topaz'
  | 'garnet'
  | 'opal'
  | 'other'

/**
 * Gem status
 */
export type GemStatus = 'draft' | 'active' | 'sold' | 'inactive' | 'pending' | 'verified' | 'rejected' | 'published'

/**
 * Listing types
 */
export type ListingType = 'direct-sale' | 'auction'

/**
 * Investment grades
 */
export type InvestmentGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C'

/**
 * Market trends
 */
export type MarketTrend = 'Rising' | 'Stable' | 'Declining'

/**
 * Weight units
 */
export type WeightUnit = 'ct' | 'g'

/**
 * Dimension units
 */
export type DimensionUnit = 'mm' | 'cm'

/**
 * Media types
 */
export type MediaType = 'image' | 'video' | 'lab-report'

/**
 * Gem weight structure
 */
export interface GemWeight {
  value: number
  unit: WeightUnit
}

/**
 * Gem dimensions structure
 */
export interface GemDimensions {
  length: string
  width: string
  height: string
  unit: DimensionUnit
}

/**
 * Gem specifications
 */
export interface GemSpecifications {
  weight: number // in carats
  cut: string
  color: string
  clarity: string
  dimensions: {
    length: number
    width: number
    height: number
  }
  origin?: string
  treatment?: string
}

/**
 * Gem media/image interface
 */
export interface GemImage {
  url: string
  alt: string
  isPrimary: boolean
  publicId: string // Cloudinary public ID
}

/**
 * Enhanced gem media interface
 */
export interface GemMedia {
  _id: string
  type: MediaType
  url: string
  isPrimary?: boolean
  order: number
  filename: string
  fileSize: number
  mimeType: string
  uploadedAt: string
}

/**
 * Gem certification information
 */
export interface Certification {
  authority: string
  certificateNumber: string
  documentUrl: string
  issuedDate: string
  expiryDate?: string
}

/**
 * Basic gem entity
 */
export interface Gem extends BaseEntity {
  title: string
  description: string
  price: number
  category: GemCategory
  type: GemType
  images: GemImage[]
  specifications: GemSpecifications
  certification?: Certification
  sellerId: string
  status: GemStatus
  featured: boolean
  published: boolean
  views: number
  likes: number
  tags: string[]
}

/**
 * Complete seller information for gems
 */
export interface GemSeller {
  _id: string
  email: string
  verified: boolean
  rating: number
  totalReviews: number
  location: string
  yearsInBusiness?: number
  // Store settings - the only source of seller display info for buyers
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

/**
 * Seller statistics interface
 */
export interface SellerStats {
  averageRating: number
  totalReviews: number
  totalSales?: number
  responseRate?: number
  responseTime?: number
}

/**
 * Enhanced gem interface with complete data
 */
export interface EnhancedGem extends BaseEntity {
  // Lab Report Information
  reportNumber: string
  labName: string
  certificateDate?: string
  
  // Basic Gem Information
  gemType: string
  variety?: string
  weight: GemWeight
  dimensions?: GemDimensions
  shapeCut?: string
  color: string
  clarity: string
  origin: string
  treatments?: string
  additionalComments?: string
  
  // Advanced Certificate Details
  fluorescence?: string
  fluorescenceColor?: string
  polish?: string
  symmetry?: string
  girdle?: string
  culet?: string
  depth?: string
  table?: string
  
  // Market Information
  pricePerCarat?: string
  marketTrend?: MarketTrend
  investmentGrade?: InvestmentGrade
  
  // Listing Information
  listingType: ListingType
  price?: number
  startingBid?: number
  reservePrice?: number
  shippingMethod: string
  
  // Auction-specific fields
  auctionStartTime?: string
  auctionEndTime?: string
  currentHighestBid?: number
  totalBids?: number
  auctionStatus?: 'not-started' | 'active' | 'ending-soon' | 'ended'
  finalizedBidId?: string
  auctionDuration?: string
  
  // Seller Information - now with complete data
  sellerId: GemSeller
  sellerType?: 'Platform' | 'Third-Party'
  sellerStats?: SellerStats
  
  // Media and Status
  media: GemMedia[]
  labReportId?: string | {
    _id: string
    url: string
    filename?: string
  }
  status: GemStatus
  featured: boolean
  published: boolean
  views: number
  likes: number
  submittedAt: string
  
  // Order and Purchase Tracking
  orderId?: string // Reference to order when gem is sold
  buyerId?: string // Reference to buyer when gem is sold
  soldAt?: string // When the gem was sold
  soldPrice?: number // Final sale price
}

/**
 * Gem metadata interface
 */
export interface GemMetadata {
  reportNumber?: string
  labName?: string
  gemType?: string
  variety?: string
  weight?: GemWeight
  dimensions?: GemDimensions
  shapeCut?: string
  color?: string
  clarity?: string
  origin?: string
  treatments?: string
  certificateDate?: string
  additionalComments?: string
}

/**
 * Admin gem data interface
 */
export interface AdminGemData {
  // Lab Report Information
  reportNumber: string
  labName: string
  certificateDate?: string
  
  // Basic Gem Information
  gemType: string
  variety?: string
  weight: GemWeight
  dimensions?: GemDimensions
  shapeCut?: string
  color: string
  clarity: string
  origin: string
  treatments?: string
  additionalComments?: string
  
  // Admin-specific fields
  isPlatformGem: boolean
  sellerType: 'Ishq'
  adminSubmitted: boolean
  autoVerified: boolean
  
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
    isPrimary: boolean
    order: number
  }>
}

/**
 * Gem service health check response
 */
export interface GemHealthCheckResponse {
  success: boolean
  message: string
  timestamp: string
  services?: Record<string, string>
}

/**
 * Lab report deletion response
 */
export interface LabReportDeleteResponse {
  success: boolean
  message?: string
}

/**
 * S3 upload URL generation response
 */
export interface GenerateUploadUrlsResponse {
  success: boolean
  data: S3UploadResponse[]
  message?: string
}

/**
 * S3 upload response interface
 */
export interface S3UploadResponse {
  fileName: string
  uploadUrl: string
  s3Key: string
  mediaType: string
}

/**
 * Gem creation response
 */
export interface CreateGemResponse {
  success: boolean
  data: EnhancedGem
  message: string
}

/**
 * Gem async submission response
 */
export interface SubmitGemAsyncResponse {
  success: boolean
  data?: {
    jobId: string
    status: string
    message: string
  }
  message: string
}

/**
 * Job status response
 */
export interface JobStatusResponse {
  success: boolean
  data?: JobProgress
  message: string
}



/**
 * Refresh media URLs response
 */
export interface RefreshMediaUrlsResponse {
  success: boolean
  data?: {
    media: Array<{
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
    } | null
  }
  message?: string
}

/**
 * Gem details response
 */
export interface GemDetailsResponse {
  success: boolean
  data?: {
    _id: string
    gemType: string
    color: string
    name: string
    weight: { value: number; unit: string }
    media?: Array<{
      _id: string
      type: string
      url: string
      isPrimary: boolean
    }>
  }
  message?: string
}

/**
 * File upload request interface
 */
export interface FileUploadRequest {
  fileName: string
  fileType: string
  mediaType: MediaType
}

/**
 * Create gem request interface
 */
export interface CreateGemRequest {
  // Lab Report Information
  reportNumber: string
  labName: string
  certificateDate?: string
  
  // Basic Gem Information
  gemType: string
  variety?: string
  weight: GemWeight
  dimensions?: GemDimensions
  shapeCut?: string
  color: string
  clarity: string
  origin: string
  treatments?: string
  additionalComments?: string
  
  // Listing Information
  listingType: ListingType
  price?: number
  startingBid?: number
  reservePrice?: number
  auctionDuration?: string
  shippingMethod: string
  
  // Media information
  mediaFiles: Array<{
    s3Key: string
    type: MediaType
    filename: string
    fileSize: number
    mimeType: string
    isPrimary: boolean
    order: number
  }>
}

/**
 * Update gem request interface
 */
export interface UpdateGemRequest {
  // Basic Gem Information
  gemType?: string
  variety?: string
  weight?: GemWeight
  dimensions?: GemDimensions
  shapeCut?: string
  color?: string
  clarity?: string
  origin?: string
  treatments?: string
  additionalComments?: string
  
  // Listing Information
  listingType?: ListingType
  price?: number
  startingBid?: number
  reservePrice?: number
  auctionDuration?: string
  shippingMethod?: string
  
  // Status
  published?: boolean
  status?: GemStatus
}

/**
 * Lab report extraction response
 */
export interface LabReportExtractionResponse {
  success: boolean
  data?: GemMetadata
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
    maxFileSize: number
    processingTime: string
    accuracy: string
  }
  message?: string
}

/**
 * Gem service configuration
 */
export interface GemServiceConfig {
  baseUrl: string
  retryOptions: {
    maxRetries: number
    retryCondition: (error: unknown) => boolean
  }
  cacheOptions: {
    healthCheckTtl: number
    extractionInfoTtl: number
    jobStatusTtl: number
    myGemsTtl: number
    allGemsTtl: number
    filterOptionsTtl: number
    gemDetailsTtl: number
    pendingGemsTtl: number
  }
  validation: {
    maxLabReportSize: number
    allowedLabReportTypes: string[]
    maxFileUploadCount: number
    maxGemPrice: number
  }
}

/**
 * Gem service state interface
 */
export interface GemServiceState {
  startTime: number
  lastError?: string
}

/**
 * Gem list query parameters
 */
export interface GemListQuery {
  // Pagination
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  
  // Basic filters
  status?: string
  sellerId?: string
  
  // Single value filters
  gemType?: string
  color?: string
  shapeCut?: string
  clarity?: string
  origin?: string
  treatments?: string
  investmentGrade?: string
  fluorescence?: string
  polish?: string
  symmetry?: string
  listingType?: 'direct-sale' | 'auction'
  rarity?: string
  
  // Multi-value filters (arrays)
  gemTypes?: string[]
  colors?: string[]
  shapes?: string[]
  origins?: string[]
  rarities?: string[]
  investmentGrades?: string[]
  
  // Range filters
  minPrice?: number
  maxPrice?: number
  minWeight?: number
  maxWeight?: number
  minCarat?: number
  maxCarat?: number
  
  // Boolean filters
  labCertified?: boolean
  featured?: boolean
  
  // Text search
  search?: string
}

/**
 * Gem list response
 */
export interface GemListResponse {
  gems: EnhancedGem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters?: {
    appliedFilters: Record<string, unknown>
    availableFilters: Record<string, string[]>
  }
} 