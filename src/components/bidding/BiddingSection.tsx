'use client'

import { useState, useEffect, useCallback } from 'react'
import { Gavel, Users, Shield, AlertCircle, X } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useWebSocketBidding } from '@/hooks/useWebSocketBidding'
import bidService from '@/services/bid.service'
import { BidData } from '@/types'
import PlaceBidForm from './PlaceBidForm'
import BidHistory from './BidHistory'
import AuctionTimer from './AuctionTimer'
import BiddingNotifications from '../notifications/BiddingNotifications'
import BiddingErrorBoundary from './BiddingErrorBoundary'
import { cn } from '@/lib/utils'

interface BidStats {
  totalBids: number
  highestBid: number
  hasActiveBids: boolean
  isFinalized: boolean
  auctionStatus?: string
}

interface BiddingSectionProps {
  gemId: string
  listingType: 'direct-sale' | 'auction'
  auctionEndTime?: string
  auctionStartTime?: string
  currentHighestBid?: number
  reservePrice?: number
  startingBid?: number
  totalBids?: number
  isFinalized?: boolean
  sellerId?: string
  className?: string
  onBidPlaced?: () => void
  triggerPlaceBid?: boolean // Add prop to trigger place bid form
  onTriggerPlaceBidReset?: () => void // Callback to reset the trigger
}

