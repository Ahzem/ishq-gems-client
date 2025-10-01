'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useLoader, useAlert } from '@/components/providers'
import { useCaptcha } from '@/hooks'
import type { SignupResult, SignUpFormData } from '@/types'
import TurnstileWidget from './TurnstileWidget'
import { env } from '@/config/environment'

export default function SignUpForm() {
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    captchaToken: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const { signup } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  const showAlert = useAlert()
  const router = useRouter()

  // Use the new CAPTCHA hook
  const {
    captchaToken,
    isCaptchaLoading,
    captchaError,
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
    setError('')
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      showAlert({
        type: 'error',
        message: 'Passwords do not match'
      })
      return
    }

    // Don't show error alert immediately, just return if CAPTCHA isn't ready
    if (!isCaptchaReady) {
      return
    }

    showLoader({
      message: 'Creating your account...',
      subMessage: 'Please wait while we set up your profile'
    })

    try {
      const result = await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        captchaToken: captchaToken! // Include CAPTCHA token in signup request
      })
      
      if (result.success) {
        hideLoader()
        
        // Reset CAPTCHA for future use
        resetCaptcha()
        
        // Show success message
        showAlert({
          type: 'success',
          message: 'Account created successfully!'
        })
        
        // Check if this is a buyer signup that requires email verification
        if ((result as SignupResult).data?.requiresEmailVerification) {
          // Redirect to verification sent page
          setTimeout(() => {
            router.push(`/verify-email/sent?email=${encodeURIComponent(formData.email)}`)
          }, 1000)
        } else {
          // For other roles (sellers/admins), redirect based on role
          setTimeout(() => {
            router.push('/')
          }, 1000)
        }
      } else {
        hideLoader()
        
        // Reset CAPTCHA on error
        resetCaptcha()
        
        showAlert({
          type: 'error',
          message: result.message
        })
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
    return { text: 'Create Account', disabled: false }
  }

  const buttonState = getButtonState()

  return (
    <div className="w-full max-w-md mx-auto">
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {error && (
          <div className="p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Full Name Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-foreground">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="Enter your full name"
              required
            />
          </div>
          </div>

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

        {/* Phone Field (Optional) */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
          </label>
        <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="Enter your phone number"
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
              minLength={8}
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
          <p className="text-xs text-muted-foreground px-1">
            Password must be at least 8 characters with uppercase, lowercase, number, and special character
          </p>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Confirm Password
          </label>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
          <input
              id="confirmPassword"
              name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 sm:h-5 w-4 sm:w-5" />
              ) : (
                <Eye className="h-4 sm:h-5 w-4 sm:w-5" />
              )}
          </button>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="text-xs sm:text-sm text-muted-foreground px-1">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
                Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                Privacy Policy
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
          {captchaError && (
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{captchaError}</p>
          )}
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

        {/* Sign In Link */}
      <div className="text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link 
            href="/signin" 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </form>
      </div>
  )
} 