import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Gavel, 
  TrendingUp, 
  Trophy, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Bell,
  X,
  DollarSign,
  Timer,
  Crown,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useRealTimeBids } from '@/hooks/useRealTimeBids'
import type { BidUpdate } from '@/types/entities/bid'
import type { 
  BidEvent, 
  BackendNotification, 
  BiddingNotificationsProps 
} from '@/types'
import notificationService from '@/services/notification.service'
import bidService from '@/services/bid.service'
import gemService from '@/services/gem.service'

export default function BiddingNotifications({
  className,
  maxVisible = 3,
  autoHide = true,
  enableSound = true,
  onNotificationClick
}: BiddingNotificationsProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<BidEvent[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(enableSound)
  const [isLoading, setIsLoading] = useState(false)
  const processedUpdatesRef = useRef<Set<string>>(new Set())

  // Get user's auction gems for real-time updates
  const [userGemIds, setUserGemIds] = useState<string[]>([])
  const [gemDetails, setGemDetails] = useState<Record<string, { name: string; image?: string }>>({})

  // Helper function to convert backend notification to BidEvent
  const convertNotificationToBidEvent = useCallback((notification: BackendNotification): BidEvent | null => {
    if (!notification.metadata?.gemId) return null

    const { metadata } = notification
    
    // Determine notification type based on message content
    let type: BidEvent['type'] = 'new_bid'
    let priority: BidEvent['priority'] = 'medium'

    if (notification.message.includes('outbid')) {
      type = 'outbid'
      priority = 'high'
    } else if (notification.message.includes('won')) {
      type = 'won'
      priority = 'high'
    } else if (notification.message.includes('ending soon')) {
      type = 'ending_soon'
      priority = 'urgent'
    } else if (notification.message.includes('reserve')) {
      type = 'reserve_met'
      priority = 'medium'
    } else if (notification.message.includes('started')) {
      type = 'auction_started'
      priority = 'low'
    } else if (notification.message.includes('ended')) {
      type = 'auction_ended'
      priority = 'medium'
    } else if (notification.message.includes('cancelled')) {
      type = 'bid_cancelled'
      priority = 'medium'
    } else if (notification.message.includes('finalized')) {
      type = 'bid_finalized'
      priority = 'high'
    }

    return {
      id: notification._id || notification.id || '',
      type,
      gemId: metadata.gemId || '',
      gemName: notification.title.split(' - ')[0] || 'Gem',
      newBid: metadata.amount,
      bidderName: metadata.senderName,
      timestamp: notification.createdAt || notification.timestamp || new Date().toISOString(),
      read: notification.isRead || false,
      priority,
      notificationId: notification._id || notification.id,
      bidId: metadata.bidId
    }
  }, [])

  // Helper function to convert BidUpdate to BidEvent
  const convertBidUpdateToBidEvent = useCallback((update: BidUpdate): BidEvent | null => {
    let priority: BidEvent['priority'] = 'medium'

    if (update.type === 'new_bid' && update.bidder?.isCurrentUser === false) {
      // User got outbid
      priority = 'high'
      return {
        id: `${update.gemId}-${update.timestamp}`,
        type: 'outbid',
        gemId: update.gemId,
        gemName: 'Auction Item', // We'd need to fetch gem details for proper name
        newBid: update.bidAmount,
        bidderName: update.bidder?.name || 'Anonymous',
        timestamp: update.timestamp,
        read: false,
        priority,
        bidId: update.bidId
      }
    } else if (update.type === 'auction_ended') {
      priority = 'high'
      return {
        id: `${update.gemId}-${update.timestamp}`,
        type: update.auctionStatus === 'ended' ? 'auction_ended' : 'ending_soon',
        gemId: update.gemId,
        gemName: 'Auction Item',
        newBid: update.currentHighestBid,
        timestamp: update.timestamp,
        read: false,
        priority,
        auctionStatus: update.auctionStatus
      }
    }

         return null
   }, [])

      // Helper function to fetch gem details
   const fetchGemDetails = useCallback(async (gemId: string) => {
     if (gemDetails[gemId]) return gemDetails[gemId]

     try {
       const response = await gemService.getGemDetails(gemId)
       if (response.success && response.data) {
         const gem = response.data
         const gemInfo = {
           name: gemService.formatGemName(gem),
           image: gem.media?.find(m => m.isPrimary)?.url
         }
         
         setGemDetails(prev => ({
           ...prev,
           [gemId]: gemInfo
         }))

         return gemInfo
       }
     } catch (error) {
       console.error('Failed to fetch gem details:', error)
     }

     // Fallback
     const fallback = { name: 'Gem Auction', image: undefined }
     setGemDetails(prev => ({
       ...prev,
       [gemId]: fallback
     }))
     return fallback
   }, [gemDetails])

  // Play notification sound for different event types
  const playNotificationSound = useCallback((type: BidEvent['type']) => {
    if (!soundEnabled) return

    // Create different sounds for different event types
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different frequencies for different event types
    const frequencies = {
      outbid: [440, 523], // A4 to C5 (alert sound)
      won: [523, 659, 784], // C5 to E5 to G5 (success chord)
      lost: [392, 349], // G4 to F4 (sad sound)
      ending_soon: [880, 880, 880], // A5 repeated (urgent)
      new_bid: [523], // C5 (neutral)
      reserve_met: [659, 784], // E5 to G5 (positive)
      auction_started: [523, 659], // C5 to E5 (start)
      auction_ended: [523, 440], // C5 to A4 (end)
      bid_cancelled: [349, 293], // F4 to D4 (cancelled)
      bid_finalized: [523, 659, 784, 1047] // C5 to E5 to G5 to C6 (finalized)
    }

    const freqs = frequencies[type] || [523]
    let currentFreq = 0

    const playNext = () => {
      if (currentFreq < freqs.length) {
        oscillator.frequency.setValueAtTime(freqs[currentFreq], audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        currentFreq++
        setTimeout(playNext, 200)
      } else {
        oscillator.stop()
      }
    }

    oscillator.start()
    playNext()
  }, [soundEnabled])

  // Use real-time bid updates
  const { 
    bidUpdates, 
    isConnected,
    error: realTimeError
  } = useRealTimeBids({
    gemIds: userGemIds,
    autoConnect: true
  })

  // Load user's auction gems to monitor
  useEffect(() => {
    if (!user) return

    const loadUserAuctions = async () => {
      setIsLoading(true)
      try {
        // Get user's bids to monitor
        const response = await bidService.getMyBids(1, 50)
        if (response.success && response.data?.bids) {
          const gemIds = [...new Set(response.data.bids.map(bid => {
            // Ensure gemId is a string, handle both string and object cases
            const gemId = bid.gemId as string | { _id: string; toString?: () => string }
            const processedId = typeof gemId === 'string' ? gemId : (gemId?._id || gemId?.toString?.() || '')
            return processedId
          }))].filter(id => id && typeof id === 'string') // Remove empty strings and ensure string type
          
          console.log('Processed gemIds for notifications:', gemIds)
          setUserGemIds(gemIds)
        }
      } catch (error) {
        console.error('Failed to load user auctions for notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAuctions()
  }, [user])

  // Load existing notifications on mount
  useEffect(() => {
    if (!user) return

    const loadNotifications = async () => {
      try {
        const response = await notificationService.getNotifications({
          type: 'bid',
          unreadOnly: false,
          limit: 20
        })
        
        if (response.success && response.data?.notifications) {
          const bidNotifications: BidEvent[] = response.data.notifications
            .filter(notif => notif.type === 'bid' && notif.metadata?.gemId)
            .map(notif => convertNotificationToBidEvent(notif))
            .filter(Boolean) as BidEvent[]

          setNotifications(bidNotifications)
        }
      } catch (error) {
        console.error('Failed to load bid notifications:', error)
      }
    }

         loadNotifications()
   }, [user, convertNotificationToBidEvent])

   // Process real-time bid updates
   useEffect(() => {
     if (!bidUpdates.length || !user) return

     bidUpdates.forEach(update => {
       const updateId = `${update.gemId}-${update.timestamp}-${update.type}`
       
       // Skip if already processed
       if (processedUpdatesRef.current.has(updateId)) return
       processedUpdatesRef.current.add(updateId)

                const bidEvent = convertBidUpdateToBidEvent(update)
         if (bidEvent) {
           // Try to get real gem name
           fetchGemDetails(bidEvent.gemId).then(details => {
             if (details.name !== 'Gem Auction') {
               setNotifications(prev => 
                 prev.map(n => 
                   n.id === bidEvent.id 
                     ? { ...n, gemName: details.name, gemImage: details.image }
                     : n
                 )
               )
             }
           })

           setNotifications(prev => {
           // Check if similar notification already exists
           const existing = prev.find(n => 
             n.gemId === bidEvent.gemId && 
             n.type === bidEvent.type &&
             Math.abs(new Date(n.timestamp).getTime() - new Date(bidEvent.timestamp).getTime()) < 5000
           )
           
           if (existing) return prev
           
           // Add new notification
           const updated = [bidEvent, ...prev]
           return updated.slice(0, maxVisible * 2) // Keep some extras for rotation
         })

         // Play sound for new notification
         if (soundEnabled) {
           setTimeout(() => playNotificationSound(bidEvent.type), 100)
         }
       }
     })
   }, [bidUpdates, user, convertBidUpdateToBidEvent, maxVisible, soundEnabled, fetchGemDetails, playNotificationSound])

   // Clear processed updates periodically to prevent memory leaks
   useEffect(() => {
     const interval = setInterval(() => {
       processedUpdatesRef.current.clear()
     }, 300000) // Clear every 5 minutes

     return () => clearInterval(interval)
   }, [])

   // Check for auctions ending soon
   useEffect(() => {
     if (!userGemIds.length || !user) return

     const checkEndingSoon = async () => {
       try {
         for (const gemId of userGemIds) {
           // Ensure gemId is a valid string before making the API call
           if (!gemId || typeof gemId !== 'string') {
             console.warn('Invalid gemId in checkEndingSoon:', gemId)
             continue
           }
           
           const response = await bidService.getBidsForGem(gemId, 1, 1)
           if (response.success && response.data?.bids?.length) {
             const userBid = response.data.bids.find(bid => bid.userId._id === user.id)
             if (userBid && userBid.status === 'winning') {
               // Check if auction ending soon
               // This would typically come from gem data, but we can simulate it
               const now = new Date()
               const endTime = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes from now
               
               const timeLeft = endTime.getTime() - now.getTime()
               if (timeLeft > 0 && timeLeft < 30 * 60 * 1000) { // Less than 30 minutes
                 const minutes = Math.floor(timeLeft / (1000 * 60))
                 
                 const endingSoonEvent: BidEvent = {
                   id: `ending-soon-${gemId}-${now.getTime()}`,
                   type: 'ending_soon',
                   gemId,
                   gemName: 'Your Auction', // Would fetch real name
                   yourBid: userBid.amount,
                   timeLeft: `${minutes} minutes`,
                   timestamp: now.toISOString(),
                   read: false,
                   priority: 'urgent',
                   bidId: userBid._id
                 }

                 setNotifications(prev => {
                   const existing = prev.find(n => 
                     n.gemId === gemId && 
                     n.type === 'ending_soon'
                   )
                   
                   if (existing) return prev
                   return [endingSoonEvent, ...prev]
                 })
               }
             }
           }
         }
       } catch (error) {
         console.error('Failed to check ending auctions:', error)
       }
     }

     // Check immediately and then every 5 minutes
     checkEndingSoon()
     const interval = setInterval(checkEndingSoon, 5 * 60 * 1000)

     return () => clearInterval(interval)
   }, [userGemIds, user])

  const getNotificationIcon = (type: BidEvent['type']) => {
    switch (type) {
      case 'outbid':
        return <TrendingUp className="w-5 h-5 text-red-500" />
      case 'won':
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 'lost':
        return <X className="w-5 h-5 text-gray-500" />
      case 'ending_soon':
        return <Clock className="w-5 h-5 text-orange-500" />
      case 'new_bid':
        return <Gavel className="w-5 h-5 text-blue-500" />
      case 'reserve_met':
        return <Target className="w-5 h-5 text-green-500" />
      case 'auction_started':
        return <Timer className="w-5 h-5 text-purple-500" />
      case 'auction_ended':
        return <CheckCircle2 className="w-5 h-5 text-gray-500" />
      case 'bid_cancelled':
        return <X className="w-5 h-5 text-orange-500" />
      case 'bid_finalized':
        return <Crown className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5 text-primary" />
    }
  }

  const getNotificationTitle = (event: BidEvent) => {
    switch (event.type) {
      case 'outbid':
        return 'You\'ve been outbid!'
      case 'won':
        return 'Congratulations! You won!'
      case 'lost':
        return 'Auction ended'
      case 'ending_soon':
        return 'Auction ending soon!'
      case 'new_bid':
        return 'New bid placed'
      case 'reserve_met':
        return 'Reserve price met!'
      case 'auction_started':
        return 'Auction started'
      case 'auction_ended':
        return 'Auction ended'
      case 'bid_cancelled':
        return 'Bid cancelled'
      case 'bid_finalized':
        return 'Bid finalized!'
      default:
        return 'Bid notification'
    }
  }

  const getNotificationMessage = (event: BidEvent) => {
    switch (event.type) {
      case 'outbid':
        return `${event.gemName} - New bid of $${event.newBid?.toLocaleString()} by ${event.bidderName}. Your bid: $${event.yourBid?.toLocaleString()}`
      case 'won':
        return `${event.gemName} - You won with a bid of $${event.yourBid?.toLocaleString()}!`
      case 'lost':
        return `${event.gemName} - Auction ended. Final bid: $${event.newBid?.toLocaleString()}`
      case 'ending_soon':
        return `${event.gemName} - Only ${event.timeLeft} left! Your current bid: $${event.yourBid?.toLocaleString()}`
      case 'new_bid':
        return `${event.gemName} - New bid of $${event.newBid?.toLocaleString()}`
      case 'reserve_met':
        return `${event.gemName} - Reserve price of $${event.reservePrice?.toLocaleString()} has been met!`
      case 'auction_started':
        return `${event.gemName} - Auction is now live!`
      case 'auction_ended':
        return `${event.gemName} - Auction has ended`
      case 'bid_cancelled':
        return `${event.gemName} - Your bid of $${event.yourBid?.toLocaleString()} has been cancelled`
      case 'bid_finalized':
        return `${event.gemName} - Winning bid of $${event.newBid?.toLocaleString()} has been finalized!`
      default:
        return event.gemName
    }
  }

  const getPriorityStyles = (priority: BidEvent['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const handleNotificationClick = async (event: BidEvent) => {
    // Mark as read locally
    setNotifications(prev => 
      prev.map(n => n.id === event.id ? { ...n, read: true } : n)
    )

    // Mark as read on backend if it has a notification ID
    if (event.notificationId) {
      try {
        await notificationService.markAsRead(event.notificationId)
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }

    // Call external handler
    onNotificationClick?.(event)
  }

  const dismissNotification = useCallback(async (id: string) => {
    const notification = notifications.find(n => n.id === id)
    
    // Remove from local state
    setNotifications(prev => prev.filter(n => n.id !== id))

    // Delete from backend if it has a notification ID
    if (notification?.notificationId) {
      try {
        await notificationService.deleteNotification(notification.notificationId)
      } catch (error) {
        console.error('Failed to delete notification:', error)
      }
    }
  }, [notifications])

  const dismissAll = async () => {
    // Get notifications with backend IDs
    const backendNotifications = notifications.filter(n => n.notificationId)
    
    // Clear local state
    setNotifications([])

    // Delete from backend
    try {
      await Promise.all(
        backendNotifications.map(n => 
          notificationService.deleteNotification(n.notificationId!)
        )
      )
    } catch (error) {
      console.error('Failed to delete notifications:', error)
    }
  }

  // Refresh notifications periodically
  const refreshNotifications = useCallback(async () => {
    if (!user) return

    try {
      const response = await notificationService.getNotifications({
        type: 'bid',
        unreadOnly: false,
        limit: 10
      })
      
      if (response.success && response.data?.notifications) {
        const bidNotifications: BidEvent[] = response.data.notifications
          .filter(notif => notif.type === 'bid' && notif.metadata?.gemId)
          .map(notif => convertNotificationToBidEvent(notif))
          .filter(Boolean) as BidEvent[]

        // Merge with existing real-time notifications
        setNotifications(prev => {
          const realTimeNotifications = prev.filter(n => !n.notificationId)
          const uniqueBackendNotifications = bidNotifications.filter(bn => 
            !prev.some(pn => pn.notificationId === bn.notificationId)
          )
          
          return [...realTimeNotifications, ...uniqueBackendNotifications]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, maxVisible * 2)
        })
      }
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
    }
  }, [user, convertNotificationToBidEvent, maxVisible])

  // Refresh notifications every 2 minutes
  useEffect(() => {
    if (!user) return

    refreshNotifications()
    const interval = setInterval(refreshNotifications, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [refreshNotifications, user])

  // Auto-hide notifications after delay
  useEffect(() => {
    if (!autoHide) return

    notifications.forEach(notification => {
      if (!notification.read) {
        setTimeout(() => {
          dismissNotification(notification.id)
        }, notification.priority === 'urgent' ? 10000 : 5000)
      }
    })
  }, [notifications, autoHide, dismissNotification])

  // Play sound for new notifications
  useEffect(() => {
    const newNotifications = notifications.filter(n => !n.read)
    if (newNotifications.length > 0) {
      newNotifications.forEach(notification => {
        playNotificationSound(notification.type)
      })
    }
  }, [notifications, playNotificationSound])

  // Show loading state or connection issues
  const showConnectionStatus = !isConnected || realTimeError || isLoading

  if (!isVisible || (notifications.length === 0 && !showConnectionStatus)) {
    return null
  }

  const visibleNotifications = notifications.slice(0, maxVisible)

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full',
      className
    )}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell className={cn(
            "w-4 h-4",
            isConnected ? "text-primary" : "text-red-500"
          )} />
          <span className="text-sm font-medium text-foreground">
            Bid Alerts ({notifications.length})
          </span>
          {isLoading && (
            <span className="text-xs text-blue-500">Loading...</span>
          )}
          {!isConnected && (
            <span className="text-xs text-red-500">Disconnected</span>
          )}
          {realTimeError && (
            <span className="text-xs text-orange-500" title={realTimeError}>
              Connection Error
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              'p-1 rounded text-xs transition-colors',
              soundEnabled 
                ? 'text-primary hover:bg-primary/10' 
                : 'text-muted-foreground hover:bg-secondary'
            )}
            title={soundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            🔊
          </button>
          
          {notifications.length > 0 && (
            <button
              onClick={dismissAll}
              className="p-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Dismiss all"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Hide notifications"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        {visibleNotifications.map((event) => (
          <div
            key={event.id}
            className={cn(
              'border-l-4 bg-card border border-border rounded-lg shadow-lg overflow-hidden',
              'transform transition-all duration-300 hover:scale-105 cursor-pointer',
              getPriorityStyles(event.priority),
              !event.read && 'animate-slide-in-top'
            )}
            onClick={() => handleNotificationClick(event)}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(event.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {getNotificationTitle(event)}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        dismissNotification(event.id)
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {getNotificationMessage(event)}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    
                    {event.priority === 'urgent' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick actions for specific types */}
              {(event.type === 'outbid' || event.type === 'ending_soon') && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors">
                      <DollarSign className="w-3 h-3 inline mr-1" />
                      Place Bid
                    </button>
                    <button className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/80 transition-colors">
                      View Auction
                    </button>
                  </div>
                </div>
              )}

              {event.type === 'won' && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                      <Crown className="w-3 h-3 inline mr-1" />
                      Complete Purchase
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show more indicator */}
      {notifications.length > maxVisible && (
        <div className="text-center p-2 bg-card border border-border rounded-lg">
          <span className="text-xs text-muted-foreground">
            +{notifications.length - maxVisible} more notifications
          </span>
        </div>
      )}
    </div>
  )
} 