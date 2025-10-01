/**
 * Authentication API Response types
 */

import { ApiResponse } from './responses'

/**
 * Authentication user interface (API specific)
 */
export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: 'buyer' | 'seller' | 'admin'
  isEmailVerified: boolean
  avatar?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
}

/**
 * Login response interface
 */
export interface LoginResponse {
  user: AuthUser
  token: string
  refreshToken?: string
}

/**
 * Signup response interface
 */
export interface SignupResponse {
  user: AuthUser
  token?: string
  refreshToken?: string
  requiresEmailVerification?: boolean
  emailSent?: boolean
}

/**
 * Token verification response interface
 */
export interface TokenVerificationResponse {
  user: AuthUser
  valid: boolean
}

/**
 * Refresh token response interface
 */
export interface RefreshTokenResponse {
  user: AuthUser
  token: string
  refreshToken?: string
}

/**
 * Password reset response interface
 */
export interface PasswordResetResponse {
  success: boolean
  message: string
  emailSent?: boolean
}

/**
 * Password reset confirmation response interface
 */
export interface PasswordResetConfirmResponse {
  success: boolean
  message: string
}

/**
 * Change password response interface
 */
export interface ChangePasswordResponse {
  success: boolean
  message: string
}

/**
 * Email verification response interface
 */
export interface EmailVerificationResponse {
  success: boolean
  message: string
  user?: AuthUser
}

/**
 * Logout response interface
 */
export interface LogoutResponse {
  message: string
}

// API Response type aliases for auth endpoints
export type LoginApiResponse = ApiResponse<LoginResponse>
export type SignupApiResponse = ApiResponse<SignupResponse>
export type TokenVerificationApiResponse = ApiResponse<TokenVerificationResponse>
export type RefreshTokenApiResponse = ApiResponse<RefreshTokenResponse>
export type PasswordResetApiResponse = ApiResponse<PasswordResetResponse>
export type PasswordResetConfirmApiResponse = ApiResponse<PasswordResetConfirmResponse>
export type ChangePasswordApiResponse = ApiResponse<ChangePasswordResponse>
export type EmailVerificationApiResponse = ApiResponse<EmailVerificationResponse>
export type LogoutApiResponse = ApiResponse<LogoutResponse>
