'use client'

import { useEffect, useRef, useCallback } from 'react'
import type {
  TurnstileOptions,
  TurnstileWidgetProps,
  TurnstileElement,
} from '@/types'

/**
 * Turnstile CAPTCHA Widget Component
 * 
 * This component provides Cloudflare Turnstile CAPTCHA integration
 * for spam protection. Uses invisible mode by default.
 */
export default function TurnstileWidget({
  siteKey,
  onVerify,
  onError,
  onExpired,
  theme = 'auto',
  size = 'invisible',
  className = '',
  id = 'turnstile-widget'
}: TurnstileWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoadedRef = useRef<boolean>(false)
  const retryCountRef = useRef(0)
  const maxRetries = 2
  
  // Store callback refs to avoid dependency issues
  const onVerifyRef = useRef(onVerify)
  const onErrorRef = useRef(onError)
  const onExpiredRef = useRef(onExpired)
  
  // Update refs when callbacks change
  useEffect(() => {
    onVerifyRef.current = onVerify
    onErrorRef.current = onError
    onExpiredRef.current = onExpired
  }, [onVerify, onError, onExpired])

  // Load Turnstile script
  const loadTurnstileScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if Turnstile is already available
      if (window.turnstile) {
        resolve()
        return
      }

      // Check if script is already in DOM
      const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')
      if (existingScript) {
        // Wait for existing script to load
        if (window.turnstile) {
          resolve()
        } else {
          const checkTurnstile = () => {
            if (window.turnstile) {
              resolve()
            } else {
              setTimeout(checkTurnstile, 50)
            }
          }
          checkTurnstile()
        }
        return
      }

      // Create and load script (without async/defer attributes)
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      
      script.onload = () => {
        scriptLoadedRef.current = true
        // Wait a bit more for Turnstile to be fully ready
        const checkTurnstile = () => {
          if (window.turnstile) {
            resolve()
          } else {
            setTimeout(checkTurnstile, 50)
          }
        }
        setTimeout(checkTurnstile, 100)
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load Turnstile script'))
      }
      
      document.head.appendChild(script)
    })
  }, [])

  // Render the widget
  const renderWidget = useCallback(() => {
    if (!window.turnstile || !widgetRef.current || !siteKey) {
      console.warn('Turnstile not available or missing required props')
      return
    }

    try {
      // Remove existing widget if present
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }

      // Configure widget options
      const options: TurnstileOptions = {
        sitekey: siteKey,
        callback: (token: string) => {
          // Reset retry count on successful verification
          retryCountRef.current = 0;
          onVerifyRef.current?.(token);
        },
        'error-callback': (error: string) => {
          console.error('Turnstile error:', error)
          
           // Check if error is retryable
           const retryableErrors = ['300010', '300020', '300030', '600010'];
           const isRetryable = retryableErrors.some(code => error.includes(code));
          
          // Map specific error codes to user-friendly messages
          let userMessage = error;
          switch (error) {
            case '300010':
              userMessage = 'CAPTCHA verification failed due to client execution error. Please try refreshing the page or disabling browser extensions.';
              break;
            case '300020':
              userMessage = 'CAPTCHA verification timed out. Please try again.';
              break;
             case '300030':
               userMessage = 'CAPTCHA verification failed due to client execution error. Please refresh the page, clear your browser cache, or try incognito mode.';
               break;
            case '600010':
              userMessage = 'CAPTCHA verification failed due to network issues. Please check your internet connection.';
              break;
            default:
              userMessage = `CAPTCHA verification failed (Error: ${error}). Please try again.`;
          }
          
          // Attempt automatic retry for retryable errors
          if (isRetryable && retryCountRef.current < maxRetries) {
            retryCountRef.current += 1;
            console.log(`Attempting retry ${retryCountRef.current}/${maxRetries} for error: ${error}`);
            
            // Wait a bit before retrying
            setTimeout(() => {
              try {
                if (window.turnstile && widgetIdRef.current) {
                  window.turnstile.reset(widgetIdRef.current);
                }
              } catch (retryError) {
                console.error('Error during retry:', retryError);
                onErrorRef.current?.(userMessage);
              }
            }, 1000 * retryCountRef.current); // Exponential backoff
            
            return; // Don't call error handler yet, we're retrying
          }
          
          // Reset retry count for next attempt
          retryCountRef.current = 0;
          onErrorRef.current?.(userMessage)
        },
        'expired-callback': () => {
          console.warn('Turnstile token expired')
          onExpiredRef.current?.()
        },
        theme,
        size,
        retry: 'auto',
        'refresh-expired': 'auto'
      }

      // Render the widget
      widgetIdRef.current = window.turnstile.render(widgetRef.current, options)
      
      console.log('Turnstile widget rendered successfully')
    } catch (error) {
      console.error('Failed to render Turnstile widget:', error)
      onErrorRef.current?.(`Failed to render CAPTCHA: ${error}`)
    }
  }, [siteKey, theme, size])

  // Initialize widget
  useEffect(() => {
    const initializeWidget = async () => {
      try {
        await loadTurnstileScript()
        
        if (window.turnstile) {
          // Script is loaded and Turnstile is available, render widget
          renderWidget()
        } else {
          throw new Error('Turnstile not available after script load')
        }
      } catch (error) {
        console.error('Failed to initialize Turnstile:', error)
        onErrorRef.current?.(`Failed to initialize CAPTCHA: ${error}`)
      }
    }

    if (siteKey) {
      initializeWidget()
    } else {
      console.warn('Turnstile site key is missing')
      onErrorRef.current?.('CAPTCHA configuration error')
    }

    // Cleanup function
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (error) {
          console.warn('Error cleaning up Turnstile widget:', error)
        }
      }
    }
  }, [siteKey, loadTurnstileScript, renderWidget])

  // Reset widget function (can be called externally)
  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current)
      } catch (error) {
        console.error('Failed to reset Turnstile widget:', error)
      }
    }
  }, [])

  // Get current response token
  const getResponse = useCallback((): string | null => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        return window.turnstile.getResponse(widgetIdRef.current)
      } catch (error) {
        console.error('Failed to get Turnstile response:', error)
      }
    }
    return null
  }, [])

  // Expose methods via ref if needed
  useEffect(() => {
    const element = widgetRef.current
    if (element) {
      // Attach helper methods to the DOM element for external access
      ;(element as TurnstileElement).turnstileReset = reset
      ;(element as TurnstileElement).turnstileGetResponse = getResponse
    }
  }, [reset, getResponse])

  return (
    <div className={`turnstile-container ${className}`}>
      <div 
        ref={widgetRef} 
        id={id}
        className="turnstile-widget"
        data-testid="turnstile-widget"
      />
      {/* Hidden input for form compatibility */}
      <input 
        type="hidden" 
        name="cf-turnstile-response" 
        value=""
        data-turnstile-input
      />
    </div>
  )
}

// Export widget reference type for external use
// TurnstileWidgetRef is now imported from @/types 