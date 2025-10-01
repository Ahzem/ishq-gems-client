'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, SortAsc, SortDesc, Eye, Gavel, Clock, CheckCircle2, AlertTriangle, Shield, TrendingUp, DollarSign, XCircle, Ban, AlertOctagon, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import bidService from '@/services/bid.service'
import AuctionTimer from '@/components/bidding/AuctionTimer'
import S3Image from '@/components/common/S3Image'
import Toast from '@/components/alerts/Toast'
import ConfirmDialog from '@/components/alerts/ConfirmDialog'
import BidHistory from '@/components/bidding/BidHistory'
import { AdminAuctionView } from '@/types'

// Using centralized AdminAuctionView interface from @/types

interface AdminFilters {
  status: 'all' | 'not-started' | 'active' | 'ending-soon' | 'ended'
  hasBids: 'all' | 'with-bids' | 'no-bids'
  hasDisputes: 'all' | 'with-disputes' | 'no-disputes'
  seller: string
  sortBy: 'endTime' | 'startTime' | 'totalBids' | 'currentBid' | 'totalValue' | 'disputes'
  sortOrder: 'asc' | 'desc'
  search: string
  flaggedOnly: boolean
}

export default function AdminBidManagement() {
  const { user } = useAuth()
  const [auctionGems, setAuctionGems] = useState<AdminAuctionView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGem, setSelectedGem] = useState<AdminAuctionView | null>(null)
  const [showBidHistory, setShowBidHistory] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmDialogType, setConfirmDialogType] = useState<'finalize' | 'cancel' | null>(null)
  const [selectedBidAction, setSelectedBidAction] = useState<{ gemId: string; bidId: string } | null>(null)
  const [filters, setFilters] = useState<AdminFilters>({
    status: 'all',
    hasBids: 'all',
    hasDisputes: 'all',
    seller: '',
    sortBy: 'endTime',
    sortOrder: 'asc',
    search: '',
    flaggedOnly: false
  })
  const [stats, setStats] = useState({
    totalActiveAuctions: 0,
    totalBidsToday: 0,
    totalValue: 0,
    disputesCount: 0
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const response = await bidService.getAdminStats()
      
      if (response.success && response.data) {
        setStats(response.data)
        
        // Debug: Verify active auction count matches filtered data
        const actualActiveCount = auctionGems.filter(gem => gem.auctionStatus === 'active').length
        console.log('Stats from backend - Active auctions:', response.data.totalActiveAuctions)
        console.log('Calculated from UI data - Active auctions:', actualActiveCount)
        
        if (response.data.totalActiveAuctions !== actualActiveCount && auctionGems.length > 0) {
          console.warn('Active auction count mismatch detected!')
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [auctionGems])

  const fetchAuctionData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await bidService.getAllAuctions({ includeAdminData: true })
      
      if (response.success && response.data) {
        setAuctionGems(response.data)
        
        // After getting auction data, refresh stats to ensure they're in sync
        setTimeout(() => {
          fetchStats()
        }, 100)
      }
    } catch (error) {
      console.error('Error fetching auction data:', error)
      setToast({ message: 'Failed to load auction data', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [fetchStats])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAuctionData() // fetchStats() is called automatically after auction data loads
    }
  }, [user, fetchAuctionData])

  const handleFinalizeBid = async (gemId: string, bidId: string) => {
    setSelectedBidAction({ gemId, bidId })
    setConfirmDialogType('finalize')
    setShowConfirmDialog(true)
  }



  const confirmAction = async () => {
    if (!selectedBidAction || !confirmDialogType) return

    try {
      setActionLoading(selectedBidAction.bidId)

      if (confirmDialogType === 'finalize') {
        const response = await bidService.finalizeBid(selectedBidAction.bidId, 'Finalized by admin')
        
        if (response.success) {
          setToast({ message: 'Bid finalized successfully', type: 'success' })
          await fetchAuctionData()
          await fetchStats()
        } else {
          setToast({ message: response.message || 'Failed to finalize bid', type: 'error' })
        }
      } else if (confirmDialogType === 'cancel') {
        const response = await bidService.cancelBid(selectedBidAction.bidId, 'Cancelled by admin')
        
        if (response.success) {
          setToast({ message: 'Bid cancelled successfully', type: 'success' })
          await fetchAuctionData()
          await fetchStats()
        } else {
          setToast({ message: response.message || 'Failed to cancel bid', type: 'error' })
        }
      }
    } catch {
      setToast({ 
        message: `Error ${confirmDialogType === 'finalize' ? 'finalizing' : 'cancelling'} bid`, 
        type: 'error' 
      })
    } finally {
      setActionLoading(null)
      setShowConfirmDialog(false)
      setSelectedBidAction(null)
      setConfirmDialogType(null)
    }
  }

  const handleFlagBid = async (bidId: string, reason: string) => {
    try {
      setActionLoading(bidId)
      const response = await bidService.flagBid(bidId, reason)
      
      if (response.success) {
        setToast({ message: 'Bid flagged for dispute resolution', type: 'info' })
        await fetchAuctionData()
      } else {
        setToast({ message: response.message || 'Failed to flag bid', type: 'error' })
      }
    } catch (_err) {
      console.error('Error flagging bid:', _err)
      setToast({ message: 'Failed to flag bid for dispute resolution', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleResolveDispute = async (bidId: string, resolution: 'approved' | 'cancelled', notes?: string) => {
    try {
      const response = await bidService.resolveDispute(bidId, resolution, notes)
      
      if (response.success) {
        setToast({ message: `Dispute resolved: bid ${resolution}`, type: 'success' })
        await fetchAuctionData()
      } else {
        setToast({ message: response.message || 'Failed to resolve dispute', type: 'error' })
      }
    } catch (_error) {
      console.error('Error resolving dispute:', _error)
      setToast({ message: 'Failed to resolve dispute', type: 'error' })
    }
  }

  const filteredAndSortedGems = auctionGems
    .filter(gem => {
      // Status filter
      if (filters.status !== 'all' && gem.auctionStatus !== filters.status) return false
      
      // Bids filter
      if (filters.hasBids === 'with-bids' && gem.totalBids === 0) return false
      if (filters.hasBids === 'no-bids' && gem.totalBids > 0) return false
      
      // Disputes filter
      if (filters.hasDisputes === 'with-disputes' && !gem.hasDisputes) return false
      if (filters.hasDisputes === 'no-disputes' && gem.hasDisputes) return false
      
      // Flagged only filter
      if (filters.flaggedOnly && !gem.flaggedBidsCount) return false
      
      // Seller filter
      if (filters.seller && !gem.seller.name.toLowerCase().includes(filters.seller.toLowerCase())) return false
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return (
          gem.gemType.toLowerCase().includes(searchLower) ||
          gem.color.toLowerCase().includes(searchLower) ||
          gem.reportNumber.toLowerCase().includes(searchLower) ||
          gem.seller.name.toLowerCase().includes(searchLower)
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
        case 'totalValue':
          return modifier * ((a.totalValue || 0) - (b.totalValue || 0))
        case 'disputes':
          return modifier * ((a.flaggedBidsCount || 0) - (b.flaggedBidsCount || 0))
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

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-secondary/20 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary/20 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Active Auctions', value: stats.totalActiveAuctions, icon: TrendingUp, color: 'primary' },
          { label: 'Bids Today', value: stats.totalBidsToday, icon: Gavel, color: 'green' },
          { label: 'Total Value', value: stats.totalValue, icon: DollarSign, color: 'primary', isCurrency: true },
          { label: 'Disputes', value: stats.disputesCount, icon: AlertOctagon, color: stats.disputesCount > 0 ? 'red' : 'gray' }
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
      <div className="bg-card border border-border/30 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search gems, sellers, or report numbers..."
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as AdminFilters['status'] }))}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="active">Active</option>
              <option value="ending-soon">Ending Soon</option>
              <option value="ended">Ended</option>
            </select>
            
            <select
              value={filters.hasBids}
              onChange={(e) => setFilters(prev => ({ ...prev, hasBids: e.target.value as AdminFilters['hasBids'] }))}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[120px]"
            >
              <option value="all">All Gems</option>
              <option value="with-bids">With Bids</option>
              <option value="no-bids">No Bids</option>
            </select>
            
            <select
              value={filters.hasDisputes}
              onChange={(e) => setFilters(prev => ({ ...prev, hasDisputes: e.target.value as AdminFilters['hasDisputes'] }))}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[120px]"
            >
              <option value="all">All</option>
              <option value="with-disputes">With Disputes</option>
              <option value="no-disputes">No Disputes</option>
            </select>
            
            <div className="flex items-center gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as AdminFilters['sortBy'] }))}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="endTime">End Time</option>
                <option value="totalBids">Total Bids</option>
                <option value="currentBid">Current Bid</option>
                <option value="totalValue">Total Value</option>
                <option value="disputes">Disputes</option>
              </select>
              
              <button
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                }))}
                className="p-2 border border-border rounded-lg bg-background hover:bg-secondary transition-colors"
                title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {filters.sortOrder === 'asc' ? 
                  <SortAsc className="w-4 h-4" /> : 
                  <SortDesc className="w-4 h-4" />
                }
              </button>
            </div>
            
            <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background cursor-pointer">
              <input
                type="checkbox"
                checked={filters.flaggedOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, flaggedOnly: e.target.checked }))}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-foreground">Flagged Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Auction List */}
      <div className="space-y-4">
        {filteredAndSortedGems.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Auctions Found</h3>
            <p className="text-muted-foreground">No auctions match your current filters.</p>
          </div>
        ) : (
          filteredAndSortedGems.map(gem => {
            const StatusIcon = getStatusIcon(gem.auctionStatus)
            const primaryImage = gem.media?.find(m => m.type === 'image' && m.isPrimary) || 
                                gem.media?.find(m => m.type === 'image')
            
            return (
              <div key={gem._id} className={cn(
                "bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow",
                gem.hasDisputes ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10" : "border-border"
              )}>
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
                          <p className="text-sm text-muted-foreground">
                            Seller: {gem.seller.name} ({gem.seller.email})
                            {gem.seller.verified && <span className="text-green-600 ml-1">✓</span>}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {gem.hasDisputes && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                              <AlertOctagon className="w-3 h-3" />
                              <span>Disputes</span>
                            </div>
                          )}
                          
                          {(gem.flaggedBidsCount || 0) > 0 && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                              <Ban className="w-3 h-3" />
                              <span>{gem.flaggedBidsCount} Flagged</span>
                            </div>
                          )}
                          
                          <div className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                            getStatusColor(gem.auctionStatus)
                          )}>
                            <StatusIcon className="w-3 h-3" />
                            <span className="capitalize">{gem.auctionStatus.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bid Information */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
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
                          <div className="text-xs text-muted-foreground">Total Value</div>
                          <div className="font-semibold">{formatCurrency(gem.totalValue || 0)}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Reserve</div>
                          <div className="font-semibold">
                            {gem.reservePrice ? formatCurrency(gem.reservePrice) : 'None'}
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
                      
                      {/* Admin Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedGem(gem)
                            setShowBidHistory(true)
                          }}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                          <Eye className="w-4 h-4" />
                          {gem.totalBids > 0 ? `View Bids (${gem.totalBids})` : 'View Bids'}
                        </button>
                        
                        {(gem.flaggedBidsCount || 0) > 0 && (
                          <button
                            onClick={() => {
                              setSelectedGem(gem)
                              setShowBidHistory(true)
                            }}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <AlertOctagon className="w-4 h-4" />
                            Resolve Disputes
                          </button>
                        )}
                        
                        {(gem.flaggedBidsCount || 0) > 0 && (
                          <button
                            onClick={() => {
                              setSelectedGem(gem)
                              setShowBidHistory(true)
                            }}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                          >
                            <Ban className="w-4 h-4" />
                            Review Flagged ({gem.flaggedBidsCount})
                          </button>
                        )}

                        {/* Flag Suspicious Bids */}
                        {gem.totalBids > 0 && gem.auctionStatus === 'active' && (
                          <button
                            onClick={() => {
                              const suspiciousBid = gem.bids?.find(bid => bid.status === 'winning' && !bid.flagged)
                              if (suspiciousBid) {
                                handleFlagBid(suspiciousBid._id, 'Admin review requested for suspicious bidding activity')
                              }
                            }}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                          >
                            <Ban className="w-4 h-4" />
                            Flag for Review
                          </button>
                        )}

                        {/* Admin Quick Actions */}
                        {gem.totalBids > 0 && gem.auctionStatus === 'ended' && !gem.finalizedBidId && (
                          <button
                            onClick={() => {
                              const winningBid = gem.bids?.find(bid => bid.status === 'winning')
                              if (winningBid) {
                                handleFinalizeBid(gem._id, winningBid._id)
                              }
                            }}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <Trophy className="w-4 h-4" />
                            {actionLoading ? 'Processing...' : 'Finalize Winner'}
                          </button>
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

      {/* Enhanced Bid History Modal for Admin */}
      {showBidHistory && selectedGem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBidHistory(false)} />
          
          <div className="relative max-w-6xl w-full max-h-[90vh] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <div>
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Admin View - {selectedGem.gemType} {selectedGem.color}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Report #{selectedGem.reportNumber} • Seller: {selectedGem.seller.name}
                </p>
              </div>
              <button
                onClick={() => setShowBidHistory(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* BidHistory Component with Admin Controls */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <BidHistory
                gemId={selectedGem._id}
                bids={selectedGem.bids?.map(bid => ({
                  _id: bid._id,
                  amount: bid.amount,
                  bidder: {
                    id: bid.userId?._id || bid.userId?.toString() || 'unknown',
                    name: bid.userId?.fullName || 'Anonymous Bidder',
                    isAnonymous: !bid.userId?.fullName
                  },
                  timestamp: bid.placedAt,
                  status: bid.status,
                  isProxyBid: bid.isProxy,
                  proxyMaxBid: bid.maxAmount,
                  isCurrentUser: user?.id === (bid.userId?._id || bid.userId?.toString())
                })) || []}
                currentHighestBid={selectedGem.currentHighestBid}
                reservePrice={selectedGem.reservePrice}
                showPrivateInfo={true}
                showBidderDetails={true}
                maxHeight="400px"
                isAuctionEnded={selectedGem.auctionStatus === 'ended'}
                className="border-0 bg-transparent"
                onRefresh={async () => {
                  console.log(`Admin refreshing bid history for gem ${selectedGem._id}`)
                  await fetchAuctionData()
                  // Update selectedGem with fresh data
                  const updatedGem = auctionGems.find(g => g._id === selectedGem._id)
                  if (updatedGem) {
                    setSelectedGem(updatedGem)
                  }
                }}
                onBidUpdated={async () => {
                  console.log(`Admin bid updated for gem ${selectedGem._id}`)
                  await fetchAuctionData()
                  // Update selectedGem with fresh data
                  const updatedGem = auctionGems.find(g => g._id === selectedGem._id)
                  if (updatedGem) {
                    setSelectedGem(updatedGem)
                  }
                }}
              />
              
              {/* Admin Action Panel */}
              {(selectedGem.bids?.filter(bid => bid.disputed && !bid.disputeResolved).length || 0) > 0 && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4" />
                    Dispute Resolution Required
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                    This auction has {selectedGem.bids?.filter(bid => bid.disputed && !bid.disputeResolved).length || 0} disputed bid(s) that require admin review. 
                    Use the action buttons above to approve or reject individual bids.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Bulk approve all disputed bids
                        const disputedBids = selectedGem.bids?.filter(bid => bid.disputed && !bid.disputeResolved) || []
                        disputedBids.forEach(bid => {
                          if (bid.disputeReason) {
                            handleResolveDispute(bid._id, 'approved')
                          }
                        })
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 inline mr-2" />
                      Approve All Disputed
                    </button>
                    <button
                      onClick={() => {
                        // Bulk reject all disputed bids
                        const disputedBids = selectedGem.bids?.filter(bid => bid.disputed && !bid.disputeResolved) || []
                        disputedBids.forEach(bid => {
                          if (bid.disputeReason) {
                            handleResolveDispute(bid._id, 'cancelled')
                          }
                        })
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4 inline mr-2" />
                      Reject All Disputed
                    </button>
                  </div>
                </div>
              )}

              {/* Auction Summary */}
              <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Auction Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <div className="font-medium capitalize">{selectedGem.auctionStatus.replace('-', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Bids</div>
                    <div className="font-medium">{selectedGem.totalBids}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Flagged Bids</div>
                    <div className={cn(
                      "font-medium",
                      (selectedGem.flaggedBidsCount || 0) > 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {(selectedGem.flaggedBidsCount || 0) > 0 ? selectedGem.flaggedBidsCount : 'None'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Value</div>
                    <div className="font-medium">{formatCurrency(selectedGem.totalValue || 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title={confirmDialogType === 'finalize' ? 'Finalize Winning Bid' : 'Cancel Bid'}
        message={
          confirmDialogType === 'finalize' ? (
            <div className="space-y-2">
              <p>Are you sure you want to finalize this bid? This action cannot be undone.</p>
              <p className="text-sm opacity-80">Finalizing the bid will:</p>
              <ul className="list-disc list-inside text-sm opacity-80">
                <li>Mark the auction as completed</li>
                <li>Notify the winning bidder</li>
                <li>Close bidding permanently</li>
                <li>Generate final transaction records</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-2">
              <p>Are you sure you want to cancel this bid?</p>
              <p className="text-sm opacity-80">Cancelling the bid will:</p>
              <ul className="list-disc list-inside text-sm opacity-80">
                <li>Remove the bid from the auction</li>
                <li>Notify the bidder</li>
                <li>Update auction statistics</li>
                <li>This action can be reversed if needed</li>
              </ul>
            </div>
          )
        }
        confirmText={confirmDialogType === 'finalize' ? 'Finalize Bid' : 'Cancel Bid'}
        cancelText="Close"
        onConfirm={confirmAction}
        onCancel={() => {
          setShowConfirmDialog(false)
          setSelectedBidAction(null)
          setConfirmDialogType(null)
        }}
        type={confirmDialogType === 'finalize' ? 'warning' : 'danger'}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type as 'success' | 'error' | 'info'}
            isVisible={true}
            onClose={() => setToast(null)}
            duration={5000}
          />
        </div>
      )}
    </div>
  )
} 