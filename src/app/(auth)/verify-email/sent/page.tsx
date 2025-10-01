'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Clock, RefreshCw, ArrowLeft } from 'lucide-react'
import { authService } from '@/services'

function VerificationSentContent() {
  const [isResending, setIsResending] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [countdown, setCountdown] = useState(0)
  const [email, setEmail] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email from URL params if available
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [countdown, canResend])

  const handleResendEmail = async () => {
    if (!canResend || !email) return

    setIsResending(true)
    try {
      const response = await authService.resendVerificationEmail({ email: email as string })

      if (response.success) {
        setResendCount(prev => prev + 1)
        setCanResend(false)
        setCountdown(60) // 60 second cooldown
      }
    } catch (error) {
      console.error('Error resending verification email:', error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Check Your Email
          </h1>
          <p className="text-muted-foreground">
            We &apos;ve sent a verification link to{' '}
            {email ? (
              <span className="font-medium text-foreground">{email}</span>
            ) : (
              'your email address'
            )}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Click the verification link
              </h3>
              <p className="text-sm text-muted-foreground">
                Open the email and click the <span className="font-bold">Verify Email Address</span> button to activate your account.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Check your spam folder
              </h3>
              <p className="text-sm text-muted-foreground">
                Sometimes emails end up in spam. Look for an email from Ishq Gems.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Link expires in 24 hours
              </h3>
              <p className="text-sm text-muted-foreground">
                For security, the verification link will expire after 24 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={!canResend || isResending || !email}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                {canResend ? 'Resend Email' : `Resend in ${countdown}s`}
              </>
            )}
          </button>

          {resendCount > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Email sent {resendCount} time{resendCount > 1 ? 's' : ''}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/signin"
              className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Still need help?
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
              If you continue to have issues, please contact our support team.
            </p>
            <Link
              href="/contact"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerificationSentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we load your verification status.</p>
        </div>
      </div>
    }>
      <VerificationSentContent />
    </Suspense>
  )
} 