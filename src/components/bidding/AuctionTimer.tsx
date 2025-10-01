'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle, CheckCircle2, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AuctionTimerProps {
  auctionStartTime: string
  auctionEndTime: string
  currentHighestBid?: number
  reservePrice?: number
  className?: string
  showLabels?: boolean
  compact?: boolean
  onAuctionEnd?: () => void
  onAuctionStart?: () => void
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

type AuctionStatus = 'not-started' | 'active' | 'ending-soon' | 'ended'

export default function AuctionTimer({
  auctionStartTime,
  auctionEndTime,
  currentHighestBid,
  reservePrice,
  className,
  showLabels = true,
  compact = false,
  onAuctionEnd,
  onAuctionStart
}: AuctionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  })
  const [auctionStatus, setAuctionStatus] = useState<AuctionStatus>('not-started')
  const [hasStarted, setHasStarted] = useState(false)
  const [hasEnded, setHasEnded] = useState(false)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Date.now()
      const startTime = new Date(auctionStartTime).getTime()
      const endTime = new Date(auctionEndTime).getTime()

      let targetTime: number
      let status: AuctionStatus

      if (now < startTime) {
        // Auction hasn't started yet
        targetTime = startTime
        status = 'not-started'
      } else if (now < endTime) {
        // Auction is active
        targetTime = endTime
        const timeLeft = endTime - now
        
        // Trigger onAuctionStart if it just started
        if (!hasStarted) {
          setHasStarted(true)
          onAuctionStart?.()
        }
        
        // Check if ending soon (less than 1 hour remaining)
        status = timeLeft <= 3600000 ? 'ending-soon' : 'active'
      } else {
        // Auction has ended
        targetTime = endTime
        status = 'ended'
        
        // Trigger onAuctionEnd if it just ended
        if (!hasEnded) {
          setHasEnded(true)
          onAuctionEnd?.()
        }
      }

      setAuctionStatus(status)

      const difference = Math.max(0, targetTime - now)
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeRemaining({ days, hours, minutes, seconds, total: difference })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [auctionStartTime, auctionEndTime, hasStarted, hasEnded, onAuctionStart, onAuctionEnd])

  const getStatusConfig = () => {
    switch (auctionStatus) {
      case 'not-started':
        return {
          icon: Play,
          label: 'Starts in',
          bgClass: 'bg-blue-50 dark:bg-blue-950/50',
          textClass: 'text-blue-600 dark:text-blue-400',
          borderClass: 'border-blue-200 dark:border-blue-800',
          pulseClass: ''
        }
      case 'active':
        return {
          icon: Clock,
          label: 'Ends in',
          bgClass: 'bg-green-50 dark:bg-green-950/50',
          textClass: 'text-green-600 dark:text-green-400',
          borderClass: 'border-green-200 dark:border-green-800',
          pulseClass: ''
        }
      case 'ending-soon':
        return {
          icon: AlertTriangle,
          label: 'Ending soon',
          bgClass: 'bg-red-50 dark:bg-red-950/50',
          textClass: 'text-red-600 dark:text-red-400',
          borderClass: 'border-red-200 dark:border-red-800',
          pulseClass: 'animate-pulse'
        }
      case 'ended':
        return {
          icon: CheckCircle2,
          label: 'Auction ended',
          bgClass: 'bg-muted/50',
          textClass: 'text-muted-foreground',
          borderClass: 'border-border',
          pulseClass: ''
        }
    }
  }

  const config = getStatusConfig()
  const StatusIcon = config.icon

  const formatTimeUnit = (value: number, unit: string) => {
    if (compact) {
      return `${value}${unit.charAt(0)}`
    }
    return `${value} ${unit}${value !== 1 ? 's' : ''}`
  }

  const getDisplayTime = () => {
    if (auctionStatus === 'ended') {
      return null
    }

    const { days, hours, minutes, seconds } = timeRemaining

    if (compact) {
      // More compact display for mobile
      if (days > 0) return `${days}d ${hours}h`
      if (hours > 0) return `${hours}h ${minutes}m`
      if (minutes > 0) return `${minutes}m`
      return `${seconds}s`
    }

    const parts = []
    if (days > 0) parts.push(formatTimeUnit(days, 'day'))
    if (hours > 0) parts.push(formatTimeUnit(hours, 'hour'))
    if (minutes > 0) parts.push(formatTimeUnit(minutes, 'minute'))
    if (seconds > 0 && days === 0 && hours === 0) parts.push(formatTimeUnit(seconds, 'second'))

    return parts.slice(0, 2).join(', ')
  }

  const timeDisplay = getDisplayTime()
  const isReserveMet = !reservePrice || (currentHighestBid && currentHighestBid >= reservePrice)

  if (compact) {
    return (
      <div className={cn(
        'inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border',
        config.bgClass,
        config.textClass,
        config.borderClass,
        config.pulseClass,
        className
      )}>
        <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm font-medium">
          {auctionStatus === 'ended' ? 'Ended' : timeDisplay}
        </span>
      </div>
    )
  }

  return (
    <div className={cn(
      'bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden',
      config.pulseClass,
      className
    )}>
      {/* Header - Responsive */}
      <div className={cn(
        'flex items-center justify-between p-3 sm:p-4 border-b border-border/30',
        config.bgClass
      )}>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <StatusIcon className={cn('w-4 h-4 sm:w-5 sm:h-5', config.textClass)} />
          <span className={cn('font-semibold text-sm sm:text-base', config.textClass)}>
            {config.label}
          </span>
        </div>
        
        {auctionStatus === 'ending-soon' && (
          <div className="flex items-center gap-1 text-xs bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded-full animate-pulse">
            <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">URGENT</span>
            <span className="sm:hidden">!</span>
          </div>
        )}
      </div>

      {/* Timer Display - Responsive */}
      <div className="p-4 sm:p-6">
        {auctionStatus === 'ended' ? (
          <div className="text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-muted-foreground mb-2">
              Auction Ended
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground/70">
              {new Date(auctionEndTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ) : timeDisplay ? (
          <div className="text-center">
            <div className={cn(
              'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2',
              auctionStatus === 'ending-soon' ? 'text-red-600 dark:text-red-400' : 'text-primary'
            )}>
              {timeDisplay}
            </div>
            
            {showLabels && (
              <div className="text-xs sm:text-sm text-muted-foreground">
                {auctionStatus === 'not-started' ? (
                  <>
                    <span className="hidden sm:inline">Auction starts on </span>
                    <span className="sm:hidden">Starts </span>
                    {new Date(auctionStartTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Until auction ends on </span>
                    <span className="sm:hidden">Ends </span>
                    {new Date(auctionEndTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* Reserve Price Status - Responsive */}
        {auctionStatus === 'active' && reservePrice && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-secondary/20 rounded-lg">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Reserve Price</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-medium">
                  ${reservePrice.toLocaleString()}
                </span>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isReserveMet ? 'bg-green-500 dark:bg-green-400' : 'bg-yellow-500 dark:bg-yellow-400'
                )} />
                <span className={cn(
                  'text-xs font-medium',
                  isReserveMet ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                )}>
                  {isReserveMet ? 'Met' : 'Not Met'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Auto-refresh notice for active auctions - Responsive */}
        {auctionStatus === 'active' && (
          <div className="mt-3 sm:mt-4 text-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground bg-secondary/20 px-2.5 sm:px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
              <span>Live updates</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 