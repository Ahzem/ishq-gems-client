/**
 * Authentication API Request types
 */

/**
 * Login request interface
 */
export interface LoginRequest {
  email: string
  password: string
  captchaToken?: string
}

/**
 * Signup request interface
 */
export interface SignupRequest {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  captchaToken?: string
}

/**
 * Refresh token request interface
 */
export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * Password reset request interface
 */
export interface PasswordResetRequest {
  email: string
  captchaToken?: string
}

/**
 * Password reset confirmation request interface
 */
export interface PasswordResetConfirmRequest {
  token: string
  password: string
  confirmPassword: string
}

/**
 * Change password request interface
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Email verification request interface
 */
export interface EmailVerificationRequest {
  token: string
}

/**
 * Resend verification email request interface
 */
export interface ResendVerificationRequest {
  email: string
  captchaToken?: string
}
