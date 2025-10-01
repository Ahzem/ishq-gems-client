/**
 * Marketplace entity types and interfaces
 * 
 * UI-specific types for marketplace components and pages
 */

import { MediaType, ListingType } from './gem'
import { AuctionStatus } from './bid'

/**
 * Seller type classification
 */
export type SellerType = 'Platform' | 'Third-Party'

/**
 * Gem image for marketplace display
 */
export interface MarketplaceGemImage {
  url: string
  alt: string
}

/**
 * Gem media for marketplace display
 */
export interface MarketplaceGemMedia {
  _id: string
  type: MediaType
  url: string
  isPrimary: boolean
  order: number
}

/**
 * Lab report reference for marketplace
 */
export interface MarketplaceLabReport {
  _id: string
  url: string
  filename: string
}

/**
 * Seller information for marketplace display
 */
export interface MarketplaceSeller {
  _id: string
  email: string
  verified?: boolean
}

/**
 * Seller details for marketplace display
 */
export interface MarketplaceSellerDetails {
  id: string
  storeSettings: {
    storeName: string
    storeSlogan?: string
    storeDescription?: string
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string | null
    bannerUrl?: string | null
  }
  verified: boolean
  type: SellerType
  rating: number
  totalReviews: number
  yearsInBusiness: number
  location: string
}

/**
 * Comprehensive gem data interface for marketplace detail pages
 * 
 * This interface combines backend gem data with UI-specific display properties
 */
export interface GemData {
  _id: string
  id: string // UI-friendly ID
  gemType: string
  variety?: string
  color: string
  weight: { value: number; unit: string }
  dimensions?: { length: string; width: string; height: string; unit: string }
  shapeCut?: string
  clarity: string
  origin: string
  treatments?: string
  price?: number
  startingBid?: number
  reservePrice?: number
  listingType: ListingType
  status: string
  reportNumber: string
  labName: string
  additionalComments?: string
  
  // Auction-specific fields
  auctionStartTime?: string
  auctionEndTime?: string
  currentHighestBid?: number
  totalBids?: number
  auctionStatus?: AuctionStatus
  finalizedBidId?: string
  
  // Media references
  media?: MarketplaceGemMedia[]
  labReportId?: MarketplaceLabReport
  sellerId: MarketplaceSeller
  
  // Enhanced properties for display (required for UI)
  name: string
  carat: string
  rarity: string
  location: string
  category: string
  description: string
  views?: number
  images: MarketplaceGemImage[]
  videoUrl?: string
  hasLabReport: boolean
  labReportUrl?: string
  specifications: Record<string, string>
  seller: MarketplaceSellerDetails
} 