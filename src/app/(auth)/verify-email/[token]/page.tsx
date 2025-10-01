'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, RefreshCw, Mail, ArrowRight } from 'lucide-react'
import { authService } from '@/services'

interface EmailVerificationUser {
  id: string
  email: string
  fullName: string
}

interface VerificationState {
  status: 'loading' | 'success' | 'error' | 'expired' | 'already_verified'
  message: string
  user?: EmailVerificationUser
}

export default function VerifyEmailPage() {
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'loading',
    message: 'Verifying your email address...'
  })
  const [isResending, setIsResending] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const data = await authService.verifyEmail({ token: verificationToken })

      if (data.success) {
        setVerificationState({
          status: data.data?.user?.isEmailVerified ? 'success' : 'already_verified',
          message: data.message,
          user: data.data?.user
        })
      } else {
        // Determine error type for better UX
        if (data.error === 'INVALID_TOKEN' || data.message?.includes('expired')) {
          setVerificationState({
            status: 'expired',
            message: 'This verification link has expired or is invalid.'
          })
        } else {
          setVerificationState({
            status: 'error',
            message: data.message || 'Failed to verify email address.'
          })
        }
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setVerificationState({
        status: 'error',
        message: 'Network error occurred. Please try again.'
      })
    }
  }

  const handleResendVerification = async () => {
    if (!verificationState.user?.email) return

    setIsResending(true)
    try {
      const data = await authService.resendVerificationEmail({ email: verificationState.user.email })

      if (data.success) {
        router.push(`/verify-email/sent?email=${encodeURIComponent(verificationState.user.email)}`)
      }
    } catch (error) {
      console.error('Error resending verification email:', error)
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (verificationState.status) {
      case 'loading':
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verifying Your Email
            </h1>
            <p className="text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          </>
        )

      case 'success':
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Email Verified Successfully!
            </h1>
            <p className="text-muted-foreground mb-6">
              Welcome to Ishq Gems, {verificationState.user?.fullName}! Your email has been verified and your account is now active.
            </p>
            <div className="space-y-4">
              <Link
                href="/signin"
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center"
              >
                Sign In to Your Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Explore Gemstones
                </Link>
              </div>
            </div>
          </>
        )

      case 'already_verified':
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Already Verified
            </h1>
            <p className="text-muted-foreground mb-6">
              Your email address is already verified. You can sign in to your account.
            </p>
            <div className="space-y-4">
              <Link
                href="/signin"
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center"
              >
                Sign In to Your Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </>
        )

      case 'expired':
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verification Link Expired
            </h1>
            <p className="text-muted-foreground mb-6">
              This verification link has expired for security reasons. Don&apos;t worry - we can send you a new one!
            </p>
            <div className="space-y-4">
              <Link
                href="/verify-email/sent"
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Get New Verification Link
              </Link>
              <div className="text-center">
                <Link
                  href="/signin"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </>
        )

      case 'error':
      default:
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verification Failed
            </h1>
            <p className="text-muted-foreground mb-6">
              {verificationState.message}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => verifyEmail(token)}
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              {verificationState.user?.email && (
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full py-3 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send New Link
                    </>
                  )}
                </button>
              )}
              <div className="text-center">
                <Link
                  href="/signin"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {renderContent()}
        </div>

        {/* Help section */}
        <div className="mt-8">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Need help?
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              If you continue to have issues with email verification, please contact our support team.
            </p>
            <Link
              href="/contact"
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 