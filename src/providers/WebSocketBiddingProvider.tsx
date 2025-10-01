'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { env } from '@/config/environment'
import type { BidUpdate } from '@/types/entities/bid'
import type {
  WebSocketBiddingContextType,
  WebSocketBidData,
  WebSocketServerBidUpdate,
  WebSocketServerAuctionEndingAlert,
  WebSocketServerAuctionStatusChange,
  WebSocketConnectionConfig
} from '@/types/websocket/bidding'

// Create context with proper typing
const WebSocketBiddingContext = createContext<WebSocketBiddingContextType | null>(null)

interface WebSocketBiddingProviderProps {
  children: React.ReactNode
  autoConnect?: boolean
}

export function WebSocketBiddingProvider({ 
  children, 
  autoConnect = true 
}: WebSocketBiddingProviderProps) {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const subscribedGems = useRef<Set<string>>(new Set())
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = useRef(1000)

  const connect = useCallback(() => {
    if (!user || !token || socket?.connected) return
    
    const config: WebSocketConnectionConfig = {
      serverUrl: env.API_URL,
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: reconnectDelay.current,
      timeout: 20000
    }
    
    const newSocket = io(config.serverUrl, {
      auth: config.auth,
      transports: config.transports,
      autoConnect: config.autoConnect,
      reconnection: config.reconnection,
      reconnectionAttempts: config.reconnectionAttempts,
      reconnectionDelay: config.reconnectionDelay,
      timeout: config.timeout
    })

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected for bidding')
      setIsConnected(true)
      setConnectionError(null)
      reconnectAttempts.current = 0
      reconnectDelay.current = 1000

      // Re-subscribe to previously subscribed gems
      subscribedGems.current.forEach(gemId => {
        newSocket.emit('subscribe_gem', gemId)
        console.log(`🔄 Re-subscribed to gem ${gemId}`)
      })
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
      setIsConnected(false)
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        setConnectionError('Server disconnected the connection')
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      setConnectionError(error.message)
      setIsConnected(false)
      
      reconnectAttempts.current++
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000)
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        setConnectionError('Failed to connect after multiple attempts')
      }
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`)
      setConnectionError(null)
    })

    // Connection confirmation
    newSocket.on('connected', (data) => {
      console.log('🎉 WebSocket bidding service confirmed:', data.message)
    })

    // Bid update events
    newSocket.on('bid_update', (serverBidUpdate: WebSocketServerBidUpdate) => {
      console.log('🔨 Real-time bid update:', serverBidUpdate)
      
      // Transform server data to client BidUpdate format
      const bidUpdate: BidUpdate = {
        type: serverBidUpdate.type,
        gemId: serverBidUpdate.gemId,
        bidId: serverBidUpdate.bidId,
        bidAmount: serverBidUpdate.amount,
        bidder: serverBidUpdate.bidderName ? {
          id: '', // Server doesn't send bidder ID in this event
          name: serverBidUpdate.bidderName,
          isCurrentUser: false // Will be determined by the receiving component
        } : undefined,
        timestamp: serverBidUpdate.timestamp,
        totalBids: serverBidUpdate.totalBids,
        auctionStatus: 'active', // Default, will be updated by status events
        message: `${serverBidUpdate.type === 'new_bid' ? 'New bid' : serverBidUpdate.type} for ${serverBidUpdate.gemTitle}`
      }
      
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('websocket-bid-update', {
        detail: bidUpdate
      }))
    })

    // Auction ending alerts
    newSocket.on('auction_ending', (data: WebSocketServerAuctionEndingAlert) => {
      console.log('⏰ Auction ending soon:', data.gemTitle)
      
      const bidUpdate: BidUpdate = {
        type: 'auction_ended',
        gemId: data.gemId,
        timestamp: new Date().toISOString(),
        message: `Auction ending in ${data.timeLeft}`
      }
      
      window.dispatchEvent(new CustomEvent('websocket-bid-update', {
        detail: bidUpdate
      }))
    })

    // Auction status changes
    newSocket.on('auction_status_change', (data: WebSocketServerAuctionStatusChange) => {
      console.log('📊 Auction status changed:', data)
      
      window.dispatchEvent(new CustomEvent('websocket-auction-status', {
        detail: data
      }))
    })

    // Error handling
    newSocket.on('error', (error) => {
      console.error('❌ WebSocket error:', error)
      setConnectionError(error.message || 'WebSocket error occurred')
    })

    newSocket.connect()
    setSocket(newSocket)

    return newSocket
  }, [user, token, socket])

  const disconnect = useCallback(() => {
    if (socket) {
      console.log('🔌 Disconnecting WebSocket for bidding...')
      
      // Unsubscribe from all gems
      subscribedGems.current.forEach(gemId => {
        socket.emit('unsubscribe_gem', gemId)
      })
      subscribedGems.current.clear()
      
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
      setConnectionError(null)
    }
  }, [socket])

  const subscribeToGem = useCallback((gemId: string) => {
    if (socket && socket.connected) {
      socket.emit('subscribe_gem', gemId)
      subscribedGems.current.add(gemId)
      console.log(`📍 Subscribed to gem ${gemId} for real-time updates`)
    } else {
      // Store for later subscription when connected
      subscribedGems.current.add(gemId)
      console.log(`📍 Queued subscription to gem ${gemId}`)
    }
  }, [socket])

  const unsubscribeFromGem = useCallback((gemId: string) => {
    if (socket && socket.connected) {
      socket.emit('unsubscribe_gem', gemId)
    }
    subscribedGems.current.delete(gemId)
    console.log(`📍 Unsubscribed from gem ${gemId}`)
  }, [socket])

  const sendBidUpdate = useCallback((gemId: string, bidData: WebSocketBidData) => {
    if (socket && socket.connected) {
      socket.emit('bid_placed', { ...bidData, gemId })
      console.log(`🔨 Sent bid update for gem ${gemId}`)
    }
  }, [socket])

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (autoConnect && user && token && !socket) {
      connect()
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [autoConnect, user, token, connect, socket])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  const contextValue: WebSocketBiddingContextType = {
    socket,
    isConnected,
    connectionError,
    subscribedGems: subscribedGems.current,
    subscribeToGem,
    unsubscribeFromGem,
    sendBidUpdate,
    connect,
    disconnect
  }

  return (
    <WebSocketBiddingContext.Provider value={contextValue}>
      {children}
    </WebSocketBiddingContext.Provider>
  )
}

export function useWebSocketBidding() {
  const context = useContext(WebSocketBiddingContext)
  if (!context) {
    throw new Error('useWebSocketBidding must be used within a WebSocketBiddingProvider')
  }
  return context
}

export default WebSocketBiddingProvider
