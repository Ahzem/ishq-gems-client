import apiClient from '@/lib/api-client';
import { 
  ApiResponse,
  LoginRequest,
  SignupRequest,
  AuthUser,
  LoginResponse,
  SignupResponse,
  TokenVerificationResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  ChangePasswordRequest,
  EmailVerificationRequest,
  ResendVerificationRequest,
  PasswordResetResponse,
  PasswordResetConfirmResponse,
  ChangePasswordResponse,
  EmailVerificationResponse
} from '@/types';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';
import { environment } from '@/config/environment';

/**
 * Production-optimized Authentication Service
 * Implements caching, error handling, and performance monitoring
 */
class AuthService {
  private readonly baseUrl = '/auth';
  private readonly circuitBreaker = ServiceUtils.circuitBreaker('auth-service');

  /**
   * User login with enhanced validation, error handling and performance monitoring
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Rate limiting for login attempts
          const rateLimitKey = `login_${credentials.email}`;
          if (!ServiceUtils.rateLimiter.isAllowed(rateLimitKey)) {
            return {
              success: false,
              message: 'Too many login attempts. Please try again later.'
            } as ApiResponse<LoginResponse>;
          }

          // Client-side validation
          const validationError = this.validateLoginData(credentials);
          if (validationError) {
            return {
              success: false,
              message: validationError
            } as ApiResponse<LoginResponse>;
          }

          // Use circuit breaker for auth service protection
          const response = await this.circuitBreaker.execute(
            () => handleServiceResponse(
              () => apiClient.post<LoginResponse>(`${this.baseUrl}/signin`, credentials),
              {
                retryOptions: {
                  maxRetries: ServiceUtils.isSlowConnection() ? 1 : 2,
                  delay: ServiceUtils.getAdaptiveTimeout(1000),
                  retryCondition: (error) => {
                    // Retry on network errors but not on auth failures (401, 403)
                    if (error && typeof error === 'object' && 'status' in error) {
                      const status = (error as { status: number }).status;
                      return status >= 500 || status === 0;
                    }
                    return false;
                  }
                }
              }
            ),
            'auth-service'
          );

          // Record auth metrics
          ServiceUtils.healthMonitor.recordRequest(
            performance.now(),
            !response.success
          );

          // Clear any stale cache on successful login
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear any user-specific cache
            this.clearTokenCache();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Login failed', error, { 
            email: credentials.email,
            connectionStatus: ServiceUtils.connection.getStatus()
          });
          throw ServiceUtils.handleError('login', error, { email: credentials.email });
        }
      },
      'auth_login',
      { 
        criticalPath: true, 
        expectedDuration: this.getAdaptiveLoginDuration(), 
        priority: 'critical' 
      }
    );
  }

  /**
   * User signup with comprehensive validation and error handling
   */
  async signup(userData: SignupRequest): Promise<ApiResponse<SignupResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Comprehensive client-side validation
          const validationError = this.validateSignupData(userData);
          if (validationError) {
            return {
              success: false,
              message: validationError
            } as ApiResponse<SignupResponse>;
          }

