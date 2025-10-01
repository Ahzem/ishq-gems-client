'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Eye, EyeOff, CheckCircle, Lock, User, Mail, Calendar, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlertBox } from '@/components/alerts'
import Spinner from '@/components/loading/Spinner'
import Link from 'next/link'
import sellerService from '@/services/seller.service'

interface SellerInfo {
  fullName: string
  email: string
  expiresAt: string
}

interface FormData {
  password: string
  confirmPassword: string
}

interface FormErrors {
  [key: string]: string
}

export default function SellerSetupPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState<string>('')
  
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiError, setApiError] = useState<string>('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const verifyToken = useCallback(async () => {
    try {
      setIsVerifying(true)
      setTokenError('')

      const response = await sellerService.verifySetupToken(token)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Invalid or expired token')
      }

      setSellerInfo(response.data)
      setIsTokenValid(true)
    } catch (error) {
      console.error('Token verification error:', error)
      setTokenError(error instanceof Error ? error.message : 'Failed to verify token')
      setIsTokenValid(false)
    } finally {
      setIsVerifying(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      verifyToken()
    }
  }, [token, verifyToken])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setApiError('')
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      const response = await sellerService.completeSetup({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })
      
      if (!response.success) {
        // Handle validation errors from the API
        if (response.message && response.message.includes('validation')) {
          // If it's a validation error, try to extract field-specific errors
          // This is a fallback - ideally the API would return structured error details
          if (response.message.toLowerCase().includes('password')) {
            setErrors({ password: response.message })
            return
          }
        }
        
        throw new Error(response.message || 'Failed to setup account')
      }
      
      setIsSuccess(true)
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/signin?message=Account created successfully. Please sign in.')
      }, 3000)
      
    } catch (error) {
      console.error('Setup account error:', error)
      setApiError(error instanceof Error ? error.message : 'Failed to setup account')
    } finally {
      setIsLoading(false)
    }
  }

  const formatExpiryTime = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diffMs = expiry.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffMs <= 0) {
      return 'Expired'
    }
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m remaining`
    }
    
    return `${diffMinutes}m remaining`
  }

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" text="Verifying your invitation..." />
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
              Invalid or Expired Link
            </h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {tokenError || 'This setup link is no longer valid. Please contact support if you need assistance.'}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
            >
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
              Account Created Successfully!
            </h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your seller account has been set up. You can now sign in and start selling on Ishq Gems.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to sign in page in a few seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main setup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border/50 rounded-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              Complete Your Account Setup
            </h1>
            <p className="text-muted-foreground">
              Welcome to Ishq Gems! Set your password to activate your seller account.
            </p>
          </div>

          {/* Seller Info */}
          {sellerInfo && (
            <div className="bg-secondary/20 border border-border/30 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{sellerInfo.fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{sellerInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Link expires: {formatExpiryTime(sellerInfo.expiresAt)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {apiError && (
            <div className="mb-6">
              <AlertBox
                type="error"
                message={apiError}
                onClose={() => setApiError('')}
                placement="inline"
              />
            </div>
          )}

          {/* Setup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-12 py-3 bg-background/50 border rounded-xl placeholder:text-muted-foreground text-foreground",
                    "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-primary/50",
                    errors.password ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.password}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-12 py-3 bg-background/50 border rounded-xl placeholder:text-muted-foreground text-foreground",
                    "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-primary/50",
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2',
                'bg-gradient-to-r from-primary to-accent text-primary-foreground',
                'hover:from-accent hover:to-primary hover:shadow-xl hover:shadow-primary/30',
                'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
                'transform hover:scale-[1.02] active:scale-[0.98]',
                isLoading && 'animate-pulse'
              )}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" variant="minimal" className="bg-transparent p-0" />
                  Setting up your account...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Need help? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 