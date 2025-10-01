import apiClient from '@/lib/api-client';
import { 
  Notification, 
  NotificationResponse, 
  UnreadCountResponse, 
  CreateNotificationRequest,
  NotificationQuery
} from '@/types';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';

/**
 * Production-optimized Notification Service
 * Handles real-time notifications with caching, validation, and performance monitoring
 */
class NotificationService {
  private readonly baseUrl = '/notifications';

  /**
   * Get notifications for the current user with caching and validation
   */
  async getNotifications(options: NotificationQuery = {}): Promise<NotificationResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const { page = 1, limit = 20, unreadOnly = false, type } = options;
          
          // Validate pagination parameters
          if (page < 1) {
            return {
              success: false,
              message: 'Page number must be 1 or greater'
            };
          }

          if (limit < 1 || limit > 100) {
            return {
              success: false,
              message: 'Limit must be between 1 and 100'
            };
          }

          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            unreadOnly: unreadOnly.toString(),
            ...(type && { type }),
          });

          const cacheKey = `notifications_${params.toString()}`;
          const cacheTtl = unreadOnly ? 60000 : 300000; // Increased: 1min for unread, 5min for all

          const response = await handleServiceResponse(
            () => apiClient.get<NotificationResponse>(`${this.baseUrl}?${params}`),
            {
              cacheKey,
              cacheTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 3, // Increased retries
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0 || status === 408; // Include timeout errors
                  }
                  return false;
                },
                delay: 1000, // 1 second delay between retries
                backoff: true
              }
            }
          );

          return {
            success: response.success,
            data: response.data || { notifications: [], total: 0, unreadCount: 0, page: 1, totalPages: 0 },
            message: response.message
          } as NotificationResponse;
        } catch (error) {
          ServiceUtils.logger.error('Failed to get notifications', error);
          
          // Enhanced error handling for 500 errors
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
          const isServerError = errorMessage.includes('500') || errorMessage.includes('Internal Server Error');
          
          return {
            success: false,
            data: { notifications: [], total: 0, unreadCount: 0, page: 1, totalPages: 0 },
            message: isServerError 
              ? 'Server temporarily unavailable. Please try again in a few moments.'
              : errorMessage
          };
        }
      },
      'notification_get_notifications',
      {
        expectedDuration: 3000, // Increase threshold to 3 seconds for notifications
        priority: 'normal'
      }
    );
  }

  /**
   * Get unread notification count with aggressive caching
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.get<UnreadCountResponse>(`${this.baseUrl}/unread-count`),
            {
              cacheKey: 'notifications_unread_count',
              cacheTtl: 30000, // Increased to 30 seconds to reduce server load
              useCache: true,
              retryOptions: {
                maxRetries: 3,
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0 || status === 408;
                  }
                  return false;
                },
                delay: 500, // Shorter delay for unread count
                backoff: true
              }
            }
          );

          return {
            success: response.success,
            data: response.data || { count: 0 },
            message: response.message
          } as UnreadCountResponse;
        } catch (error) {
          ServiceUtils.logger.error('Failed to get unread count', error);
          
          // Enhanced error handling for 500 errors
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch unread count';
          const isServerError = errorMessage.includes('500') || errorMessage.includes('Internal Server Error');
          
          return {
            success: false,
            data: { count: 0 },
            message: isServerError 
              ? 'Unable to check notifications. Service will retry automatically.'
              : errorMessage
          };
        }
      },
      'notification_get_unread_count',
      {
        expectedDuration: 2000, // 2 second threshold for unread count
        priority: 'high' // Higher priority for unread counts
      }
    );
  }

  /**
   * Mark a notification as read with validation
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; message?: string }> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate notification ID
          if (!notificationId || notificationId.trim().length === 0) {
            return {
              success: false,
              message: 'Notification ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.patch<{ success: boolean; message?: string }>(`${this.baseUrl}/${notificationId}/read`),
            {
              retryOptions: {
                maxRetries: 2,
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          // Clear notification caches on successful read
          if (response.success) {
            this.clearNotificationCaches();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to mark notification as read', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to mark notification as read'
          };
        }
      },
      'notification_mark_as_read'
    );
  }

  /**
   * Mark all notifications as read with cache clearing
   */
  async markAllAsRead(): Promise<{ success: boolean; message?: string }> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.patch<{ success: boolean; message?: string }>(`${this.baseUrl}/mark-all-read`),
            {
              retryOptions: {
                maxRetries: 2,
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          // Clear all notification caches on successful mark all as read
          if (response.success) {
            this.clearNotificationCaches();
          }

          return {
            success: response.success,
            message: response.message
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to mark all notifications as read', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to mark all notifications as read'
          };
        }
      },
      'notification_mark_all_as_read'
    );
  }

  /**
   * Delete a notification with validation
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message?: string }> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate notification ID
          if (!notificationId || notificationId.trim().length === 0) {
            return {
              success: false,
              message: 'Notification ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.delete<{ success: boolean; message?: string }>(`${this.baseUrl}/${notificationId}`),
            {
              retryOptions: {
                maxRetries: 2,
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          // Clear notification caches on successful deletion
          if (response.success) {
            this.clearNotificationCaches();
          }

          return {
            success: response.success,
            message: response.message
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to delete notification', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to delete notification'
          };
        }
      },
      'notification_delete'
    );
  }

  /**
   * Create a new notification (admin only) with validation
   */
  async createNotification(data: CreateNotificationRequest): Promise<{ success: boolean; data?: Notification; message?: string }> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate notification data
          this.validateNotificationData(data);

          const response = await handleServiceResponse(
            () => apiClient.post<Notification>(`${this.baseUrl}`, data),
            {
              retryOptions: {
                maxRetries: 2,
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          // Clear notification caches on successful creation
          if (response.success) {
            this.clearNotificationCaches();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to create notification', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create notification'
          };
        }
      },
      'notification_create'
    );
  }

  /**
   * Subscribe to notification updates (optimized polling with exponential backoff)
   */
  subscribeToUpdates(callback: (notification: Notification) => void): () => void {
    let pollInterval = 10000; // Start with 10 seconds (reduced frequency)
    let consecutiveErrors = 0;
    let timeoutId: NodeJS.Timeout;
    let lastNotificationId: string | null = null;

    const poll = async () => {
      try {
        const response = await this.getNotifications({ limit: 5, unreadOnly: true });
        
        if (response.success && response.data?.notifications) {
          const notifications = response.data.notifications;
          
          // Check for new notifications
          if (notifications.length > 0) {
            const latestNotification = notifications[0];
            
            // Only callback if this is a truly new notification
            const notificationId = (latestNotification as Notification & { id?: string; _id?: string }).id || 
                                   (latestNotification as Notification & { id?: string; _id?: string })._id;
            if (lastNotificationId !== notificationId) {
              lastNotificationId = notificationId;
              callback(latestNotification);
            }
          }

          // Reset error tracking on success
          consecutiveErrors = 0;
          pollInterval = 10000; // Reset to normal interval (10 seconds)
        } else {
          throw new Error(response.message || 'Failed to fetch notifications');
        }
      } catch (error) {
        consecutiveErrors++;
        ServiceUtils.logger.error('Error polling for notifications', error);
        
        // Exponential backoff on consecutive errors (max 120 seconds)
        pollInterval = Math.min(10000 * Math.pow(2, consecutiveErrors), 120000);
      }

      // Schedule next poll
      timeoutId = setTimeout(poll, pollInterval);
    };

    // Start polling
    poll();

    // Return cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }

  /**
   * Get notification icon component for display
   */
  getNotificationIcon(type: string, customIcon?: string): string {
    if (customIcon) return customIcon;
    
    const iconMap: Record<string, string> = {
      'bid': '🔨',
      'order': '🛒',
      'message': '💬',
      'listing': '💎',
      'system': '⚙️',
      'seller': '🏪',
      'admin': '👑'
    };

    return iconMap[type] || '🔔';
  }

  /**
   * Format notification for display
   */
  formatNotification(notification: Notification): {
    title: string;
    message: string;
    icon: string;
    color: string;
    link?: string;
  } {
    const baseFormatted = {
      title: notification.title,
      message: notification.message,
      link: notification.link
    };

    switch (notification.type) {
      case 'bid':
        return {
          ...baseFormatted,
          icon: 'gavel',
          color: 'text-yellow-600'
        };
      case 'order':
        return {
          ...baseFormatted,
          icon: 'shopping-bag',
          color: 'text-green-600'
        };
      case 'message':
        return {
          ...baseFormatted,
          icon: 'message-circle',
          color: 'text-blue-600'
        };
      case 'listing':
        return {
          ...baseFormatted,
          icon: 'gem',
          color: 'text-purple-600'
        };
      case 'system':
        return {
          ...baseFormatted,
          icon: 'settings',
          color: 'text-gray-600'
        };
      case 'seller':
        return {
          ...baseFormatted,
          icon: 'store',
          color: 'text-indigo-600'
        };
      case 'admin':
        return {
          ...baseFormatted,
          icon: 'shield',
          color: 'text-red-600'
        };
      default:
        return {
          ...baseFormatted,
          icon: 'bell',
          color: 'text-gray-600'
        };
    }
  }

  // Private helper methods
  private validateNotificationData(data: CreateNotificationRequest): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Notification data is required');
    }

    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Notification title is required');
    }

    if (data.title.trim().length > 100) {
      throw new Error('Notification title must be less than 100 characters');
    }

    if (!data.message || data.message.trim().length === 0) {
      throw new Error('Notification message is required');
    }

    if (data.message.trim().length > 500) {
      throw new Error('Notification message must be less than 500 characters');
    }

    if (data.type && !['bid', 'order', 'message', 'listing', 'system', 'seller', 'admin'].includes(data.type)) {
      throw new Error('Invalid notification type');
    }

    // Validate recipient ID if provided
    interface NotificationWithRecipients {
      recipientIds?: string[];
      recipientId?: string;
    }
    const dataWithRecipients = data as CreateNotificationRequest & NotificationWithRecipients;
    const recipientIds = dataWithRecipients.recipientIds || (dataWithRecipients.recipientId ? [dataWithRecipients.recipientId] : []);
    if (recipientIds && Array.isArray(recipientIds)) {
      if (recipientIds.length > 1000) {
        throw new Error('Maximum 1000 recipients allowed per notification');
      }

      for (const id of recipientIds) {
        if (!id || id.trim().length === 0) {
          throw new Error('All recipient IDs must be valid');
        }
      }
    }
  }

  private clearNotificationCaches(): void {
    // Clear notification-related caches using the public API
    try {
      // Get cache stats to check if cache has entries
      const stats = ServiceUtils.getCacheStats();
      if (stats.entries > 0) {
        // Clear all cache - this is safer than trying to access internal properties
        ServiceUtils.cache.clear();
      }
    } catch {
      // If cache access fails, just clear everything to be safe
      ServiceUtils.cache.clear();
    }
  }

  /**
   * Clear all notification service caches
   */
  clearCache(): void {
    ServiceUtils.cache.clear();
  }

  /**
   * Optimized batch mark as read for multiple notifications
   */
  async batchMarkAsRead(notificationIds: string[]): Promise<{ success: boolean; message?: string }> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate input
          if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
            return {
              success: false,
              message: 'Notification IDs array is required'
            };
          }

          if (notificationIds.length > 100) {
            return {
              success: false,
              message: 'Maximum 100 notifications can be marked as read at once'
            };
          }

          // Validate all IDs
          for (const id of notificationIds) {
            if (!id || id.trim().length === 0) {
              return {
                success: false,
                message: 'All notification IDs must be valid'
              };
            }
          }

          const response = await handleServiceResponse(
            () => apiClient.patch<{ success: boolean; message?: string }>(`${this.baseUrl}/batch-read`, { notificationIds }),
            {
              retryOptions: {
                maxRetries: 2,
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          // Clear notification caches on successful batch read
          if (response.success) {
            this.clearNotificationCaches();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to batch mark notifications as read', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to batch mark notifications as read'
          };
        }
      },
      'notification_batch_mark_as_read'
    );
  }
}

const notificationService = new NotificationService();
export default notificationService; 