/**
 * WebSocket Bidding Types and Interfaces
 */

import type { Socket } from 'socket.io-client'
import type { BidUpdate, AuctionStatus } from '@/types/entities/bid'

// WebSocket Bid Data Interface
export interface WebSocketBidData {
  gemId: string
  bidId?: string
  amount?: number
  bidderName?: string
  totalBids?: number
  isWinning?: boolean
  gemTitle?: string
  timestamp?: string
  type?: BidUpdate['type']
}

// WebSocket Connection Status
export interface WebSocketConnectionStatus {
  isConnected: boolean
  connectionError: string | null
  reconnectAttempts: number
  lastConnectedAt?: Date
  lastDisconnectedAt?: Date
}

// WebSocket Subscription Data
export interface WebSocketSubscription {
  gemId: string
  subscribedAt: Date
  isActive: boolean
}

// WebSocket Event Data
export interface WebSocketBidUpdateEvent {
  type: 'websocket-bid-update'
  detail: BidUpdate
}

export interface WebSocketAuctionStatusEvent {
  type: 'websocket-auction-status'
  detail: {
    gemId: string
    status: AuctionStatus
    message?: string
  }
}

// Auction Data for WebSocket
export interface WebSocketAuctionData {
  currentHighestBid: number
  totalBids: number
  auctionStatus: AuctionStatus
  lastUpdate: string
  winningBidder?: {
    id: string
    name: string
    isCurrentUser?: boolean
  }
}

// WebSocket Provider Context Type
export interface WebSocketBiddingContextType {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
  subscribedGems: Set<string>
  subscribeToGem: (gemId: string) => void
  unsubscribeFromGem: (gemId: string) => void
  sendBidUpdate: (gemId: string, bidData: WebSocketBidData) => void
  connect: () => void
  disconnect: () => void
}

// Hook Options and Return Types
export interface UseWebSocketBiddingOptions {
  gemIds?: string[]
  autoSubscribe?: boolean
  onBidUpdate?: (bidUpdate: BidUpdate) => void
  onAuctionStatusChange?: (data: { gemId: string; status: string; message?: string }) => void
  onConnectionChange?: (connected: boolean) => void
}

export interface UseWebSocketBiddingReturn {
  isConnected: boolean
  connectionError: string | null
  auctionData: Record<string, WebSocketAuctionData>
  bidUpdates: BidUpdate[]
  subscribeToGem: (gemId: string) => void
  unsubscribeFromGem: (gemId: string) => void
  clearUpdates: () => void
  refreshConnection: () => void
}

// WebSocket Server Response Types
export interface WebSocketServerBidUpdate {
  type: BidUpdate['type']
  gemId: string
  bidId?: string
  amount?: number
  bidderName?: string
  totalBids?: number
  timeLeft?: string
  isWinning?: boolean
  gemTitle: string
  timestamp: string
}

export interface WebSocketServerAuctionEndingAlert {
  gemId: string
  gemTitle: string
  timeLeft: string
}

export interface WebSocketServerAuctionStatusChange {
  gemId: string
  status: AuctionStatus
  message?: string
}

// WebSocket Connection Configuration
export interface WebSocketConnectionConfig {
  serverUrl: string
  auth: {
    token: string
  }
  transports: ('websocket' | 'polling')[]
  autoConnect: boolean
  reconnection: boolean
  reconnectionAttempts: number
  reconnectionDelay: number
  timeout: number
}

// Custom Event Types
export type WebSocketCustomEvent = WebSocketBidUpdateEvent | WebSocketAuctionStatusEvent

// Event Handler Types
export type WebSocketEventHandler<T = unknown> = (event: CustomEvent<T>) => void

export type WebSocketBidUpdateHandler = WebSocketEventHandler<BidUpdate>
export type WebSocketAuctionStatusHandler = WebSocketEventHandler<{
  gemId: string
  status: string
  message?: string
}>

// WebSocket Error Types
export interface WebSocketConnectionError extends Error {
  code?: string
  type: 'connection' | 'authentication' | 'subscription' | 'message'
  details?: Record<string, unknown>
  isRetryable?: boolean
}

// WebSocket Metrics
export interface WebSocketMetrics {
  totalConnections: number
  successfulConnections: number
  failedConnections: number
  totalSubscriptions: number
  activeSubscriptions: number
  messagesReceived: number
  messagesSent: number
  averageLatency?: number
  uptime: number
}
