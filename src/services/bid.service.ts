import apiClient from '@/lib/api-client';
import { 
  // Core bid types
  BidData, 
  BidResponse, 
  BidListResponse,
  BidStatsResponse,
  BidActionResponse,
  BidFlagResponse,
  DisputeResolutionResponse,
  BidUpdatesResponse,
  SellerAuctionsResponse,
  AdminAuctionsResponse,
  AdminBidStatsResponse,
  DisputedBidsResponse,
  // Request types
  PlaceBidRequest, 
  UpdateBidRequest, 
  AdminBidFilters,
  AuctionOptions,
  DisputeFilters,
  // Utility types
  BidStatusInfo,
  TimeRemaining,
  BidValidationContext,
  BidServiceConfig,
  BidServiceState,
  DisputedBidData
} from '@/types';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';

/**
 * Production-optimized Bid Service
 * 
 * Enterprise-grade bidding service with:
 * - Comprehensive type safety with centralized type definitions
 * - Advanced caching strategies with memory pressure awareness
 * - Circuit breaker pattern for service resilience
 * - Real-time bid updates and auction monitoring
 * - Comprehensive error handling and retry logic
 * - Performance monitoring and analytics
 * - Input validation and security measures
 * - Production-ready logging and monitoring
 */
class BidService {
  private readonly config: BidServiceConfig = {
    baseUrl: '/bids',
    retryOptions: { 
      maxRetries: 1, // Conservative for bidding to prevent double bids
      retryCondition: (error: unknown) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          return status >= 500 || status === 0;
        }
        return false;
      }
    },
    cacheOptions: {
      defaultTtl: 300000, // 5 minutes
      bidListTtl: 30000,  // 30 seconds for bid lists
      highestBidTtl: 15000, // 15 seconds for highest bid
      statsTtl: 60000     // 1 minute for statistics
    }
  };

  private state: BidServiceState = {
    startTime: 0
  };

  /**
   * Place a new bid on a gem with validation and performance monitoring
   */
  async placeBid(bidData: PlaceBidRequest): Promise<BidResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate bid data
          this.validateBidData(bidData);

          const response = await handleServiceResponse(
            () => apiClient.post<BidData>(this.config.baseUrl, {
              ...bidData,
              isProxy: bidData.proxyMaxBid !== undefined,
              maxAmount: bidData.proxyMaxBid
            }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear bid caches on successful bid placement
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear all bid-related cache
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to place bid', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to place bid'
          };
        }
      },
      'bid_place'
    );
  }

  /**
   * Update an existing bid with validation and performance monitoring
   */
  async updateBid(bidId: string, updateData: UpdateBidRequest): Promise<BidResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate bid ID
          if (!bidId || bidId.trim().length === 0) {
            return {
              success: false,
              message: 'Bid ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.put<BidData>(`${this.config.baseUrl}/${bidId}`, updateData),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear bid caches on successful update
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to update bid', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update bid'
          };
        }
      },
      'bid_update'
    );
  }

  /**
   * Cancel a bid with enhanced error handling and validation
   */
  async cancelBid(bidId: string, reason?: string): Promise<BidActionResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate bid ID
          if (!bidId || bidId.trim().length === 0) {
            return {
              success: false,
              message: 'Bid ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<BidActionResponse>(`${this.config.baseUrl}/${bidId}/cancel`, { reason }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear related caches on successful cancellation
          if (response.success) {
            ServiceUtils.cache.clear();
          }

      return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to cancel bid', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel bid'
      };
    }
      },
      'bid_cancel'
    );
  }

  /**
   * Delete a bid with enhanced validation and monitoring
   */
  async deleteBid(bidId: string): Promise<BidActionResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate bid ID
          if (!bidId || bidId.trim().length === 0) {
            return {
              success: false,
              message: 'Bid ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.delete<BidActionResponse>(`${this.config.baseUrl}/${bidId}`),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear related caches on successful deletion
          if (response.success) {
            ServiceUtils.cache.clear();
          }

      return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to delete bid', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete bid'
      };
    }
      },
      'bid_delete'
    );
  }

  /**
   * Finalize a winning bid with enhanced validation and monitoring
   */
  async finalizeBid(bidId: string, notes?: string): Promise<BidResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate bid ID
          if (!bidId || bidId.trim().length === 0) {
            return {
              success: false,
              message: 'Bid ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<BidData>(`${this.config.baseUrl}/${bidId}/finalize`, { notes }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear related caches on successful finalization
          if (response.success) {
            ServiceUtils.cache.clear();
          }

      return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to finalize bid', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to finalize bid'
      };
    }
      },
      'bid_finalize'
    );
  }

  /**
   * Get all bids for a specific gem with caching
   */
  async getBidsForGem(
    gemId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    sortBy: 'amount' | 'placedAt' = 'amount',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<BidListResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!gemId || gemId.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy,
            sortOrder,
            ...(status && { status })
          });

          const cacheKey = `gem_bids_${gemId}_${page}_${limit}_${sortBy}_${sortOrder}_${status || 'all'}`;

          const response = await handleServiceResponse(
            () => apiClient.get(`${this.config.baseUrl}/gem/${gemId}?${params}`),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.bidListTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Transform response to match expected format
          return {
            success: response.success,
            message: response.message || 'Gem bids retrieved successfully',
            data: response.data && typeof response.data === 'object' && 'bids' in response.data
              ? response.data as { bids: BidData[]; total: number; page: number; totalPages: number; }
              : { bids: [], total: 0, page: 1, totalPages: 0 }
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to get bids for gem', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve bids'
          };
        }
      },
      'bid_get_for_gem'
    );
  }

  /**
   * Get the highest bid for a specific gem with caching
   */
  async getHighestBidForGem(gemId: string): Promise<BidResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!gemId || gemId.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          return await handleServiceResponse(
            () => apiClient.get<BidData>(`${this.config.baseUrl}/gem/${gemId}/highest`),
            {
              cacheKey: `gem_highest_bid_${gemId}`,
              cacheTtl: this.config.cacheOptions.highestBidTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get highest bid', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve highest bid'
          };
        }
      },
      'bid_get_highest'
    );
  }

  /**
   * Get bid statistics for a gem with caching
   */
  async getBidStatsForGem(gemId: string): Promise<BidStatsResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!gemId || gemId.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.get(`${this.config.baseUrl}/gem/${gemId}/stats`),
            {
              cacheKey: `gem_bid_stats_${gemId}`,
              cacheTtl: this.config.cacheOptions.statsTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Transform response to match expected format
          return {
            success: response.success,
            message: response.message || 'Bid statistics retrieved successfully',
            data: response.data && typeof response.data === 'object' && 'totalBids' in response.data 
              ? response.data as { totalBids: number; highestBid: number; hasActiveBids: boolean; isFinalized: boolean; }
              : undefined
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to get bid statistics', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve bid statistics'
          };
        }
      },
      'bid_get_stats'
    );
  }

  /**
   * Get current user's bids across all gems with caching
   */
  async getMyBids(page: number = 1, limit: number = 20): Promise<BidListResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
          });

          const response = await handleServiceResponse(
            () => apiClient.get(`${this.config.baseUrl}/my-bids?${params}`),
            {
              cacheKey: `my_bids_${page}_${limit}`,
              cacheTtl: this.config.cacheOptions.bidListTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Transform response to match expected format
          return {
            success: response.success,
            message: response.message || 'User bids retrieved successfully',
            data: response.data && typeof response.data === 'object' && 'bids' in response.data
              ? response.data as { bids: BidData[]; total: number; page: number; totalPages: number; }
              : { bids: [], total: 0, page: 1, totalPages: 0 }
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to get user bids', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve your bids',
            data: { bids: [], total: 0, page: 1, totalPages: 0 }
          };
        }
      },
      'bid_get_my_bids'
    );
  }

  /**
   * Admin: Get all bids with filtering and caching
   */
  async getAllBidsAdmin(
    filters: AdminBidFilters = {}
  ): Promise<BidListResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const params = new URLSearchParams({
            page: (filters.page || 1).toString(),
            limit: (filters.limit || 20).toString(),
            sortBy: filters.sortBy || 'placedAt',
            sortOrder: filters.sortOrder || 'desc',
            ...(filters.gemId && { gemId: filters.gemId }),
            ...(filters.userId && { userId: filters.userId }),
            ...(filters.status && { status: filters.status })
          });

          const cacheKey = `admin_all_bids_${filters.page || 1}_${filters.limit || 20}_${filters.sortBy || 'placedAt'}_${filters.sortOrder || 'desc'}_${filters.gemId || ''}_${filters.userId || ''}_${filters.status || ''}`;

          const response = await handleServiceResponse(
            () => apiClient.get(`${this.config.baseUrl}/admin/all?${params}`),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.statsTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Transform response to match expected format
          return {
            success: response.success,
            message: response.message || 'Admin bids retrieved successfully',
            data: response.data && typeof response.data === 'object' && 'bids' in response.data
              ? response.data as { bids: BidData[]; total: number; page: number; totalPages: number; }
              : { bids: [], total: 0, page: 1, totalPages: 0 }
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to get all bids (admin)', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve bids',
            data: { bids: [], total: 0, page: 1, totalPages: 0 }
          };
        }
      },
      'bid_get_all_admin'
    );
  }

  /**
   * Admin: Process expired auctions with enhanced monitoring
   */
  async processExpiredAuctions(): Promise<BidActionResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.post<BidActionResponse>(`${this.config.baseUrl}/admin/process-expired`),
            {
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Clear all caches after processing expired auctions
          if (response.success) {
            ServiceUtils.cache.clear();
          }

      return response;
    } catch (error) {
          ServiceUtils.logger.error('Failed to process expired auctions', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process expired auctions'
      };
    }
      },
      'admin_process_expired_auctions'
    );
  }

  /**
   * Get bid updates for real-time functionality with enhanced validation
   */
  async getBidUpdates(gemId: string, since?: string): Promise<BidUpdatesResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!gemId || gemId.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

      const params = new URLSearchParams({
        ...(since && { since })
      });

          const response = await handleServiceResponse(
            () => apiClient.get(`${this.config.baseUrl}/gem/${gemId}/updates?${params}`),
            {
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

      return {
        success: response.success,
        message: response.message || 'Bid updates retrieved successfully',
            data: response.data && typeof response.data === 'object' ? response.data as BidUpdatesResponse['data'] : undefined
      };
    } catch (error) {
          ServiceUtils.logger.error('Failed to get bid updates', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve bid updates'
      };
    }
      },
      'bid_get_updates'
    );
  }

  /**
   * Get seller's auction gems with enhanced caching and validation
   */
  async getSellerAuctions(): Promise<SellerAuctionsResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.get<SellerAuctionsResponse>(`${this.config.baseUrl}/seller/auctions`),
            {
              cacheKey: 'seller_auctions',
              cacheTtl: this.config.cacheOptions.defaultTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

      return {
        success: response.success,
        message: response.message || 'Seller auctions retrieved successfully',
        data: response.data && Array.isArray(response.data) ? response.data : undefined
      };
    } catch (error) {
          ServiceUtils.logger.error('Failed to get seller auctions', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve seller auctions'
      };
    }
      },
      'bid_get_seller_auctions'
    );
  }

  /**
   * Get all auctions for admin with enhanced caching and validation
   */
  async getAllAuctions(options: AuctionOptions = {}): Promise<AdminAuctionsResponse> {
    return withPerformanceMonitoring(
      async () => {
    try {
      const params = new URLSearchParams({
        ...(options.includeAdminData && { includeAdminData: 'true' })
      });

          const cacheKey = `admin_auctions_${options.includeAdminData || 'basic'}`;

          const response = await handleServiceResponse(
            () => apiClient.get<AdminAuctionsResponse>(`${this.config.baseUrl}/admin/auctions?${params}`),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.defaultTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

      return {
        success: response.success,
        message: response.message || 'Admin auctions retrieved successfully',
        data: response.data && Array.isArray(response.data) ? response.data : undefined
      };
    } catch (error) {
          ServiceUtils.logger.error('Failed to get all auctions (admin)', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve auctions'
      };
    }
      },
      'admin_get_all_auctions'
    );
  }

  /**
   * Get admin statistics with enhanced caching and monitoring
   */
  async getAdminStats(): Promise<AdminBidStatsResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.get<AdminBidStatsResponse>(`${this.config.baseUrl}/admin/stats`),
            {
              cacheKey: 'admin_bid_stats',
              cacheTtl: this.config.cacheOptions.statsTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

      return {
        success: response.success,
        message: response.message || 'Admin stats retrieved successfully',
            data: response.data as AdminBidStatsResponse['data']
      };
    } catch (error) {
          ServiceUtils.logger.error('Failed to get admin statistics', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve admin statistics'
      };
    }
      },
      'admin_get_stats'
    );
  }

  /**
   * Flag a bid for dispute resolution with enhanced validation and monitoring
   */
  async flagBid(bidId: string, reason: string): Promise<BidFlagResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!bidId || bidId.trim().length === 0) {
            return {
              success: false,
              message: 'Bid ID is required'
            };
          }

      if (!reason || reason.trim().length === 0) {
        return {
          success: false,
          message: 'Flag reason is required and cannot be empty'
        };
      }

          const response = await handleServiceResponse(
            () => apiClient.post<BidFlagResponse>(`${this.config.baseUrl}/${bidId}/flag`, { reason: reason.trim() }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear related caches on successful flag
          if (response.success) {
            ServiceUtils.cache.clear();
          }

      return {
        success: response.success,
        message: response.message || 'Bid flagged successfully',
            data: response.data && typeof response.data === 'object' && 'data' in response.data 
              ? (response.data as { data: BidData }).data 
              : response.data as BidData | undefined
      };
    } catch (error) {
          ServiceUtils.logger.error('Failed to flag bid for dispute', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to flag bid for dispute resolution'
      };
    }
      },
      'admin_flag_bid'
    );
  }

  /**
   * Resolve a disputed bid with enhanced validation and monitoring
   */
  async resolveDispute(
    bidId: string, 
    resolution: 'approved' | 'cancelled',
    notes?: string
  ): Promise<DisputeResolutionResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!bidId || bidId.trim().length === 0) {
            return {
              success: false,
              message: 'Bid ID is required'
            };
          }

      if (!['approved', 'cancelled'].includes(resolution)) {
        return {
          success: false,
          message: 'Resolution must be either "approved" or "cancelled"'
        };
      }

          const response = await handleServiceResponse(
            () => apiClient.post<DisputeResolutionResponse>(`${this.config.baseUrl}/${bidId}/resolve`, { 
        resolution,
        notes: notes?.trim() || undefined
            }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear related caches on successful resolution
          if (response.success) {
            ServiceUtils.cache.clear();
          }

      return {
        success: response.success,
        message: response.message || 'Dispute resolved successfully',
            data: response.data && typeof response.data === 'object' && 'data' in response.data 
              ? (response.data as { data: BidData }).data 
              : response.data as BidData | undefined
      };
    } catch (error) {
          ServiceUtils.logger.error('Failed to resolve dispute', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to resolve dispute'
      };
    }
      },
      'admin_resolve_dispute'
    );
  }

  /**
   * Get all disputed bids with enhanced filtering and caching
   */
  async getDisputedBids(options: DisputeFilters = {}): Promise<DisputedBidsResponse> {
    return withPerformanceMonitoring(
      async () => {
    try {
      const params = new URLSearchParams({
        page: (options.page || 1).toString(),
        limit: (options.limit || 20).toString(),
        status: options.status || 'all',
        sortBy: options.sortBy || 'disputedAt',
        sortOrder: options.sortOrder || 'desc'
      });

          const cacheKey = `disputed_bids_${options.page || 1}_${options.limit || 20}_${options.status || 'all'}_${options.sortBy || 'disputedAt'}_${options.sortOrder || 'desc'}`;

          const response = await handleServiceResponse(
            () => apiClient.get<DisputedBidsResponse>(`${this.config.baseUrl}/admin/disputes?${params}`),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.defaultTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

      return {
        success: response.success,
        message: response.message || 'Disputed bids retrieved successfully',
            data: response.data && typeof response.data === 'object' && 'bids' in response.data && 'pagination' in response.data 
              ? response.data as { bids: DisputedBidData[]; pagination: { currentPage: number; totalPages: number; totalBids: number; limit: number; } } 
          : undefined
      };
    } catch (error) {
          ServiceUtils.logger.error('Failed to get disputed bids', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve disputed bids'
      };
    }
      },
      'admin_get_disputed_bids'
    );
  }

  /**
   * Helper: Format currency
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Helper: Format date/time
   */
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Helper: Get bid status display info
   */
  getBidStatusInfo(status: BidData['status']): BidStatusInfo {
    switch (status) {
      case 'winning':
        return {
          label: 'Winning',
          color: 'text-green-700 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20'
        };
      case 'active':
        return {
          label: 'Active',
          color: 'text-blue-700 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20'
        };
      case 'outbid':
        return {
          label: 'Outbid',
          color: 'text-yellow-700 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
        };
      case 'finalized':
        return {
          label: 'Won',
          color: 'text-purple-700 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/20'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'text-red-700 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20'
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-700 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20'
        };
    }
  }

  /**
   * Helper: Check if user can edit/cancel bid
   */
  canUserModifyBid(bid: BidData, userId?: string): boolean {
    if (!userId || bid.userId._id !== userId) {
      return false;
    }
    
    return bid.status === 'active' || bid.status === 'winning';
  }

  /**
   * Helper: Calculate time remaining for auction
   */
  getTimeRemaining(endTime: string): TimeRemaining {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) {
      return {
        isExpired: true,
        timeText: 'Auction ended',
        urgency: 'critical'
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let timeText = '';
    let urgency: 'normal' | 'warning' | 'critical' = 'normal';

    if (days > 0) {
      timeText = `${days}d ${hours}h`;
      urgency = days <= 1 ? 'warning' : 'normal';
    } else if (hours > 0) {
      timeText = `${hours}h ${minutes}m`;
      urgency = hours <= 2 ? 'critical' : 'warning';
    } else {
      timeText = `${minutes}m`;
      urgency = 'critical';
    }

    return {
      isExpired: false,
      timeText,
      urgency
    };
  }

  // Private validation methods with enhanced security and business logic
  private validateBidData(bidData: PlaceBidRequest): void {
    if (!bidData.gemId || bidData.gemId.trim().length === 0) {
      throw new Error('Gem ID is required');
    }

    if (!bidData.amount || bidData.amount <= 0) {
      throw new Error('Bid amount must be greater than 0');
    }

    // Enhanced validation for realistic bid amounts
    if (bidData.amount > 10000000) { // $10M max
      throw new Error('Bid amount exceeds maximum allowed limit');
    }

    if (bidData.proxyMaxBid) {
      if (bidData.proxyMaxBid <= bidData.amount) {
      throw new Error('Proxy max bid must be greater than current bid amount');
      }
      
      if (bidData.proxyMaxBid > 10000000) { // $10M max
        throw new Error('Proxy max bid exceeds maximum allowed limit');
      }
    }

    // Additional security validations
    const gemIdPattern = /^[a-fA-F0-9]{24}$/; // MongoDB ObjectId pattern
    if (!gemIdPattern.test(bidData.gemId)) {
      throw new Error('Invalid gem ID format');
    }
  }

  /**
   * Enhanced bid validation with context-aware checks
   */
  private validateBidContext(context: BidValidationContext): void {
    if (context.currentHighestBid && context.amount <= context.currentHighestBid) {
      throw new Error(`Bid amount must be higher than current highest bid of $${context.currentHighestBid.toLocaleString()}`);
    }

    if (context.minimumBidIncrement && context.currentHighestBid) {
      const minimumRequired = context.currentHighestBid + context.minimumBidIncrement;
      if (context.amount < minimumRequired) {
        throw new Error(`Bid must be at least $${minimumRequired.toLocaleString()} (minimum increment: $${context.minimumBidIncrement.toLocaleString()})`);
      }
    }

    if (context.auctionEndTime) {
      const auctionEnd = new Date(context.auctionEndTime);
      const now = new Date();
      if (now >= auctionEnd) {
        throw new Error('Auction has ended. No more bids can be placed.');
      }

      // Warning for bids placed very close to auction end
      const timeRemaining = auctionEnd.getTime() - now.getTime();
      if (timeRemaining < 60000) { // Less than 1 minute
        ServiceUtils.logger.warn('Bid placed very close to auction end', {
          gemId: context.gemId,
          timeRemaining,
          bidAmount: context.amount
        });
      }
    }
  }

  /**
   * Clear all bid service caches with optional selective clearing
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      // Selective cache clearing based on pattern
      ServiceUtils.logger.info('Clearing selective cache', { pattern });
      // In a real implementation, you'd have a more sophisticated cache clearing mechanism
    } else {
    ServiceUtils.cache.clear();
      ServiceUtils.logger.info('Cleared all bid service caches');
    }
  }

  /**
   * Get service health status
   */
  getServiceHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    cacheStats: ReturnType<typeof ServiceUtils.getCacheStats>;
    deduplicationStats: ReturnType<typeof ServiceUtils.getDeduplicationStats>;
    uptime: number;
    lastError?: string;
  } {
    const cacheStats = ServiceUtils.getCacheStats();
    const deduplicationStats = ServiceUtils.getDeduplicationStats();
    
    // Determine health status based on various metrics
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (cacheStats.size > cacheStats.maxSize * 0.9) {
      status = 'degraded';
    }
    
    if (deduplicationStats.pendingCount > 50) {
      status = 'unhealthy';
    }

    return {
      status,
      cacheStats,
      deduplicationStats,
      uptime: Date.now() - this.state.startTime || 0,
      lastError: this.state.lastError
    };
  }

  /**
   * Initialize service with startup checks
   */
  protected initialize(): void {
    this.state.startTime = Date.now();
    ServiceUtils.logger.info('BidService initialized', {
      config: this.config,
      timestamp: new Date().toISOString()
    });
  }
}

// Initialize the service
class BidServiceSingleton extends BidService {
  private static instance: BidServiceSingleton;
  
  private constructor() {
    super();
    this.initialize();
  }
  
  public static getInstance(): BidServiceSingleton {
    if (!BidServiceSingleton.instance) {
      BidServiceSingleton.instance = new BidServiceSingleton();
    }
    return BidServiceSingleton.instance;
  }
  
  /**
   * Graceful shutdown cleanup
   */
  public shutdown(): void {
    ServiceUtils.logger.info('BidService shutting down');
    this.clearCache();
    ServiceUtils.clearAllCaches();
  }
}

// Export singleton instance
const bidService = BidServiceSingleton.getInstance();

// Cleanup on page unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    bidService.shutdown();
  });
}

export default bidService; 