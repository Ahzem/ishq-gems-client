/**
 * Hook-related types and interfaces
 */

import { Socket } from 'socket.io-client'
import { Notification, Message, CartItem, WishlistItem, BidUpdate } from '../entities'
import { LinkPreview } from '../../utils/linkUtils'

// ============================================================================
// Real-time Notifications Hook Types
// ============================================================================

export interface UseRealTimeNotificationsOptions {
  autoConnect?: boolean
  enableBidUpdates?: boolean
  gemIds?: string[]
}

// Extend the existing BidUpdate type for notifications
export interface NotificationBidUpdate extends BidUpdate {
  bidderName?: string
  timeLeft?: string
  isWinning?: boolean
  gemTitle: string
}

export interface SystemMessage {
  type: 'info' | 'warning' | 'error'
  message: string
  timestamp: string
}

export interface UseRealTimeNotificationsReturn {
  // Connection state
  isConnected: boolean
  connectionError: string | null
  
  // Data
  notifications: Notification[]
  bidUpdates: NotificationBidUpdate[]
  systemMessages: SystemMessage[]
  
  // Actions
  connect: () => void
  disconnect: () => void
  subscribeToGem: (gemId: string) => void
  unsubscribeFromGem: (gemId: string) => void
  clearNotifications: () => void
  clearBidUpdates: () => void
  clearSystemMessages: () => void
  requestNotificationPermission: () => Promise<boolean>
  
  // Socket instance (for advanced usage)
  socket: Socket | null
}

// ============================================================================
// Real-time Messages Hook Types
// ============================================================================

// Use the existing LinkPreview type from utils

export interface SocketWithTransport {
  io?: {
    engine?: {
      transport?: {
        name: string
      }
    }
  }
}

export interface ConnectionError extends Error {
  description?: string
  context?: string
  type?: string
}

export interface IncomingMessageData {
  id: string
  content: string
  sentAt: string
  isRead: boolean
  readAt?: string
  senderId: string
  senderName: string
  senderAvatar?: string
  senderRole: string
  linkPreviews?: LinkPreview[]
}

export interface TypingIndicator {
  senderId: string
  senderName: string
  isTyping: boolean
  timestamp: string
}

export interface ReadReceipt {
  messageId: string
  readById: string
  readerName: string
  readAt: string
}

export interface UseRealTimeMessagesOptions {
  autoConnect?: boolean
  onNewMessage?: (message: Message) => void
  onTypingIndicator?: (indicator: TypingIndicator) => void
  onReadReceipt?: (receipt: ReadReceipt) => void
}

export interface UseRealTimeMessagesReturn {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
  connect: () => void
  disconnect: () => void
  joinChat: (otherUserId: string) => void
  leaveChat: (otherUserId: string) => void
  sendTypingStart: (receiverId: string, senderName: string) => void
  sendTypingStop: (receiverId: string, senderName: string) => void
  messages: Message[]
  typingIndicators: Map<string, TypingIndicator>
  clearTypingIndicator: (senderId: string) => void
}

// ============================================================================
// Real-time Bids Hook Types
// ============================================================================

// Use the existing BidUpdate type for real-time bids
export type BidUpdateEvent = BidUpdate

export interface AuctionData {
  [gemId: string]: {
    currentHighestBid: number
    totalBids: number
    auctionStatus: 'not-started' | 'active' | 'ending-soon' | 'ended'
    lastUpdate: string
    winningBidder?: {
      id: string
      name: string
    }
  }
}

export interface UseRealTimeBidsOptions {
  gemIds?: string[]
  pollInterval?: number
  autoConnect?: boolean
}

