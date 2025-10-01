/**
 * Authentication types and interfaces
 */

import { UserRole } from '../entities/user'

/**
 * Auth tokens interface
 */
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Registration credentials
 */
export interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}

/**
 * Signup data interface
 */
export interface SignupData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}

/**
 * Auth user interface for context
 */
export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
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
 * Login result interface
 */
export interface LoginResult {
  success: boolean
  message: string
  user?: AuthUser
  error?: string
}

/**
 * Signup result interface
 */
export interface SignupResult {
  success: boolean
  message: string
  data?: {
    requiresEmailVerification?: boolean
    user?: AuthUser
  }
  error?: string
}

/**
 * Auth state interface
 */
export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

/**
 * Auth context type
 */
export interface AuthContextType extends AuthState {
  login: (email: string, password: string, captchaToken: string) => Promise<LoginResult>
  logout: () => Promise<void>
  signup: (data: SignupData & { captchaToken: string }) => Promise<SignupResult>
  refreshToken: () => Promise<boolean>
  hasRole: (role: string | string[]) => boolean
  redirectUserByRole: (user: AuthUser) => void
  forceLogout: () => void
} 