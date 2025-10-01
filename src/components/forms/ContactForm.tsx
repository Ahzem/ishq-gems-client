'use client'

import { useState } from 'react'
import { User, Mail, Phone, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCaptcha } from '@/hooks'
import type { ContactFormData, ContactFormErrors } from '@/types'
import TurnstileWidget from './TurnstileWidget'
import { env } from '@/config/environment'

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  })
  
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: ContactFormErrors = {}

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = 'Message must be less than 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Check CAPTCHA verification
    if (!isCaptchaReady) {
      return
    }

    setIsLoading(true)
    
    try {
      // TODO: Replace with actual API call
      // This is where you would integrate with your backend or email service
      console.log('Contact form data:', { ...formData, captchaToken })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSubmitted(true)
      
      // Reset form after successful submission
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        message: ''
      })
      
      // Reset CAPTCHA
      resetCaptcha()
      
    } catch (_error) {
      console.error('Error submitting contact form:', _error)
      
      // Reset CAPTCHA on error
      resetCaptcha()
      
      // Handle error (show toast notification, etc.)
    } finally {
      setIsLoading(false)
    }
  }

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

  // Determine button text and disabled state
  const getButtonState = () => {
    if (isLoading) {
      return { text: 'Sending Message...', disabled: true }
    }
    if (isCaptchaLoading) {
      return { text: `Verifying${verifyingDots}`, disabled: true }
    }
    if (!captchaToken) {
      return { text: 'Please wait while we verify your request', disabled: true }
    }
    return { text: 'Send Message', disabled: false }
  }

  const buttonState = getButtonState()

  // Success state
  if (isSubmitted) {
    return (
      <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
        <div className="text-center">
          <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-8 sm:w-10 h-8 sm:h-10 text-green-500" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
            Message Sent Successfully!
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed px-2">
            Thank you for reaching out to us. We&apos;ve received your message and will get back to you within 24 hours.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-sm sm:text-base"
          >
            Send Another Message
          </button>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-green-500 to-green-600 opacity-60 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
          Send us a Message
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Fill out the form below and we&apos;ll get back to you as soon as possible
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        
        {/* Full Name */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
            </div>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={cn(
                "w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-background/50 border rounded-lg sm:rounded-xl placeholder:text-muted-foreground text-foreground text-sm sm:text-base",
                "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300",
                "hover:border-primary/50",
                errors.fullName 
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" 
                  : "border-border focus:ring-primary/20 focus:border-primary"
              )}
              required
            />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={cn(
                "w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-background/50 border rounded-lg sm:rounded-xl placeholder:text-muted-foreground text-foreground text-sm sm:text-base",
                "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300",
                "hover:border-primary/50",
                errors.email 
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" 
                  : "border-border focus:ring-primary/20 focus:border-primary"
              )}
              required
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-foreground">
            Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
            </div>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-background/50 border border-border rounded-lg sm:rounded-xl placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-primary/50 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="message" className="block text-sm font-medium text-foreground">
            Message <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute top-2.5 sm:top-3 left-3 pointer-events-none">
              <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
            </div>
            <textarea
              id="message"
              rows={5}
              placeholder="Tell us about your inquiry, what type of gemstones you're looking for, or any questions you have..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className={cn(
                "w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-background/50 border rounded-lg sm:rounded-xl placeholder:text-muted-foreground text-foreground resize-none text-sm sm:text-base",
                "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300",
                "hover:border-primary/50",
                errors.message 
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" 
                  : "border-border focus:ring-primary/20 focus:border-primary"
              )}
              required
            />
          </div>
          <div className="flex justify-between items-center gap-2">
            {errors.message ? (
              <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1 flex-1">
                <span className="w-1 h-1 bg-red-500 rounded-full flex-shrink-0"></span>
                <span className="truncate">{errors.message}</span>
              </p>
            ) : (
              <div className="flex-1"></div>
            )}
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formData.message.length}/1000
            </span>
          </div>
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
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {isLoading && !isCaptchaLoading && (
            <div className="mr-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {!isLoading && !isCaptchaLoading && (
            <Send className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
          )}
          {buttonState.text}
        </button>
      </form>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  )
} 