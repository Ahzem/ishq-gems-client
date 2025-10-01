import { useState, useCallback, useEffect } from 'react'
import { useAlert } from '@/components/providers'
import type { UseCaptchaOptions, UseCaptchaReturn } from '@/types'

export function useCaptcha(options: UseCaptchaOptions = {}): UseCaptchaReturn {
  const { onError, showErrorAlert = true } = options
  const showAlert = useAlert()
  
  // CAPTCHA states
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(true)
  const [captchaError, setCaptchaError] = useState<string | null>(null)
  const [captchaKey, setCaptchaKey] = useState(0)
  const [verifyingDots, setVerifyingDots] = useState('')

  // Animate verifying dots only when CAPTCHA is loading
  useEffect(() => {
    if (!isCaptchaLoading) {
      setVerifyingDots('')
      return
    }

    const interval = setInterval(() => {
      setVerifyingDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isCaptchaLoading])

  // Reset CAPTCHA function
  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null)
    setCaptchaError(null)
    setIsCaptchaLoading(true)
    setCaptchaKey(prev => prev + 1) // Force widget re-render
  }, [])

  // CAPTCHA verification handler
  const handleCaptchaVerify = useCallback((token: string) => {
    console.log('CAPTCHA verified successfully')
    setCaptchaToken(token)
    setCaptchaError(null)
    setIsCaptchaLoading(false)
  }, [])

  // CAPTCHA error handler with retry logic
  const handleCaptchaError = useCallback((error: string) => {
    console.error('CAPTCHA error:', error)
    setCaptchaToken(null)
    
    // Determine if error is retryable and set appropriate message
    let errorMessage = 'CAPTCHA verification failed. Please try again.';
    const shouldShowAlert = showErrorAlert;
    let isRetryable = false;
    
    // Check if error is a specific code that might benefit from retry
    if (error.includes('300010')) {
      errorMessage = 'CAPTCHA verification failed due to client execution error. Please try refreshing the page or disabling browser extensions.';
      isRetryable = true;
    } else if (error.includes('300020') || error.includes('timeout')) {
      errorMessage = 'CAPTCHA verification timed out. Please try again.';
      isRetryable = true;
    } else if (error.includes('300030')) {
      errorMessage = 'CAPTCHA verification failed due to client execution error. Please refresh the page, clear your browser cache, or try incognito mode.';
      isRetryable = true;
    } else if (error.includes('600010') || error.includes('network')) {
      errorMessage = 'CAPTCHA verification failed due to network issues. Please check your internet connection and try again.';
      isRetryable = true;
    } else if (error.startsWith('CAPTCHA verification failed due to')) {
      // This is already a user-friendly message from TurnstileWidget
      errorMessage = error;
    }
    
    setCaptchaError(errorMessage)
    setIsCaptchaLoading(false)
    
    // Call custom error handler if provided
    onError?.(error)
    
    // Show error alert if enabled
    if (shouldShowAlert) {
      showAlert({
        type: 'error',
        message: errorMessage,
        duration: isRetryable ? 8000 : 5000 // Longer duration for retryable errors
      })
    }
  }, [onError, showErrorAlert, showAlert])

  // CAPTCHA expiry handler
  const handleCaptchaExpired = useCallback(() => {
    console.warn('CAPTCHA token expired')
    setCaptchaError('CAPTCHA verification expired. Please try again.')
    resetCaptcha()
  }, [resetCaptcha])

  // Derived state for validation
  const isCaptchaReady = !isCaptchaLoading && !!captchaToken

  return {
    // States
    captchaToken,
    isCaptchaLoading,
    captchaError,
    captchaKey,
    verifyingDots,
    
    // Handlers
    handleCaptchaVerify,
    handleCaptchaError,
    handleCaptchaExpired,
    resetCaptcha,
    
    // Validation
    isCaptchaReady
  }
} 