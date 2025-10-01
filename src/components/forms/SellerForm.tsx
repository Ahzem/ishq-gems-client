'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, IdCard, Calendar, FileText, Upload, MessageSquare, Globe, Check, Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCaptcha } from '@/hooks'
import { useAuth } from '@/features/auth/hooks/useAuth'
import AlertBox from '@/components/alerts/AlertBox'
import Spinner from '@/components/loading/Spinner'
import TurnstileWidget from './TurnstileWidget'
import sellerService from '@/services/seller.service'
import type { ApiValidationErrorResponse } from '@/types/api/responses'
import type { SellerFormData, SellerFormErrors, SellerFormProps } from '@/types'
import { env } from '@/config/environment'

export default function SellerForm({ 
  mode = 'new', 
  existingEmail = '', 
  existingFullName = '' 
}: SellerFormProps) {
  const { user, isAuthenticated } = useAuth()
  
  // Check if user is signed in as a buyer
  const isSignedInBuyer = isAuthenticated && user?.role === 'buyer'
  
  const [formData, setFormData] = useState<SellerFormData>({
    fullName: existingFullName || (isSignedInBuyer ? user.fullName : ''),
    email: existingEmail || (isSignedInBuyer ? user.email : ''),
    phone: isSignedInBuyer && user.phone ? user.phone : '',
    nicNumber: '',
    dateOfBirth: '',
    hasNGJALicense: false,
    ngjaLicenseNumber: '',
    yearsOfExperience: '',
    gemstoneTypes: [],
    nicFront: null,
    nicBack: null,
    ngjaLicense: null,
    sampleCertificate: null,
    whyJoin: '',
    preferredLanguage: 'English',
    confirmAccuracy: false
  })

  const [errors, setErrors] = useState<SellerFormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string>('')

  const isBuyerUpgrade = mode === 'buyer-upgrade'

  // Update form data when user authentication state changes
  useEffect(() => {
    if (isSignedInBuyer && user) {
      setFormData(prev => ({
        ...prev,
        fullName: existingFullName || user.fullName,
        email: existingEmail || user.email,
        phone: user.phone || prev.phone
      }))
    }
  }, [isSignedInBuyer, user, existingFullName, existingEmail])

  const experienceOptions = [
    '0-1 years',
    '1-3 years',
    '3-5 years',
    '5-10 years',
    '10+ years'
  ]

  const gemstoneOptions = [
    'Sapphires',
    'Rubies',
    'Spinels',
    'Moonstones',
    'Emeralds',
    'Garnets',
    'Tourmalines',
    'Others'
  ]

  const languageOptions = [
    'English',
    'Sinhala',
    'Tamil',
    'Hindi'
  ]

  const validateForm = (): boolean => {
    const newErrors: SellerFormErrors = {}

    // Personal Information
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.nicNumber.trim()) {
      newErrors.nicNumber = 'NIC number is required'
    }

    // Business Details
    if (formData.hasNGJALicense && !formData.ngjaLicenseNumber.trim()) {
      newErrors.ngjaLicenseNumber = 'NGJA license number is required when you have a license'
    }

    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Please select your years of experience'
    }

    if (formData.gemstoneTypes.length === 0) {
      newErrors.gemstoneTypes = 'Please select at least one gemstone type'
    }

    // Documents
    if (!formData.nicFront) {
      newErrors.nicFront = 'NIC front image is required'
    }

    if (!formData.nicBack) {
      newErrors.nicBack = 'NIC back image is required'
    }

    if (formData.hasNGJALicense && !formData.ngjaLicense) {
      newErrors.ngjaLicense = 'NGJA license document is required when you have a license'
    }

    // Additional
    if (!formData.whyJoin.trim()) {
      newErrors.whyJoin = 'Please tell us why you want to join'
    } else if (formData.whyJoin.trim().length < 50) {
      newErrors.whyJoin = 'Please provide at least 50 characters'
    }

    if (!formData.confirmAccuracy) {
      newErrors.confirmAccuracy = 'You must confirm that all details are accurate'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof SellerFormData, value: string | boolean | string[] | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleGemstoneChange = (gemstone: string, checked: boolean) => {
    const updatedTypes = checked 
      ? [...formData.gemstoneTypes, gemstone]
      : formData.gemstoneTypes.filter(type => type !== gemstone)
    
    handleInputChange('gemstoneTypes', updatedTypes)
  }

  const handleFileChange = (field: keyof SellerFormData, file: File | null) => {
    handleInputChange(field, file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear any previous API errors
    setApiError('')
    
    if (!validateForm()) {
      return
    }

    // Check CAPTCHA verification
    if (!isCaptchaReady) {
      setApiError('Please wait for CAPTCHA verification to complete.')
      return
    }

    setIsLoading(true)
    
    try {
      // Create FormData for multipart/form-data submission
      const formDataToSend = new FormData()
      
      // Add text fields
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('nicNumber', formData.nicNumber)
      if (formData.dateOfBirth) {
        formDataToSend.append('dateOfBirth', formData.dateOfBirth)
      }
      formDataToSend.append('hasNGJALicense', String(formData.hasNGJALicense))
      if (formData.ngjaLicenseNumber) {
        formDataToSend.append('ngjaLicenseNumber', formData.ngjaLicenseNumber)
      }
      formDataToSend.append('yearsOfExperience', formData.yearsOfExperience)
      formDataToSend.append('gemstoneTypes', JSON.stringify(formData.gemstoneTypes))
      formDataToSend.append('whyJoin', formData.whyJoin)
      formDataToSend.append('preferredLanguage', formData.preferredLanguage)
      formDataToSend.append('confirmAccuracy', String(formData.confirmAccuracy))
      
      // Add CAPTCHA token
      formDataToSend.append('captchaToken', captchaToken!)

      // Add mode flag for backend processing
      if (isBuyerUpgrade) {
        formDataToSend.append('applicationMode', 'buyer-upgrade')
      }

      // Add files
      if (formData.nicFront) {
        formDataToSend.append('nicFront', formData.nicFront)
      }
      if (formData.nicBack) {
        formDataToSend.append('nicBack', formData.nicBack)
      }
      if (formData.ngjaLicense) {
        formDataToSend.append('ngjaLicense', formData.ngjaLicense)
      }
      if (formData.sampleCertificate) {
        formDataToSend.append('sampleCertificate', formData.sampleCertificate)
      }

      // Submit to API using seller service
      const response = await sellerService.applyAsSeller(formDataToSend)

      if (!response.success) {
        // Reset CAPTCHA on API error
        resetCaptcha()
        
        // Handle API validation errors
        const responseWithDetails = response as ApiValidationErrorResponse<{ message: string }>;
        if (responseWithDetails.details && Array.isArray(responseWithDetails.details)) {
          const newErrors: SellerFormErrors = {}
          const errorMessages: string[] = []
          
          responseWithDetails.details.forEach((detail: { field?: string; message: string }) => {
            if (detail.field) {
              newErrors[detail.field] = detail.message
              errorMessages.push(detail.message)
            } else {
              errorMessages.push(detail.message)
            }
          })

          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            // Show summary alert for validation errors
            setApiError(`Please fix the following errors: ${errorMessages.join(', ')}`)
            return
          }
        }
        
        throw new Error(response.message || 'Failed to submit application')
      }
      
      setIsSubmitted(true)
      
      // Show success alert briefly before showing the success page
      setTimeout(() => {
        // The success state will be shown
      }, 100)
      
    } catch (error) {
      console.error('Error submitting seller application:', error)
      
      // Reset CAPTCHA on any error
      resetCaptcha()
      
      // Handle specific error types
      let errorMessage = 'An unexpected error occurred'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Upload timeout - File upload is taking longer than expected. Please check your internet connection and try again with smaller files if possible.'
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error - Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      setApiError(errorMessage)
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
      return { text: apiError ? 'Retrying...' : 'Uploading Documents & Submitting Application...', disabled: true }
    }
    if (isCaptchaLoading) {
      return { text: `Verifying${verifyingDots}`, disabled: true }
    }
    if (!captchaToken) {
      return { text: 'Please wait while we verify your request', disabled: true }
    }
    return { text: 'Submit Application', disabled: false }
  }

  const buttonState = getButtonState()

  // Success state
  if (isSubmitted) {
    return (
      <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
        {/* Success Alert */}
        <div className="mb-4 sm:mb-6">
          <AlertBox
            type="success"
            message={isBuyerUpgrade 
              ? "Upgrade application submitted successfully! We'll review your request and upgrade your account once approved." 
              : "Application submitted successfully! Thank you for your interest in becoming a verified seller."
            }
            autoDismiss={false}
            placement="inline"
          />
        </div>

        <div className="text-center">
          <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-8 sm:w-10 h-8 sm:h-10 text-green-500" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            {isBuyerUpgrade ? "Upgrade Request Submitted!" : "Application Submitted Successfully!"}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed max-w-2xl mx-auto px-2">
            {isBuyerUpgrade 
              ? "Thank you for your interest in becoming a seller! Our team will review your application and upgrade your account to seller status. You'll receive an email notification once your application is approved."
              : "Thank you for your interest in becoming a verified seller on Ishq Gems. Our team will review your information and contact you for verification within 2–3 business days."
            }
          </p>
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-md mx-auto">
            <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">What happens next?</h4>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 text-left">
              <li>• Document verification (1-2 days)</li>
              <li>• Background check</li>
              <li>• Video call interview</li>
              {isBuyerUpgrade 
                ? <li>• Account upgrade & seller dashboard access</li>
                : <li>• Account setup & training</li>
              }
            </ul>
          </div>
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
          {isBuyerUpgrade ? "Seller Upgrade Application" : "Seller Application Form"}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {isBuyerUpgrade 
            ? "Complete this form to upgrade your buyer account to a seller account with full privileges."
            : "Please fill out all required fields. Our team will review your application carefully."
          }
        </p>
        
        {/* Signed-in Buyer Info */}
        {isSignedInBuyer && (
          <div className="mt-4">
            <AlertBox
              type="info"
              message={`Welcome! We've automatically filled in your name and email from your account${user?.phone ? ', and phone number' : ''}. You can review and complete the remaining fields below.`}
              autoDismiss={false}
              placement="inline"
            />
          </div>
        )}

        {/* API Error Display */}
        {apiError && (
          <div className="mt-4">
            <AlertBox
              type="error"
              message={`Application Failed: ${apiError}. Please correct the errors and try again.`}
              onClose={() => setApiError('')}
              autoDismiss={false}
              placement="inline"
            />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        
        {/* Personal Information */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground border-b border-border/30 pb-2">
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Name */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                Full Name <span className="text-red-500">*</span>
                {isSignedInBuyer && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Auto-filled from your account)</span>
                )}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  readOnly={isSignedInBuyer}
                  className={cn(
                    "w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl placeholder:text-muted-foreground text-foreground text-sm sm:text-base",
                    "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300",
                    isSignedInBuyer 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 cursor-not-allowed" 
                      : "bg-background/50 hover:border-primary/50",
                    errors.fullName ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
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
                {isSignedInBuyer && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Auto-filled from your account)</span>
                )}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  readOnly={isSignedInBuyer}
                  className={cn(
                    "w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl placeholder:text-muted-foreground text-foreground text-sm sm:text-base",
                    "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300",
                    isSignedInBuyer 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 cursor-not-allowed" 
                      : "bg-background/50 hover:border-primary/50",
                    errors.email ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
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

            {/* Phone */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                Phone Number <span className="text-red-500">*</span>
                {isSignedInBuyer && user?.phone && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Auto-filled from your account)</span>
                )}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="+94 77 123 4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  readOnly={isSignedInBuyer && !!user?.phone}
                  className={cn(
                    "w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl placeholder:text-muted-foreground text-foreground text-sm sm:text-base",
                    "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300",
                    isSignedInBuyer && user?.phone
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 cursor-not-allowed" 
                      : "bg-background/50 hover:border-primary/50",
                    errors.phone ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
                  )}
                  required
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* NIC Number */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="nicNumber" className="block text-sm font-medium text-foreground">
                NIC Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IdCard className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                <input
                  id="nicNumber"
                  type="text"
                  placeholder="123456789V or 123456789012"
                  value={formData.nicNumber}
                  onChange={(e) => handleInputChange('nicNumber', e.target.value)}
                  className={cn(
                    "w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-background/50 border rounded-lg sm:rounded-xl placeholder:text-muted-foreground text-foreground text-sm sm:text-base",
                    "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-primary/50",
                    errors.nicNumber ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
                  )}
                  required
                />
              </div>
              {errors.nicNumber && (
                <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.nicNumber}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground">
                Date of Birth <span className="text-muted-foreground text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                <input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-background/50 border border-border rounded-lg sm:rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-primary/50 text-sm sm:text-base"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Business Details */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground border-b border-border/30 pb-2">
            Business Details
          </h3>

          {/* NGJA License */}
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Do you have an NGJA License? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasNGJALicense"
                    checked={formData.hasNGJALicense}
                    onChange={() => handleInputChange('hasNGJALicense', true)}
                    className="w-4 h-4 text-primary focus:ring-primary/20"
                  />
                  <span className="text-foreground text-sm sm:text-base">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasNGJALicense"
                    checked={!formData.hasNGJALicense}
                    onChange={() => handleInputChange('hasNGJALicense', false)}
                    className="w-4 h-4 text-primary focus:ring-primary/20"
                  />
                  <span className="text-foreground text-sm sm:text-base">No</span>
                </label>
              </div>
            </div>

            {/* NGJA License Number */}
            {formData.hasNGJALicense && (
              <>
                <div className="mb-4">
                  <AlertBox
                    type="info"
                    message="Please provide your NGJA license number and upload the license document below."
                    autoDismiss={false}
                    placement="inline"
                  />
                </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="ngjaLicenseNumber" className="block text-sm font-medium text-foreground">
                  NGJA License Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                  <input
                    id="ngjaLicenseNumber"
                    type="text"
                    placeholder="Enter your NGJA license number"
                    value={formData.ngjaLicenseNumber}
                    onChange={(e) => handleInputChange('ngjaLicenseNumber', e.target.value)}
                    className={cn(
                      "w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-background/50 border rounded-lg sm:rounded-xl placeholder:text-muted-foreground text-foreground text-sm sm:text-base",
                      "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-primary/50",
                      errors.ngjaLicenseNumber ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
                    )}
                    required
                  />
                </div>
                {errors.ngjaLicenseNumber && (
                  <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.ngjaLicenseNumber}
                  </p>
                )}
              </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Years of Experience */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-foreground">
                Years of Experience in Gem Trade <span className="text-red-500">*</span>
              </label>
              <select
                id="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                className={cn(
                  "w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background/50 border rounded-lg sm:rounded-xl text-foreground text-sm sm:text-base",
                  "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-primary/50",
                  errors.yearsOfExperience ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
                )}
                required
              >
                <option value="">Select experience level</option>
                {experienceOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.yearsOfExperience && (
                <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.yearsOfExperience}
                </p>
              )}
            </div>

            {/* Preferred Language */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="preferredLanguage" className="block text-sm font-medium text-foreground">
                Preferred Language for Communication
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                <select
                  id="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-background/50 border border-border rounded-lg sm:rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:border-primary/50 text-sm sm:text-base"
                >
                  {languageOptions.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Gemstone Types */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Gemstone Types You Sell <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {gemstoneOptions.map(gemstone => (
                <label key={gemstone} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.gemstoneTypes.includes(gemstone)}
                    onChange={(e) => handleGemstoneChange(gemstone, e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary/20 rounded"
                  />
                  <span className="text-foreground text-xs sm:text-sm">{gemstone}</span>
                </label>
              ))}
            </div>
            {errors.gemstoneTypes && (
              <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.gemstoneTypes}
              </p>
            )}
          </div>
        </div>

        {/* Document Uploads */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground border-b border-border/30 pb-2">
            Supporting Documents
          </h3>

          {/* File Upload Guidelines */}
          <AlertBox
            type="warning"
            message="Please ensure all documents are clear and readable. Accepted formats: JPEG, PNG, PDF. Maximum file size: 5MB per file."
            autoDismiss={false}
            placement="inline"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* NIC Front */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-foreground">
                NIC Front Side <span className="text-red-500">*</span>
              </label>
              <div className={cn(
                "border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center transition-all duration-300 hover:border-primary/50",
                errors.nicFront ? "border-red-500" : "border-border",
                formData.nicFront ? "border-green-500 bg-green-500/5" : ""
              )}>
                <Upload className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 px-2">
                  {formData.nicFront ? formData.nicFront.name : 'Drop file here or click to upload'}
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('nicFront', e.target.files?.[0] || null)}
                  className="hidden"
                  id="nicFront"
                />
                <label htmlFor="nicFront" className="cursor-pointer text-primary hover:text-accent transition-colors text-sm sm:text-base">
                  Choose File
                </label>
              </div>
              {errors.nicFront && (
                <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.nicFront}
                </p>
              )}
            </div>

            {/* NIC Back */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-foreground">
                NIC Back Side <span className="text-red-500">*</span>
              </label>
              <div className={cn(
                "border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center transition-all duration-300 hover:border-primary/50",
                errors.nicBack ? "border-red-500" : "border-border",
                formData.nicBack ? "border-green-500 bg-green-500/5" : ""
              )}>
                <Upload className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 px-2">
                  {formData.nicBack ? formData.nicBack.name : 'Drop file here or click to upload'}
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('nicBack', e.target.files?.[0] || null)}
                  className="hidden"
                  id="nicBack"
                />
                <label htmlFor="nicBack" className="cursor-pointer text-primary hover:text-accent transition-colors text-sm sm:text-base">
                  Choose File
                </label>
              </div>
              {errors.nicBack && (
                <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.nicBack}
                </p>
              )}
            </div>

            {/* NGJA License Document */}
            {formData.hasNGJALicense && (
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  NGJA License Document <span className="text-red-500">*</span>
                </label>
                <div className={cn(
                  "border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center transition-all duration-300 hover:border-primary/50",
                  errors.ngjaLicense ? "border-red-500" : "border-border",
                  formData.ngjaLicense ? "border-green-500 bg-green-500/5" : ""
                )}>
                  <Upload className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 px-2">
                    {formData.ngjaLicense ? formData.ngjaLicense.name : 'Drop file here or click to upload'}
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange('ngjaLicense', e.target.files?.[0] || null)}
                    className="hidden"
                    id="ngjaLicense"
                  />
                  <label htmlFor="ngjaLicense" className="cursor-pointer text-primary hover:text-accent transition-colors text-sm sm:text-base">
                    Choose File
                  </label>
                </div>
                {errors.ngjaLicense && (
                  <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.ngjaLicense}
                  </p>
                )}
              </div>
            )}

            {/* Sample Certificate */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Sample Gem Certificate <span className="text-muted-foreground text-xs">(Optional)</span>
              </label>
              <div className={cn(
                "border-2 border-dashed border-border rounded-lg sm:rounded-xl p-4 sm:p-6 text-center transition-all duration-300 hover:border-primary/50",
                formData.sampleCertificate ? "border-green-500 bg-green-500/5" : ""
              )}>
                <Upload className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 px-2">
                  {formData.sampleCertificate ? formData.sampleCertificate.name : 'Drop file here or click to upload'}
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('sampleCertificate', e.target.files?.[0] || null)}
                  className="hidden"
                  id="sampleCertificate"
                />
                <label htmlFor="sampleCertificate" className="cursor-pointer text-primary hover:text-accent transition-colors text-sm sm:text-base">
                  Choose File
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground border-b border-border/30 pb-2">
            Additional Information
          </h3>

          {/* Why Join */}
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="whyJoin" className="block text-sm font-medium text-foreground">
              Why do you want to sell on Ishq Gems? <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
              <textarea
                id="whyJoin"
                rows={4}
                placeholder="Tell us about your motivation, experience, and what makes you a good fit for our platform..."
                value={formData.whyJoin}
                onChange={(e) => handleInputChange('whyJoin', e.target.value)}
                className={cn(
                  "w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-background/50 border rounded-lg sm:rounded-xl placeholder:text-muted-foreground text-foreground resize-none text-sm sm:text-base",
                  "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-primary/50",
                  errors.whyJoin ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
                )}
                required
              />
            </div>
            <div className="flex justify-between items-center gap-2">
              {errors.whyJoin ? (
                <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1 flex-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full flex-shrink-0"></span>
                  <span className="truncate">{errors.whyJoin}</span>
                </p>
              ) : (
                <div className="flex-1"></div>
              )}
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formData.whyJoin.length}/500
              </span>
            </div>
          </div>

          {/* Confirmation */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="flex items-start gap-2 sm:gap-3 cursor-pointer group">
              <div className="relative mt-0.5 sm:mt-1">
                <input
                  type="checkbox"
                  checked={formData.confirmAccuracy}
                  onChange={(e) => handleInputChange('confirmAccuracy', e.target.checked)}
                  className="sr-only"
                />
                <div className={cn(
                  "w-4 sm:w-5 h-4 sm:h-5 border-2 rounded transition-all duration-300 flex items-center justify-center",
                  formData.confirmAccuracy 
                    ? "bg-primary border-primary" 
                    : "border-muted-foreground group-hover:border-primary",
                  errors.confirmAccuracy && "border-red-500"
                )}>
                  {formData.confirmAccuracy && (
                    <Check className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-primary-foreground" />
                  )}
                </div>
              </div>
              <span className="text-xs sm:text-sm text-foreground leading-relaxed">
                I confirm that all details provided are accurate and truthful. I understand that providing false information may result in rejection of my application.
                <span className="text-red-500 ml-1">*</span>
              </span>
            </label>
            {errors.confirmAccuracy && (
              <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1 ml-6 sm:ml-8">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.confirmAccuracy}
              </p>
            )}
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
        <div className="pt-4 sm:pt-6">
          <button
            type="submit"
            disabled={buttonState.disabled}
            className={cn(
              'w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base',
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
                  <Spinner 
                    size="sm" 
                    variant="minimal" 
                    className="bg-transparent p-0"
                  />
                  <span className="hidden sm:inline">{buttonState.text}</span>
                  <span className="sm:hidden">Uploading...</span>
                </>
              ) : isCaptchaLoading ? (
                <>
                  <div className="mr-2">
                    <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="hidden sm:inline">{buttonState.text}</span>
                  <span className="sm:hidden">Verifying...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 sm:h-5 w-4 sm:w-5" />
                  <span className="hidden sm:inline">{buttonState.text}</span>
                  <span className="sm:hidden">Submit</span>
                </>
              )}
            </button>
          
          {isLoading && (
            <div className="mt-4">
              <Spinner 
                size="md" 
                variant="gem" 
                text="Uploading documents and processing your application... This may take a few minutes depending on file sizes."
                className="bg-card/50 backdrop-blur-sm"
              />
            </div>
          )}
        </div>
      </form>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  )
} 