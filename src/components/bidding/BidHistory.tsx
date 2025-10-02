'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Clock, Crown, TrendingUp, EyeOff, Shield, Star, ChevronDown, ChevronUp, RefreshCw, Edit2, Trash2, AlertCircle, Flag, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import bidService from '@/services/bid.service'

export interface BidData {
  _id: string
  amount: number
  bidder: {
    id: string
    name: string
    isAnonymous?: boolean
    avatar?: string
  }
  timestamp: string
  status: 'active' | 'outbid' | 'winning' | 'finalized' | 'cancelled'
  isProxyBid?: boolean
  proxyMaxBid?: number
  isCurrentUser?: boolean
  disputed?: boolean
  disputedAt?: string
  disputedBy?: { _id: string; fullName: string; email: string }
  disputeReason?: string
  disputeResolved?: boolean
  disputeResolvedAt?: string
  disputeResolvedBy?: { _id: string; fullName: string; email: string }
  disputeResolution?: 'approved' | 'cancelled'
}

export interface BidHistoryProps {
  gemId: string
  bids: BidData[]
  currentHighestBid?: number
  reservePrice?: number
  isLoading?: boolean
  showPrivateInfo?: boolean // For admin/seller view
  showBidderDetails?: boolean
  maxHeight?: string
  className?: string
  onRefresh?: () => void
  onBidUpdated?: () => void
  isAuctionEnded?: boolean
}