          return await handleServiceResponse(
            () => apiClient.post<SignupResponse>(`${this.baseUrl}/signup`, userData),
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
          ServiceUtils.logger.error('Signup failed', error);
          throw ServiceUtils.handleError('signup', error, { email: userData.email });
        }
      },
      'auth_signup'
    );
  }

  /**
   * Verify authentication token with caching
   */
  async verifyToken(): Promise<ApiResponse<TokenVerificationResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Use advanced cache system with priority
          const cacheKey = 'auth_token_verification';
          
          const response = await this.circuitBreaker.execute(
            () => handleServiceResponse(
              () => apiClient.post<TokenVerificationResponse>(`${this.baseUrl}/verify`),
              {
                cacheKey,
                cacheTtl: 60000, // 1 minute TTL
                useCache: true,
                retryOptions: {
                  maxRetries: ServiceUtils.isSlowConnection() ? 0 : 1,
                  retryCondition: (error) => {
                    // Don't retry auth errors (401, 403)
                    if (error && typeof error === 'object' && 'status' in error) {
                      const status = (error as { status: number }).status;
                      if (status === 401 || status === 403) return false;
                      return status >= 500 || status === 0;
                    }
                    return false;
                  }
                }
              }
            ),
            'auth-service'
          );

          // Cache with critical priority for frequent access
          if (response.success && response.data) {
            ServiceUtils.cache.set(cacheKey, response, 60000, 'critical');
          }

          return response;
        } catch (error) {
          // Don't log auth errors as errors - they're expected when not authenticated
          if (this.isAuthError(error)) {
            ServiceUtils.logger.info('Token verification failed - user not authenticated');
          } else {
            ServiceUtils.logger.error('Token verification failed', error);
          }
          throw ServiceUtils.handleError('verify token', error);
        }
      },
      'auth_verify_token',
      { 
        criticalPath: true, 
        expectedDuration: this.getAdaptiveVerifyDuration(), 
        priority: 'critical' 
      }
    );
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.post<RefreshTokenResponse>(`${this.baseUrl}/refresh`, refreshTokenData),
            {
              retryOptions: {
                maxRetries: 1, // Limited retries for token refresh
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

          // Clear verification cache on token refresh
          if (response.success) {
            this.clearTokenCache();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Token refresh failed', error);
          throw ServiceUtils.handleError('refresh token', error);
        }
      },
      'auth_refresh_token'
    );
  }

  /**
   * User logout with cleanup
   */
  async logout(): Promise<ApiResponse<LogoutResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.post<LogoutResponse>(`${this.baseUrl}/logout`),
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

          // Clear all auth-related cache
          this.clearTokenCache();
          ServiceUtils.cache.clear(); // Clear any user-related cache

          return response;
        } catch (error) {
          // Logout should always succeed locally even if server request fails
          ServiceUtils.logger.error('Logout request failed', error);
          this.clearTokenCache();
          ServiceUtils.cache.clear();
          
          return {
            success: true,
            data: { message: 'Logged out locally' }
          } as ApiResponse<LogoutResponse>;
        }
      },
      'auth_logout'
    );
  }

  /**
   * Check if user is authenticated (cached)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await this.verifyToken();
      return response.success && response.data?.valid === true;
    } catch (error) {
      ServiceUtils.logger.error('Authentication check failed', error);
      return false;
    }
  }

  /**
   * Get current user from cache or server
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await this.verifyToken();
      return response.success && response.data ? response.data.user : null;
    } catch (error) {
      ServiceUtils.logger.error('Get current user failed', error);
      return null;
    }
  }

  // Private helper methods
  private clearTokenCache(): void {
    // Clear token-related caches using the advanced cache system
    const cacheKeys = ['auth_token_verification', 'current_user', 'auth_status'];
    cacheKeys.forEach(key => {
      if (ServiceUtils.cache.has(key)) {
        ServiceUtils.cache.delete(key);
      }
    });
  }

  private async warmAuthCache(): Promise<void> {
    try {
      // Only warm cache if we have potential auth data (tokens in localStorage, etc.)
      const hasAuthData = this.hasAuthIndicators();
      
      if (!hasAuthData) {
        ServiceUtils.logger.info('No auth indicators found, skipping cache warming');
        return;
      }

      // Pre-populate critical auth data only if we have tokens
      // Skip cache warming in development to avoid performance noise
      if (environment.isDevelopment) {
        ServiceUtils.logger.info('Skipping auth cache warming in development mode');
        return;
      }

      // Use a timeout wrapper for the verification call itself
      const verifyWithTimeout = async (): Promise<ApiResponse<TokenVerificationResponse>> => {
        return new Promise(async (resolve) => {
          const timeoutId = setTimeout(() => {
            ServiceUtils.logger.info('Auth verification timed out during cache warming, using cached fallback');
            resolve({ success: false, message: 'Verification timeout' } as ApiResponse<TokenVerificationResponse>);
          }, 2000); // 2 second timeout for individual verification

          try {
            // Call verifyToken with reduced performance monitoring expectations
            const result = await this.verifyTokenForCacheWarming();
            clearTimeout(timeoutId);
            resolve(result);
          } catch (error) {
            clearTimeout(timeoutId);
            if (this.isAuthError(error)) {
              ServiceUtils.logger.info('Auth verification failed during cache warming (expected if not logged in)');
              resolve({ success: false, message: 'Not authenticated' } as ApiResponse<TokenVerificationResponse>);
            } else {
              resolve({ success: false, message: 'Verification failed' } as ApiResponse<TokenVerificationResponse>);
            }
          }
        });
      };

      await ServiceUtils.warmCache([
        {
          key: 'auth_permissions',
          dataFetcher: verifyWithTimeout,
          ttl: 60000,
          priority: 'normal' // Reduced from critical to avoid blocking
        }
      ]);
    } catch (error) {
      ServiceUtils.logger.warn('Auth cache warming failed', error);
      // Don't throw - cache warming failure shouldn't break initialization
    }
  }

  private hasAuthIndicators(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for common auth indicators (adjust based on your token storage strategy)
    const hasTokens = !!(
      localStorage.getItem('token') || 
      localStorage.getItem('accessToken') || 
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('accessToken') ||
      document.cookie.includes('token') ||
      document.cookie.includes('auth')
    );

    return hasTokens;
  }

  /**
   * Verify token specifically for cache warming with relaxed performance monitoring
   */
  private async verifyTokenForCacheWarming(): Promise<ApiResponse<TokenVerificationResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.get<TokenVerificationResponse>('/auth/verify'),
            {
              cacheKey: 'auth_verify_token_cache_warming',
              cacheTtl: 300000, // 5 minutes
              useCache: true,
              retryOptions: {
                maxRetries: 1, // Reduced retries for cache warming
                retryCondition: (error: unknown) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          return response;
        } catch (error) {
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as { status: number }).status;
            if (status === 401 || status === 403) {
              // Expected auth errors during cache warming
              return { success: false, message: 'Not authenticated' };
            }
          }
          throw error;
        }
      },
      'auth_verify_token_cache_warming',
      { 
        criticalPath: false, // Not critical during cache warming
        expectedDuration: 5000, // Very relaxed 5s threshold for cache warming
        priority: 'low' // Low priority for cache warming
      }
    );
  }

  private isAuthError(error: unknown): boolean {
    if (error && typeof error === 'object') {
      // Check for common auth error patterns
      if ('status' in error) {
        const status = (error as { status: number }).status;
        return status === 401 || status === 403;
      }
      if ('message' in error) {
        const message = (error as { message: string }).message.toLowerCase();
        return message.includes('unauthorized') || 
               message.includes('forbidden') || 
               message.includes('invalid token') ||
               message.includes('token expired');
      }
    }
    return false;
  }

  private getAdaptiveLoginDuration(): number {
    const connectionStatus = ServiceUtils.connection.getStatus();
    const baseTime = 1200; // Base expectation: 1.2 seconds for login
    
    if (!connectionStatus.isOnline) return baseTime * 3; // 3.6s offline
    if (connectionStatus.isSlowConnection) return baseTime * 2.5; // 3s slow connection
    if (connectionStatus.effectiveType === '3g') return baseTime * 1.5; // 1.8s 3G
    if (connectionStatus.isFastConnection) return baseTime * 0.8; // 0.96s fast connection
    
    return baseTime; // 1.2s default
  }

  private getAdaptiveVerifyDuration(): number {
    const connectionStatus = ServiceUtils.connection.getStatus();
    const baseTime = 1500; // Increased base expectation: 1.5s for token verification
    
    if (!connectionStatus.isOnline) return baseTime * 2; // 3s offline
    if (connectionStatus.isSlowConnection) return baseTime * 2; // 3s slow connection
    if (connectionStatus.effectiveType === '3g') return baseTime * 1.3; // 2s 3G
    if (connectionStatus.isFastConnection) return baseTime * 0.8; // 1.2s fast connection
    
    return baseTime; // 1.5s default
  }

  private getAdaptivePasswordChangeDuration(): number {
    const connectionStatus = ServiceUtils.connection.getStatus();
    const baseTime = 2000; // Base expectation: 2 seconds for password change
    
    if (!connectionStatus.isOnline) return baseTime * 2; // 4s offline
    if (connectionStatus.isSlowConnection) return baseTime * 1.8; // 3.6s slow connection
    if (connectionStatus.effectiveType === '3g') return baseTime * 1.3; // 2.6s 3G
    if (connectionStatus.isFastConnection) return baseTime * 0.8; // 1.6s fast connection
    
    return baseTime; // 2s default
  }

  /**
   * Request password reset with validation
   */
  async requestPasswordReset(resetData: PasswordResetRequest): Promise<ApiResponse<PasswordResetResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate email format
          if (!resetData.email || !this.isValidEmail(resetData.email)) {
            return {
              success: false,
              message: 'Please provide a valid email address'
            } as ApiResponse<PasswordResetResponse>;
          }

          return await handleServiceResponse(
            () => apiClient.post<PasswordResetResponse>(`${this.baseUrl}/forgot-password`, resetData),
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
          ServiceUtils.logger.error('Password reset request failed', error);
          throw ServiceUtils.handleError('request password reset', error, { email: resetData.email });
        }
      },
      'auth_request_password_reset'
    );
  }

  /**
   * Confirm password reset with validation
   */
  async confirmPasswordReset(confirmData: PasswordResetConfirmRequest): Promise<ApiResponse<PasswordResetConfirmResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate password reset data
          const validationError = this.validatePasswordResetData(confirmData);
          if (validationError) {
            return {
              success: false,
              message: validationError
            } as ApiResponse<PasswordResetConfirmResponse>;
          }

          const response = await handleServiceResponse(
            () => apiClient.post<PasswordResetConfirmResponse>(`${this.baseUrl}/reset-password`, confirmData),
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

          // Clear all caches on successful password reset
          if (response.success) {
            this.clearTokenCache();
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Password reset confirmation failed', error);
          throw ServiceUtils.handleError('confirm password reset', error);
        }
      },
      'auth_confirm_password_reset'
    );
  }

  /**
   * Change password with validation
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate password change data
          const validationError = this.validatePasswordChangeData(passwordData);
          if (validationError) {
            return {
              success: false,
              message: validationError
            } as ApiResponse<ChangePasswordResponse>;
          }

          // If offline, queue for background sync
          if (!ServiceUtils.connection.getStatus().isOnline) {
            ServiceUtils.backgroundSync.queue(
              `change_password_${Date.now()}`,
              () => apiClient.post<ChangePasswordResponse>(`${this.baseUrl}/change-password`, passwordData),
              'high'
            );

            return {
              success: true,
              message: 'Password change queued. Will be processed when online.',
              data: { success: true, message: 'Queued for processing' }
            } as ApiResponse<ChangePasswordResponse>;
          }

          const response = await this.circuitBreaker.execute(
            () => handleServiceResponse(
              () => apiClient.post<ChangePasswordResponse>(`${this.baseUrl}/change-password`, passwordData),
              {
                retryOptions: {
                  maxRetries: 1,
                  delay: ServiceUtils.getAdaptiveTimeout(2000),
                  retryCondition: (error) => {
                    if (error && typeof error === 'object' && 'status' in error) {
                      const status = (error as { status: number }).status;
                      return status >= 500 || status === 0;
                    }
                    return false;
                  }
                }
              }
            ),
            'auth-service'
          );

          // Clear token cache on successful password change
          if (response.success) {
            this.clearTokenCache();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Change password failed', error);
          throw ServiceUtils.handleError('change password', error);
        }
      },
      'auth_change_password',
      { expectedDuration: this.getAdaptivePasswordChangeDuration(), priority: 'high' }
    );
  }

  /**
   * Verify email with validation
   */
  async verifyEmail(verificationData: EmailVerificationRequest): Promise<ApiResponse<EmailVerificationResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate token
          if (!verificationData.token || verificationData.token.trim().length === 0) {
            return {
              success: false,
              message: 'Verification token is required'
            } as ApiResponse<EmailVerificationResponse>;
          }

          const response = await handleServiceResponse(
            () => apiClient.get<EmailVerificationResponse>(`/email-verification/verify/${verificationData.token}`),
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

          // Clear verification cache on successful email verification
          if (response.success) {
            this.clearTokenCache();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Email verification failed', error);
          throw ServiceUtils.handleError('verify email', error);
        }
      },
      'auth_verify_email'
    );
  }

  /**
   * Resend verification email with rate limiting
   */
  async resendVerificationEmail(resendData: ResendVerificationRequest): Promise<ApiResponse<EmailVerificationResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate email format
          if (!resendData.email || !this.isValidEmail(resendData.email)) {
            return {
              success: false,
              message: 'Please provide a valid email address'
            } as ApiResponse<EmailVerificationResponse>;
          }

          return await handleServiceResponse(
            () => apiClient.post<EmailVerificationResponse>(`/email-verification/resend`, resendData),
            {
              retryOptions: {
                maxRetries: 1, // Limited retries for email operations
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
          ServiceUtils.logger.error('Resend verification email failed', error);
          throw ServiceUtils.handleError('resend verification email', error, { email: resendData.email });
        }
      },
      'auth_resend_verification_email'
    );
  }

  // Private validation methods
  private validateLoginData(credentials: LoginRequest): string | null {
    if (!credentials.email || !credentials.password) {
      return 'Email and password are required';
    }

    if (!this.isValidEmail(credentials.email)) {
      return 'Please provide a valid email address';
    }

    if (credentials.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    return null;
  }

  private validateSignupData(userData: SignupRequest): string | null {
    if (!userData.fullName || userData.fullName.trim().length === 0) {
      return 'Full name is required';
    }

    if (userData.fullName.trim().length < 2) {
      return 'Full name must be at least 2 characters long';
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      return 'Please provide a valid email address';
    }

    if (!userData.password || userData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (userData.password !== userData.confirmPassword) {
      return 'Passwords do not match';
    }

    // Password strength validation
    if (!this.isStrongPassword(userData.password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (userData.phone && !this.isValidPhone(userData.phone)) {
      return 'Please provide a valid phone number';
    }

    return null;
  }

  private validatePasswordResetData(confirmData: PasswordResetConfirmRequest): string | null {
    if (!confirmData.token || confirmData.token.trim().length === 0) {
      return 'Reset token is required';
    }

    if (!confirmData.password || confirmData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (confirmData.password !== confirmData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (!this.isStrongPassword(confirmData.password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    return null;
  }

  private validatePasswordChangeData(passwordData: ChangePasswordRequest): string | null {
    if (!passwordData.currentPassword) {
      return 'Current password is required';
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      return 'New password must be at least 8 characters long';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return 'New passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      return 'New password must be different from current password';
    }

    if (!this.isStrongPassword(passwordData.newPassword)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    // At least one uppercase letter, one lowercase letter, and one number
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    return strongPasswordRegex.test(password);
  }

  private isValidPhone(phone: string): boolean {
    // Basic phone validation - can be enhanced based on requirements
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Initialize auth service with cache warming and connection monitoring
   */
  async initialize(): Promise<void> {
    try {
      ServiceUtils.logger.info('Initializing auth service');

      // Set up connection monitoring first
      ServiceUtils.connection.onChange((status) => {
        if (!status.isOnline) {
          ServiceUtils.logger.info('Auth service: Connection lost, enabling offline mode');
        } else {
          ServiceUtils.logger.info('Auth service: Connection restored, processing queued operations');
        }
      });

      // Warm critical caches on service initialization (non-blocking)
      this.warmAuthCache().catch(error => {
        ServiceUtils.logger.warn('Auth cache warming failed during initialization', error);
      });

      ServiceUtils.logger.info('Auth service initialized successfully');
    } catch (error) {
      ServiceUtils.logger.warn('Auth service initialization failed', error);
      // Don't throw - service should still be usable even if initialization fails
    }
  }

  /**
   * Get comprehensive auth service statistics
   */
  getAuthStats() {
    return {
      cacheStats: ServiceUtils.getCacheStats(),
      circuitBreakerState: this.circuitBreaker.getState(),
      healthMetrics: ServiceUtils.getHealthMetrics(),
      connectionStatus: ServiceUtils.connection.getStatus()
    };
  }

  /**
   * Clear all auth service caches
   */
  clearCache(): void {
    this.clearTokenCache();
    ServiceUtils.logger.info('Auth service cache cleared');
  }
}

const authService = new AuthService();

// Initialize auth service in browser environment
if (typeof window !== 'undefined') {
  authService.initialize().catch(error => {
    console.warn('Auth service initialization warning:', error);
  });
}

export default authService;

// Types are now exported from @/types - no need for local exports
