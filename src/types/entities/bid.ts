/**
 * Bid entity types and interfaces
 */

import { MediaType } from './gem'

/**
 * Bid status types
 */
export type BidStatus = 'active' | 'outbid' | 'winning' | 'finalized' | 'cancelled'

/**
 * Auction status types
 */
export type AuctionStatus = 'not-started' | 'active' | 'ending-soon' | 'ended'

/**
 * Bidder information
 */
export interface Bidder {
  id: string
  name: string
  email?: string
  isAnonymous?: boolean
  avatar?: string
}

/**
 * Basic bid data
 */
export interface BidData {
  _id: string
  gemId: string
  userId: {
    _id: string
    fullName: string
    email?: string
  }
  amount: number
  isProxy: boolean
  maxAmount?: number
  status: BidStatus
  isFinalized: boolean
  finalizedBy?: {
    _id: string
    fullName: string
    email?: string
  }
  finalizedAt?: string
  placedAt: string
  lastModified: string
  notes?: string
  cancelReason?: string
  timestamp: string
  isProxyBid?: boolean
  proxyMaxBid?: number
  isCurrentUser?: boolean
  flagged?: boolean
  disputeReason?: string
  // Enhanced dispute tracking
  disputed?: boolean
  disputedAt?: string
  disputedBy?: {
    _id: string
    fullName: string
    email?: string
  }
  disputeResolved?: boolean
  disputeResolvedAt?: string
  disputeResolvedBy?: {
    _id: string
    fullName: string
    email?: string
  }
  disputeResolution?: 'approved' | 'cancelled'
}

/**
 * Auction gem information
 */
export interface AuctionGem {
  _id: string
  gemType: string
  color: string
  weight: { value: number; unit: string }
  reportNumber: string
  auctionStartTime: string
  auctionEndTime: string
  startingBid: number
  reservePrice?: number
  currentHighestBid: number
  totalBids: number
  auctionStatus: AuctionStatus
  finalizedBidId?: string
  media?: Array<{
    _id: string
    type: MediaType
    url: string
    isPrimary: boolean
  }>
  bids?: BidData[]
}

/**
 * Admin auction view with additional fields
 */
export interface AdminAuctionView extends AuctionGem {
  seller: {
    id: string
    name: string
    email: string
    verified: boolean
  }
  hasDisputes?: boolean
  flaggedBidsCount?: number
  totalValue?: number
}

/**
 * Dispute-related types
 */
export interface DisputeBidRequest {
  reason: string
}

export interface ResolveDisputeRequest {
  resolution: 'approved' | 'cancelled'
  notes?: string
}

export interface DisputedBidData {
  _id: string
  gemId: {
    _id: string
    gemType: string
    color: string
    weight: { value: number; unit: string }
    reportNumber: string
  }
  userId: {
    _id: string
    fullName: string
    email?: string
  }
  amount: number
  isProxy: boolean
  maxAmount?: number
  status: BidStatus
  isFinalized: boolean
  finalizedBy?: {
    _id: string
    fullName: string
    email?: string
  }
  finalizedAt?: string
  placedAt: string
  lastModified: string
  notes?: string
  cancelReason?: string
  timestamp: string
  isProxyBid?: boolean
  proxyMaxBid?: number
  isCurrentUser?: boolean
  flagged?: boolean
  disputeReason?: string
  disputed?: boolean
  disputedAt?: string
  disputedBy?: {
    _id: string
    fullName: string
    email?: string
  }
  disputeResolved?: boolean
  disputeResolvedAt?: string
  disputeResolvedBy?: {
    _id: string
    fullName: string
    email?: string
  }
  disputeResolution?: 'approved' | 'cancelled'
}

export interface DisputedBidsResponse {
  success: boolean
  data?: {
    bids: DisputedBidData[]
    pagination: {
      currentPage: number
      totalPages: number
      totalBids: number
      limit: number
    }
  }
  message?: string
}

export interface DisputeFilters {
  page?: number
  limit?: number
  status?: 'all' | 'pending' | 'resolved'
  sortBy?: 'disputedAt' | 'disputeResolvedAt' | 'amount' | 'placedAt'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Bid updates for real-time functionality
 */
export interface BidUpdatesResponse {
  success: boolean
  data?: {
    currentHighestBid: number
    totalBids: number
    auctionStatus: AuctionStatus
    winningBidder?: { id: string; name: string }
    updates: BidUpdate[]
  }
  message?: string
}

export interface BidUpdate {
  type: 'new_bid' | 'bid_cancelled' | 'auction_ended' | 'auction_started' | 'bid_finalized'
  gemId: string
  bidId?: string
  bidAmount?: number
  bidder?: { id: string; name: string; isCurrentUser?: boolean }
  timestamp: string
  auctionStatus?: AuctionStatus
  currentHighestBid?: number
  totalBids?: number
  message?: string
}

/**
 * Seller auction response
 */
export interface SellerAuctionsResponse {
  success: boolean
  data?: AuctionGem[]
  message?: string
}

/**
 * Admin auctions response
 */
export interface AdminAuctionsResponse {
  success: boolean
  data?: AdminAuctionView[]
  message?: string
}

/**
 * Admin bid statistics
 */
export interface AdminBidStats {
  totalActiveAuctions: number
  totalBidsToday: number
  totalValue: number
  disputesCount: number
}

export interface AdminBidStatsResponse {
  success: boolean
  data?: AdminBidStats
  message?: string
}

/**
 * Bid action responses (cancel, delete, finalize)
 */
export interface BidActionResponse {
  success: boolean
  message?: string
}

/**
 * Bid flag and dispute resolution responses
 */
export interface BidFlagResponse {
  success: boolean
  message?: string
  data?: BidData
}

export interface DisputeResolutionResponse {
  success: boolean
  message?: string
  data?: BidData
}

/**
 * Bid status display information
 */
export interface BidStatusInfo {
  label: string
  color: string
  bgColor: string
}

/**
 * Time remaining information for auctions
 */
export interface TimeRemaining {
  isExpired: boolean
  timeText: string
  urgency: 'normal' | 'warning' | 'critical'
}

/**
 * Bid validation context
 */
export interface BidValidationContext {
  gemId: string
  amount: number
  proxyMaxBid?: number
  currentHighestBid?: number
  minimumBidIncrement?: number
  auctionEndTime?: string
}

/**
 * Bid service configuration
 */
export interface BidServiceConfig {
  baseUrl: string
  retryOptions: {
    maxRetries: number
    retryCondition: (error: unknown) => boolean
  }
  cacheOptions: {
    defaultTtl: number
    bidListTtl: number
    highestBidTtl: number
    statsTtl: number
  }
}

/**
 * Bid service state interface
 */
export interface BidServiceState {
  startTime: number
  lastError?: string
} 