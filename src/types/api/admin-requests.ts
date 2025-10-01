/**
 * Admin API Request types
 */

import { BaseQuery } from './requests'

/**
 * Contact seller request
 */
export interface ContactSellerRequest {
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high'
  type: 'general' | 'violation' | 'support' | 'warning'
}

/**
 * Block seller request
 */
export interface BlockSellerRequest {
  reason: string
  duration?: number // duration in days, null for permanent
  notifyUser?: boolean
}

/**
 * Update buyer status request
 */
export interface UpdateBuyerStatusRequest {
  status: 'active' | 'suspended' | 'banned'
  reason?: string
  notifyUser?: boolean
}

/**
 * Admin sellers query parameters
 */
export interface AdminSellersQuery extends BaseQuery {
  status?: string
}

/**
 * Admin buyers query parameters
 */
export interface AdminBuyersQuery extends BaseQuery {
  status?: string
}

/**
 * Admin seller applications query parameters
 */
export interface AdminSellerApplicationsQuery extends BaseQuery {
  status?: string
}

/**
 * Admin flagged reviews query parameters
 */
export interface AdminFlaggedReviewsQuery extends BaseQuery {
  status?: 'all' | 'flagged' | 'resolved'
}

/**
 * Admin recent activity query parameters
 */
export interface AdminRecentActivityQuery {
  limit?: number
}

/**
 * Seller rejection request
 */
export interface RejectSellerRequest {
  reason: string
}

/**
 * Review rejection request
 */
export interface RejectReviewRequest {
  reason?: string
}
