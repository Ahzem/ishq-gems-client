import apiClient from '@/lib/api-client';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';

// Use centralized types
import type { 
  ApiResponse,
  SendMessageRequest,
  SendMessageResponse,
  MessagesResponse,
  ChatsResponse,
  MessageUnreadCountResponse,
  UserInfoResponse,
  BlockedUsersResponse
} from '@/types';

/**
 * Production-optimized Message Service
 * Handles messaging operations with caching, validation, and performance monitoring
 */
class MessageService {
  private readonly baseUrl = '/messages';

  /**
   * Get messages for a specific user conversation with caching
   */
  async getMessages(userId: string, page: number = 1, limit: number = 50): Promise<ApiResponse<MessagesResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate user ID
          if (!userId || userId.trim().length === 0) {
            return {
              success: false,
              message: 'User ID is required'
            };
          }

          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
          });

          const cacheKey = `messages_${userId}_${page}_${limit}`;

          return await handleServiceResponse(
            () => apiClient.get<MessagesResponse>(`${this.baseUrl}/${userId}?${params}`),
            {
              cacheKey,
              cacheTtl: 30000, // 30 seconds cache for messages (real-time data)
              useCache: true,
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
    } catch (error) {
          ServiceUtils.logger.error('Failed to fetch messages', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to load messages. Please try again.',
        error: 'MESSAGE_FETCH_FAILED'
      };
    }
      },
      'message_get_messages'
    );
  }

  /**
   * Get all chat threads for current user with caching
   */
  async getChats(page: number = 1, limit: number = 20): Promise<ApiResponse<ChatsResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
          });

          const cacheKey = `chats_${page}_${limit}`;

          return await handleServiceResponse(
            () => apiClient.get<ChatsResponse>(`${this.baseUrl}/chats?${params}`),
            {
              cacheKey,
              cacheTtl: 60000, // 1 minute cache for chat list
              useCache: true,
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
    } catch (error) {
          ServiceUtils.logger.error('Failed to fetch chats', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to load conversations. Please try again.',
        error: 'CHATS_FETCH_FAILED'
      };
    }
      },
      'message_get_chats'
    );
  }

  /**
   * Get unread messages count with caching
   */
  async getUnreadCount(): Promise<ApiResponse<MessageUnreadCountResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          return await handleServiceResponse(
            () => apiClient.get<MessageUnreadCountResponse>(`${this.baseUrl}/unread-count`),
            {
              cacheKey: 'unread_count',
              cacheTtl: 15000, // 15 seconds cache for unread count
              useCache: true,
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
        } catch (error) {
          ServiceUtils.logger.error('Failed to get unread count', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get unread count'
          };
        }
      },
      'message_get_unread_count'
    );
  }

  /**
   * Send a new message with validation and performance monitoring
   */
  async sendMessage(messageData: SendMessageRequest): Promise<ApiResponse<SendMessageResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate message data
          this.validateSendMessageRequest(messageData);

          const response = await handleServiceResponse(
            () => apiClient.post<SendMessageResponse>(this.baseUrl, messageData),
            {
              retryOptions: {
                maxRetries: 1, // Messages should have minimal retries to prevent duplicates
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

          // Clear relevant caches on successful send
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear message and chat caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to send message', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to send message'
          };
        }
      },
      'message_send'
    );
  }

  /**
   * Mark all messages as read for a specific user with validation
   */
  async markAllAsRead(userId: string): Promise<ApiResponse<never>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate user ID
          if (!userId || userId.trim().length === 0) {
            return {
              success: false,
              message: 'User ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.put<never>(`${this.baseUrl}/mark-all-read/${userId}`),
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

          // Clear relevant caches on successful mark as read
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear message and unread count caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to mark messages as read', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to mark messages as read'
          };
        }
      },
      'message_mark_all_read'
    );
  }

  /**
   * Get user information by ID with caching
   */
  async getUserById(userId: string): Promise<ApiResponse<UserInfoResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate user ID
          if (!userId || userId.trim().length === 0) {
            return {
              success: false,
              message: 'User ID is required'
            };
          }

          return await handleServiceResponse(
            () => apiClient.get<UserInfoResponse>(`/user/${userId}`),
            {
              cacheKey: `user_info_${userId}`,
              cacheTtl: 300000, // 5 minutes cache for user info
              useCache: true,
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
        } catch (error) {
          ServiceUtils.logger.error('Failed to get user info', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get user information'
          };
        }
      },
      'message_get_user_by_id'
    );
  }

  /**
   * Delete a message with validation
   */
  async deleteMessage(messageId: string): Promise<ApiResponse<never>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate message ID
          if (!messageId || messageId.trim().length === 0) {
            return {
              success: false,
              message: 'Message ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.delete<never>(`${this.baseUrl}/${messageId}`),
            {
              retryOptions: {
                maxRetries: 1,
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

          // Clear relevant caches on successful deletion
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear message caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to delete message', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to delete message'
          };
        }
      },
      'message_delete'
    );
  }

  /**
   * Report a message with validation
   */
  async reportMessage(messageId: string, reason: string): Promise<ApiResponse<never>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!messageId || messageId.trim().length === 0) {
            return {
              success: false,
              message: 'Message ID is required'
            };
          }

          if (!reason || reason.trim().length === 0) {
            return {
              success: false,
              message: 'Report reason is required'
            };
          }

          if (reason.trim().length > 500) {
            return {
              success: false,
              message: 'Report reason must be less than 500 characters'
            };
          }

          return await handleServiceResponse(
            () => apiClient.post<never>(`${this.baseUrl}/${messageId}/report`, { reason: reason.trim() }),
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
        } catch (error) {
          ServiceUtils.logger.error('Failed to report message', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to report message'
          };
        }
      },
      'message_report'
    );
  }

  /**
   * Block a user with validation
   */
  async blockUser(userId: string): Promise<ApiResponse<never>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate user ID
          if (!userId || userId.trim().length === 0) {
            return {
              success: false,
              message: 'User ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<never>(`${this.baseUrl}/block/${userId}`),
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

          // Clear relevant caches on successful block
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear chat and message caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to block user', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to block user'
          };
        }
      },
      'message_block_user'
    );
  }

  /**
   * Unblock a user with validation
   */
  async unblockUser(userId: string): Promise<ApiResponse<never>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate user ID
          if (!userId || userId.trim().length === 0) {
            return {
              success: false,
              message: 'User ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.delete<never>(`${this.baseUrl}/block/${userId}`),
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

          // Clear relevant caches on successful unblock
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear chat and message caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to unblock user', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to unblock user'
          };
        }
      },
      'message_unblock_user'
    );
  }

  /**
   * Get blocked users list with caching
   */
  async getBlockedUsers(): Promise<ApiResponse<BlockedUsersResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          return await handleServiceResponse(
            () => apiClient.get<BlockedUsersResponse>(`${this.baseUrl}/blocked`),
            {
              cacheKey: 'blocked_users',
              cacheTtl: 180000, // 3 minutes cache for blocked users list
              useCache: true,
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
        } catch (error) {
          ServiceUtils.logger.error('Failed to get blocked users', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get blocked users list'
          };
        }
      },
      'message_get_blocked_users'
    );
  }

  // Private validation methods
  private validateSendMessageRequest(messageData: SendMessageRequest): void {
    if (!messageData.receiverId || messageData.receiverId.trim().length === 0) {
      throw new Error('Receiver ID is required');
    }

    if (!messageData.content || messageData.content.trim().length === 0) {
      throw new Error('Message content is required');
    }

    if (messageData.content.trim().length > 5000) {
      throw new Error('Message content must be less than 5000 characters');
    }

    // Validate link previews if provided
    if (messageData.linkPreviews && messageData.linkPreviews.length > 3) {
      throw new Error('Maximum 3 link previews allowed per message');
    }
  }

  /**
   * Clear all message service caches
   */
  clearCache(): void {
    ServiceUtils.cache.clear();
  }
}

const messageService = new MessageService();
export default messageService;

// Re-export types from centralized location
export type {
  Message,
  ChatThread,
  MessageUser,
  SendMessageRequest,
  SendMessageResponse,
  MessagesResponse,
  ChatsResponse,
  MessageUnreadCountResponse,
  UserInfoResponse,
  BlockedUsersResponse
} from '@/types';