export default function BiddingSection({
  gemId,
  listingType,
  auctionEndTime,
  auctionStartTime,
  currentHighestBid = 0,
  reservePrice = 0,
  startingBid = 0,
  totalBids = 0,
  isFinalized = false,
  sellerId,
  className,
  onBidPlaced,
  triggerPlaceBid = false,
  onTriggerPlaceBidReset
}: BiddingSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const [bids, setBids] = useState<BidData[]>([])
  const [bidStats, setBidStats] = useState<BidStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPlaceBidForm, setShowPlaceBidForm] = useState(false)

  // Initialize WebSocket bidding
  const {
    auctionData,
    isConnected,
    subscribeToGem,
    unsubscribeFromGem
  } = useWebSocketBidding({
    gemIds: [gemId],
    autoSubscribe: true,
    onBidUpdate: (bidUpdate) => {
      console.log('🔨 New bid update received:', bidUpdate)
      // Refresh bid stats when new bid is received
      if (bidUpdate.gemId === gemId && bidUpdate.type === 'new_bid') {
        loadBiddingData()
      }
    },
    onAuctionStatusChange: (data) => {
      console.log('📊 Auction status changed:', data)
    }
  })

  // Effect to handle external trigger for place bid form
  useEffect(() => {
    if (triggerPlaceBid) {
      setShowPlaceBidForm(true)
      onTriggerPlaceBidReset?.()
    }
  }, [triggerPlaceBid, onTriggerPlaceBidReset])

  // Update bid data when real-time data changes
  useEffect(() => {
    const realTimeData = auctionData[gemId]
    if (realTimeData) {
      setBidStats(prev => ({
        highestBid: realTimeData.currentHighestBid,
        totalBids: realTimeData.totalBids,
        auctionStatus: realTimeData.auctionStatus,
        hasActiveBids: prev?.hasActiveBids ?? false,
        isFinalized: prev?.isFinalized ?? false
      }))
    }
  }, [auctionData, gemId])

  // Check if current user is the seller
  const isUserSeller = user?.id === sellerId

  // Check if auction is active
  const isAuctionActive = listingType === 'auction' && 
    auctionStartTime && auctionEndTime &&
    new Date() >= new Date(auctionStartTime) &&
    new Date() <= new Date(auctionEndTime)

  const loadBiddingData = useCallback(async () => {
    try {
      setLoading(true)
      const [bidsResponse, statsResponse] = await Promise.all([
        bidService.getBidsForGem(gemId, 1, 10),
        bidService.getBidStatsForGem(gemId)
      ])

      if (bidsResponse.success && bidsResponse.data) {
        setBids(bidsResponse.data.bids)
      }

      if (statsResponse.success && statsResponse.data) {
        setBidStats(statsResponse.data)
      }
    } catch (error) {
      console.error('Error loading bidding data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bidding information'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [gemId])

  // Handle WebSocket connection and subscription
  useEffect(() => {
    if (listingType === 'auction' && gemId) {
      // Subscribe to gem updates when component mounts
      subscribeToGem(gemId)
      
      // Cleanup: unsubscribe when component unmounts or gemId changes
      return () => {
        unsubscribeFromGem(gemId)
      }
    }
  }, [gemId, listingType, subscribeToGem, unsubscribeFromGem])

  useEffect(() => {
    if (listingType === 'auction') {
      loadBiddingData()
    }
  }, [gemId, listingType, loadBiddingData])

  const handleBidPlaced = () => {
    // Refresh local data - WebSocket will handle real-time updates
    loadBiddingData()
    setShowPlaceBidForm(false) // Close the form after successful bid
    onBidPlaced?.()
  }

  const handleBidUpdated = () => {
    // Refresh local data - WebSocket will handle real-time updates
    loadBiddingData()
  }

  if (listingType !== 'auction') {
    return null
  }

  return (
    <BiddingErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Bidding section error:', error, errorInfo)
        setError(error.message)
      }}
    >
      <div className={cn('space-y-6', className)}>
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">Error Loading Auction Data</p>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    loadBiddingData()
                  }}
                  className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Real-time Bid Notifications */}
      <BiddingNotifications
        className="fixed top-4 right-4 z-50"
        maxVisible={3}
        autoHide={true}
        enableSound={true}
        onNotificationClick={(event) => {
          // Handle notification click - could navigate to gem or scroll to relevant section
          console.log('Notification clicked:', event)
        }}
      />

      {/* Connection Status */}
      {listingType === 'auction' && (
        <div className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Live bidding connected" : "Reconnecting..."}
            </span>
          </div>
          {!isConnected && (
            <button
              onClick={() => {
                // Reconnect WebSocket
                unsubscribeFromGem(gemId)
                setTimeout(() => subscribeToGem(gemId), 1000)
              }}
              className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Reconnect
            </button>
          )}
        </div>
      )}

      {/* Auction Status */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Gavel className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-foreground">Live Auction</h3>
              <p className="text-sm text-muted-foreground">
                {isFinalized ? 'Auction Finalized' : isAuctionActive ? 'Bidding Open' : 'Auction Ended'}
              </p>
            </div>
          </div>
          
          {auctionEndTime && !isFinalized && (
            <AuctionTimer 
              auctionStartTime={auctionStartTime || ''}
              auctionEndTime={auctionEndTime}
              className="text-right"
            />
          )}
        </div>

        {/* Auction Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {bidService.formatPrice(bidStats?.highestBid || currentHighestBid)}
            </div>
            <div className="text-xs text-muted-foreground">Current Bid</div>
          </div>
          
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {bidStats?.totalBids || totalBids}
            </div>
            <div className="text-xs text-muted-foreground">Total Bids</div>
          </div>
          
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <div className="text-2xl font-bold text-accent">
              {bidService.formatPrice(reservePrice)}
            </div>
            <div className="text-xs text-muted-foreground">Reserve Price</div>
          </div>
          
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <div className="text-2xl font-bold text-muted-foreground">
              {bidService.formatPrice(startingBid)}
            </div>
            <div className="text-xs text-muted-foreground">Starting Bid</div>
          </div>
        </div>

        {/* Reserve Price Status */}
        {reservePrice > 0 && (
          <div className="mt-4 p-3 bg-background/40 rounded-lg">
            <div className="flex items-center gap-2">
              {(bidStats?.highestBid || currentHighestBid) >= reservePrice ? (
                <>
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Reserve price met
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Reserve price not yet met
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Place Bid Section */}
      {isAuthenticated && !isUserSeller && isAuctionActive && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">Place Your Bid</h4>
            {!showPlaceBidForm ? (
              <button
                onClick={() => setShowPlaceBidForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Place Bid
              </button>
            ) : (
              <button
                onClick={() => setShowPlaceBidForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {showPlaceBidForm && (
            <div className="mb-6">
              <PlaceBidForm
                gemId={gemId}
                currentHighestBid={bidStats?.highestBid || currentHighestBid}
                minimumBid={Math.max(currentHighestBid * 1.05, startingBid || 0)}
                reservePrice={reservePrice}
                auctionEndTime={auctionEndTime || ''}
                sellerId={sellerId || ''}
                totalBids={totalBids}
                onBidPlaced={handleBidPlaced}
                onBidUpdate={handleBidUpdated}
              />
            </div>
          )}
        </div>
      )}

      {/* Authentication Message */}
      {!isAuthenticated && isAuctionActive && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Sign in to place bids
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Create an account or sign in to participate in this auction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seller Message */}
      {isUserSeller && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                This is your listing
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You cannot bid on your own items. Monitor bids and finalize when ready.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bid History */}
      <div className="bg-card border border-border rounded-2xl">
        <BidHistory
          gemId={gemId}
          bids={bids.map(bid => ({
            _id: bid._id,
            amount: bid.amount,
            bidder: {
              id: bid.userId?._id || bid.userId?.toString() || '',
              name: bid.userId?.fullName || 'Anonymous',
              isAnonymous: false
            },
            timestamp: bid.placedAt,
            status: bid.status,
            isProxyBid: bid.isProxy,
            proxyMaxBid: bid.maxAmount,
            isCurrentUser: bid.userId?._id === user?.id
          }))}
          currentHighestBid={bidStats?.highestBid || currentHighestBid}
          reservePrice={reservePrice}
          isLoading={loading}
          showPrivateInfo={user?.role === 'admin' || isUserSeller}
          showBidderDetails={user?.role === 'admin' || isUserSeller || user?.role === 'seller'}
          isAuctionEnded={auctionEndTime ? new Date() > new Date(auctionEndTime) : false}
          onRefresh={loadBiddingData}
          onBidUpdated={handleBidUpdated}
        />
      </div>

      {/* Auction Rules */}
      <div className="bg-secondary/20 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Auction Rules</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Bids must be higher than the current highest bid</p>
          <p>• You can edit or cancel your bid before the auction ends</p>
          <p>• Reserve price must be met for the auction to be valid</p>
          <p>• The seller will finalize the winning bid after auction ends</p>
          <p>• All bids are binding once the auction is finalized</p>
        </div>
      </div>
      </div>
    </BiddingErrorBoundary>
  )
} 