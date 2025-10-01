'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services'
import type { 
  AuthUser as User,
  AuthUser 
} from '@/types'

// Define SignupData locally to avoid import issues
interface SignupData {
  fullName: string
  email: string
  password: string
  phone?: string
  captchaToken?: string
}

// Define local AuthState to avoid conflicts
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; message: string; user?: User }>
  logout: () => Promise<void>
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>
  refreshToken: () => Promise<boolean>
  hasRole: (role: string | string[]) => boolean
  redirectBasedOnRole: () => void
  redirectUserByRole: (user: User) => void // Direct redirect with user data
  forceLogout: () => void // Force logout for security violations
}

// Export the User type for backward compatibility
export type { AuthUser as User } from '@/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null
  })
  const router = useRouter()

  // Security: Clear any cached authentication on page refresh if tokens are invalid
  useEffect(() => {
    const clearAuthCache = () => {
      // Clear any cached authentication state
      if (typeof window !== 'undefined') {
        // Check if we're on a public page that doesn't require authentication
        const publicPages = ['/', '/explore', '/about', '/contact', '/signin', '/signup', '/forgot-password', '/reset-password', '/sell', '/help', '/shipping', '/returns', '/sizing', '/privacy', '/terms', '/cookies', '/security']
        const currentPath = window.location.pathname
        const isPublicPage = publicPages.some(page => currentPath === page || currentPath.startsWith('/gem/') || currentPath.startsWith('/static/'))
        
        // Force reload authentication state
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (token) {
          verifyToken(token).then((isValid) => {
            if (!isValid && refreshToken) {
              // Try to refresh token
              handleRefreshToken(refreshToken)
            } else if (!isValid) {
              // Only force logout on protected pages, clear tokens silently on public pages
              if (!isPublicPage) {
                forceLogout()
              } else {
                // Clear invalid tokens silently on public pages
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                setAuthState({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                  token: null
                })
              }
            }
          })
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      }
    }

    clearAuthCache()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Security: Check token validity periodically
  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      const checkTokenValidity = setInterval(async () => {
        const isValid = await verifyToken(authState.token!)
        if (!isValid) {
          console.warn('Token validation failed - checking if on public page')
          
          // Check if we're on a public page
          const publicPages = ['/', '/explore', '/about', '/contact', '/signin', '/signup', '/forgot-password', '/reset-password', '/sell', '/help', '/shipping', '/returns', '/sizing', '/privacy', '/terms', '/cookies', '/security']
          const currentPath = window.location.pathname
          const isPublicPage = publicPages.some(page => currentPath === page || currentPath.startsWith('/gem/') || currentPath.startsWith('/static/'))
          
          if (!isPublicPage) {
            forceLogout()
          } else {
            // Clear authentication silently on public pages
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              token: null
            })
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
          }
        }
      }, 5 * 60 * 1000) // Check every 5 minutes

      return () => clearInterval(checkTokenValidity)
    }
    // Only depend on isAuthenticated to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.isAuthenticated])

  // Validate user data structure
  const validateAuthUser = (userData: unknown): userData is AuthUser => {
    if (!userData || typeof userData !== 'object') return false
    const user = userData as Record<string, unknown>
    return (
      typeof user.id === 'string' &&
      typeof user.email === 'string' &&
      typeof user.fullName === 'string' &&
      typeof user.role === 'string' &&
      ['buyer', 'seller', 'admin'].includes(user.role as string)
    )
  }

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await authService.verifyToken()

      if (response.success && response.data?.user) {
        // Validate user data structure
        if (!validateAuthUser(response.data.user)) {
          console.error('Invalid user data structure received')
          return false
        }

        // Only update state if user data is different or not authenticated
        if (!authState.isAuthenticated || authState.user?.id !== response.data.user.id) {
          setAuthState({
            user: {
              id: response.data.user.id,
              email: response.data.user.email,
              fullName: response.data.user.fullName,
              role: response.data.user.role,
              isEmailVerified: response.data.user.isEmailVerified || false,
              avatar: response.data.user.avatar
            },
            isAuthenticated: true,
            isLoading: false,
            token
          })
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  const handleRefreshToken = async (refreshToken: string): Promise<boolean> => {
    try {
      const response = await authService.refreshToken({ refreshToken })

      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token)
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }
        
        setAuthState({
          user: {
            id: response.data.user.id,
            email: response.data.user.email,
            fullName: response.data.user.fullName,
            role: response.data.user.role,
            isEmailVerified: response.data.user.isEmailVerified,
            avatar: response.data.user.avatar
          },
          isAuthenticated: true,
          isLoading: false,
          token: response.data.token
        })
        return true
      }
      
      // Refresh failed, clear tokens
      forceLogout()
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      forceLogout()
      return false
    }
  }

  const login = async (email: string, password: string, captchaToken?: string) => {
    try {
      const response = await authService.login({ email, password, captchaToken })

      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token)
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }

        const user = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          role: response.data.user.role,
          isEmailVerified: response.data.user.isEmailVerified,
          avatar: response.data.user.avatar
        }

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          token: response.data.token
        })

        return { 
          success: true, 
          message: response.message || 'Login successful',
          user // Return user data directly
        }
      }

      return { success: false, message: response.message || 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  const signup = async (signupData: SignupData) => {
    try {
      const response = await authService.signup({
        fullName: signupData.fullName,
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.password, // Add confirmPassword field
        phone: signupData.phone,
        captchaToken: signupData.captchaToken // Include CAPTCHA token
      })

      if (response.success && response.data) {
        // Check if email verification is required (for buyers)
        if (response.data.requiresEmailVerification) {
          // For buyers who need email verification, don't set tokens or auth state
          return { 
            success: true, 
            message: response.message || 'Signup successful',
            data: { requiresEmailVerification: true, emailSent: response.data.emailSent }
          }
        }

        // For sellers/admins or already verified users, proceed with normal auth flow
        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken)
          }
        }

        const user = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          role: response.data.user.role,
          isEmailVerified: response.data.user.isEmailVerified,
          avatar: response.data.user.avatar
        }

        setAuthState({
          user,
          isAuthenticated: !!response.data.token,
          isLoading: false,
          token: response.data.token || null
        })

        return { success: true, message: response.message || 'Signup successful' }
      }

      return { success: false, message: response.message || 'Signup failed' }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  const logout = async () => {
    try {
      // Call backend logout endpoint to invalidate token server-side
      await authService.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
      // Continue with client-side cleanup even if server call fails
    } finally {
      // Always perform client-side cleanup
      performClientSideLogout()
    }
  }

  const forceLogout = () => {
    console.warn('Performing forced logout due to security violation')
    performClientSideLogout()
  }

  const performClientSideLogout = () => {
    // Clear all client-side storage
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    sessionStorage.clear()
    
    // Clear auth state
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null
    })
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear browser cache for sensitive data
      try {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name)
          })
        })
      } catch (error) {
        console.warn('Could not clear cache:', error)
      }
    }
    
    // Redirect to signin page
    router.push('/signin?message=You have been logged out for security reasons')
  }

  const refreshTokenFn = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return false
    return handleRefreshToken(refreshToken)
  }

  const hasRole = (role: string | string[]): boolean => {
    if (!authState.user) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(authState.user.role)
  }

  const redirectBasedOnRole = () => {
    if (!authState.user) return

    switch (authState.user.role) {
      case 'seller':
        router.push('/seller')
        break
      case 'admin':
        router.push('/admin')
        break
      case 'buyer':
        // Buyers stay on the main site, just redirect to home or previous page
        router.push('/')
        break
      default:
        router.push('/')
    }
  }

  // Direct redirect function that takes user data as parameter
  const redirectUserByRole = (user: User) => {
    switch (user.role) {
      case 'seller':
        router.push('/seller')
        break
      case 'admin':
        router.push('/admin')
        break
      case 'buyer':
        // Buyers stay on the main site, just redirect to home or previous page
        router.push('/')
        break
      default:
        router.push('/')
    }
  }

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    signup,
    refreshToken: refreshTokenFn,
    hasRole,
    redirectBasedOnRole,
    redirectUserByRole,
    forceLogout
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Enhanced HOC for role-based protection with stricter security
export function withRoleGuard<T extends object>(
  Component: React.ComponentType<T>,
  allowedRoles: string[]
) {
  return function GuardedComponent(props: T) {
    const { user, isLoading, hasRole, forceLogout } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          // No user - redirect to signin
          router.push('/signin?message=Please login to access this page')
        } else if (!hasRole(allowedRoles)) {
          // User doesn't have required role - force logout for security
          console.warn(`User ${user.email} attempted to access page requiring roles: ${allowedRoles.join(', ')} but has role: ${user.role}`)
          forceLogout()
        }
      }
    }, [user, isLoading, hasRole, router, forceLogout])

    // Show loading spinner while checking auth
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying authentication...</p>
          </div>
        </div>
      )
    }

    // Don't render anything if user is not authenticated or doesn't have proper role
    if (!user || !hasRole(allowedRoles)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}