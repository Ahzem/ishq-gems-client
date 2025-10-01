import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';

interface User {
  id: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
}

interface EmailVerificationResponse {
  verified: boolean;
  user: User;
}

interface ResendVerificationRequest {
  email: string;
}

interface ResendVerificationResponse {
  message: string;
}

/**
 * Production-optimized Email Verification Service
 * Implements rate limiting, caching, and proper validation
 */
class EmailVerificationService {
  private readonly baseUrl = '/email-verification';
  private resendAttempts = new Map<string, { count: number; lastAttempt: number }>();
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly MAX_RESEND_ATTEMPTS = 3; // 3 attempts per minute

  /**
   * Verify email using verification token with enhanced error handling
   */
  async verifyEmail(token: string): Promise<ApiResponse<EmailVerificationResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Basic token validation
          if (!token || token.length < 10) {
            return {
              success: false,
              message: 'Invalid verification token'
            } as ApiResponse<EmailVerificationResponse>;
          }

          const response = await handleServiceResponse(
            () => apiClient.get<EmailVerificationResponse>(`${this.baseUrl}/verify/${token}`),
            {
              cacheKey: `email_verification_${token}`,
              cacheTtl: 300000, // 5 minutes cache for verification results
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    // Don't retry on 400-level errors (invalid token, already verified, etc.)
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          // Clear verification cache on successful verification
          if (response.success && response.data?.verified) {
            ServiceUtils.cache.clear(); // Clear user profile cache to refresh verification status
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Email verification failed', error);
          throw ServiceUtils.handleError('verify email', error, { tokenLength: token?.length });
        }
      },
      'email_verify'
    );
  }

  /**
   * Resend email verification with rate limiting
   */
  async resendVerification(email: string): Promise<ApiResponse<ResendVerificationResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate email format
          if (!this.validateEmail(email)) {
            return {
              success: false,
              message: 'Invalid email address format'
            } as ApiResponse<ResendVerificationResponse>;
          }

          // Check rate limiting
          if (!this.checkRateLimit(email)) {
            return {
              success: false,
              message: `Too many resend attempts. Please wait ${Math.ceil(this.getRemainingCooldown(email) / 1000)} seconds.`
            } as ApiResponse<ResendVerificationResponse>;
          }

          const response = await handleServiceResponse(
            () => apiClient.post<ResendVerificationResponse>(`${this.baseUrl}/resend`, { email }),
            {
              retryOptions: {
                maxRetries: 1, // Email sending should not be retried aggressively
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

          // Update rate limiting tracking
          this.updateRateLimit(email);

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Resend verification failed', error);
          throw ServiceUtils.handleError('resend email verification', error, { email });
        }
      },
      'email_resend_verification'
    );
  }

  /**
   * Request new verification link (for expired tokens)
   */
  async requestNewVerificationLink(email: string): Promise<ApiResponse<ResendVerificationResponse>> {
    return this.resendVerification(email);
  }

  /**
   * Check if user can request another verification email
   */
  canRequestVerification(email: string): { allowed: boolean; remainingTime?: number } {
    if (!this.validateEmail(email)) {
      return { allowed: false };
    }

    const allowed = this.checkRateLimit(email);
    if (!allowed) {
      return {
        allowed: false,
        remainingTime: this.getRemainingCooldown(email)
      };
    }

    return { allowed: true };
  }

  /**
   * Clear rate limiting for testing purposes
   */
  clearRateLimit(email?: string): void {
    if (email) {
      this.resendAttempts.delete(email);
    } else {
      this.resendAttempts.clear();
    }
  }

  // Private validation and rate limiting methods
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private checkRateLimit(email: string): boolean {
    const now = Date.now();
    const attempts = this.resendAttempts.get(email);

    if (!attempts) {
      return true; // First attempt
    }

    // Reset counter if window has passed
    if (now - attempts.lastAttempt > this.RATE_LIMIT_WINDOW) {
      this.resendAttempts.delete(email);
      return true;
    }

    return attempts.count < this.MAX_RESEND_ATTEMPTS;
  }

  private updateRateLimit(email: string): void {
    const now = Date.now();
    const attempts = this.resendAttempts.get(email);

    if (!attempts || now - attempts.lastAttempt > this.RATE_LIMIT_WINDOW) {
      this.resendAttempts.set(email, { count: 1, lastAttempt: now });
    } else {
      this.resendAttempts.set(email, {
        count: attempts.count + 1,
        lastAttempt: now
      });
    }
  }

  private getRemainingCooldown(email: string): number {
    const attempts = this.resendAttempts.get(email);
    if (!attempts) return 0;

    const elapsed = Date.now() - attempts.lastAttempt;
    return Math.max(0, this.RATE_LIMIT_WINDOW - elapsed);
  }
}

const emailVerificationService = new EmailVerificationService();
export default emailVerificationService;

// Export types for use in components
export type {
  User,
  EmailVerificationResponse,
  ResendVerificationRequest,
  ResendVerificationResponse
};
