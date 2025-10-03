'use client'

import { useEffect, useCallback, useRef } from 'react'
import { env } from '@/config/environment'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useLoader, useAlert } from '@/components/providers'
import axios from 'axios'

// Google types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              logo_alignment?: 'left' | 'center'
              width?: number
            }
          ) => void
          prompt: () => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void
  buttonText?: 'signin_with' | 'signup_with' | 'continue_with'
  disabled?: boolean
  className?: string
}

export default function GoogleSignInButton({ 
  onSuccess,
  buttonText = 'signin_with',
  disabled = false,
  className = ''
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const { redirectUserByRole } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  const showAlert = useAlert()

  // Detect theme
  const isDarkTheme = typeof window !== 'undefined' && 
    (document.documentElement.classList.contains('dark') || 
     window.matchMedia('(prefers-color-scheme: dark)').matches)

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    if (disabled) return
    
    showLoader({
      message: 'Signing in with Google...',
      subMessage: 'Please wait while we verify your account'
    })

    try {
      // Send the ID token to our backend
      const result = await axios.post(
        `${env.API_BASE_URL}/auth/google`,
        { idToken: response.credential },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (result.data.success) {
        // Store tokens
        const { token, refreshToken, user, isNewUser } = result.data.data

        localStorage.setItem('token', token)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        // Update auth state immediately (before hiding loader)
        // This ensures the UI updates before redirect
        window.dispatchEvent(new CustomEvent('auth-state-changed', { 
          detail: { user, token, isAuthenticated: true } 
        }))

        hideLoader()

        // Show success message
        showAlert({
          type: 'success',
          message: isNewUser 
            ? 'Account created successfully with Google!' 
            : 'Successfully signed in with Google!'
        })

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }

        // Redirect based on role (reduced timeout since state is already updated)
        setTimeout(() => {
          redirectUserByRole(user)
        }, 500)
      } else {
        hideLoader()
        showAlert({
          type: 'error',
          message: result.data.message || 'Google sign-in failed'
        })
      }
    } catch (error) {
      hideLoader()
      
      let errorMessage = 'Failed to sign in with Google'
      
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error. Please check your connection.'
        } else if (error.response?.status === 429) {
          errorMessage = 'Too many requests. Please try again later.'
        } else if (error.response?.status && error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      }

      showAlert({
        type: 'error',
        message: errorMessage
      })

      console.error('Google sign-in error:', error)
    }
  }, [showLoader, hideLoader, showAlert, redirectUserByRole, onSuccess, disabled])


  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      if (window.google) {
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.google) {
          // Initialize Google Sign-In
          window.google.accounts.id.initialize({
            client_id: env.GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false
          })

          // Render the button
          const buttonDiv = buttonRef.current
          if (buttonDiv) {
            buttonDiv.innerHTML = ''
            window.google.accounts.id.renderButton(buttonDiv, {
              theme: isDarkTheme ? 'filled_black' : 'outline',
              size: 'large',
              text: buttonText,
              shape: 'rectangular',
              logo_alignment: 'left',
              width: buttonDiv.offsetWidth || 350
            })
          }
        }
      }
      script.onerror = () => {
        showAlert({
          type: 'error',
          message: 'Failed to load Google Sign-In. Please check your internet connection.'
        })
      }
      document.body.appendChild(script)
    }

    if (!disabled) {
      loadGoogleScript()
    }
  }, [disabled, handleGoogleResponse, buttonText, isDarkTheme, showAlert])

  // Listen for theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = () => {
      if (window.google && env.GOOGLE_CLIENT_ID) {
        // Re-render button with new theme
        const buttonDiv = buttonRef.current
        if (buttonDiv) {
          buttonDiv.innerHTML = ''
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: mediaQuery.matches ? 'filled_black' : 'outline',
            size: 'large',
            text: buttonText,
            shape: 'rectangular',
            logo_alignment: 'left',
            width: buttonDiv.offsetWidth || 350
          })
        }
      }
    }

    mediaQuery.addEventListener('change', handleThemeChange)
    return () => mediaQuery.removeEventListener('change', handleThemeChange)
  }, [buttonText])

  // Don't render if Google Client ID is not configured
  if (!env.GOOGLE_CLIENT_ID) {
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      <div 
        ref={buttonRef}
        className="google-signin-container"
      />
    </div>
  )
}

