/**
 * Notification component types and interfaces
 */

import type { BidUpdate } from '../entities/bid'

// ============================================================================
// Bidding Notifications Types
// ============================================================================

export interface BidEvent {
  id: string
  type: 'outbid' | 'won' | 'lost' | 'ending_soon' | 'new_bid' | 'reserve_met' | 'auction_started' | 'auction_ended' | 'bid_cancelled' | 'bid_finalized'
  gemId: string
  gemName: string
  gemImage?: string
  previousBid?: number
  newBid?: number
  yourBid?: number
  reservePrice?: number
  auctionEndTime?: string
  bidderName?: string
  timeLeft?: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notificationId?: string
  bidId?: string
  auctionStatus?: 'not-started' | 'active' | 'ending-soon' | 'ended'
}

export interface BackendNotification {
  _id?: string
  id?: string
  message: string
  title: string
  type: string
  isRead?: boolean
  createdAt?: string
  timestamp?: string
  metadata?: {
    gemId?: string
    amount?: number
    senderName?: string
    bidId?: string
  }
}

export interface BiddingNotificationsProps {
  className?: string
  maxVisible?: number
  autoHide?: boolean
  enableSound?: boolean
  onNotificationClick?: (event: BidEvent) => void
}

// ============================================================================
// Notification Bell Types
// ============================================================================

export interface NotificationBellProps {
  onClick: () => void
  className?: string
}

// ============================================================================
// Notification Modal Types
// ============================================================================

export interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

// ============================================================================
// Notification System Types
// ============================================================================

export interface NotificationSystemProps {
  className?: string
}

// ============================================================================
// Real-Time Notifications Types
// ============================================================================

export interface NotificationItemProps {
  update: BidUpdate
  onDismiss: () => void
  onMarkAsRead: () => void
  isRead?: boolean
}

export interface RealTimeNotificationsProps {
  className?: string
  maxVisible?: number
  autoHide?: boolean
  hideAfter?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  showSoundToggle?: boolean
  gemIds?: string[]
}

// ============================================================================
// Notification Dropdown Types
// ============================================================================

export interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

// ============================================================================
// Shared Notification Types
// ============================================================================

export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export type BidEventType = 'outbid' | 'won' | 'lost' | 'ending_soon' | 'new_bid' | 'reserve_met' | 'auction_started' | 'auction_ended' | 'bid_cancelled' | 'bid_finalized'

export type AuctionStatus = 'not-started' | 'active' | 'ending-soon' | 'ended'

// ============================================================================
// Notification Filter Types
// ============================================================================

export type NotificationFilter = 'all' | 'unread'

// ============================================================================
// Sound Notification Types
// ============================================================================

export interface NotificationSoundConfig {
  enabled: boolean
  volume: number
  frequencies: Record<BidEventType, number[]>
}
