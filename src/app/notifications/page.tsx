'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  Trash2, 
  RefreshCw,
  ExternalLink,
  Search,
  ArrowLeft,
  Gavel,
  ShoppingBag,
  MessageCircle,
  Gem,
  Settings,
  Store,
  Shield,
  X
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

  // Icon mapping function
  const getNotificationIcon = (iconName: string) => {
    const iconMap = {
      'gavel': Gavel,
      'shopping-bag': ShoppingBag,
      'message-circle': MessageCircle,
      'gem': Gem,
      'settings': Settings,
      'store': Store,
      'shield': Shield,
      'bell': Bell
    }
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Bell
    return <IconComponent className="h-5 w-5" />
  }

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Enhanced Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border/30 sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Top Row - Title and Back Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => router.back()}
                  className="p-1.5 sm:p-2 hover:bg-secondary/50 rounded-xl transition-all duration-200 border border-border/30 hover:border-primary/30"
                  title="Go Back"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary transition-colors" />
                </button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="p-1.5 sm:p-2 lg:p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
                    </div>
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-serif font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Notifications
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      Stay updated with your activity
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-xl transition-all duration-200 border border-border/30 hover:border-primary/30"
                  title="Refresh notifications"
                >
                  <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium text-muted-foreground hidden sm:inline lg:hidden xl:inline">Refresh</span>
                </button>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-lg shadow-primary/20 text-sm"
                  >
                    Mark All Read
                  </button>
                )}
              </div>
            </div>
            
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Search Input - Desktop */}
              <div className="relative flex-1 hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={cn(
                    'px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    filter === 'all'
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/30'
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={cn(
                    'px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    filter === 'unread'
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/30'
                  )}
                >
                  Unread ({unreadCount})
                </button>
                
                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 sm:px-4 py-2 bg-secondary/50 rounded-xl border border-border/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
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
      </div>

      {/* Mobile Search Input */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>


      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="sticky top-[120px] z-10 bg-primary/10 border-b border-primary/20">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
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
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-xl"></div>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3">
              {searchQuery ? 'No matching notifications' : 'No notifications yet'}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : "We'll notify you when something happens with your gems, bids, or orders"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={cn(
                  'flex items-start gap-4 p-4 sm:p-6 rounded-xl border transition-all duration-200',
                  'hover:bg-secondary/30 cursor-pointer group bg-card/80 backdrop-blur-sm',
                  !notification.isRead && 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/10',
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
                  'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mt-1',
                  !notification.isRead ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                )}>
                  {getNotificationIcon(notificationService.formatNotification(notification).icon)}
                </div>

                {/* Content */}
                <div 
                  className="flex-1 min-w-0"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={cn(
                        'text-lg font-medium mb-2',
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {notification.title}
                      </h3>
                      <p className={cn(
                        'text-sm mb-3 line-clamp-2',
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {notification.message}
                      </p>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
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