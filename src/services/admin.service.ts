import apiClient from '@/lib/api-client';
import { 
  ApiResponse,
  SellerMetrics,
  AdminSellerApplication, 
  AdminBuyerUser,
  AdminActionResponse,
  ContactResponse,
  BlockResponse,
  VerificationResponse,
  MeetLinkResponse,
  ContactSellerRequest,
  BlockSellerRequest,
  UpdateBuyerStatusRequest,
  SellerUsersResponse,
  SellerApplicationsResponse,
  BuyersResponse,
  AdminDashboardStats,
  AdminRecentActivity,
  AdminBuyerStats,
  AdminFlaggedReviewsStats,
  AdminFlaggedReviewsResponse,
  MessageResponse
} from '@/types';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';

/**
 * Production-optimized Admin Service
 * Handles admin operations with caching, validation, and performance monitoring
 */
class AdminService {
  private readonly baseUrl = '/admin/sellers';

  /**
   * Get all active sellers with pagination, filtering, and caching
   */
  async getSellers(
    page: number = 1,
    limit: number = 10,
    status: string = 'all',
    search?: string
  ): Promise<ApiResponse<SellerUsersResponse>> {
    return withPerformanceMonitoring(
      async () => {
    try {
          const cacheKey = `admin_sellers_${page}_${limit}_${status}_${search || ''}`;
          
          const response = await handleServiceResponse(
            () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status !== 'all' && { status }),
        ...(search && { search })
              });
              
              return apiClient.get<SellerUsersResponse>(`${this.baseUrl}/users?${params}`);
            },
            {
              cacheKey,
              cacheTtl: !search ? 180000 : 60000, // 3 min cache for lists, 1 min for search
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

        return {
            success: response.success,
          message: response.message || 'Sellers fetched successfully',
          data: {
            sellers: response.data?.sellers || [],
            pagination: response.data?.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              pages: 0
            }
          }
          };
    } catch (error) {
          ServiceUtils.logger.error('Failed to fetch sellers', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch sellers',
        data: {
          sellers: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
          };
      }
      },
      'admin_get_sellers'
    );
  }



  /**
   * Block seller with validation and performance monitoring
   */
  async blockSeller(id: string, blockData: BlockSellerRequest): Promise<ApiResponse<BlockResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            } as ApiResponse<BlockResponse>;
          }

          if (!blockData.reason || blockData.reason.trim().length === 0) {
            return {
              success: false,
              message: 'Block reason is required'
            } as ApiResponse<BlockResponse>;
          }

          return await handleServiceResponse(
            () => apiClient.post<BlockResponse>(`${this.baseUrl}/${id}/block`, blockData),
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
    } catch (error) {
          ServiceUtils.logger.error('Failed to block seller', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to block seller'
          } as ApiResponse<BlockResponse>;
      }
      },
      'admin_block_seller'
    );
  }

  /**
   * Unblock seller with validation
   */
  async unblockSeller(id: string): Promise<ApiResponse<AdminActionResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate seller ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            } as ApiResponse<AdminActionResponse>;
          }

          const response = await handleServiceResponse(
            () => apiClient.post<AdminActionResponse>(`${this.baseUrl}/${id}/unblock`),
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

          // Clear seller cache on successful unblock
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to unblock seller', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unblock seller'
          } as ApiResponse<AdminActionResponse>;
      }
      },
      'admin_unblock_seller'
    );
  }

  /**
   * Contact seller via email with validation
   */
  async contactSeller(id: string, contactData: ContactSellerRequest): Promise<ApiResponse<ContactResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            } as ApiResponse<ContactResponse>;
          }

          this.validateContactData(contactData);

          return await handleServiceResponse(
            () => apiClient.post<ContactResponse>(`${this.baseUrl}/${id}/contact`, contactData),
            {
              retryOptions: {
                maxRetries: 1, // Email operations should not be retried aggressively
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
          ServiceUtils.logger.error('Failed to contact seller', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to contact seller'
          } as ApiResponse<ContactResponse>;
      }
      },
      'admin_contact_seller'
    );
  }

  /**
   * Get seller performance metrics with caching
   */
  async getSellerMetrics(id: string): Promise<ApiResponse<SellerMetrics>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate seller ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            } as ApiResponse<SellerMetrics>;
          }

          return await handleServiceResponse(
            () => apiClient.get<SellerMetrics>(`${this.baseUrl}/${id}/metrics`),
            {
              cacheKey: `seller_metrics_${id}`,
              cacheTtl: 300000, // 5 minutes cache for metrics
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
          ServiceUtils.logger.error('Failed to fetch seller metrics', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch seller metrics'
          } as ApiResponse<SellerMetrics>;
      }
      },
      'admin_get_seller_metrics'
    );
  }

  // === APPLICATION MANAGEMENT METHODS (for verification page) ===

  /**
   * Get all seller applications with pagination, filtering, caching and validation
   */
  async getSellerApplications(
    page: number = 1,
    limit: number = 10,
    status: string = 'all'
  ): Promise<ApiResponse<SellerApplicationsResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate pagination parameters
          if (page < 1) {
            return {
              success: false,
              message: 'Page number must be 1 or greater',
              data: { applications: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
            };
          }

          if (limit < 1 || limit > 100) {
            return {
              success: false,
              message: 'Limit must be between 1 and 100',
              data: { applications: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
            };
          }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status !== 'all' && { status })
          });

          const cacheKey = `admin_seller_applications_${page}_${limit}_${status}`;

          const response = await handleServiceResponse(
            () => apiClient.get<SellerApplicationsResponse>(`${this.baseUrl}?${params}`),
            {
              cacheKey,
              cacheTtl: 120000, // 2 minutes cache for applications (frequently updated)
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
      
      if (response.success) {
        // Handle the actual API response structure
            const applicationsArray = Array.isArray(response.data) ? response.data : (response.data?.applications || []);
            const paginationData = (response as { pagination?: { page: number; limit: number; total: number; pages: number } }).pagination || response.data?.pagination || {
          page: 1,
          limit: 10,
          total: applicationsArray.length,
          pages: Math.ceil(applicationsArray.length / 10)
            };
        
        return {
          success: true,
          message: response.message || 'Applications fetched successfully',
          data: {
            applications: applicationsArray,
            pagination: paginationData
          }
            };
      }
      
          return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to fetch seller applications', error);
      return {
        success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch seller applications',
            data: { applications: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
          };
        }
      },
      'admin_get_seller_applications'
    );
  }

  /**
   * Get single seller application by ID with caching and validation
   */
  async getSellerApplication(id: string): Promise<ApiResponse<AdminSellerApplication>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate application ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Application ID is required'
            };
          }

          return await handleServiceResponse(
            () => apiClient.get<AdminSellerApplication>(`${this.baseUrl}/${id}`),
            {
              cacheKey: `admin_seller_application_${id}`,
              cacheTtl: 300000, // 5 minutes cache for individual applications
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
          ServiceUtils.logger.error('Failed to fetch seller application', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch seller application'
          };
      }
      },
      'admin_get_seller_application'
    );
  }

  /**
   * Approve seller application with validation
   */
  async approveSeller(id: string): Promise<ApiResponse<AdminActionResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate application ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Application ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<AdminActionResponse>(`${this.baseUrl}/${id}/approve`),
            {
              retryOptions: {
                maxRetries: 1, // Application approval should have minimal retries
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

          // Clear application caches on successful approval
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to approve seller', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to approve seller'
          };
      }
      },
      'admin_approve_seller'
    );
  }

  /**
   * Reject seller application with validation
   */
  async rejectSeller(id: string, reason: string): Promise<ApiResponse<AdminActionResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Application ID is required'
            };
          }

          if (!reason || reason.trim().length === 0) {
            return {
              success: false,
              message: 'Rejection reason is required'
            };
          }

          if (reason.trim().length > 1000) {
            return {
              success: false,
              message: 'Rejection reason must be less than 1000 characters'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<AdminActionResponse>(`${this.baseUrl}/${id}/reject`, { reason: reason.trim() }),
            {
              retryOptions: {
                maxRetries: 1, // Application rejection should have minimal retries
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

          // Clear application caches on successful rejection
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to reject seller', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reject seller'
          };
      }
      },
      'admin_reject_seller'
    );
  }

  /**
   * Verify video call completion with validation
   */
  async verifyVideoCall(id: string): Promise<ApiResponse<VerificationResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate application ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Application ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.patch<VerificationResponse>(`${this.baseUrl}/${id}/verify-video-call`),
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

          // Clear application caches on successful verification
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to verify video call', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify video call'
          };
      }
      },
      'admin_verify_video_call'
    );
  }

  /**
   * Send Calendly meeting link to seller with validation
   */
  async sendMeetLink(id: string, meetingData?: {
    meetingLink: string;
    meetingDuration: number;
    meetingInstructions: string;
  }): Promise<ApiResponse<MeetLinkResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate application ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Application ID is required'
            };
          }

          // Validate meeting data if provided
          if (meetingData) {
            if (!meetingData.meetingLink || meetingData.meetingLink.trim().length === 0) {
              return {
                success: false,
                message: 'Meeting link is required'
              };
            }

            if (meetingData.meetingDuration < 15 || meetingData.meetingDuration > 120) {
              return {
                success: false,
                message: 'Meeting duration must be between 15 and 120 minutes'
              };
            }
          }

          const requestData = meetingData ? {
            meetingLink: meetingData.meetingLink.trim(),
            meetingDuration: meetingData.meetingDuration,
            meetingInstructions: meetingData.meetingInstructions?.trim() || ''
          } : {};

          return await handleServiceResponse(
            () => apiClient.post<MeetLinkResponse>(`${this.baseUrl}/${id}/send-meet`, requestData),
            {
              retryOptions: {
                maxRetries: 1, // Email operations should not be retried aggressively
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
          ServiceUtils.logger.error('Failed to send meet link', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send meet link'
          };
        }
      },
      'admin_send_meet_link'
    );
  }

  /**
   * Get admin dashboard statistics with caching
   */
  async getDashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          return await handleServiceResponse(
            () => apiClient.get(`/admin/dashboard/stats`),
            {
              cacheKey: 'admin_dashboard_stats',
              cacheTtl: 300000, // 5 minutes cache for dashboard stats
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
          ServiceUtils.logger.error('Failed to fetch dashboard stats', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch dashboard statistics'
          };
        }
      },
      'admin_get_dashboard_stats'
    );
  }

  /**
   * Get recent activity for admin dashboard with caching and validation
   */
  async getRecentActivity(limit: number = 10): Promise<ApiResponse<AdminRecentActivity[]>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate limit parameter
          if (limit < 1 || limit > 100) {
      return {
        success: false,
              message: 'Limit must be between 1 and 100',
              data: []
            };
          }

          return await handleServiceResponse(
            () => apiClient.get(`/admin/dashboard/activity?limit=${limit}`),
            {
              cacheKey: `admin_recent_activity_${limit}`,
              cacheTtl: 60000, // 1 minute cache for recent activity (very dynamic)
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
          ServiceUtils.logger.error('Failed to fetch recent activity', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch recent activity',
            data: []
          };
        }
      },
      'admin_get_recent_activity'
    );
  }

  /**
   * Get flagged reviews stats with caching and optimization
   */
  async getFlaggedReviewsStats(): Promise<ApiResponse<AdminFlaggedReviewsStats>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const cacheKey = 'admin_flagged_reviews_stats';

                    return await handleServiceResponse(
            async () => {
              // Use batch requests for better performance
              const [pendingResponse, approvedResponse] = await ServiceUtils.batchRequests([
                () => apiClient.get(`/admin/reviews/flagged?status=flagged&limit=1`),
                () => apiClient.get(`/admin/reviews/flagged?status=resolved&limit=1`)
              ], { batchSize: 2, delay: 0 });

      if (!pendingResponse.success || !approvedResponse.success) {
                throw new Error('Failed to fetch review stats');
      }

      // For now, we'll calculate simple stats
      // In a real app, you'd have a dedicated stats endpoint
              const pending = (pendingResponse.data as { pagination?: { total?: number } })?.pagination?.total || 0;
              const resolved = (approvedResponse.data as { pagination?: { total?: number } })?.pagination?.total || 0;
      
      // Mock approved/rejected split (in real app, you'd track this separately)
              const approved = Math.floor(resolved * 0.7); // Assume 70% approved
              const rejected = resolved - approved;

      return {
        success: true,
        message: 'Review stats retrieved successfully',
        data: {
          pending,
          approved,
          rejected,
          avgResponseTimeHours: 0.8 // Less than 1 hour average
                } as AdminFlaggedReviewsStats
              };
            },
            {
              cacheKey,
              cacheTtl: 120000, // 2 minutes cache for review stats
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
          ServiceUtils.logger.error('Failed to fetch flagged review stats', error);
      return {
        success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch review stats',
            data: {
              pending: 0,
              approved: 0,
              rejected: 0,
              avgResponseTimeHours: 0
            }
          };
        }
      },
      'admin_get_flagged_reviews_stats'
    );
  }

  // === BUYER MANAGEMENT ===

  /**
   * Get all buyers with pagination, filtering, caching and validation
   */
  async getBuyers(
    page: number = 1,
    limit: number = 10,
    status: string = 'all',
    search?: string
  ): Promise<ApiResponse<BuyersResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate pagination parameters
          if (page < 1) {
            return {
              success: false,
              message: 'Page number must be 1 or greater',
              data: { buyers: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
            };
          }

          if (limit < 1 || limit > 100) {
            return {
              success: false,
              message: 'Limit must be between 1 and 100',
              data: { buyers: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
            };
          }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status !== 'all' && { status }),
        ...(search && { search })
          });

          const cacheKey = `admin_buyers_${page}_${limit}_${status}_${search || ''}`;

          const response = await handleServiceResponse(
            () => apiClient.get<BuyersResponse>(`/admin/buyers?${params}`),
            {
              cacheKey,
              cacheTtl: !search ? 180000 : 60000, // 3 min cache for lists, 1 min for search
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
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Buyers fetched successfully',
          data: {
            buyers: response.data?.buyers || [],
            pagination: response.data?.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              pages: 0
            }
          }
            };
      }

          return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to fetch buyers', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch buyers',
        data: {
          buyers: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
          };
        }
      },
      'admin_get_buyers'
    );
  }

  /**
   * Get buyer details by ID with caching and validation
   */
  async getBuyerDetails(buyerId: string): Promise<ApiResponse<AdminBuyerUser>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate buyer ID
          if (!buyerId || buyerId.trim().length === 0) {
            return {
              success: false,
              message: 'Buyer ID is required'
            };
          }

          return await handleServiceResponse(
            () => apiClient.get<AdminBuyerUser>(`/admin/buyers/${buyerId}`),
            {
              cacheKey: `admin_buyer_details_${buyerId}`,
              cacheTtl: 300000, // 5 minutes cache for buyer details
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
          ServiceUtils.logger.error('Failed to fetch buyer details', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch buyer details'
          };
      }
      },
      'admin_get_buyer_details'
    );
  }

  /**
   * Update buyer status (activate, suspend, ban) with validation
   */
  async updateBuyerStatus(
    buyerId: string, 
    statusData: UpdateBuyerStatusRequest
  ): Promise<ApiResponse<MessageResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!buyerId || buyerId.trim().length === 0) {
            return {
              success: false,
              message: 'Buyer ID is required'
            };
          }

          if (!statusData || !statusData.status) {
            return {
              success: false,
              message: 'Status data is required'
            };
          }

          if (!['active', 'suspended', 'banned'].includes(statusData.status)) {
            return {
              success: false,
              message: 'Invalid status. Must be active, suspended, or banned'
            };
          }

          if (statusData.reason && statusData.reason.trim().length > 1000) {
            return {
              success: false,
              message: 'Reason must be less than 1000 characters'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.put<MessageResponse>(`/admin/buyers/${buyerId}/status`, {
              ...statusData,
              reason: statusData.reason?.trim()
            }),
            {
              retryOptions: {
                maxRetries: 1, // Status updates should have minimal retries
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

          // Clear buyer caches on successful status update
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to update buyer status', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update buyer status'
          };
        }
      },
      'admin_update_buyer_status'
    );
  }

  /**
   * Get buyer statistics with caching
   */
  async getBuyerStats(): Promise<ApiResponse<AdminBuyerStats>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          return await handleServiceResponse(
            () => apiClient.get(`/admin/buyers/stats`),
            {
              cacheKey: 'admin_buyer_stats',
              cacheTtl: 300000, // 5 minutes cache for buyer statistics
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
          ServiceUtils.logger.error('Failed to fetch buyer stats', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch buyer statistics'
          };
      }
      },
      'admin_get_buyer_stats'
    );
  }

  // === FLAGGED REVIEW MANAGEMENT METHODS ===

  /**
   * Get flagged reviews with pagination, filtering, caching and validation
   */
  async getFlaggedReviews(
    page: number = 1,
    limit: number = 10,
    status: 'all' | 'flagged' | 'resolved' = 'flagged'
  ): Promise<ApiResponse<AdminFlaggedReviewsResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate pagination parameters
          if (page < 1) {
            return {
              success: false,
              message: 'Page number must be 1 or greater',
              data: { reviews: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
            };
          }

          if (limit < 1 || limit > 100) {
            return {
              success: false,
              message: 'Limit must be between 1 and 100',
              data: { reviews: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
            };
          }

          if (!['all', 'flagged', 'resolved'].includes(status)) {
            return {
              success: false,
              message: 'Invalid status. Must be all, flagged, or resolved',
              data: { reviews: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
            };
          }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status !== 'all' && { status })
          });

          const cacheKey = `admin_flagged_reviews_${page}_${limit}_${status}`;

          return await handleServiceResponse(
            () => apiClient.get(`/admin/reviews/flagged?${params}`),
            {
              cacheKey,
              cacheTtl: 120000, // 2 minutes cache for flagged reviews (moderation content)
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
          ServiceUtils.logger.error('Failed to fetch flagged reviews', error);
      return {
        success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch flagged reviews',
            data: { reviews: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
          };
        }
      },
      'admin_get_flagged_reviews'
    );
  }

  /**
   * Approve a flagged review with validation
   */
  async approveReview(reviewId: string): Promise<ApiResponse<MessageResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate review ID
          if (!reviewId || reviewId.trim().length === 0) {
            return {
              success: false,
              message: 'Review ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<MessageResponse>(`/admin/reviews/${reviewId}/approve`),
            {
              retryOptions: {
                maxRetries: 1, // Review approval should have minimal retries
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

          // Clear flagged review caches on successful approval
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to approve review', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to approve review'
          };
        }
      },
      'admin_approve_review'
    );
  }

  /**
   * Reject a flagged review with validation
   */
  async rejectReview(reviewId: string, reason?: string): Promise<ApiResponse<MessageResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate review ID
          if (!reviewId || reviewId.trim().length === 0) {
            return {
              success: false,
              message: 'Review ID is required'
            };
          }

          // Validate reason if provided
          if (reason && reason.trim().length > 1000) {
            return {
              success: false,
              message: 'Rejection reason must be less than 1000 characters'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<MessageResponse>(`/admin/reviews/${reviewId}/reject`, { 
              reason: reason?.trim() || undefined 
            }),
            {
              retryOptions: {
                maxRetries: 1, // Review rejection should have minimal retries
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

          // Clear flagged review caches on successful rejection
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to reject review', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reject review'
          };
        }
      },
      'admin_reject_review'
    );
  }

  // Private validation methods
  private validateContactData(contactData: ContactSellerRequest): void {
    if (!contactData.subject || contactData.subject.trim().length === 0) {
      throw new Error('Subject is required');
    }

    if (!contactData.message || contactData.message.trim().length === 0) {
      throw new Error('Message is required');
    }

    if (!['low', 'medium', 'high'].includes(contactData.priority)) {
      throw new Error('Invalid priority level');
    }

    if (!['general', 'violation', 'support', 'warning'].includes(contactData.type)) {
      throw new Error('Invalid message type');
    }
  }

  /**
   * Clear all admin service caches
   */
  clearCache(): void {
    ServiceUtils.cache.clear();
  }
}

const adminService = new AdminService()
export default adminService 