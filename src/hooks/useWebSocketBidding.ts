'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWebSocketBidding as useWebSocketProvider } from '@/providers/WebSocketBiddingProvider'
import type { BidUpdate } from '@/types/entities/bid'
import type {
  UseWebSocketBiddingOptions,
  UseWebSocketBiddingReturn,
  WebSocketAuctionData,
  WebSocketBidUpdateHandler,
  WebSocketAuctionStatusHandler
} from '@/types/websocket/bidding'

export function useWebSocketBidding(options: UseWebSocketBiddingOptions = {}): UseWebSocketBiddingReturn {
  const {
    gemIds = [],
    autoSubscribe = true,
    onBidUpdate,
    onAuctionStatusChange,
    onConnectionChange
  } = options

  const websocket = useWebSocketProvider()
  const [auctionData, setAuctionData] = useState<Record<string, WebSocketAuctionData>>({})
  const [bidUpdates, setBidUpdates] = useState<BidUpdate[]>([])
  const eventHandlersRef = useRef<{ [key: string]: (e: CustomEvent) => void }>({})
  const gemIdsRef = useRef<string[]>(gemIds)

  // Update ref when gemIds changes
  useEffect(() => {
    gemIdsRef.current = gemIds
  }, [gemIds])

  // Handle connection status changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(websocket.isConnected)
    }
  }, [websocket.isConnected, onConnectionChange])

  // Subscribe to gems when connected
  useEffect(() => {
    if (autoSubscribe && websocket.isConnected && gemIds.length > 0) {
      gemIds.forEach(gemId => {
        websocket.subscribeToGem(gemId)
      })

      // Cleanup: unsubscribe when gemIds change or component unmounts
      return () => {
        gemIds.forEach(gemId => {
          websocket.unsubscribeFromGem(gemId)
        })
      }
    }
  }, [websocket, gemIds, autoSubscribe])

  // Handle WebSocket events
  useEffect(() => {
    const currentHandlers = eventHandlersRef.current

    // Bid update handler
    const handleBidUpdate: WebSocketBidUpdateHandler = (e: CustomEvent<BidUpdate>) => {
      const bidUpdate = e.detail
      
      // Update auction data
      setAuctionData(prev => {
        const newData = { ...prev }
        const gemId = bidUpdate.gemId
        
        newData[gemId] = {
          currentHighestBid: bidUpdate.bidAmount || prev[gemId]?.currentHighestBid || 0,
          totalBids: bidUpdate.totalBids || (prev[gemId]?.totalBids || 0) + 1,
          auctionStatus: bidUpdate.auctionStatus || prev[gemId]?.auctionStatus || 'active',
          lastUpdate: new Date().toISOString(),
          winningBidder: bidUpdate.bidder
        }
        
        return newData
      })

      // Add to bid updates
      setBidUpdates(prev => [bidUpdate, ...prev.slice(0, 49)]) // Keep last 50 updates

      // Call callback if provided
      if (onBidUpdate) {
        onBidUpdate(bidUpdate)
      }
    }

    // Auction status change handler
    const handleAuctionStatusChange: WebSocketAuctionStatusHandler = (e: CustomEvent<{ gemId: string; status: string; message?: string }>) => {
      const data = e.detail
      
      // Update auction data
      setAuctionData(prev => ({
        ...prev,
        [data.gemId]: {
          ...prev[data.gemId],
          auctionStatus: data.status as 'not-started' | 'active' | 'ending-soon' | 'ended',
          lastUpdate: new Date().toISOString()
        }
      }))

      // Call callback if provided
      if (onAuctionStatusChange) {
        onAuctionStatusChange(data)
      }
    }

    // Store handlers in ref
    currentHandlers.bidUpdate = handleBidUpdate
    currentHandlers.auctionStatus = handleAuctionStatusChange

    // Add event listeners
    window.addEventListener('websocket-bid-update', handleBidUpdate as EventListener)
    window.addEventListener('websocket-auction-status', handleAuctionStatusChange as EventListener)

    // Cleanup function
    return () => {
      window.removeEventListener('websocket-bid-update', handleBidUpdate as EventListener)
      window.removeEventListener('websocket-auction-status', handleAuctionStatusChange as EventListener)
      delete currentHandlers.bidUpdate
      delete currentHandlers.auctionStatus
    }
  }, [onBidUpdate, onAuctionStatusChange])

  const subscribeToGem = useCallback((gemId: string) => {
    websocket.subscribeToGem(gemId)
    
    // Initialize auction data if not exists
    setAuctionData(prev => ({
      ...prev,
      [gemId]: prev[gemId] || {
        currentHighestBid: 0,
        totalBids: 0,
        auctionStatus: 'not-started',
        lastUpdate: new Date().toISOString()
      }
    }))
  }, [websocket])

  const unsubscribeFromGem = useCallback((gemId: string) => {
    websocket.unsubscribeFromGem(gemId)
    
    // Remove auction data
    setAuctionData(prev => {
      const newData = { ...prev }
      delete newData[gemId]
      return newData
    })
  }, [websocket])

  const clearUpdates = useCallback(() => {
    setBidUpdates([])
  }, [])

  const refreshConnection = useCallback(() => {
    websocket.disconnect()
    setTimeout(() => {
      websocket.connect()
    }, 1000)
  }, [websocket])

  return {
    isConnected: websocket.isConnected,
    connectionError: websocket.connectionError,
    auctionData,
    bidUpdates,
    subscribeToGem,
    unsubscribeFromGem,
    clearUpdates,
    refreshConnection
  }
}

export default useWebSocketBidding
