'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import notificationService from '@/services/notification.service'
import { Notification } from '@/types/entities/notification'
import type { NotificationModalProps, NotificationFilter } from '@/types'

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    setIsLoading(true)
    try {
      const response = await notificationService.getNotifications({
        page: pageNum,
        limit: 20,
        unreadOnly: filter === 'unread'
      })
      
      if (response.success && response.data) {
        // Filter out message notifications since we have MessagesIcon for that
        const nonMessageNotifications = response.data.notifications.filter(
          notification => notification.type !== 'message'
        )
        
        if (pageNum === 1) {
          setNotifications(nonMessageNotifications)
        } else {
          setNotifications(prev => [...prev, ...nonMessageNotifications])
        }
        
        // Count unread notifications excluding messages
        const unreadNonMessageCount = nonMessageNotifications.filter(n => !n.isRead).length
        setUnreadCount(unreadNonMessageCount)
        setHasMore(response.data.page < response.data.totalPages)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filter])

  // Fetch notifications when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await notificationService.markAsRead(notification._id)
      setNotifications(prev => 
        prev.map(n => 
          n._id === notification._id 
            ? { ...n, isRead: true }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Navigate to link if available
    if (notification.link) {
      onClose()
      router.push(notification.link)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead()
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    try {
      const response = await notificationService.deleteNotification(notificationId)
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId))
        const deletedNotification = notifications.find(n => n._id === notificationId)
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleRefresh = () => {
    fetchNotifications(1)
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchNotifications(page + 1)
    }
  }

  const handleFilterChange = (newFilter: NotificationFilter) => {
    setFilter(newFilter)
    setPage(1)
  }

  const filteredNotifications = notifications.filter(notification => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      )
    }
    return true
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              aria-label="Close notifications"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn('h-5 w-5', isLoading && 'animate-spin')} />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="px-4 pb-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('unread')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === 'unread'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center px-4">
            <Bell className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No matching notifications' : 'No notifications yet'}
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : "We&apos;ll notify you when something happens"
              }
            </p>
          </div>
        ) : (
          <div className="pb-20">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'flex items-start gap-4 p-4 border-b border-border',
                  'active:bg-secondary/50 transition-colors',
                  !notification.isRead && 'bg-primary/5 border-l-4 border-l-primary'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg',
                  !notification.isRead ? 'bg-primary/20' : 'bg-secondary'
                )}>
                  {notificationService.getNotificationIcon(notification.type, notification.icon)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className={cn(
                        'text-base font-medium',
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {notification.title}
                      </h3>
                      <p className={cn(
                        'text-sm mt-1',
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {notification.message}
                      </p>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {notification.link && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      )}
                      <button
                        onClick={(e) => handleDeleteNotification(notification._id, e)}
                        className="p-2 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-muted-foreground">
                      {notification.timeAgo}
                    </span>
                    {!notification.isRead && (
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && filteredNotifications.length > 0 && (
        <div className="sticky bottom-0 p-4 bg-background border-t border-border">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className={cn(
              'w-full py-3 px-4 text-base font-medium rounded-lg',
              'bg-secondary hover:bg-secondary/80 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
} 