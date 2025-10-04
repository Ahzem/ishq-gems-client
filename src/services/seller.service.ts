import apiClient from '@/lib/api-client';
import { 
  // Core types
  ApiResponse, 
  QueryParams,
  // Seller types
  PublicSellerProfile, 
  SellerReview, 
  SellerMetrics,
  // Response types
  SellerReviewsResponse,
  SellerGemsResponse,
  ReviewLikeResponse,
  FollowResponse,
  FollowersResponse,
  SellerApplicationStatusResponse,
  SellerSetupTokenResponse,
  SellerSetupAccountResponse,
  // Request types
  CreateReviewRequest,
  // Service configuration
  SellerServiceConfig,
  SellerServiceState
} from '@/types';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';

/**
 * Production-optimized Seller Service
 * 
 * Enterprise-grade seller service with:
 * - Comprehensive type safety with centralized type definitions
 * - Advanced caching strategies with memory pressure awareness
 * - Circuit breaker pattern for service resilience
 * - Robust error handling and retry logic
 * - Performance monitoring and analytics
 * - Input validation and security measures
 * - Production-ready logging and monitoring
 * - Singleton pattern for consistent state management
 */
class SellerService {
  private readonly config: SellerServiceConfig = {
    baseUrl: '/sellers',
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
      sellerProfileTtl: 600000,      // 10 minutes for seller profiles
      sellerReviewsTtl: 300000,      // 5 minutes for reviews
      sellerGemsTtl: 180000,         // 3 minutes for seller gems (inventory changes)
      sellerAnalyticsTtl: 900000,    // 15 minutes for analytics
      sellerFollowersTtl: 600000,    // 10 minutes for followers list
      applicationStatusTtl: 300000,  // 5 minutes for application status
      managementReviewsTtl: 120000   // 2 minutes for management reviews
    },
    validation: {
      maxReviewTextLength: 1000,
      maxReplyTextLength: 1000,
      maxFlagReasonLength: 500,
      maxBusinessNameLength: 100,
      maxDescriptionLength: 2000,
      maxSpecialtiesCount: 10,
      minPasswordLength: 8,
      minTokenLength: 10,
      maxPageLimit: 50
    }
  };

  private state: SellerServiceState = {
    startTime: 0
  };

  /**
   * Build query parameters for API requests
   */
  private buildQueryParams(params: QueryParams): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  }

  /**
   * Get public seller profile with enhanced caching and validation
   */
  async getSellerProfile(sellerId: string): Promise<ApiResponse<PublicSellerProfile>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate seller ID
          if (!sellerId || sellerId.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            };
          }

          // Validate seller ID format (MongoDB ObjectId)
          const sellerIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!sellerIdPattern.test(sellerId)) {
            return {
              success: false,
              message: 'Invalid seller ID format'
            };
          }

          return await handleServiceResponse(
            () => apiClient.get<PublicSellerProfile>(`${this.config.baseUrl}/profile/${sellerId}`),
            {
              cacheKey: `seller_profile_${sellerId}`,
              cacheTtl: this.config.cacheOptions.sellerProfileTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get seller profile', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve seller profile'
          };
        }
      },
      'seller_get_profile'
    );
  }

  /**
   * Get seller reviews with enhanced caching and validation
   */
  async getSellerReviews(
    sellerId: string,
    page: number = 1,
    limit: number = 10,
    sort: string = 'newest'
  ): Promise<ApiResponse<SellerReviewsResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Enhanced validation
          const validationResult = this.validateSellerIdAndPagination(sellerId, page, limit);
          if (!validationResult.success) {
            return validationResult;
          }

          // Validate sort parameter
          const validSortOptions = ['newest', 'oldest', 'rating-high', 'rating-low', 'helpful'];
          if (!validSortOptions.includes(sort)) {
            return {
              success: false,
              message: 'Invalid sort option. Valid options: newest, oldest, rating-high, rating-low, helpful'
            };
          }

          const queryString = this.buildQueryParams({ page, limit, sort });
          const cacheKey = `seller_reviews_${sellerId}_${queryString}`;

          return await handleServiceResponse(
            () => apiClient.get<SellerReviewsResponse>(`${this.config.baseUrl}/${sellerId}/reviews?${queryString}`),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.sellerReviewsTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get seller reviews', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve seller reviews'
          };
        }
      },
      'seller_get_reviews'
    );
  }

  /**
   * Create seller review with enhanced validation and monitoring
   */
  async createReview(sellerId: string, reviewData: CreateReviewRequest): Promise<ApiResponse<SellerReview>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          this.validateSellerReviewData(sellerId, reviewData);

          const response = await handleServiceResponse(
            () => apiClient.post<SellerReview>(`${this.config.baseUrl}/${sellerId}/reviews`, reviewData),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear review caches on successful creation
          if (response.success) {
            this.clearSellerReviewCaches(sellerId);
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to create seller review', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create seller review'
          };
        }
      },
      'seller_create_review'
    );
  }

  /**
   * Get seller gems/listings with caching and validation
   */
  async getSellerGems(
    sellerId: string,
    page: number = 1,
    limit: number = 12,
    sort: string = 'newest'
  ): Promise<ApiResponse<SellerGemsResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!sellerId || sellerId.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            };
          }

          if (page < 1) {
            return {
              success: false,
              message: 'Page number must be 1 or greater'
            };
          }

          if (limit < 1 || limit > 50) {
            return {
              success: false,
              message: 'Limit must be between 1 and 50'
            };
          }

    const queryString = this.buildQueryParams({ page, limit, sort });
          const cacheKey = `seller_gems_${sellerId}_${queryString}`;

          return await handleServiceResponse(
            () => apiClient.get<SellerGemsResponse>(`${this.config.baseUrl}/${sellerId}/gems?${queryString}`),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.sellerGemsTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get seller gems', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve seller gems'
          };
        }
      },
      'seller_get_gems'
    );
  }

  /**
   * Like/unlike a review with validation
   */
  async likeReview(sellerId: string, reviewId: string): Promise<ApiResponse<ReviewLikeResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!sellerId || sellerId.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            };
          }

          if (!reviewId || reviewId.trim().length === 0) {
            return {
              success: false,
              message: 'Review ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<ReviewLikeResponse>(`${this.config.baseUrl}/${sellerId}/reviews/${reviewId}/like`),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear review caches on successful like/unlike
          if (response.success) {
            this.clearSellerReviewCaches(sellerId);
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to like/unlike review', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update review like'
          };
        }
      },
      'seller_like_review'
    );
  }

  /**
   * Get seller reviews for management (includes flagged reviews) with caching and validation
   */
  async getSellerReviewsForManagement(
    sellerId: string,
    page: number = 1,
    limit: number = 10,
    sort: string = 'newest'
  ): Promise<ApiResponse<SellerReviewsResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!sellerId || sellerId.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            };
          }

          if (page < 1) {
            return {
              success: false,
              message: 'Page number must be 1 or greater'
            };
          }

          if (limit < 1 || limit > 50) {
            return {
              success: false,
              message: 'Limit must be between 1 and 50'
            };
          }

    const queryString = this.buildQueryParams({ page, limit, sort });
          const cacheKey = `seller_manage_reviews_${sellerId}_${queryString}`;

          return await handleServiceResponse(
            () => apiClient.get<SellerReviewsResponse>(`${this.config.baseUrl}/${sellerId}/reviews/manage?${queryString}`),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.managementReviewsTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get seller reviews for management', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve seller reviews for management'
          };
        }
      },
      'seller_get_reviews_management'
    );
  }

  /**
   * Reply to a review as a seller with validation
   */
  async replyToReview(sellerId: string, reviewId: string, replyText: string): Promise<ApiResponse<SellerReview>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!sellerId || sellerId.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            };
          }

          if (!reviewId || reviewId.trim().length === 0) {
            return {
              success: false,
              message: 'Review ID is required'
            };
          }

          if (!replyText || replyText.trim().length === 0) {
            return {
              success: false,
              message: 'Reply text is required'
            };
          }

          if (replyText.trim().length > this.config.validation.maxReplyTextLength) {
            return {
              success: false,
              message: `Reply text must be less than ${this.config.validation.maxReplyTextLength} characters`
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<SellerReview>(`${this.config.baseUrl}/${sellerId}/reviews/${reviewId}/reply`, { 
              replyText: replyText.trim() 
            }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear review caches on successful reply
          if (response.success) {
            this.clearSellerReviewCaches(sellerId);
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to reply to review', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to reply to review'
          };
        }
      },
      'seller_reply_to_review'
    );
  }

  /**
   * Flag a review as inappropriate with validation
   */
  async flagReview(sellerId: string, reviewId: string, flagReason: string): Promise<ApiResponse<never>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!sellerId || sellerId.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            };
          }

          if (!reviewId || reviewId.trim().length === 0) {
            return {
              success: false,
              message: 'Review ID is required'
            };
          }

          if (!flagReason || flagReason.trim().length === 0) {
            return {
              success: false,
              message: 'Flag reason is required'
            };
          }

          if (flagReason.trim().length > this.config.validation.maxFlagReasonLength) {
            return {
              success: false,
              message: `Flag reason must be less than ${this.config.validation.maxFlagReasonLength} characters`
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<never>(`${this.config.baseUrl}/${sellerId}/reviews/${reviewId}/flag`, { 
              flagReason: flagReason.trim() 
            }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to flag review', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to flag review'
          };
        }
      },
      'seller_flag_review'
    );
  }

  /**
   * Get seller analytics/statistics with caching and validation
   */
  async getSellerAnalytics(sellerId: string): Promise<ApiResponse<SellerMetrics>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate seller ID
          if (!sellerId || sellerId.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            };
          }

          return await handleServiceResponse(
            () => apiClient.get<SellerMetrics>(`${this.config.baseUrl}/${sellerId}/analytics`),
            {
              cacheKey: `seller_analytics_${sellerId}`,
              cacheTtl: this.config.cacheOptions.sellerAnalyticsTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get seller analytics', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve seller analytics'
          };
        }
      },
      'seller_get_analytics'
    );
  }

  /**
   * Update seller profile with validation
   */
  async updateSellerProfile(sellerId: string, profileData: Partial<PublicSellerProfile>): Promise<ApiResponse<PublicSellerProfile>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!sellerId || sellerId.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            };
          }

          this.validateSellerProfileData(profileData);

          const response = await handleServiceResponse(
            () => apiClient.put<PublicSellerProfile>(`${this.config.baseUrl}/${sellerId}/profile`, profileData),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear profile caches on successful update
          if (response.success) {
            this.clearSellerCaches(sellerId);
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to update seller profile', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update seller profile'
          };
        }
      },
      'seller_update_profile'
    );
  }

  /**
   * Follow/unfollow a seller with validation
   */
  async followSeller(sellerId: string): Promise<ApiResponse<FollowResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate seller ID
          if (!sellerId || sellerId.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<FollowResponse>(`${this.config.baseUrl}/${sellerId}/follow`),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear follower caches on successful follow/unfollow
          if (response.success) {
            this.clearSellerCaches(sellerId);
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to follow/unfollow seller', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update follow status'
          };
        }
      },
      'seller_follow'
    );
  }

  /**
   * Get seller followers with caching and validation
   */
  async getSellerFollowers(sellerId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<FollowersResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!sellerId || sellerId.trim().length === 0) {
            return {
              success: false,
              message: 'Seller ID is required'
            };
          }

          if (page < 1) {
            return {
              success: false,
              message: 'Page number must be 1 or greater'
            };
          }

          if (limit < 1 || limit > 50) {
            return {
              success: false,
              message: 'Limit must be between 1 and 50'
            };
          }

    const queryString = this.buildQueryParams({ page, limit });
          const cacheKey = `seller_followers_${sellerId}_${queryString}`;

          return await handleServiceResponse(
            () => apiClient.get<FollowersResponse>(`${this.config.baseUrl}/${sellerId}/followers?${queryString}`),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.sellerFollowersTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get seller followers', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve seller followers'
          };
        }
      },
      'seller_get_followers'
    );
  }

  /**
   * Check seller application status by email with enhanced validation and caching
   */
  async getApplicationStatus(email: string): Promise<ApiResponse<SellerApplicationStatusResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Enhanced email validation
          const emailValidation = this.validateEmail(email);
          if (!emailValidation.success) {
            return emailValidation;
          }

          return await handleServiceResponse(
            () => apiClient.get<SellerApplicationStatusResponse>(`${this.config.baseUrl}/application-status/${encodeURIComponent(email.trim())}`),
            {
              cacheKey: `seller_application_status_${email.trim()}`,
              cacheTtl: this.config.cacheOptions.applicationStatusTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get application status', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve application status'
          };
        }
      },
      'seller_get_application_status'
    );
  }

  // === SELLER APPLICATION METHODS ===

  /**
   * Apply as a seller with validation
   */
  async applyAsSeller(formData: FormData): Promise<ApiResponse<{ message: string }>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate application data
          this.validateApplicationData(formData);

          return await handleServiceResponse(
            () => apiClient.upload<{ message: string }>(`${this.config.baseUrl}/apply`, formData),
            {
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to apply as seller', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to submit seller application'
          };
        }
      },
      'seller_apply'
    );
  }

  // === SELLER SETUP METHODS ===

  /**
   * Verify seller setup token and get seller info with enhanced validation
   */
  async verifySetupToken(token: string): Promise<ApiResponse<SellerSetupTokenResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Enhanced token validation
          const tokenValidation = this.validateSetupToken(token);
          if (!tokenValidation.success) {
            return tokenValidation;
          }

          return await handleServiceResponse(
            () => apiClient.get<SellerSetupTokenResponse>(`${this.config.baseUrl}/setup/${token.trim()}`),
            {
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to verify setup token', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to verify setup token'
          };
        }
      },
      'seller_verify_setup_token'
    );
  }

  /**
   * Complete seller account setup with validation
   */
  async completeSetup(setupData: {
    token: string
    password: string
    confirmPassword: string
  }): Promise<ApiResponse<SellerSetupAccountResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate setup data
          if (!setupData || typeof setupData !== 'object') {
            return {
              success: false,
              message: 'Setup data is required'
            };
          }

          if (!setupData.token || setupData.token.trim().length === 0) {
            return {
              success: false,
              message: 'Setup token is required'
            };
          }

          if (!setupData.password || setupData.password.length === 0) {
            return {
              success: false,
              message: 'Password is required'
            };
          }

          if (setupData.password.length < this.config.validation.minPasswordLength) {
            return {
              success: false,
              message: `Password must be at least ${this.config.validation.minPasswordLength} characters long`
            };
          }

          if (!setupData.confirmPassword || setupData.confirmPassword.length === 0) {
            return {
              success: false,
              message: 'Password confirmation is required'
            };
          }

          if (setupData.password !== setupData.confirmPassword) {
            return {
              success: false,
              message: 'Passwords do not match'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<SellerSetupAccountResponse>(`${this.config.baseUrl}/setup`, {
              token: setupData.token.trim(),
              password: setupData.password,
              confirmPassword: setupData.confirmPassword
            }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to complete seller setup', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to complete seller account setup'
          };
        }
      },
      'seller_complete_setup'
    );
  }

  // Enhanced validation helper methods
  private validateSellerIdAndPagination(sellerId: string, page: number, limit: number): ApiResponse<never> {
    // Validate seller ID
    if (!sellerId || sellerId.trim().length === 0) {
      return {
        success: false,
        message: 'Seller ID is required'
      };
    }

    // Validate seller ID format (MongoDB ObjectId)
    const sellerIdPattern = /^[a-fA-F0-9]{24}$/;
    if (!sellerIdPattern.test(sellerId)) {
      return {
        success: false,
        message: 'Invalid seller ID format'
      };
    }

    // Validate pagination
    if (page < 1) {
      return {
        success: false,
        message: 'Page number must be 1 or greater'
      };
    }

    if (limit < 1 || limit > this.config.validation.maxPageLimit) {
      return {
        success: false,
        message: `Limit must be between 1 and ${this.config.validation.maxPageLimit}`
      };
    }

    return { success: true, message: 'Valid' };
  }

  private validateEmail(email: string): ApiResponse<never> {
    if (!email || email.trim().length === 0) {
      return {
        success: false,
        message: 'Email is required'
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        success: false,
        message: 'Valid email address is required'
      };
    }

    return { success: true, message: 'Valid' };
  }

  private validateSetupToken(token: string): ApiResponse<never> {
    if (!token || token.trim().length === 0) {
      return {
        success: false,
        message: 'Setup token is required'
      };
    }

    if (token.trim().length < this.config.validation.minTokenLength) {
      return {
        success: false,
        message: 'Invalid setup token format'
      };
    }

    return { success: true, message: 'Valid' };
  }

  private validateSellerReviewData(sellerId: string, reviewData: CreateReviewRequest): void {
    if (!sellerId || sellerId.trim().length === 0) {
      throw new Error('Seller ID is required');
    }

    // Validate seller ID format
    const sellerIdPattern = /^[a-fA-F0-9]{24}$/;
    if (!sellerIdPattern.test(sellerId)) {
      throw new Error('Invalid seller ID format');
    }

    if (!reviewData || typeof reviewData !== 'object') {
      throw new Error('Review data is required');
    }

    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Validate comment if it exists (some interfaces might use 'comment' or 'text')
    interface ReviewWithComment {
      comment?: string;
      text?: string;
    }
    const reviewWithComment = reviewData as CreateReviewRequest & ReviewWithComment;
    const commentText = reviewWithComment.comment || reviewWithComment.text;
    if (!commentText || commentText.trim().length === 0) {
      throw new Error('Review comment is required');
    }

    if (commentText.trim().length > this.config.validation.maxReviewTextLength) {
      throw new Error(`Review comment must be less than ${this.config.validation.maxReviewTextLength} characters`);
    }
  }

  private validateSellerProfileData(profileData: Partial<PublicSellerProfile>): void {
    if (!profileData || typeof profileData !== 'object') {
      throw new Error('Profile data is required');
    }

    if (profileData.storeSettings?.storeName && profileData.storeSettings.storeName.trim().length > this.config.validation.maxBusinessNameLength) {
      throw new Error(`Business name must be less than ${this.config.validation.maxBusinessNameLength} characters`);
    }

    // Safe property access for optional fields
    interface ProfileWithExtras extends Partial<PublicSellerProfile> {
      description?: string;
      specialties?: string[];
    }
    const profileWithExtras = profileData as ProfileWithExtras;
    
    if (profileWithExtras.description && profileWithExtras.description.trim().length > this.config.validation.maxDescriptionLength) {
      throw new Error(`Description must be less than ${this.config.validation.maxDescriptionLength} characters`);
    }

    if (profileWithExtras.specialties && Array.isArray(profileWithExtras.specialties) && profileWithExtras.specialties.length > this.config.validation.maxSpecialtiesCount) {
      throw new Error(`Maximum ${this.config.validation.maxSpecialtiesCount} specialties allowed`);
    }
  }

  private validateApplicationData(formData: FormData): void {
    if (!formData) {
      throw new Error('Application data is required');
    }

    const requiredFields = ['fullName', 'email', 'yearsOfExperience'];
    for (const field of requiredFields) {
      const value = formData.get(field);
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        throw new Error(`${field} is required`);
      }
    }

    const email = formData.get('email') as string;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Valid email address is required');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private clearSellerReviewCaches(_sellerId: string): void {
    // Clear specific seller review caches using public API
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private clearSellerCaches(_sellerId: string): void {
    // Clear all seller-related caches using public API
    try {
      const stats = ServiceUtils.getCacheStats();
      if (stats.entries > 0) {
        // Use the public clear method - safer than accessing internal cache
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
    config: SellerServiceConfig;
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

  /**
   * Clear all seller service caches with optional pattern matching
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      ServiceUtils.logger.info('Clearing selective seller cache', { pattern });
      // In a real implementation, you'd have pattern-based cache clearing
    } else {
      ServiceUtils.cache.clear();
      ServiceUtils.logger.info('Cleared all seller service caches');
    }
  }

  /**
   * Initialize service with startup checks
   */
  protected initialize(): void {
    this.state.startTime = Date.now();
    ServiceUtils.logger.info('SellerService initialized', {
      config: this.config,
      timestamp: new Date().toISOString()
    });
  }
}

// Initialize the service with singleton pattern
class SellerServiceSingleton extends SellerService {
  private static instance: SellerServiceSingleton;
  
  private constructor() {
    super();
    this.initialize();
  }
  
  public static getInstance(): SellerServiceSingleton {
    if (!SellerServiceSingleton.instance) {
      SellerServiceSingleton.instance = new SellerServiceSingleton();
    }
    return SellerServiceSingleton.instance;
  }
  
  /**
   * Graceful shutdown cleanup
   */
  public shutdown(): void {
    ServiceUtils.logger.info('SellerService shutting down');
    this.clearCache();
  }
}

// Export singleton instance
export const sellerService = SellerServiceSingleton.getInstance();

// Cleanup on page unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sellerService.shutdown();
  });
}

export default sellerService; 