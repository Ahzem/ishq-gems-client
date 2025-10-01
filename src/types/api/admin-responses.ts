/**
 * Admin API Response types
 */

import { ApiResponse } from './responses'
import { 
  AdminSellerApplication, 
  AdminSellerUser, 
  AdminBuyerUser, 
  AdminDashboardStats,
  AdminRecentActivity,
  AdminBuyerStats,
  AdminFlaggedReview,
  AdminFlaggedReviewsStats
} from '../entities/admin'

/**
 * Base admin action response
 */
export interface AdminActionResponse {
  success: boolean
  message: string
  timestamp: string
}

/**
 * Contact response interface
 */
export interface ContactResponse extends AdminActionResponse {
  emailSent: boolean
  messageId?: string
}

/**
 * Block response interface
 */
export interface BlockResponse extends AdminActionResponse {
  isBlocked: boolean
  blockReason?: string
  blockDuration?: number
  blockedUntil?: string
}

/**
 * Verification response interface
 */
export interface VerificationResponse extends AdminActionResponse {
  isVerified: boolean
  verifiedAt?: string
  nextStep?: string
}

/**
 * Meet link response interface
 */
export interface MeetLinkResponse extends AdminActionResponse {
  meetLink?: string
  scheduledFor?: string
}

/**
 * Seller users response
 */
export interface SellerUsersResponse {
  sellers: AdminSellerUser[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * Seller applications response
 */
export interface SellerApplicationsResponse {
  applications: AdminSellerApplication[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * Buyers response
 */
export interface BuyersResponse {
  buyers: AdminBuyerUser[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * Flagged reviews response
 */
export interface AdminFlaggedReviewsResponse {
  reviews: AdminFlaggedReview[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * Simple message response
 */
export interface MessageResponse {
  message: string
}

// API Response type aliases for admin endpoints
export type AdminDashboardStatsResponse = ApiResponse<AdminDashboardStats>
export type AdminRecentActivityResponse = ApiResponse<AdminRecentActivity[]>
export type AdminBuyerStatsResponse = ApiResponse<AdminBuyerStats>
export type AdminFlaggedReviewsStatsResponse = ApiResponse<AdminFlaggedReviewsStats>
export type AdminSellerApplicationResponse = ApiResponse<AdminSellerApplication>
export type AdminBuyerUserResponse = ApiResponse<AdminBuyerUser>
