/**
 * Cart and wishlist entity types and interfaces
 */

import { ListingType } from './gem'

/**
 * Seller information for cart items
 */
export interface CartSeller {
  id: string
  name: string // Store name only - derived from storeSettings
  verified: boolean
  rating: number
  totalReviews: number
  location: string
  // Store settings - the only source of seller display info for buyers
  storeSettings: {
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
 * Cart item interface
 */
export interface CartItem {
  id: string
  name: string
  price: string
  priceNumber: number
  image: string
  carat?: string
  rarity?: string
  location: string
  quantity: number
  seller: CartSeller
  gemType?: string
  color?: string
  clarity?: string
  origin?: string
  weight?: {
    value: number
    unit: string
  }
  listingType?: ListingType
  labCertified?: boolean
}

/**
 * Wishlist item interface
 */
export interface WishlistItem {
  id: string
  gemId?: string // Add gemId for API compatibility
  name: string
  type: string
  price: string
  priceNumber: number
  location: string
  image: string
  carat: string
  rarity: string
  color?: string
  clarity?: string
  cut?: string
  treatment?: string
  labCertified?: boolean
  seller?: {
    name: string // Store name only
    verified: boolean
    rating: number
    totalReviews: number
  }
  dateAdded: string
}

/**
 * Wishlist service configuration
 */
export interface WishlistServiceConfig {
  baseUrl: string
  retryOptions: {
    maxRetries: number
    delay: number
    backoff: boolean
    retryCondition: (error: unknown) => boolean
  }
  cacheOptions: {
    wishlistTtl: number
    countTtl: number
    checkTtl: number
  }
  validation: {
    maxGemIdsPerRequest: number
    maxCategoryNameLength: number
    minPageSize: number
    maxPageSize: number
  }
}

/**
 * Wishlist service internal state
 */
export interface WishlistServiceState {
  startTime: number
  lastError: Error | null
  requestCount: number
  cacheHits: number
  cacheMisses: number
}

/**
 * Wishlist API response interfaces
 */
export interface WishlistResponse {
  items: WishlistItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface WishlistAddResponse {
  item: WishlistItem
  message?: string
}

export interface WishlistCheckResponse {
  inWishlist: boolean
  item?: WishlistItem
}

export interface WishlistCountResponse {
  count: number
  lastUpdated?: string
}

export interface WishlistMoveToCartResponse {
  movedItems: string[]
  failedItems: string[]
  cartItemsCount: number
  message?: string
}

export interface WishlistStatsResponse {
  totalItems: number
  totalValue: number
  avgItemValue: number
  categoryCounts: Record<string, number>
  recentlyAdded: number
}

/**
 * Wishlist query parameters
 */
export interface WishlistQueryParams {
  page?: number
  limit?: number
  sortBy?: 'dateAdded' | 'name' | 'price' | 'type'
  sortOrder?: 'asc' | 'desc'
  gemType?: string
  priceRange?: {
    min?: number
    max?: number
  }
  rarity?: string
  labCertified?: boolean
} 