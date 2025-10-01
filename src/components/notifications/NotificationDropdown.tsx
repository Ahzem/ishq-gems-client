'use client'

import { useState, useEffect, useRef, ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Package,
  MessageSquare,
  Gem,
  Settings,
  Store,
  Shield,
  Gavel,
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import notificationService from '@/services/notification.service'
import { Notification } from '@/types/entities/notification'
import type { NotificationDropdownProps } from '@/types'

// Helper function to get the appropriate icon component
const getNotificationIcon = (type: string, customIcon?: string) => {
  // If custom icon is specified, try to match it to a component
  if (customIcon) {
    const iconMap: Record<string, ComponentType<{ className?: string }>> = {
      'ShoppingBag': ShoppingBag,
      'Package': Package,
      'MessageSquare': MessageSquare,
      'MessageCircle': MessageCircle,
      'Gem': Gem,
      'Settings': Settings,
      'Store': Store,
      'Shield': Shield,
      'Gavel': Gavel,
      'Bell': Bell
    };
    
    if (iconMap[customIcon]) {
      return iconMap[customIcon];
    }
  }
  
  // Fallback to type-based icons
  const typeIconMap: Record<string, ComponentType<{ className?: string }>> = {
    'order': ShoppingBag,
    'bid': Gavel,
    'message': MessageSquare,
    'listing': Gem,
    'system': Settings,
    'seller': Store,
    'admin': Shield,
    'package': Package
  };

  return typeIconMap[type] || Bell;
};

export default function NotificationDropdown({ 
  isOpen, 
  onClose, 
  className 
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen, onClose])

  const fetchNotifications = async (pageNum = 1) => {
    setIsLoading(true)
    try {
      const response = await notificationService.getNotifications({
        page: pageNum,
        limit: 20
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
  }

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

  if (!isOpen) return null

  return (
    <div 
      ref={dropdownRef}
      className={cn(
        'absolute right-0 top-full mt-2 w-80 sm:w-96',
        'bg-card border border-border rounded-lg shadow-2xl',
        'max-h-[70vh] overflow-hidden',
        'z-50 animate-in fade-in slide-in-from-top-2 duration-200',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="p-1 hover:bg-secondary rounded-md transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs mt-1">We&apos;ll notify you when something happens</p>
          </div>
        ) : (
          <div className="py-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'flex items-start gap-3 p-3 mx-2 my-1 rounded-lg',
                  'hover:bg-secondary/50 transition-colors cursor-pointer',
                  'border border-transparent hover:border-border/50',
                  !notification.isRead && 'bg-primary/5 border-primary/20'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm',
                  !notification.isRead ? 'bg-primary/20' : 'bg-secondary'
                )}>
                  {(() => {
                    const IconComponent = getNotificationIcon(notification.type, notification.icon);
                    return <IconComponent className={cn(
                      'h-4 w-4',
                      !notification.isRead ? 'text-primary' : 'text-muted-foreground'
                    )} />;
                  })()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className={cn(
                        'text-sm font-medium truncate',
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {notification.title}
                      </h4>
                      <p className={cn(
                        'text-xs mt-1 line-clamp-2',
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {notification.message}
                      </p>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {notification.link && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      <button
                        onClick={(e) => handleDeleteNotification(notification._id, e)}
                        className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {notification.timeAgo}
                    </span>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && notifications.length > 0 && (
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className={cn(
              'w-full py-2 px-4 text-sm font-medium rounded-md',
              'bg-secondary hover:bg-secondary/80 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-border bg-secondary/20">
        <button
          onClick={() => {
            onClose()
            router.push('/notifications')
          }}
          className="w-full text-sm text-primary hover:underline flex items-center justify-center gap-2"
        >
          View All Notifications
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
} 