export default function BidHistory({
  gemId,
  bids,
  currentHighestBid,
  reservePrice,
  isLoading = false,
  showPrivateInfo = false,
  showBidderDetails = true,
  maxHeight = '400px',
  className,
  onRefresh,
  onBidUpdated,
  isAuctionEnded = false
}: BidHistoryProps) {
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [visibleBids] = useState(5)
  const [editingBid, setEditingBid] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFlagDialog, setShowFlagDialog] = useState<string | null>(null)
  const [flagReason, setFlagReason] = useState('')
  const [showResolveDialog, setShowResolveDialog] = useState<string | null>(null)
  const [resolveNotes, setResolveNotes] = useState('')

  // Sort bids by timestamp (newest first)
  const sortedBids = [...bids].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // Log bid history loading for debugging
  if (bids.length > 0) {
    console.log(`Loaded ${bids.length} bids for gem ${gemId}`)
  }

  const displayBids = isExpanded ? sortedBids : sortedBids.slice(0, visibleBids)

  const handleEditBid = async (bidId: string, newAmount: number) => {
    try {
      setActionLoading(bidId)
      setError(null)
      
      console.log(`Updating bid ${bidId} for gem ${gemId} with new amount: ${newAmount}`)
      
      const response = await bidService.updateBid(bidId, { amount: newAmount })
      
      if (response.success) {
        setEditingBid(null)
        setEditAmount('')
        onBidUpdated?.()
        onRefresh?.()
        console.log(`Successfully updated bid ${bidId} for gem ${gemId}`)
      } else {
        const errorMsg = `Failed to update bid for gem ${gemId}: ${response.message || 'Unknown error'}`
        setError(errorMsg)
        console.error(errorMsg)
      }
    } catch (error) {
      const errorMsg = `Error updating bid ${bidId} for gem ${gemId}: ${error instanceof Error ? error.message : 'Failed to update bid'}`
      setError(errorMsg)
      console.error(errorMsg)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteBid = async (bidId: string) => {
    if (!confirm(`Are you sure you want to delete this bid for gem ${gemId}?`)) return
    
    try {
      setActionLoading(bidId)
      setError(null)
      
      console.log(`Deleting bid ${bidId} for gem ${gemId}`)
      
      const response = await bidService.deleteBid(bidId)
      
      if (response.success) {
        onBidUpdated?.()
        onRefresh?.()
        console.log(`Successfully deleted bid ${bidId} for gem ${gemId}`)
      } else {
        const errorMsg = `Failed to delete bid for gem ${gemId}: ${response.message || 'Unknown error'}`
        setError(errorMsg)
        console.error(errorMsg)
      }
    } catch (error) {
      const errorMsg = `Error deleting bid ${bidId} for gem ${gemId}: ${error instanceof Error ? error.message : 'Failed to delete bid'}`
      setError(errorMsg)
      console.error(errorMsg)
    } finally {
      setActionLoading(null)
    }
  }

  const canUserEditBid = (bid: BidData) => {
    if (isAuctionEnded) return false
    return user?.role === 'admin' || (bid.isCurrentUser && bid.status === 'active')
  }

  const canUserDeleteBid = (bid: BidData) => {
    if (isAuctionEnded) return false
    return user?.role === 'admin' || (bid.isCurrentUser && bid.status !== 'finalized')
  }

  const canFlagBid = (bid: BidData) => {
    return user?.role === 'admin' && !bid.disputed
  }

  const canResolveDispute = (bid: BidData) => {
    return user?.role === 'admin' && bid.disputed && !bid.disputeResolved
  }

  const handleFlagBid = async (bidId: string) => {
    if (!flagReason.trim()) return

    try {
      setActionLoading(bidId)
      setError(null)
      
      console.log(`Flagging bid ${bidId} for gem ${gemId} with reason: ${flagReason}`)
      
      const response = await bidService.flagBid(bidId, flagReason.trim())
      
      if (response.success) {
        onBidUpdated?.()
        onRefresh?.()
        setShowFlagDialog(null)
        setFlagReason('')
        console.log(`Successfully flagged bid ${bidId} for gem ${gemId}`)
      } else {
        const errorMsg = `Failed to flag bid for gem ${gemId}: ${response.message || 'Unknown error'}`
        setError(errorMsg)
        console.error(errorMsg)
      }
    } catch (error) {
      const errorMsg = `Error flagging bid ${bidId} for gem ${gemId}: ${error instanceof Error ? error.message : 'Failed to flag bid'}`
      setError(errorMsg)
      console.error(errorMsg)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResolveDispute = async (bidId: string, resolution: 'approved' | 'cancelled') => {
    try {
      setActionLoading(bidId)
      setError(null)
      
      console.log(`Resolving dispute for bid ${bidId} on gem ${gemId} with resolution: ${resolution}`)
      
      const response = await bidService.resolveDispute(bidId, resolution, resolveNotes.trim())
      
      if (response.success) {
        onBidUpdated?.()
        onRefresh?.()
        setShowResolveDialog(null)
        setResolveNotes('')
        console.log(`Successfully resolved dispute for bid ${bidId} on gem ${gemId}`)
      } else {
        const errorMsg = `Failed to resolve dispute for gem ${gemId}: ${response.message || 'Unknown error'}`
        setError(errorMsg)
        console.error(errorMsg)
      }
    } catch (error) {
      const errorMsg = `Error resolving dispute for bid ${bidId} on gem ${gemId}: ${error instanceof Error ? error.message : 'Failed to resolve dispute'}`
      setError(errorMsg)
      console.error(errorMsg)
    } finally {
      setActionLoading(null)
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBidStatusInfo = (bid: BidData) => {
    switch (bid.status) {
      case 'winning':
        return {
          icon: Crown,
          label: 'Winning',
          className: 'text-green-600 bg-green-100 dark:bg-green-900/20'
        }
      case 'active':
        return {
          icon: TrendingUp,
          label: 'Active',
          className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
        }
      case 'outbid':
        return {
          icon: TrendingUp,
          label: 'Outbid',
          className: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
        }
      case 'finalized':
        return {
          icon: Star,
          label: 'Won',
          className: 'text-primary bg-primary/10'
        }
      case 'cancelled':
        return {
          icon: EyeOff,
          label: 'Cancelled',
          className: 'text-red-600 bg-red-100 dark:bg-red-900/20'
        }
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          className: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
        }
    }
  }

  const getBidderDisplay = (bid: BidData) => {
    if (bid.isCurrentUser) {
      return 'You'
    }
    
    if (!showBidderDetails || bid.bidder.isAnonymous) {
      return 'Anonymous Bidder'
    }
    
    return bid.bidder.name || 'Anonymous Bidder'
  }

  const isReserveMet = (amount: number) => {
    return !reservePrice || amount >= reservePrice
  }

  if (isLoading) {
    return (
      <div className={cn('bg-card border border-border rounded-xl p-6', className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Bid History</h3>
            <div className="animate-spin">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          
          {/* Loading skeleton */}
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-full animate-pulse" />
                  <div className="space-y-1">
                    <div className="w-20 h-4 bg-secondary rounded animate-pulse" />
                    <div className="w-16 h-3 bg-secondary rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-16 h-4 bg-secondary rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (bids.length === 0) {
    console.log(`No bids found for gem ${gemId}`)
    return (
      <div className={cn('bg-card border border-border rounded-xl p-6', className)}>
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">No Bids Yet</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to place a bid on this auction!
          </p>
          {showPrivateInfo && (
            <p className="text-xs text-muted-foreground mt-2">
              Gem ID: {gemId}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-secondary/10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Bid History ({bids.length})
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {showPrivateInfo && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/20 px-2 py-1 rounded-full">
              <Shield className="w-3 h-3" />
              <span>
                {user?.role === 'admin' ? 'Admin View' : 'Seller View'}
                {/* Only show gem ID in development or for admins */}
                {(process.env.NODE_ENV === 'development' || user?.role === 'admin') && (
                  <span className="ml-1 opacity-75">- {gemId}</span>
                )}
              </span>
            </div>
          )}
          
          {onRefresh && (
            <button
              onClick={() => {
                console.log(`Refreshing bids for gem ${gemId}`)
                onRefresh()
              }}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title={`Refresh bids for gem ${gemId}`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-border/30">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Bid List */}
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        <div className="divide-y divide-border/30">
          {displayBids.map((bid, index) => {
            const statusInfo = getBidStatusInfo(bid)
            const StatusIcon = statusInfo.icon
            const isHighestBid = index === 0
            
            return (
              <div
                key={bid._id}
                className={cn(
                  'p-4 transition-colors hover:bg-secondary/20',
                  bid.isCurrentUser && 'bg-primary/5 border-l-2 border-primary',
                  isHighestBid && bid.status === 'winning' && 'bg-green-50 dark:bg-green-900/10'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Bidder Avatar/Icon */}
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                      bid.isCurrentUser 
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    )}>
                      {bid.bidder.avatar ? (
                        <Image
                          src={bid.bidder.avatar}
                          alt={getBidderDisplay(bid)}
                          width={32}
                          height={32}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        (getBidderDisplay(bid) || 'A').charAt(0).toUpperCase()
                      )}
                    </div>
                    
                    {/* Bid Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {getBidderDisplay(bid)}
                        </span>
                        
                        {isHighestBid && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        
                        {bid.isProxyBid && (
                          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded">
                            Proxy
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(bid.timestamp)}</span>
                        
                        {!isReserveMet(bid.amount) && (
                          <span className="text-amber-600">• Below reserve</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {/* Bid Amount */}
                    <div className={cn(
                      'font-bold text-lg',
                      isHighestBid ? 'text-primary' : 'text-foreground'
                    )}>
                      {formatCurrency(bid.amount)}
                    </div>
                    
                    {/* Proxy Max Bid (Admin/Seller view) */}
                    {showPrivateInfo && bid.proxyMaxBid && bid.proxyMaxBid > bid.amount && (
                      <div className="text-xs text-muted-foreground">
                        Max: {formatCurrency(bid.proxyMaxBid)}
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1',
                      statusInfo.className
                    )}>
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusInfo.label}</span>
                    </div>

                    {/* Dispute Status */}
                    {bid.disputed && (
                      <div className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ml-2',
                        bid.disputeResolved 
                          ? bid.disputeResolution === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                      )}>
                        <Flag className="w-3 h-3" />
                        <span>
                          {bid.disputeResolved 
                            ? `Dispute ${bid.disputeResolution}`
                            : 'Disputed'
                          }
                        </span>
                      </div>
                    )}

                    {/* Edit/Delete Actions */}
                    <div className="flex items-center gap-1 mt-2">
                      {canUserEditBid(bid) && (
                        <button
                          onClick={() => {
                            setEditingBid(bid._id)
                            setEditAmount(bid.amount.toString())
                            setError(null)
                          }}
                          disabled={actionLoading === bid._id}
                          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                          title="Edit bid"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                      
                      {canUserDeleteBid(bid) && (
                        <button
                          onClick={() => handleDeleteBid(bid._id)}
                          disabled={actionLoading === bid._id}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete bid"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      
                      {/* Dispute Actions */}
                      {canFlagBid(bid) && (
                        <button
                          onClick={() => {
                            setShowFlagDialog(bid._id)
                            setError(null)
                          }}
                          disabled={actionLoading === bid._id}
                          className="p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                          title="Flag for dispute"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      )}
                      
                      {canResolveDispute(bid) && (
                        <>
                          <button
                            onClick={() => handleResolveDispute(bid._id, 'approved')}
                            disabled={actionLoading === bid._id}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Approve disputed bid"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleResolveDispute(bid._id, 'cancelled')}
                            disabled={actionLoading === bid._id}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Cancel disputed bid"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                {editingBid === bid._id && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter new bid amount"
                        min={currentHighestBid && currentHighestBid > bid.amount ? currentHighestBid + 1 : bid.amount}
                      />
                      <button
                        onClick={() => {
                          const newAmount = parseFloat(editAmount)
                          if (!isNaN(newAmount) && newAmount > 0) {
                            handleEditBid(bid._id, newAmount)
                          }
                        }}
                        disabled={actionLoading === bid._id || !editAmount}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingBid(null)
                          setEditAmount('')
                          setError(null)
                        }}
                        className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Expand/Collapse Footer */}
      {bids.length > visibleBids && (
        <div className="border-t border-border/30 p-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show All {bids.length} Bids
              </>
            )}
          </button>
        </div>
      )}

      {/* Flag Dialog */}
      {showFlagDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Flag Bid for Dispute</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for flagging this bid. This will mark it for admin review and dispute resolution.
            </p>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Enter reason for flagging this bid..."
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] resize-vertical"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleFlagBid(showFlagDialog)}
                disabled={!flagReason.trim() || actionLoading === showFlagDialog}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === showFlagDialog ? 'Flagging...' : 'Flag Bid'}
              </button>
              <button
                onClick={() => {
                  setShowFlagDialog(null)
                  setFlagReason('')
                  setError(null)
                }}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Dialog */}
      {showResolveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Resolve Dispute</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add notes for the dispute resolution (optional):
            </p>
            <textarea
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              placeholder="Enter resolution notes..."
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px] resize-vertical"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleResolveDispute(showResolveDialog, 'approved')}
                disabled={actionLoading === showResolveDialog}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === showResolveDialog ? 'Resolving...' : 'Approve'}
              </button>
              <button
                onClick={() => handleResolveDispute(showResolveDialog, 'cancelled')}
                disabled={actionLoading === showResolveDialog}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === showResolveDialog ? 'Resolving...' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setShowResolveDialog(null)
                  setResolveNotes('')
                  setError(null)
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 