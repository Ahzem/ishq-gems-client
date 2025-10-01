/**
 * Seller entity types and interfaces
 */

import { BaseEntity } from '../common/base'
import { MediaType, ListingType } from './gem'

/**
 * Public seller profile interface
 */
export interface PublicSellerProfile {
  id: string
  fullName: string
  avatar: string | null
  isVerified: boolean
  memberSince: Date
  yearsOfExperience: string
  gemstoneTypes: string[]
  hasNGJALicense: boolean
  preferredLanguage: string
  totalGems: number
  rating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  responseTime: string
  languages: string[]
  specializations: string[]
  supplierType: string
  // Store settings
  storeSettings?: {
    storeName: string
    storeSlogan: string
    storeDescription: string
    primaryColor: string
    secondaryColor: string
    logoUrl: string | null
    bannerUrl: string | null
  }
}

/**
 * Seller review interface
 */
export interface SellerReview {
  _id: string
  rating: number
  title?: string
  text: string
  isVerified: boolean
  createdAt: Date
  helpfulVotes: number
  isLikedByCurrentUser: boolean
  isOwnReview: boolean
  sellerReply?: {
    text: string
    createdAt: Date
  }
  buyer: {
    id: string
    displayName: string
    fullName: string
    avatar: string | null
  }
}

/**
 * Seller gem interface
 */
export interface SellerGem {
  _id: string
  gemType: string
  color: string
  weight: { value: number; unit: string }
  price?: number
  listingType: ListingType
  startingBid?: number
  origin: string
  clarity: string
  status: 'draft' | 'active' | 'sold' | 'inactive' | 'pending' | 'verified' | 'rejected' | 'published'
  submittedAt: Date
  views: number
  media: Array<{
    _id: string
    type: MediaType
    url: string
    isPrimary: boolean
    order: number
  }>
}

/**
 * Seller statistics interface
 */
export interface SellerStats {
  totalListings: number
  totalSales: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
  responseRate: number
  joinDate: Date
}

/**
 * Seller application interface
 */
export interface SellerApplication extends BaseEntity {
  userId: string
  businessType: 'individual' | 'company'
  yearsOfExperience: string
  gemstoneTypes: string[]
  hasNGJALicense: boolean
  preferredLanguage: string
  languages: string[]
  specializations: string[]
  supplierType: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  rejectionReason?: string
  documents: SellerDocument[]
}

/**
 * Seller document interface
 */
export interface SellerDocument {
  _id: string
  type: 'identity' | 'business_license' | 'tax_certificate' | 'ngja_license' | 'other'
  filename: string
  url: string
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: Date
  reviewedAt?: Date
  rejectionReason?: string
}

/**
 * Seller verification interface
 */
export interface SellerVerification {
  isVerified: boolean
  verifiedAt?: Date
  verifiedBy?: string
  verificationLevel: 'basic' | 'enhanced' | 'premium'
  documents: SellerDocument[]
  notes?: string
}

/**
 * Seller metrics interface
 */
export interface SellerMetrics {
  period: 'week' | 'month' | 'quarter' | 'year'
  sales: {
    total: number
    count: number
    average: number
  }
  listings: {
    total: number
    active: number
    sold: number
    pending: number
  }
  performance: {
    viewsPerListing: number
    conversionRate: number
    averageTimeToSell: number
  }
  reviews: {
    averageRating: number
    totalReviews: number
    recentReviews: number
  }
}

/**
 * Seller dashboard data interface
 */
export interface SellerDashboardData {
  profile: PublicSellerProfile
  stats: SellerStats
  metrics: SellerMetrics
  recentActivity: Array<{
    type: 'listing' | 'sale' | 'review' | 'message'
    title: string
    description: string
    timestamp: Date
    link?: string
  }>
  notifications: Array<{
    id: string
    type: 'order' | 'review' | 'message' | 'system'
    title: string
    message: string
    read: boolean
    createdAt: Date
  }>
}

/**
 * Seller service configuration interface
 */
export interface SellerServiceConfig {
  baseUrl: string
  retryOptions: {
    maxRetries: number
    retryCondition: (error: unknown) => boolean
  }
  cacheOptions: {
    sellerProfileTtl: number
    sellerReviewsTtl: number
    sellerGemsTtl: number
    sellerAnalyticsTtl: number
    sellerFollowersTtl: number
    applicationStatusTtl: number
    managementReviewsTtl: number
  }
  validation: {
    maxReviewTextLength: number
    maxReplyTextLength: number
    maxFlagReasonLength: number
    maxBusinessNameLength: number
    maxDescriptionLength: number
    maxSpecialtiesCount: number
    minPasswordLength: number
    minTokenLength: number
    maxPageLimit: number
  }
}

/**
 * Seller service state interface
 */
export interface SellerServiceState {
  startTime: number
  lastError?: string
}

/**
 * Seller application status response
 */
export interface SellerApplicationStatusResponse {
  id: string
  fullName: string
  email: string
  status: 'pending' | 'verified' | 'rejected'
  applicationDate: string
  applicationMode?: 'new' | 'buyer-upgrade'
  reviewedAt?: string
  rejectionReason?: string
  videoCallCompleted?: boolean
  accountCreated?: boolean
}

/**
 * Seller setup token verification response
 */
export interface SellerSetupTokenResponse {
  fullName: string
  email: string
  expiresAt: string
} 