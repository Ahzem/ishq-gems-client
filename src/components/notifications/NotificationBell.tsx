'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NotificationBellProps } from '@/types'
import notificationService from '@/services/notification.service'

export default function NotificationBell({ onClick, className }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch unread count on mount and set up periodic updates
  useEffect(() => {
    fetchUnreadCount()
    
    // Update every 60 seconds to reduce server load
    const interval = setInterval(fetchUnreadCount, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    setIsLoading(true)
    try {
      // Fetch all notifications and filter out message notifications client-side
      const response = await notificationService.getNotifications({ unreadOnly: true })
      if (response.success && response.data?.notifications) {
        // Filter out message notifications since we have MessagesIcon for that
        const nonMessageNotifications = response.data.notifications.filter(
          notification => notification.type !== 'message'
        )
        setUnreadCount(nonMessageNotifications.length)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 group border border-border/20 hover:border-primary/30 min-w-[44px] min-h-[44px] flex items-center justify-center',
        'hover:bg-secondary/50 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
        className
      )}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl sm:rounded-2xl"></span>
      
      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
        <Bell 
          className={cn(
            'h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300',
            unreadCount > 0 ? 'text-primary group-hover:text-accent' : 'text-foreground group-hover:text-primary'
          )} 
        />
      </div>
      
      {/* Unread count badge */}
      {!isLoading && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <span className="absolute -top-1 -right-1 bg-muted text-muted-foreground text-xs rounded-full h-3 w-3 flex items-center justify-center animate-pulse">
        </span>
      )}
    </button>
  )
} 