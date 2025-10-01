'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  Trash2, 
  RefreshCw,
  ExternalLink,
  Search,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import notificationService from '@/services/notification.service'
import { Notification } from '@/types'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const router = useRouter()

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    setIsLoading(true)
    try {
      const response = await notificationService.getNotifications({
        page: pageNum,
        limit: 25,
        unreadOnly: filter === 'unread',
        type: typeFilter === 'all' ? undefined : typeFilter
      })
      
      if (response.success && response.data) {
        const { notifications, unreadCount, page: responsePage, totalPages } = response.data
        if (pageNum === 1) {
          setNotifications(notifications)
        } else {
          setNotifications(prev => [...prev, ...notifications])
        }
        setUnreadCount(unreadCount)
        setHasMore(responsePage < totalPages)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filter, typeFilter])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

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

  const handleBulkAction = async (action: 'read' | 'delete') => {
    if (selectedNotifications.length === 0) return

    try {
      if (action === 'read') {
        // Mark selected as read
        await Promise.all(
          selectedNotifications.map(id => notificationService.markAsRead(id))
        )
        setNotifications(prev => 
          prev.map(n => 
            selectedNotifications.includes(n._id) 
              ? { ...n, isRead: true }
              : n
          )
        )
        setUnreadCount(prev => {
          const readCount = selectedNotifications.filter(id => {
            const notification = notifications.find(n => n._id === id)
            return notification && !notification.isRead
          }).length
          return Math.max(0, prev - readCount)
        })
      } else if (action === 'delete') {
        // Delete selected
        await Promise.all(
          selectedNotifications.map(id => notificationService.deleteNotification(id))
        )
        setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)))
        
        const deletedUnreadCount = selectedNotifications.filter(id => {
          const notification = notifications.find(n => n._id === id)
          return notification && !notification.isRead
        }).length
        setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount))
      }
      
      setSelectedNotifications([])
      setShowBulkActions(false)
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSelected = prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
      
      setShowBulkActions(newSelected.length > 0)
      return newSelected
    })
  }

  const handleSelectAll = () => {
    const allIds = filteredNotifications.map(n => n._id)
    setSelectedNotifications(allIds)
    setShowBulkActions(allIds.length > 0)
  }

  const handleDeselectAll = () => {
    setSelectedNotifications([])
    setShowBulkActions(false)
  }

  const handleRefresh = () => {
    fetchNotifications(1)
  }

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchNotifications(page + 1)
    }
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

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'bid', label: 'Bids' },
    { value: 'order', label: 'Orders' },
    { value: 'listing', label: 'Listings' },
    { value: 'message', label: 'Messages' },
    { value: 'system', label: 'System' }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                    {unreadCount} unread
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
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="pb-4 space-y-4">
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
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
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
                onClick={() => setFilter('unread')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filter === 'unread'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                Unread ({unreadCount})
              </button>
              
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-secondary rounded-lg border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="sticky top-[120px] z-10 bg-primary/10 border-b border-primary/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedNotifications.length} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary hover:underline"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Deselect All
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('read')}
                  className="px-3 py-1 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors"
                >
                  Mark Read
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="h-24 w-24 text-muted-foreground/50 mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {searchQuery ? 'No matching notifications' : 'No notifications yet'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-md">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : "We&apos;ll notify you when something happens with your gems, bids, or orders"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border transition-all duration-200',
                  'hover:bg-secondary/30 cursor-pointer group',
                  !notification.isRead && 'bg-primary/5 border-primary/20',
                  selectedNotifications.includes(notification._id) && 'bg-primary/10 border-primary/30'
                )}
              >
                {/* Checkbox */}
                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={() => handleSelectNotification(notification._id)}
                    className="rounded border-border"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Icon */}
                <div className={cn(
                  'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg mt-1',
                  !notification.isRead ? 'bg-primary/20' : 'bg-secondary'
                )}>
                  {notificationService.formatNotification(notification).icon}
                </div>

                {/* Content */}
                <div 
                  className="flex-1 min-w-0"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={cn(
                        'text-lg font-medium mb-1',
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {notification.title}
                      </h3>
                      <p className={cn(
                        'text-sm mb-3',
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {notification.message}
                      </p>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className={cn(
                          'px-2 py-1 rounded-full bg-secondary text-xs font-medium',
                          notificationService.formatNotification(notification).color
                        )}>
                          {notification.type.replace('_', ' ')}
                        </span>
                        <span>{notification.timeAgo}</span>
                        {!notification.isRead && (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            Unread
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {notification.link && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ExternalLink className="h-3 w-3" />
                          <span>View</span>
                        </div>
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && filteredNotifications.length > 0 && (
          <div className="flex justify-center py-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className={cn(
                'px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 