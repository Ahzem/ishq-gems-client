/**
 * Notification entity types and interfaces
 */

import { BaseEntity } from '../common/base'

/**
 * Notification types
 */
export type NotificationType = 'order' | 'bid' | 'message' | 'listing' | 'system' | 'seller' | 'admin'

/**
 * Notification metadata
 */
export interface NotificationMetadata {
  orderId?: string
  gemId?: string
  bidId?: string
  amount?: number
  senderId?: string
  senderName?: string
}

/**
 * Notification entity
 */
export interface Notification extends BaseEntity {
  type: NotificationType
  title: string
  message: string
  link?: string
  icon?: string
  metadata?: NotificationMetadata
  isRead: boolean
  readAt?: string
  timeAgo: string
} 