export interface UseRealTimeBidsReturn {
  auctionData: AuctionData
  bidUpdates: BidUpdateEvent[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
  connect: () => void
  disconnect: () => void
  subscribeTo: (gemId: string) => void
  unsubscribeFrom: (gemId: string) => void
  clearUpdates: () => void
  refreshData: () => Promise<void>
}

export interface UseRealTimeAuctionReturn extends UseRealTimeBidsReturn {
  gemData: AuctionData[string] | null
  latestUpdate: BidUpdateEvent | null
}

// ============================================================================
// Online Status Hook Types
// ============================================================================

export interface OnlineStatusHook {
  onlineUsers: { [userId: string]: boolean }
  getOnlineStatus: (userIds: string[]) => Promise<void>
  isUserOnline: (userId: string) => boolean
  subscribeToStatusChanges: () => void
  unsubscribeFromStatusChanges: () => void
}

// ============================================================================
// User Cart Hook Types
// ============================================================================

export interface UseUserCartReturn {
  items: CartItem[]
  totalAmount: number
  shippingFee: number
  taxes: number
  clearCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  getTotalItems: () => number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isAuthenticated: boolean
  user: unknown // From auth context
}

// ============================================================================
// Gem Filters Hook Types
// ============================================================================

export interface GemFiltersState {
  gemTypes: string[]
  colors: string[]
  shapes: string[]
  priceRange: [number, number]
  caratRange: [number, number]
  origins: string[]
  labCertified: boolean | null
  sellerTypes: string[]
  availability: string[]
  rarity: string[]
  treatments: string[]
  clarities?: string[] // Optional for backward compatibility
  certifyingLabs: string[]
  investmentGrades: string[]
  supplierTypes: string[]
  pricePerCaratRange: [number, number]
  listingType: string[]
  auctionStatus: string[]
  timeRemaining: string[]
  bidActivity: string[]
  reserveMet: boolean | null
}

export interface UseGemFiltersReturn {
  filters: GemFiltersState
  debouncedFilters: GemFiltersState
  updateFilters: (newFilters: GemFiltersState) => void
  clearAllFilters: () => void
  isFiltersOpen: boolean
  toggleFilters: () => void
  getApiQuery: Record<string, string | string[] | number | boolean>
}

// ============================================================================
// CAPTCHA Hook Types
// ============================================================================

export interface UseCaptchaOptions {
  onError?: (error: string) => void
  showErrorAlert?: boolean
}

export interface UseCaptchaReturn {
  // States
  captchaToken: string | null
  isCaptchaLoading: boolean
  captchaError: string | null
  captchaKey: number
  verifyingDots: string
  
  // Handlers
  handleCaptchaVerify: (token: string) => void
  handleCaptchaError: (error: string) => void
  handleCaptchaExpired: () => void
  resetCaptcha: () => void
  
  // Validation
  isCaptchaReady: boolean
}

// ============================================================================
// Lab Report Storage Hook Types
// ============================================================================

export interface StoredLabReport {
  url: string
  filename: string
  s3Key: string
  uploadedAt: number
  fileSize: number
  fileType: string
}

export interface UseLabReportStorageReturn {
  storedLabReport: StoredLabReport | null
  saveLabReport: (report: StoredLabReport) => void
  clearLabReport: () => void
  isExpired: (report: StoredLabReport) => boolean
  replaceLabReport: (newReport: StoredLabReport, deleteOldCallback?: (oldS3Key: string) => Promise<void>) => Promise<void>
}

// ============================================================================
// Back Navigation Hook Types
// ============================================================================

export interface UseBackNavigationOptions {
  fallbackRoute?: string
  excludeRoutes?: string[]
}

export interface UseBackNavigationReturn {
  goBack: () => void
  goBackWithFallback: (specificFallback: string) => void
  previousRoute: string | null
}

// ============================================================================
// Local Storage Hook Types
// ============================================================================

export type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void
]

// ============================================================================
// Store Types
// ============================================================================

export interface CartStore {
  items: CartItem[]
  isOpen: boolean
  userId: string | null
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  clearCart: () => void
  clearCartAfterCheckout: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  setIsOpen: (isOpen: boolean) => void
  setUserId: (userId: string | null) => void
  initializeCart: (userId: string | null) => void
  clearAllCartData: () => void
}

export interface WishlistStore {
  items: WishlistItem[]
  isLoading: boolean
  error: string | null
  addItem: (item: Omit<WishlistItem, 'dateAdded'>) => Promise<void>
  addItemByGemId: (gemId: string) => Promise<boolean>
  removeItem: (id: string) => Promise<void>
  toggleItem: (gemId: string) => Promise<{ action: 'added' | 'removed'; success: boolean }>
  isInWishlist: (id: string) => boolean
  clearWishlist: () => Promise<void>
  getTotalItems: () => number
  fetchWishlist: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export interface UseCartReturn {
  items: CartItem[]
  totalAmount: number
  shippingFee: number
  taxes: number
  clearCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  getTotalItems: () => number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}
