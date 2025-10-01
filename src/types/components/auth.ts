/**
 * Auth component-related types and interfaces
 */

// ============================================================================
// User Types (Enhanced for Auth Components)
// ============================================================================

/**
 * User interface for auth components
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
 * Legacy user interface (for backward compatibility)
 */
export interface LegacyUser {
  id: string
  _id: string // Add _id field to match backend user structure
  email: string
  name: string
  role: 'buyer' | 'seller' | 'admin'
}

// ============================================================================
// Auth State Types
// ============================================================================

/**
 * Authentication state interface
 */
export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
}

/**
 * Legacy auth state (for backward compatibility)
 */
export interface LegacyAuthState {
  user: LegacyUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ============================================================================
// Auth Context Types
// ============================================================================

/**
 * Component-specific auth context type with all methods and state
 */
export interface ComponentAuthContextType extends AuthState {
  login: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; message: string; user?: AuthUser }>
  logout: () => Promise<void>
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>
  refreshToken: () => Promise<boolean>
  hasRole: (role: string | string[]) => boolean
  redirectBasedOnRole: () => void
  redirectUserByRole: (user: AuthUser) => void // Direct redirect with user data
  forceLogout: () => void // Force logout for security violations
}

// ============================================================================
// Form Data Types
// ============================================================================

/**
 * Signup form data interface
 */
export interface SignupData {
  fullName: string
  email: string
  password: string
  phone?: string
  captchaToken?: string
}

/**
 * Login form data interface
 */
export interface LoginData {
  email: string
  password: string
  captchaToken?: string
}

// ============================================================================
// HOC Types
// ============================================================================

/**
 * Role guard HOC props
 */
export interface RoleGuardProps {
  allowedRoles: string[]
  fallbackComponent?: React.ComponentType
  loadingComponent?: React.ComponentType
}
