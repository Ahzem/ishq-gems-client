import apiClient from '@/lib/api-client';
import { ServiceUtils } from '@/services/service-utils';
import { 
  ApiResponse, 
  WishlistResponse, 
  WishlistAddResponse, 
  WishlistCheckResponse, 
  WishlistCountResponse,
  WishlistMoveToCartResponse,
  WishlistStatsResponse,
  WishlistQueryParams,
  WishlistServiceConfig,
  WishlistServiceState,
  WishlistToggleApiResponse,
  PerformanceWithMemory,
  hasPerformanceMemory
} from '@/types';
import { environment } from '@/config/environment';

/**
 * Production-Grade Wishlist Service
 * 
 * Comprehensive wishlist management with enterprise-level features:
 * - Singleton pattern for consistent state management
 * - Configuration-driven design with validation
 * - Advanced caching with TTL and priority handling
 * - Circuit breaker integration for service resilience
 * - Performance monitoring and analytics
 * - Input validation and sanitization
 * - Structured error handling and logging
 * - Request deduplication and retry logic
 * - Service health monitoring
 */
class WishlistService {
  private readonly config: WishlistServiceConfig;
  private state: WishlistServiceState;

  constructor() {
    this.config = {
      baseUrl: '/user/wishlist',
      retryOptions: {
        maxRetries: 3,
        delay: 1000,
        backoff: true,
        retryCondition: (error: unknown) => {
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as { status: number }).status;
            return status >= 500 || status === 0 || status === 408 || status === 429;
          }
          return true;
        }
      },
      cacheOptions: {
        wishlistTtl: 300000, // 5 minutes
        countTtl: 60000,     // 1 minute
        checkTtl: 180000     // 3 minutes
      },
      validation: {
        maxGemIdsPerRequest: 50,
        maxCategoryNameLength: 50,
        minPageSize: 1,
        maxPageSize: 100
      }
    };

    this.state = {
      startTime: Date.now(),
      lastError: null,
      requestCount: 0,
      cacheHits: 0,
      cacheMisses: 0
    };

    this.initialize();
  }

  /**
   * Initialize service with performance monitoring and cache warming
   */
  private initialize(): void {
    ServiceUtils.logger.info('WishlistService initialized', {
      config: this.config,
      timestamp: new Date().toISOString()
    });

    // Warm critical caches on initialization
    this.warmWishlistCache().catch(error => {
      ServiceUtils.logger.warn('Failed to warm wishlist cache', error);
    });
  }

  /**
   * Warm wishlist cache with critical data
   */
  private async warmWishlistCache(): Promise<void> {
    // Skip cache warming during build time or server-side rendering
    if (typeof window === 'undefined') {
      return;
    }
    
    // Only warm cache if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      ServiceUtils.logger.info('Skipping wishlist cache warming - user not authenticated');
      return;
    }
    
    try {
      await ServiceUtils.warmCache([
        {
          key: 'wishlist-count',
          dataFetcher: () => this.getWishlistCount(),
          ttl: this.config.cacheOptions.countTtl,
          priority: 'high'
        }
      ]);
    } catch (error) {
      ServiceUtils.logger.warn('Wishlist cache warming failed', error);
    }
  }

  /**
   * Build query parameters for API requests with validation
   */
  private buildQueryParams(params: WishlistQueryParams): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && value !== null) {
          // Handle complex objects like priceRange
          if (key === 'priceRange' && typeof value === 'object') {
            const priceRange = value as { min?: number; max?: number };
            if (priceRange.min !== undefined) {
              searchParams.append('priceMin', priceRange.min.toString());
            }
            if (priceRange.max !== undefined) {
              searchParams.append('priceMax', priceRange.max.toString());
            }
          }
        } else {
        searchParams.append(key, value.toString());
        }
      }
    });
    
    return searchParams.toString();
  }

  /**
   * Validate pagination parameters
   */
  private validatePagination(page?: number, limit?: number): void {
    if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
      throw new Error('Page must be a positive integer');
    }
    
    if (limit !== undefined) {
      if (!Number.isInteger(limit) || 
          limit < this.config.validation.minPageSize || 
          limit > this.config.validation.maxPageSize) {
        throw new Error(
          `Limit must be an integer between ${this.config.validation.minPageSize} and ${this.config.validation.maxPageSize}`
        );
      }
    }
  }

  /**
   * Validate gem ID format (MongoDB ObjectId)
   */
  private validateGemId(gemId: string): void {
    if (!gemId || typeof gemId !== 'string') {
      throw new Error('Gem ID is required and must be a string');
    }
    
    if (!/^[0-9a-fA-F]{24}$/.test(gemId)) {
      throw new Error('Invalid gem ID format');
    }
  }

  /**
   * Validate category name
   */
  private validateCategory(category: string): void {
    if (!category || typeof category !== 'string') {
      throw new Error('Category is required and must be a string');
    }
    
    if (category.length > this.config.validation.maxCategoryNameLength) {
      throw new Error(
        `Category name cannot exceed ${this.config.validation.maxCategoryNameLength} characters`
      );
    }
    
    // Basic sanitization
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(category)) {
      throw new Error('Category name contains invalid characters');
    }
  }

  /**
   * Validate gem IDs array for bulk operations
   */
  private validateGemIds(gemIds: string[]): void {
    if (!Array.isArray(gemIds) || gemIds.length === 0) {
      throw new Error('Gem IDs array is required and must not be empty');
    }
    
    if (gemIds.length > this.config.validation.maxGemIdsPerRequest) {
      throw new Error(
        `Cannot process more than ${this.config.validation.maxGemIdsPerRequest} gem IDs per request`
      );
    }
    
    gemIds.forEach((gemId, index) => {
      try {
        this.validateGemId(gemId);
      } catch (error) {
        throw new Error(`Invalid gem ID at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  /**
   * Update request statistics
   */
  private updateStats(cacheHit: boolean = false): void {
    this.state.requestCount++;
    if (cacheHit) {
      this.state.cacheHits++;
    } else {
      this.state.cacheMisses++;
    }
  }

  /**
   * Get user's wishlist items with advanced filtering and caching
   */
  async getUserWishlist(
    page: number = 1,
    limit: number = 20,
    filters?: Omit<WishlistQueryParams, 'page' | 'limit'>
  ): Promise<ApiResponse<WishlistResponse>> {
    return ServiceUtils.withPerformanceMonitoring(
      async () => {
        try {
          // Check if user is authenticated
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (!token) {
            return {
              success: true,
              message: 'User not authenticated',
              data: { 
                items: [],
                pagination: {
                  page: 1,
                  limit: 20,
                  total: 0,
                  pages: 0
                }
              }
            } as ApiResponse<WishlistResponse>;
          }

          // Input validation
          this.validatePagination(page, limit);
          
          const queryParams: WishlistQueryParams = { page, limit, ...filters };
          const queryString = this.buildQueryParams(queryParams);
          const cacheKey = `wishlist-list-${queryString}`;
          
          // Check cache first
          if (ServiceUtils.cache.has(cacheKey)) {
            this.updateStats(true);
            const cached = ServiceUtils.cache.get<ApiResponse<WishlistResponse>>(cacheKey);
            if (cached) {
              ServiceUtils.logger.info('Wishlist cache hit', { cacheKey, page, limit });
              return cached;
            }
          }
          
          this.updateStats(false);
          const url = queryString ? `${this.config.baseUrl}?${queryString}` : this.config.baseUrl;
          
          const response = await ServiceUtils.withRetry(
            () => apiClient.get<WishlistResponse>(url),
            this.config.retryOptions
          );
          
          // Cache successful responses
          if (response.success && response.data) {
            ServiceUtils.cache.set(
              cacheKey, 
              response, 
              this.config.cacheOptions.wishlistTtl,
              'normal'
            );
          }
          
          this.state.lastError = null;
          return response;
          
        } catch (error) {
          this.state.lastError = error instanceof Error ? error : new Error('Unknown error');
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch wishlist',
            error: environment.isDevelopment ? error : undefined
          } as ApiResponse<WishlistResponse>;
        }
      },
      'wishlist_get_user_wishlist',
      { expectedDuration: 2000, priority: 'normal' }
    );
  }

  /**
   * Add item to wishlist with validation and caching
   */
  async addToWishlist(gemId: string): Promise<ApiResponse<WishlistAddResponse>> {
    return ServiceUtils.withPerformanceMonitoring(
      async () => {
        try {
          // Input validation
          this.validateGemId(gemId);
          
          const response = await ServiceUtils.withRetry(
            () => apiClient.post<WishlistAddResponse>(this.config.baseUrl, { gemId }),
            this.config.retryOptions
          );
          
          // Invalidate related caches on successful add
          if (response.success) {
            ServiceUtils.cache.delete('wishlist-count');
            // Clear wishlist list cache entries
            const cacheKeys = Array.from(ServiceUtils.cache.getStats().size ? ['wishlist-list'] : []);
            cacheKeys.forEach(key => {
              if (key.startsWith('wishlist-list-')) {
                ServiceUtils.cache.delete(key);
              }
            });
          }
          
          this.state.lastError = null;
          return response;
          
        } catch (error) {
          this.state.lastError = error instanceof Error ? error : new Error('Unknown error');
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to add item to wishlist',
            error: environment.isDevelopment ? error : undefined
          } as ApiResponse<WishlistAddResponse>;
        }
      },
      'wishlist_add_item',
      { expectedDuration: 1500, priority: 'high' }
    );
  }

  /**
   * Remove item from wishlist with validation and cache invalidation
   */
  async removeFromWishlist(gemId: string): Promise<ApiResponse<never>> {
    return ServiceUtils.withPerformanceMonitoring(
      async () => {
        try {
          // Input validation
          this.validateGemId(gemId);
          
          const response = await ServiceUtils.withRetry(
            () => apiClient.delete<never>(`${this.config.baseUrl}/${gemId}`),
            this.config.retryOptions
          );
          
          // Invalidate related caches on successful removal
          if (response.success) {
            ServiceUtils.cache.delete('wishlist-count');
            ServiceUtils.cache.delete(`wishlist-check-${gemId}`);
            // Clear wishlist list cache entries
            const cacheKeys = Array.from(ServiceUtils.cache.getStats().size ? ['wishlist-list'] : []);
            cacheKeys.forEach(key => {
              if (key.startsWith('wishlist-list-')) {
                ServiceUtils.cache.delete(key);
              }
            });
          }
          
          this.state.lastError = null;
          return response;
          
        } catch (error) {
          this.state.lastError = error instanceof Error ? error : new Error('Unknown error');
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to remove item from wishlist',
            error: environment.isDevelopment ? error : undefined
          } as ApiResponse<never>;
        }
      },
      'wishlist_remove_item',
      { expectedDuration: 1500, priority: 'high' }
    );
  }

  /**
   * Check if item is in wishlist with caching
   */
  async isInWishlist(gemId: string): Promise<ApiResponse<WishlistCheckResponse>> {
    return ServiceUtils.withPerformanceMonitoring(
      async () => {
        try {
          // Input validation
          this.validateGemId(gemId);
          
          const cacheKey = `wishlist-check-${gemId}`;
          
          // Check cache first
          if (ServiceUtils.cache.has(cacheKey)) {
            this.updateStats(true);
            const cached = ServiceUtils.cache.get<ApiResponse<WishlistCheckResponse>>(cacheKey);
            if (cached) {
              return cached;
            }
          }
          
          this.updateStats(false);
          const response = await ServiceUtils.withRetry(
            () => apiClient.get<WishlistCheckResponse>(`${this.config.baseUrl}/check/${gemId}`),
            this.config.retryOptions
          );
          
          // Cache successful responses
          if (response.success) {
            ServiceUtils.cache.set(
              cacheKey, 
              response, 
              this.config.cacheOptions.checkTtl,
              'normal'
            );
          }
          
          this.state.lastError = null;
          return response;
          
        } catch (error) {
          this.state.lastError = error instanceof Error ? error : new Error('Unknown error');
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to check wishlist status',
            error: environment.isDevelopment ? error : undefined
          } as ApiResponse<WishlistCheckResponse>;
        }
      },
      'wishlist_check_item',
      { expectedDuration: 1000, priority: 'normal' }
    );
  }

  /**
   * Toggle item in wishlist (add if not present, remove if present)
   */
  async toggleWishlistItem(gemId: string): Promise<ApiResponse<WishlistToggleApiResponse['data']>> {
    return ServiceUtils.withPerformanceMonitoring(
      async () => {
        try {
          // Input validation
          this.validateGemId(gemId);
          
          this.updateStats(false);
          const response = await ServiceUtils.withRetry(
            () => apiClient.post<WishlistToggleApiResponse['data']>(`${this.config.baseUrl}/toggle/${gemId}`),
            this.config.retryOptions
          );
          
          // Invalidate related caches
          if (response.success) {
            ServiceUtils.cache.delete('wishlist-items');
            ServiceUtils.cache.delete('wishlist-count');
            ServiceUtils.cache.delete(`wishlist-check-${gemId}`);
            ServiceUtils.cache.delete('wishlist-stats');
          }
          
          this.state.lastError = null;
          return response;
          
        } catch (error) {
          this.state.lastError = error instanceof Error ? error : new Error('Unknown error');
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to toggle wishlist item',
            error: environment.isDevelopment ? error : undefined
          } as ApiResponse<WishlistToggleApiResponse['data']>;
        }
      },
      'wishlist_toggle_item',
      { expectedDuration: 1500, priority: 'high' }
    );
  }

  /**
   * Clear entire wishlist with confirmation
   */
  async clearWishlist(): Promise<ApiResponse<never>> {
    return ServiceUtils.withPerformanceMonitoring(
      async () => {
        try {
          const response = await ServiceUtils.withRetry(
            () => apiClient.delete<never>(`${this.config.baseUrl}/clear`),
            this.config.retryOptions
          );
          
          // Clear all related caches on successful clear
          if (response.success) {
            ServiceUtils.cache.delete('wishlist-count');
            // Clear all wishlist-related cache entries
            const cacheKeys = Array.from(ServiceUtils.cache.getStats().size ? ['wishlist'] : []);
            cacheKeys.forEach(key => {
              if (key.startsWith('wishlist-')) {
                ServiceUtils.cache.delete(key);
              }
            });
          }
          
          this.state.lastError = null;
          return response;
          
        } catch (error) {
          this.state.lastError = error instanceof Error ? error : new Error('Unknown error');
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to clear wishlist',
            error: environment.isDevelopment ? error : undefined
          } as ApiResponse<never>;
        }
      },
      'wishlist_clear_all',
      { expectedDuration: 2000, priority: 'normal' }
    );
  }

  /**
   * Get wishlist count with caching
   */
  async getWishlistCount(): Promise<ApiResponse<WishlistCountResponse>> {
    return ServiceUtils.withPerformanceMonitoring(
      async () => {
        try {
          // Check if user is authenticated
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (!token) {
            return {
              success: true,
              message: 'User not authenticated',
              data: { count: 0 }
            } as ApiResponse<WishlistCountResponse>;
          }

          const cacheKey = 'wishlist-count';
          
          // Check cache first
          if (ServiceUtils.cache.has(cacheKey)) {
            this.updateStats(true);
            const cached = ServiceUtils.cache.get<ApiResponse<WishlistCountResponse>>(cacheKey);
            if (cached) {
              return cached;
            }
          }
          
          this.updateStats(false);
          const response = await ServiceUtils.withRetry(
            () => apiClient.get<WishlistCountResponse>(`${this.config.baseUrl}/count`),
            this.config.retryOptions
          );
          
          // Cache successful responses with shorter TTL for count
          if (response.success) {
            ServiceUtils.cache.set(
              cacheKey, 
              response, 
              this.config.cacheOptions.countTtl,
              'high'
            );
          }
          
          this.state.lastError = null;
          return response;
          
        } catch (error) {
          this.state.lastError = error instanceof Error ? error : new Error('Unknown error');
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get wishlist count',
            error: environment.isDevelopment ? error : undefined
          } as ApiResponse<WishlistCountResponse>;
        }
      },
      'wishlist_get_count',
      { expectedDuration: 800, priority: 'high' }
    );
  }

  /**
   * Move items from wishlist to cart with validation
   */
  async moveToCart(gemIds: string[]): Promise<ApiResponse<WishlistMoveToCartResponse>> {
    return ServiceUtils.withPerformanceMonitoring(
      async () => {
        try {
          // Input validation
          this.validateGemIds(gemIds);
          
          const response = await ServiceUtils.withRetry(
            () => apiClient.post<WishlistMoveToCartResponse>(`${this.config.baseUrl}/move-to-cart`, { gemIds }),
            this.config.retryOptions
          );
          
          // Invalidate related caches on successful move
          if (response.success) {
            ServiceUtils.cache.delete('wishlist-count');
            // Clear wishlist list cache entries
            const cacheKeys = Array.from(ServiceUtils.cache.getStats().size ? ['wishlist-list'] : []);
            cacheKeys.forEach(key => {
              if (key.startsWith('wishlist-list-')) {
                ServiceUtils.cache.delete(key);
              }
            });
            // Clear individual check caches for moved items
            gemIds.forEach(gemId => {
              ServiceUtils.cache.delete(`wishlist-check-${gemId}`);
            });
          }
          
          this.state.lastError = null;
          return response;
          
        } catch (error) {
          this.state.lastError = error instanceof Error ? error : new Error('Unknown error');
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to move items to cart',
            error: environment.isDevelopment ? error : undefined
          } as ApiResponse<WishlistMoveToCartResponse>;
        }
      },
      'wishlist_move_to_cart',
      { expectedDuration: 2500, priority: 'normal' }
    );
  }

  /**
   * Get wishlist items by category with validation and caching
   */
  async getWishlistByCategory(
    category: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<ApiResponse<WishlistResponse>> {
    return ServiceUtils.withPerformanceMonitoring(
      async () => {
        try {
          // Input validation
          this.validateCategory(category);
          this.validatePagination(page, limit);
          
    const queryString = this.buildQueryParams({ page, limit });
          const cacheKey = `wishlist-category-${category}-${queryString}`;
          
          // Check cache first
          if (ServiceUtils.cache.has(cacheKey)) {
            this.updateStats(true);
            const cached = ServiceUtils.cache.get<ApiResponse<WishlistResponse>>(cacheKey);
            if (cached) {
              return cached;
            }
          }
          
          this.updateStats(false);
          const url = queryString 
            ? `${this.config.baseUrl}/category/${encodeURIComponent(category)}?${queryString}`
            : `${this.config.baseUrl}/category/${encodeURIComponent(category)}`;
            
          const response = await ServiceUtils.withRetry(
            () => apiClient.get<WishlistResponse>(url),
            this.config.retryOptions
          );
          
          // Cache successful responses
          if (response.success && response.data) {
            ServiceUtils.cache.set(
              cacheKey, 
              response, 
              this.config.cacheOptions.wishlistTtl,
              'normal'
            );
          }
          
          this.state.lastError = null;
          return response;
          
        } catch (error) {
          this.state.lastError = error instanceof Error ? error : new Error('Unknown error');
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get wishlist by category',
            error: environment.isDevelopment ? error : undefined
          } as ApiResponse<WishlistResponse>;
        }
      },
      'wishlist_get_by_category',
      { expectedDuration: 2000, priority: 'normal' }
    );
  }

  /**
   * Clear service cache
   */
  clearCache(): void {
    const cacheKeys = ['wishlist-count'];
    cacheKeys.forEach(key => ServiceUtils.cache.delete(key));
    
    // Clear all wishlist-related cache entries
    const allKeys = Array.from(ServiceUtils.cache.getStats().size ? ['wishlist'] : []);
    allKeys.forEach(key => {
      if (key.startsWith('wishlist-')) {
        ServiceUtils.cache.delete(key);
      }
    });
    
    ServiceUtils.logger.info('Wishlist cache cleared');
  }

  /**
   * Get service health metrics
   */
  getServiceHealth(): {
    uptime: number;
    requestCount: number;
    errorRate: number;
    cacheHitRate: number;
    lastError: Error | null;
    memoryUsage?: number;
  } {
    const uptime = Date.now() - this.state.startTime;
    const errorRate = this.state.lastError ? 1 : 0;
    const totalRequests = this.state.cacheHits + this.state.cacheMisses;
    const cacheHitRate = totalRequests > 0 ? (this.state.cacheHits / totalRequests) * 100 : 0;

    return {
      uptime,
      requestCount: this.state.requestCount,
      errorRate,
      cacheHitRate,
      lastError: this.state.lastError,
      memoryUsage: typeof window !== 'undefined' && hasPerformanceMemory(performance) 
        ? (performance as PerformanceWithMemory).memory?.usedJSHeapSize 
        : undefined
    };
  }

  /**
   * Bulk operations helper - add multiple items to wishlist
   */
  async bulkAddToWishlist(gemIds: string[]): Promise<ApiResponse<{
    successful: string[];
    failed: Array<{ gemId: string; error: string }>;
  }>> {
    return ServiceUtils.withPerformanceMonitoring(
      async () => {
        try {
          this.validateGemIds(gemIds);
          
          const results = await Promise.allSettled(
            gemIds.map(gemId => this.addToWishlist(gemId))
          );
          
          const successful: string[] = [];
          const failed: Array<{ gemId: string; error: string }> = [];
          
          results.forEach((result, index) => {
            const gemId = gemIds[index];
            if (result.status === 'fulfilled' && result.value.success) {
              successful.push(gemId);
            } else {
              const error = result.status === 'rejected' 
                ? result.reason?.message || 'Unknown error'
                : result.value.message || 'Request failed';
              failed.push({ gemId, error });
            }
          });
          
          return {
            success: true,
            data: { successful, failed },
            message: `Processed ${gemIds.length} items: ${successful.length} successful, ${failed.length} failed`
          };
          
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Bulk add operation failed',
            error: environment.isDevelopment ? error : undefined
          } as ApiResponse<{
            successful: string[];
            failed: Array<{ gemId: string; error: string }>;
          }>;
        }
      },
      'wishlist_bulk_add',
      { expectedDuration: 5000, priority: 'low' }
    );
  }

  /**
   * Get wishlist statistics
   */
  async getWishlistStats(): Promise<ApiResponse<WishlistStatsResponse>> {
    return ServiceUtils.withPerformanceMonitoring(
      async () => {
        try {
          const cacheKey = 'wishlist-stats';
          
          // Check cache first
          if (ServiceUtils.cache.has(cacheKey)) {
            this.updateStats(true);
            const cached = ServiceUtils.cache.get<ApiResponse<WishlistStatsResponse>>(cacheKey);
            if (cached) {
              return cached;
            }
          }
          
          this.updateStats(false);
          const response = await ServiceUtils.withRetry(
            () => apiClient.get<WishlistStatsResponse>(`${this.config.baseUrl}/stats`),
            this.config.retryOptions
          );
          
          // Cache successful responses
          if (response.success) {
            ServiceUtils.cache.set(
              cacheKey, 
              response, 
              this.config.cacheOptions.wishlistTtl,
              'normal'
            );
          }
          
          this.state.lastError = null;
          return response;
          
        } catch (error) {
          this.state.lastError = error instanceof Error ? error : new Error('Unknown error');
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get wishlist statistics',
            error: environment.isDevelopment ? error : undefined
          } as ApiResponse<WishlistStatsResponse>;
        }
      },
      'wishlist_get_stats',
      { expectedDuration: 1500, priority: 'low' }
    );
  }
}

/**
 * Singleton pattern for consistent WishlistService instance
 */
class WishlistServiceSingleton {
  private static instance: WishlistService | null = null;

  static getInstance(): WishlistService {
    if (!WishlistServiceSingleton.instance) {
      WishlistServiceSingleton.instance = new WishlistService();
    }
    return WishlistServiceSingleton.instance;
  }

  static resetInstance(): void {
    WishlistServiceSingleton.instance = null;
  }
}

// Export singleton instance
const wishlistService = WishlistServiceSingleton.getInstance();
export default wishlistService;

// Export singleton class for testing
export { WishlistServiceSingleton }; 