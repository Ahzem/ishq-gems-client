'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Gavel, TrendingUp, Clock, CheckCircle2, AlertTriangle, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWebSocketBidding } from '@/hooks/useWebSocketBidding'
import type { BidUpdate } from '@/types/entities/bid'
import type { NotificationItemProps, RealTimeNotificationsProps } from '@/types'
import { useAuth } from '@/features/auth/hooks/useAuth'

function NotificationItem({ update, onDismiss, onMarkAsRead, isRead = false }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const getIcon = () => {
    switch (update.type) {
      case 'new_bid':
        return <Gavel className="w-4 h-4 text-purple-600" />
      case 'auction_started':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'auction_ended':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />
      case 'bid_cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'bid_finalized':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getTitle = () => {
    switch (update.type) {
      case 'new_bid':
        return 'New Bid Placed'
      case 'auction_started':
        return 'Auction Started'
      case 'auction_ended':
        return 'Auction Ended'
      case 'bid_cancelled':
        return 'Bid Cancelled'
      case 'bid_finalized':
        return 'Winner Selected'
      default:
        return 'Auction Update'
    }
  }

  const getMessage = () => {
    switch (update.type) {
      case 'new_bid':
        return update.bidder?.isCurrentUser 
          ? `You placed a bid of $${update.bidAmount?.toLocaleString()}`
          : `${update.bidder?.name || 'Someone'} bid $${update.bidAmount?.toLocaleString()}`
      case 'auction_started':
        return 'Bidding is now open'
      case 'auction_ended':
        return `Final bid: $${update.currentHighestBid?.toLocaleString()}`
      case 'bid_cancelled':
        return 'A bid was cancelled'
      case 'bid_finalized':
        return 'The winner has been selected'
      default:
        return update.message || 'Update received'
    }
  }

  const getTimeAgo = () => {
    const now = new Date()
    const updateTime = new Date(update.timestamp)
    const diff = now.getTime() - updateTime.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return updateTime.toLocaleDateString()
  }

  const getBgColor = () => {
    if (isRead) return 'bg-gray-50 dark:bg-gray-800/50'
    
    switch (update.type) {
      case 'new_bid':
        return 'bg-purple-50 dark:bg-purple-900/20'
      case 'auction_started':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'auction_ended':
        return 'bg-blue-50 dark:bg-blue-900/20'
      case 'bid_cancelled':
        return 'bg-red-50 dark:bg-red-900/20'
      case 'bid_finalized':
        return 'bg-green-50 dark:bg-green-900/20'
      default:
        return 'bg-gray-50 dark:bg-gray-800/50'
    }
  }

  return (
    <div
      className={cn(
        'transform transition-all duration-300',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div
        className={cn(
          'p-4 rounded-lg border border-border/50 shadow-sm',
          getBgColor(),
          !isRead && 'border-l-4 border-l-primary'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {getTitle()}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {getMessage()}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeAgo()}</span>
                  {update.totalBids !== undefined && (
                    <>
                      <span>•</span>
                      <span>{update.totalBids} bid{update.totalBids !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
              </div>
              
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
        
        {!isRead && (
          <button
            onClick={onMarkAsRead}
            className="w-full mt-3 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Mark as read
          </button>
        )}
      </div>
    </div>
  )
}

// RealTimeNotificationsProps is now imported from @/types

export default function RealTimeNotifications({
  className,
  maxVisible = 5,
  autoHide = false,
  hideAfter = 5000,
  position = 'top-right',
  showSoundToggle = true,
  gemIds = []
}: RealTimeNotificationsProps) {
  const { user } = useAuth()
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bid-sound-enabled') !== 'false'
    }
    return true
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const { bidUpdates, isConnected } = useWebSocketBidding({
    gemIds,
    autoSubscribe: true
  })

  // Filter updates to show only recent and relevant ones
  const filteredUpdates = bidUpdates
    .filter(update => {
      // Don't show dismissed notifications
      if (dismissedIds.has(update.bidId || `${update.gemId}-${update.timestamp}`)) {
        return false
      }
      
      // If user is logged in, prioritize notifications relevant to them
      if (user) {
        // Show notifications for gems the user is involved with
        const isUserRelevant = update.bidder?.isCurrentUser || 
                              gemIds.includes(update.gemId)
        
        // Always show user's own bid updates and high-priority notifications
        if (isUserRelevant || update.type === 'auction_ended' || update.type === 'bid_finalized') {
          return true
        }
      }
      
      return true
    })

  // Show limited or expanded view based on state
  const visibleUpdates = isExpanded 
    ? filteredUpdates.slice(0, maxVisible * 2) // Show more when expanded
    : filteredUpdates.slice(0, maxVisible)

  // Auto-hide notifications
  useEffect(() => {
    if (autoHide && visibleUpdates.length > 0) {
      const timer = setTimeout(() => {
        visibleUpdates.forEach(update => {
          const id = update.bidId || `${update.gemId}-${update.timestamp}`
          setDismissedIds(prev => new Set([...prev, id]))
        })
      }, hideAfter)
      
      return () => clearTimeout(timer)
    }
  }, [autoHide, hideAfter, visibleUpdates])

  // Play sound for new bids
  useEffect(() => {
    if (soundEnabled && bidUpdates.length > 0 && !bidUpdates[0]?.bidder?.isCurrentUser) {
      const audio = new Audio('/sounds/bid-notification.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
      })
    }
  }, [bidUpdates, soundEnabled])

  // Toggle sound preference
  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled
    setSoundEnabled(newSoundEnabled)
    localStorage.setItem('bid-sound-enabled', String(newSoundEnabled))
  }

  const handleDismiss = (update: BidUpdate) => {
    const id = update.bidId || `${update.gemId}-${update.timestamp}`
    setDismissedIds(prev => new Set([...prev, id]))
  }

  const handleMarkAsRead = (update: BidUpdate) => {
    const id = update.bidId || `${update.gemId}-${update.timestamp}`
    setReadIds(prev => new Set([...prev, id]))
  }

  const clearAll = () => {
    bidUpdates.forEach(update => {
      const id = update.bidId || `${update.gemId}-${update.timestamp}`
      setDismissedIds(prev => new Set([...prev, id]))
    })
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      default:
        return 'top-4 right-4'
    }
  }

  if (filteredUpdates.length === 0) {
    return null
  }

  const hasMoreNotifications = filteredUpdates.length > maxVisible

  return (
    <div className={cn('fixed z-50 w-96 max-w-[calc(100vw-2rem)]', getPositionClasses(), className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-card border border-border rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-4 h-4 text-primary" />
              {isConnected && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-sm font-medium text-foreground">
              Live Updates ({filteredUpdates.length})
            </span>
            {user && (
              <span className="text-xs text-muted-foreground">
                • {user.fullName}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {showSoundToggle && (
              <button
                onClick={toggleSound}
                className="p-1 hover:bg-secondary rounded transition-colors"
                title={soundEnabled ? 'Disable sound' : 'Enable sound'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            )}
            
            {hasMoreNotifications && (
              <button
                onClick={toggleExpanded}
                className="p-1 hover:bg-secondary rounded transition-colors"
                title={isExpanded ? 'Show less' : 'Show more'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            )}
            
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          {visibleUpdates.map((update) => (
            <NotificationItem
              key={update.bidId || `${update.gemId}-${update.timestamp}`}
              update={update}
              onDismiss={() => handleDismiss(update)}
              onMarkAsRead={() => handleMarkAsRead(update)}
              isRead={readIds.has(update.bidId || `${update.gemId}-${update.timestamp}`)}
            />
          ))}
          
          {hasMoreNotifications && !isExpanded && (
            <button
              onClick={toggleExpanded}
              className="w-full p-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors text-center"
            >
              Show {filteredUpdates.length - maxVisible} more notification{filteredUpdates.length - maxVisible !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Real-time updates disconnected
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 