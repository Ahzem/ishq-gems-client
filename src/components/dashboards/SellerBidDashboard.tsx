'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, SortAsc, SortDesc, Eye, Gavel, Clock, CheckCircle2, AlertTriangle, TrendingUp, Trophy, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import bidService from '@/services/bid.service'
import BidHistory from '@/components/bidding/BidHistory'
import AuctionTimer from '@/components/bidding/AuctionTimer'
import S3Image from '@/components/common/S3Image'
import Toast from '@/components/alerts/Toast'
import ConfirmDialog from '@/components/alerts/ConfirmDialog'
import { AuctionGem } from '@/types/entities/bid'

interface DashboardFilters {
  status: 'all' | 'not-started' | 'active' | 'ending-soon' | 'ended'
  hasBids: 'all' | 'with-bids' | 'no-bids'
  reserveMet: 'all' | 'met' | 'not-met'
  sortBy: 'endTime' | 'startTime' | 'totalBids' | 'currentBid' | 'created'
  sortOrder: 'asc' | 'desc'
  search: string
}

export default function SellerBidDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [auctionGems, setAuctionGems] = useState<AuctionGem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGem, setSelectedGem] = useState<AuctionGem | null>(null)
  const [showBidHistory, setShowBidHistory] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedBidToFinalize, setSelectedBidToFinalize] = useState<{ gemId: string; bidId: string } | null>(null)
  const [filters, setFilters] = useState<DashboardFilters>({
    status: 'all',
    hasBids: 'all',
    reserveMet: 'all',
    sortBy: 'endTime',
    sortOrder: 'asc',
    search: ''
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const fetchAuctionGems = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setToast({ message: 'Please login to view your auctions', type: 'error' })
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      console.log(`Fetching auction gems for seller: ${user.email} (${user.id})`)
      const response = await bidService.getSellerAuctions()
      
      if (response.success && response.data) {
        const gems = response.data as AuctionGem[]
        setAuctionGems(gems)
        console.log(`Successfully loaded ${gems.length} auction gems for seller ${user.id}`)
      } else {
        const errorMsg = `Failed to load auction gems for seller ${user.id}: ${response.message || 'Unknown error'}`
        console.error(errorMsg)
        setToast({ message: 'Failed to load auction gems', type: 'error' })
      }
    } catch (_error) {
      const errorMsg = `Error fetching auction gems for seller ${user.id}:` + (_error instanceof Error ? _error.message : 'Unknown error')
      console.error(errorMsg)
      setToast({ message: 'Failed to load auction gems', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`SellerBidDashboard loaded for user: ${user.email} (${user.id})`)
      fetchAuctionGems()
    }
  }, [isAuthenticated, user, fetchAuctionGems])

  const handleFinalizeBid = async (gemId: string, bidId: string) => {
    setSelectedBidToFinalize({ gemId, bidId })
    setShowConfirmDialog(true)
  }

  const confirmFinalizeBid = async () => {
    if (!selectedBidToFinalize || !user) return

    try {
      setActionLoading(selectedBidToFinalize.bidId)
      console.log(`Seller ${user.email} (${user.id}) finalizing bid ${selectedBidToFinalize.bidId} for gem ${selectedBidToFinalize.gemId}`)
      
      const response = await bidService.finalizeBid(selectedBidToFinalize.bidId, `Finalized by seller ${user.fullName}`)
      
      if (response.success) {
        setToast({ message: 'Bid finalized successfully!', type: 'success' })
        console.log(`Successfully finalized bid ${selectedBidToFinalize.bidId} by seller ${user.id}`)
        await fetchAuctionGems() // Refresh data
      } else {
        const errorMsg = `Failed to finalize bid ${selectedBidToFinalize.bidId} by seller ${user.id}: ${response.message || 'Unknown error'}`
        console.error(errorMsg)
        setToast({ message: response.message || 'Failed to finalize bid', type: 'error' })
      }
    } catch (_error) {
      const errorMsg = `Error finalizing bid ${selectedBidToFinalize.bidId} by seller ${user.id}: ${_error instanceof Error ? _error.message : 'Unknown error'}`
      console.error(errorMsg)
      setToast({ message: 'Failed to finalize bid', type: 'error' })
    } finally {
      setActionLoading(null)
      setShowConfirmDialog(false)
      setSelectedBidToFinalize(null)
    }
  }

  const filteredAndSortedGems = auctionGems
    .filter(gem => {
      // Status filter
      if (filters.status !== 'all' && gem.auctionStatus !== filters.status) return false
      
      // Bids filter
      if (filters.hasBids === 'with-bids' && gem.totalBids === 0) return false
      if (filters.hasBids === 'no-bids' && gem.totalBids > 0) return false
      
      // Reserve price filter
      if (filters.reserveMet !== 'all' && gem.reservePrice) {
        const reserveMet = gem.currentHighestBid >= gem.reservePrice
        if (filters.reserveMet === 'met' && !reserveMet) return false
        if (filters.reserveMet === 'not-met' && reserveMet) return false
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return (
          gem.gemType.toLowerCase().includes(searchLower) ||
          gem.color.toLowerCase().includes(searchLower) ||
          gem.reportNumber.toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })
    .sort((a, b) => {
      const modifier = filters.sortOrder === 'asc' ? 1 : -1
      
      switch (filters.sortBy) {
        case 'endTime':
          return modifier * (new Date(a.auctionEndTime).getTime() - new Date(b.auctionEndTime).getTime())
        case 'startTime':
          return modifier * (new Date(a.auctionStartTime).getTime() - new Date(b.auctionStartTime).getTime())
        case 'totalBids':
          return modifier * (a.totalBids - b.totalBids)
        case 'currentBid':
          return modifier * (a.currentHighestBid - b.currentHighestBid)
        default:
          return 0
      }
    })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not-started': return Clock
      case 'active': return TrendingUp
      case 'ending-soon': return AlertTriangle
      case 'ended': return CheckCircle2
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'ending-soon': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'ended': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Handle authentication states
  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please login as a seller to access your auction dashboard.</p>
        </div>
      </div>
    )
  }

  // Validate seller role
  if (user.role !== 'seller' && user.role !== 'admin') {
    console.warn(`User ${user.email} (${user.id}) with role ${user.role} attempted to access seller dashboard`)
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">Only sellers and administrators can access this dashboard.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary/20 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const stats = {
    totalAuctions: auctionGems.length,
    activeAuctions: auctionGems.filter(gem => gem.auctionStatus === 'active').length,
    totalBids: auctionGems.reduce((sum, gem) => sum + gem.totalBids, 0),
    totalValue: auctionGems.reduce((sum, gem) => sum + gem.currentHighestBid, 0)
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total Auctions', value: stats.totalAuctions, icon: Gavel, color: 'primary' },
          { label: 'Active Auctions', value: stats.activeAuctions, icon: TrendingUp, color: 'green' },
          { label: 'Total Bids', value: stats.totalBids, icon: Trophy, color: 'blue' },
          { label: 'Total Value', value: stats.totalValue, icon: DollarSign, color: 'primary', isCurrency: true }
        ].map((stat, index) => (
          <div key={index} className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {isLoading ? '...' : stat.isCurrency ? formatCurrency(stat.value) : stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-2 sm:p-3 bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/10 rounded-lg`}>
                <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 text-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search gems..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as DashboardFilters['status'] }))}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="active">Active</option>
            <option value="ending-soon">Ending Soon</option>
            <option value="ended">Ended</option>
          </select>
          
          {/* Bids filter */}
          <select
            value={filters.hasBids}
            onChange={(e) => setFilters(prev => ({ ...prev, hasBids: e.target.value as DashboardFilters['hasBids'] }))}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="all">All Gems</option>
            <option value="with-bids">With Bids</option>
            <option value="no-bids">No Bids</option>
          </select>
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as DashboardFilters['sortBy'] }))}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="endTime">End Time</option>
              <option value="totalBids">Total Bids</option>
              <option value="currentBid">Current Bid</option>
              <option value="startTime">Start Time</option>
            </select>
            
            <button
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
              className="p-2 border border-border rounded-lg bg-background hover:bg-secondary transition-colors"
            >
              {filters.sortOrder === 'asc' ? 
                <SortAsc className="w-4 h-4" /> : 
                <SortDesc className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Gems List */}
      <div className="space-y-4">
        {filteredAndSortedGems.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Auction Gems Found</h3>
            <p className="text-muted-foreground">No auction gems match your current filters.</p>
          </div>
        ) : (
          filteredAndSortedGems.map(gem => {
            const StatusIcon = getStatusIcon(gem.auctionStatus)
            const primaryImage = gem.media?.find(m => m.type === 'image' && m.isPrimary) || 
                                gem.media?.find(m => m.type === 'image')
            const winningBid = gem.bids?.find(bid => bid.status === 'winning')
            const isReserveMet = !gem.reservePrice || gem.currentHighestBid >= gem.reservePrice
            
            return (
              <div key={gem._id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Gem Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary/20 flex-shrink-0">
                      {primaryImage ? (
                        <S3Image
                          src={primaryImage.url}
                          alt={`${gem.gemType} - ${gem.color}`}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          fallbackText={gem.gemType.charAt(0)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gavel className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Gem Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {gem.gemType} - {gem.color}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {gem.weight.value} {gem.weight.unit} • Report #{gem.reportNumber}
                          </p>
                        </div>
                        
                        <div className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                          getStatusColor(gem.auctionStatus)
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          <span className="capitalize">{gem.auctionStatus.replace('-', ' ')}</span>
                        </div>
                      </div>
                      
                      {/* Bid Information */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Starting Bid</div>
                          <div className="font-semibold">{formatCurrency(gem.startingBid)}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Current Bid</div>
                          <div className={cn(
                            "font-semibold",
                            gem.currentHighestBid > gem.startingBid ? "text-green-600" : "text-muted-foreground"
                          )}>
                            {gem.currentHighestBid > 0 ? formatCurrency(gem.currentHighestBid) : 'No bids'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Total Bids</div>
                          <div className="font-semibold">{gem.totalBids}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Reserve</div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">
                              {gem.reservePrice ? formatCurrency(gem.reservePrice) : 'None'}
                            </span>
                            {gem.reservePrice && (
                              <div className={cn(
                                'w-2 h-2 rounded-full',
                                isReserveMet ? 'bg-green-500' : 'bg-yellow-500'
                              )} />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Timer */}
                      <div className="mb-4">
                        <AuctionTimer
                          auctionStartTime={gem.auctionStartTime}
                          auctionEndTime={gem.auctionEndTime}
                          currentHighestBid={gem.currentHighestBid}
                          reservePrice={gem.reservePrice}
                          compact={true}
                          showLabels={true}
                        />
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedGem(gem)
                            setShowBidHistory(true)
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Bids ({gem.totalBids})
                        </button>
                        
                        {gem.auctionStatus === 'ended' && winningBid && !gem.finalizedBidId && (
                          <button
                            onClick={() => handleFinalizeBid(gem._id, winningBid._id)}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            disabled={actionLoading === winningBid._id}
                          >
                            {actionLoading === winningBid._id ? (
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <>
                                <Trophy className="w-4 h-4" />
                                Finalize Winner
                              </>
                            )}
                          </button>
                        )}
                        
                        {gem.finalizedBidId && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Winner Selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Bid History Modal */}
      {showBidHistory && selectedGem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBidHistory(false)} />
          
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Bid History - {selectedGem.gemType} {selectedGem.color}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Report #{selectedGem.reportNumber}
                </p>
              </div>
              <button
                onClick={() => setShowBidHistory(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Bid History Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <BidHistory
                gemId={selectedGem._id}
                bids={selectedGem.bids?.map(bid => ({
                  ...bid,
                  bidder: {
                    id: bid.userId._id,
                    name: bid.userId.fullName,
                    isAnonymous: false
                  },
                  isCurrentUser: user?.id === bid.userId._id,
                  // Ensure disputedBy has required email field
                  disputedBy: bid.disputedBy ? {
                    _id: bid.disputedBy._id,
                    fullName: bid.disputedBy.fullName,
                    email: bid.disputedBy.email || 'No email provided'
                  } : undefined,
                  // Ensure disputeResolvedBy has required email field
                  disputeResolvedBy: bid.disputeResolvedBy ? {
                    _id: bid.disputeResolvedBy._id,
                    fullName: bid.disputeResolvedBy.fullName,
                    email: bid.disputeResolvedBy.email || 'No email provided'
                  } : undefined
                })) || []}
                currentHighestBid={selectedGem.currentHighestBid}
                reservePrice={selectedGem.reservePrice}
                showPrivateInfo={true}
                showBidderDetails={true}
                maxHeight="500px"
                onRefresh={() => {
                  console.log(`Seller ${user?.id} refreshing bid history for gem ${selectedGem._id}`)
                  fetchAuctionGems()
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Finalize Winning Bid"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to finalize this bid? This action cannot be undone.</p>
            <p className="text-sm opacity-80">Finalizing the bid will:</p>
            <ul className="list-disc list-inside text-sm opacity-80">
              <li>Mark the auction as completed</li>
              <li>Notify the winning bidder</li>
              <li>Close bidding permanently</li>
            </ul>
          </div>
        }
        confirmText="Finalize Bid"
        cancelText="Cancel"
        onConfirm={confirmFinalizeBid}
        onCancel={() => {
          setShowConfirmDialog(false)
          setSelectedBidToFinalize(null)
        }}
        type="warning"
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => setToast(null)}
            duration={5000}
          />
        </div>
      )}
    </div>
  )
} 