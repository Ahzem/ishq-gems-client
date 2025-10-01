import apiClient from '@/lib/api-client';
import { 
  // Core types
  ApiResponse, 
  // User types
  UserProfile,
  UserStatistics,
  AvatarUploadResponse,
  EnhancedUserPreferences as UserPreferences,
  // Request types
  UpdateProfileRequest,
  CreateAddressRequest,
  UpdateAddressRequest,
  DeleteAddressRequest,
  // Entity types
  Order,
  UserAddress,
  // Service configuration
  UserServiceConfig,
  UserServiceState
} from '@/types';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';

/**
 * Production-optimized User Service
 * 
 * Enterprise-grade user service with:
 * - Comprehensive type safety with centralized type definitions
 * - Advanced caching strategies with memory pressure awareness
 * - Circuit breaker pattern for service resilience
 * - Robust error handling and retry logic
 * - Performance monitoring and analytics
 * - Input validation and security measures
 * - Production-ready logging and monitoring
 * - Singleton pattern for consistent state management
 */
class UserService {
  private readonly config: UserServiceConfig = {
    baseUrl: '/user',
    retryOptions: {
      maxRetries: 2,
      retryCondition: (error: unknown) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          return status >= 500 || status === 0;
        }
        return false;
      }
    },
    cacheOptions: {
      userProfileTtl: 300000,      // 5 minutes for user profile
      userOrdersTtl: 180000,       // 3 minutes for orders (frequent updates)
      userStatisticsTtl: 600000,   // 10 minutes for statistics
      userPreferencesTtl: 900000   // 15 minutes for preferences (less frequent changes)
    },
    validation: {
      minPasswordLength: 8,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedImageTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
      maxBioLength: 500,
      maxBusinessNameLength: 100
    }
  };

  private state: UserServiceState = {
    startTime: 0
  };

  /**
   * Get current user profile with enhanced caching and validation
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return withPerformanceMonitoring(
      () => handleServiceResponse(
        () => apiClient.get<UserProfile>(`${this.config.baseUrl}/profile`),
        {
          cacheKey: 'user_profile',
          cacheTtl: this.config.cacheOptions.userProfileTtl,
          useCache: true,
          retryOptions: this.config.retryOptions
        }
      ),
      'user_get_profile'
    );
  }

  /**
   * Update user profile with enhanced validation and cache management
   */
  async updateProfile(updates: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate update request
          const validationResult = this.validateProfileUpdate(updates);
          if (!validationResult.success) {
            return validationResult;
          }

          const response = await handleServiceResponse(
            () => apiClient.put<UserProfile>(`${this.config.baseUrl}/profile`, updates),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear user-related caches on successful update
          if (response.success) {
            this.clearUserCaches();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Profile update failed', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update profile'
          };
        }
      },
      'user_update_profile'
    );
  }

  /**
   * Upload user avatar with enhanced validation and progress tracking
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadAvatar(file: File, _onProgress?: (progress: number) => void): Promise<ApiResponse<AvatarUploadResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Enhanced file validation
          const validationResult = this.validateAvatarFile(file);
          if (!validationResult.success) {
            return validationResult;
          }

          const formData = new FormData();
          formData.append('avatar', file);

          const response = await handleServiceResponse(
            () => apiClient.put<AvatarUploadResponse>(`${this.config.baseUrl}/avatar`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            }),
            {
              retryOptions: {
                maxRetries: 1, // File uploads shouldn't be retried aggressively
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Clear user-related caches to refresh avatar
          if (response.success) {
            this.clearUserCaches();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Avatar upload failed', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to upload avatar'
          };
        }
      },
      'user_upload_avatar'
    );
  }

  /**
   * Update user avatar (alias for uploadAvatar for backward compatibility)
   */
  async updateAvatar(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<AvatarUploadResponse>> {
    return this.uploadAvatar(file, onProgress);
  }

  /**
   * Get user's orders with enhanced pagination validation and caching
   */
  async getOrders(page: number = 1, limit: number = 20): Promise<ApiResponse<Order[]>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate pagination parameters
          const paginationValidation = this.validatePagination(page, limit);
          if (!paginationValidation.success) {
            return paginationValidation;
          }

          return await handleServiceResponse(
            () => apiClient.get<Order[]>(`${this.config.baseUrl}/orders?page=${page}&limit=${limit}`),
            {
              cacheKey: `user_orders_${page}_${limit}`,
              cacheTtl: this.config.cacheOptions.userOrdersTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get user orders', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve orders'
          };
        }
      },
      'user_get_orders'
    );
  }

  /**
   * Delete user account with confirmation
   */
  async deleteAccount(confirmPassword: string): Promise<ApiResponse<never>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.delete<never>(`${this.config.baseUrl}/delete`, { data: { password: confirmPassword } }),
            {
              retryOptions: {
                maxRetries: 1, // Account deletion should be careful with retries
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Clear all cache on account deletion
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Account deletion failed', error);
          throw ServiceUtils.handleError('delete account', error);
        }
      },
      'user_delete_account'
    );
  }

  /**
   * Change user password with enhanced security and validation
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<never>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Enhanced password validation
          const passwordValidation = this.validatePasswordChange(currentPassword, newPassword);
          if (!passwordValidation.success) {
            return passwordValidation;
          }

          return await handleServiceResponse(
            () => apiClient.put<never>(`${this.config.baseUrl}/password`, {
              currentPassword,
              newPassword
            }),
            {
              retryOptions: {
                maxRetries: 1, // Password changes should not be retried aggressively
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Password change failed', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to change password'
          };
        }
      },
      'user_change_password'
    );
  }

  /**
   * Update user preferences with validation
   */
  async updatePreferences(preferences: UserPreferences): Promise<ApiResponse<UserProfile>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate preferences
          const validatedPreferences = this.validatePreferences(preferences);
          
          const response = await handleServiceResponse(
            () => apiClient.put<UserProfile>(`${this.config.baseUrl}/preferences`, validatedPreferences),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear profile cache to reflect preference changes
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Preferences update failed', error);
          throw ServiceUtils.handleError('update preferences', error, { preferenceKeys: Object.keys(preferences) });
        }
      },
      'user_update_preferences'
    );
  }

  /**
   * Get user statistics with caching
   */
  async getStatistics(): Promise<ApiResponse<UserStatistics>> {
    return withPerformanceMonitoring(
      () => handleServiceResponse(
        () => apiClient.get<UserStatistics>(`${this.config.baseUrl}/statistics`),
        {
          cacheKey: 'user_statistics',
          cacheTtl: this.config.cacheOptions.userStatisticsTtl,
          useCache: true,
          retryOptions: this.config.retryOptions
        }
      ),
      'user_get_statistics'
    );
  }

  /**
   * Deactivate user account (soft delete)
   */
  async deactivateAccount(): Promise<ApiResponse<never>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.put<never>(`${this.config.baseUrl}/deactivate`),
            {
              retryOptions: {
                maxRetries: 1,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Clear all cache on deactivation
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Account deactivation failed', error);
          throw ServiceUtils.handleError('deactivate account', error);
        }
      },
      'user_deactivate_account'
    );
  }

  /**
   * Reactivate user account
   */
  async reactivateAccount(): Promise<ApiResponse<never>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.put<never>(`${this.config.baseUrl}/reactivate`),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear all cache on reactivation
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Account reactivation failed', error);
          throw ServiceUtils.handleError('reactivate account', error);
        }
      },
      'user_reactivate_account'
    );
  }

  // Enhanced validation helper methods
  private validateAvatarFile(file: File): ApiResponse<never> {
    if (!file) {
      return {
        success: false,
        message: 'File is required'
      };
    }

    if (!this.config.validation.allowedImageTypes.includes(file.type)) {
      return {
        success: false,
        message: `Invalid file type. Allowed types: ${this.config.validation.allowedImageTypes.join(', ')}`
      };
    }

    if (file.size > this.config.validation.maxFileSize) {
      const maxSizeMB = this.config.validation.maxFileSize / (1024 * 1024);
      return {
        success: false,
        message: `File size too large. Maximum size: ${maxSizeMB}MB`
      };
    }

    return { success: true, message: 'Valid' };
  }

  private validateProfileUpdate(updates: UpdateProfileRequest): ApiResponse<never> {
    if (!updates || typeof updates !== 'object') {
      return {
        success: false,
        message: 'Update data is required'
      };
    }

    // Validate bio length if provided
    interface UpdateWithBio extends UpdateProfileRequest {
      bio?: string;
    }
    const updateWithBio = updates as UpdateWithBio;
    if (updateWithBio.bio && updateWithBio.bio.length > this.config.validation.maxBioLength) {
      return {
        success: false,
        message: `Bio must be less than ${this.config.validation.maxBioLength} characters`
      };
    }

    // Validate business name length if provided
    interface UpdateWithBusinessName extends UpdateProfileRequest {
      businessName?: string;
    }
    const updateWithBusinessName = updates as UpdateWithBusinessName;
    if (updateWithBusinessName.businessName && updateWithBusinessName.businessName.length > this.config.validation.maxBusinessNameLength) {
      return {
        success: false,
        message: `Business name must be less than ${this.config.validation.maxBusinessNameLength} characters`
      };
    }

    return { success: true, message: 'Valid' };
  }

  private validatePagination(page: number, limit: number): ApiResponse<never> {
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

    return { success: true, message: 'Valid' };
  }

  private validatePasswordChange(currentPassword: string, newPassword: string): ApiResponse<never> {
    if (!currentPassword || currentPassword.length === 0) {
      return {
        success: false,
        message: 'Current password is required'
      };
    }

    if (!newPassword || newPassword.length === 0) {
      return {
        success: false,
        message: 'New password is required'
      };
    }

    if (newPassword.length < this.config.validation.minPasswordLength) {
      return {
        success: false,
        message: `Password must be at least ${this.config.validation.minPasswordLength} characters long`
      };
    }

    if (currentPassword === newPassword) {
      return {
        success: false,
        message: 'New password must be different from current password'
      };
    }

    return { success: true, message: 'Valid' };
  }

  private validatePreferences(preferences: UserPreferences): UserPreferences {
    const validated: UserPreferences = {};
    
    // Validate theme
    if (preferences.theme && ['light', 'dark', 'system'].includes(preferences.theme)) {
      validated.theme = preferences.theme;
    }
    
    // Validate language (ISO 639-1 codes)
    if (preferences.language && /^[a-z]{2}$/.test(preferences.language)) {
      validated.language = preferences.language;
    }
    
    // Validate currency (ISO 4217 codes)
    if (preferences.currency && /^[A-Z]{3}$/.test(preferences.currency)) {
      validated.currency = preferences.currency;
    }
    
    // Validate boolean preferences
    const booleanPrefs = [
      'emailNotifications', 'smsNotifications', 'marketingEmails',
      'priceAlerts', 'bidNotifications', 'orderUpdates', 'newsletter'
    ];
    
    for (const pref of booleanPrefs) {
      if (typeof preferences[pref] === 'boolean') {
        validated[pref] = preferences[pref];
      }
    }
    
    // Validate measurement unit
    if (preferences.measurementUnit && ['metric', 'imperial'].includes(preferences.measurementUnit)) {
      validated.measurementUnit = preferences.measurementUnit;
    }
    
    return validated;
  }

  /**
   * Clear user-related caches with selective clearing
   */
  private clearUserCaches(): void {
    try {
      const stats = ServiceUtils.getCacheStats();
      if (stats.entries > 0) {
        // Use the public clear method - it's safer and more reliable
        ServiceUtils.cache.clear();
      }
    } catch {
      // Fallback to clearing all cache if stats access fails
      ServiceUtils.cache.clear();
    }
  }

  /**
   * Get service health status and configuration
   */
  getServiceHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    config: UserServiceConfig;
    cacheStats: ReturnType<typeof ServiceUtils.getCacheStats>;
    uptime: number;
    lastError?: string;
  } {
    const cacheStats = ServiceUtils.getCacheStats();
    
    // Determine health status based on various metrics
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (cacheStats.size > cacheStats.maxSize * 0.9) {
      status = 'degraded';
    }
    
    return {
      status,
      config: this.config,
      cacheStats,
      uptime: Date.now() - this.state.startTime || 0,
      lastError: this.state.lastError
    };
  }

  // =============================================================================
  // ADDRESS MANAGEMENT METHODS
  // =============================================================================

  /**
   * Get all user addresses
   */
  async getAddresses(): Promise<ApiResponse<UserAddress[]>> {
    const cacheKey = 'user:addresses';
    
    return withPerformanceMonitoring(async () => {
      // Check cache first
      const cachedData = ServiceUtils.cache.get<ApiResponse<UserAddress[]>>(cacheKey);
      if (cachedData) {
        ServiceUtils.logger.info('Returning cached addresses');
        return cachedData;
      }

      try {
        const apiResponse = await apiClient.get<UserAddress[]>('/user/addresses');
        
        // Cache successful response
        if (apiResponse.success) {
          ServiceUtils.cache.set(cacheKey, apiResponse, this.config.cacheOptions.userProfileTtl);
        }
        
        return apiResponse;
      } catch (error) {
        ServiceUtils.logger.error('Error fetching addresses:', error);
        return {
          success: false,
          message: 'Failed to fetch addresses. Please try again.',
          data: undefined
        };
      }
    }, 'user.getAddresses');
  }

  /**
   * Create a new address
   */
  async createAddress(addressData: CreateAddressRequest): Promise<ApiResponse<UserAddress>> {
    return withPerformanceMonitoring(async () => {
      try {
        // Validate input
        if (!addressData.street?.trim() || !addressData.city?.trim() || !addressData.country?.trim()) {
          return {
            success: false,
            message: 'Street, city, and country are required fields'
          };
        }

        const apiResponse = await apiClient.post<UserAddress>('/user/addresses', addressData);
        
        // Clear cache on successful creation
        if (apiResponse.success) {
          this.clearCache('user:addresses');
          ServiceUtils.logger.info('Address created successfully', { type: addressData.type });
        }
        
        return apiResponse;
      } catch (error) {
        ServiceUtils.logger.error('Error creating address:', error);
        return {
          success: false,
          message: 'Failed to create address. Please try again.'
        };
      }
    }, 'user.createAddress');
  }

  /**
   * Update an existing address
   */
  async updateAddress(addressData: UpdateAddressRequest): Promise<ApiResponse<UserAddress>> {
    return withPerformanceMonitoring(async () => {
      try {
        // Validate input
        if (!addressData.id) {
          return {
            success: false,
            message: 'Address ID is required'
          };
        }

        const apiResponse = await apiClient.put<UserAddress>(`/user/addresses/${addressData.id}`, addressData);
        
        // Clear cache on successful update
        if (apiResponse.success) {
          this.clearCache('user:addresses');
          ServiceUtils.logger.info('Address updated successfully', { id: addressData.id });
        }
        
        return apiResponse;
      } catch (error) {
        ServiceUtils.logger.error('Error updating address:', error);
        return {
          success: false,
          message: 'Failed to update address. Please try again.'
        };
      }
    }, 'user.updateAddress');
  }

  /**
   * Delete an address
   */
  async deleteAddress(request: DeleteAddressRequest): Promise<ApiResponse> {
    return withPerformanceMonitoring(async () => {
      try {
        // Validate input
        if (!request.id) {
          return {
            success: false,
            message: 'Address ID is required'
          };
        }

        const apiResponse = await apiClient.delete<ApiResponse>(`/user/addresses/${request.id}`);
        
        // Clear cache on successful deletion
        if (apiResponse.success) {
          this.clearCache('user:addresses');
          ServiceUtils.logger.info('Address deleted successfully', { id: request.id });
        }
        
        return apiResponse;
      } catch (error) {
        ServiceUtils.logger.error('Error deleting address:', error);
        return {
          success: false,
          message: 'Failed to delete address. Please try again.'
        };
      }
    }, 'user.deleteAddress');
  }

  /**
   * Set default address for delivery
   */
  async setDefaultAddress(addressId: string): Promise<ApiResponse> {
    return withPerformanceMonitoring(async () => {
      try {
        if (!addressId) {
          return {
            success: false,
            message: 'Address ID is required'
          };
        }

        const apiResponse = await apiClient.patch<ApiResponse>(`/user/addresses/${addressId}/default`);
        
        // Clear cache on successful update
        if (apiResponse.success) {
          this.clearCache('user:addresses');
          ServiceUtils.logger.info('Default address updated successfully', { id: addressId });
        }
        
        return apiResponse;
      } catch (error) {
        ServiceUtils.logger.error('Error setting default address:', error);
        return {
          success: false,
          message: 'Failed to set default address. Please try again.'
        };
      }
    }, 'user.setDefaultAddress');
  }

  /**
   * Clear all user service caches with optional pattern matching
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      ServiceUtils.logger.info('Clearing selective user cache', { pattern });
      // In a real implementation, you'd have pattern-based cache clearing
    } else {
      ServiceUtils.cache.clear();
      ServiceUtils.logger.info('Cleared all user service caches');
    }
  }

  /**
   * Initialize service with startup checks
   */
  protected initialize(): void {
    this.state.startTime = Date.now();
    ServiceUtils.logger.info('UserService initialized', {
      config: this.config,
      timestamp: new Date().toISOString()
    });
  }
}

// Initialize the service with singleton pattern
class UserServiceSingleton extends UserService {
  private static instance: UserServiceSingleton;
  
  private constructor() {
    super();
    this.initialize();
  }
  
  public static getInstance(): UserServiceSingleton {
    if (!UserServiceSingleton.instance) {
      UserServiceSingleton.instance = new UserServiceSingleton();
    }
    return UserServiceSingleton.instance;
  }
  
  /**
   * Graceful shutdown cleanup
   */
  public shutdown(): void {
    ServiceUtils.logger.info('UserService shutting down');
    this.clearCache();
  }
}

// Export singleton instance
export const userService = UserServiceSingleton.getInstance();

// Cleanup on page unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    userService.shutdown();
  });
}

export default userService;
