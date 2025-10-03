'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useLoader, useAlert } from '@/components/providers'
import { useCaptcha } from '@/hooks'
import type { LoginResult, SignInFormData } from '@/types'
import TurnstileWidget from './TurnstileWidget'
import GoogleSignInButton from './GoogleSignInButton'
import { env } from '@/config/environment'

export default function SignInForm() {
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const { login, redirectUserByRole } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  const showAlert = useAlert()
  const router = useRouter()

  // Use the new CAPTCHA hook
  const {
    captchaToken,
    isCaptchaLoading,
    captchaKey,
    verifyingDots,
    handleCaptchaVerify,
    handleCaptchaError,
    handleCaptchaExpired,
    resetCaptcha,
    isCaptchaReady
  } = useCaptcha()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Don't show error alert immediately, just return if CAPTCHA isn't ready
    if (!isCaptchaReady) {
      return
    }

    showLoader({
      message: 'Signing you in...',
      subMessage: 'Please wait while we verify your credentials'
    })

    try {
      const result = await login(formData.email, formData.password, captchaToken!)
      
      if (result.success) {
        hideLoader()
        
        // Show success message
        showAlert({
          type: 'success',
          message: 'Successfully signed in!'
        })
        
        // Reset CAPTCHA for future use
        resetCaptcha()
        
        // Redirect immediately using user data from login result (no state dependency)
        if (result.user) {
          redirectUserByRole(result.user)
        }
      } else {
        hideLoader()
        
        // Reset CAPTCHA on any error
        resetCaptcha()
        
        // Check if error is due to unverified email for buyers
        if ((result as LoginResult).error === 'EMAIL_NOT_VERIFIED') {
          showAlert({
            type: 'warning',
            message: result.message
          })
          // Optionally redirect to verification sent page
          setTimeout(() => {
            router.push(`/verify-email/sent?email=${encodeURIComponent(formData.email)}`)
          }, 2000)
        } else {
          showAlert({
            type: 'error',
            message: result.message
          })
        }
      }
    } catch {
      hideLoader()
      
      // Reset CAPTCHA on network error
      resetCaptcha()
      
      showAlert({
        type: 'error',
        message: 'An unexpected error occurred'
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Determine button text and disabled state
  const getButtonState = () => {
    if (isCaptchaLoading) {
      return { text: `Verifying${verifyingDots}`, disabled: true }
    }
    if (!captchaToken) {
      return { text: 'Please wait while we verify your request', disabled: true }
    }
    return { text: 'Sign In', disabled: false }
  }

  const buttonState = getButtonState()

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Google Sign-In Button */}
      <div className="mb-6">
        <GoogleSignInButton buttonText="signin_with" />
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

        {/* Email Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 sm:h-5 w-4 sm:w-5" />
              ) : (
                <Eye className="h-4 sm:h-5 w-4 sm:w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        {/* CAPTCHA Verification */}
        <div className="space-y-1.5 sm:space-y-2">
          <TurnstileWidget
            key={captchaKey}
            siteKey={env.TURNSTILE_SITE_KEY || ''}
            onVerify={handleCaptchaVerify}
            onError={handleCaptchaError}
            onExpired={handleCaptchaExpired}
            theme="auto"
            size="invisible"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={buttonState.disabled}
          className={`w-full py-2.5 sm:py-3 rounded-lg font-medium focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all flex items-center justify-center text-sm sm:text-base ${
            buttonState.disabled
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isCaptchaLoading && (
            <div className="mr-2">
              <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {buttonState.text}
        </button>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
} 