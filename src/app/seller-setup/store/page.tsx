'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Image as ImageIcon, Upload, CheckCircle, ArrowRight, Palette, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlertBox } from '@/components/alerts'
import Spinner from '@/components/loading/Spinner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import sellerSettingsService from '@/services/seller-settings.service'
import fileUploadService from '@/services/file-upload.service'
import Image from 'next/image'

interface FormData {
  storeName: string
  storeSlogan: string
  storeDescription: string
  primaryColor: string
  secondaryColor: string
  logoFile: File | null
  bannerFile: File | null
}

interface FormErrors {
  [key: string]: string
}

export default function StoreSetupPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    storeName: '',
    storeSlogan: '',
    storeDescription: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    logoFile: null,
    bannerFile: null
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiError, setApiError] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  // Logo and banner preview URLs
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin?message=Please sign in to continue')
    } else if (!authLoading && isAuthenticated && user?.role !== 'seller') {
      router.push('/dashboard')
    }
  }, [authLoading, isAuthenticated, user, router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required'
    } else if (formData.storeName.trim().length < 2) {
      newErrors.storeName = 'Store name must be at least 2 characters'
    }

    if (formData.storeSlogan && formData.storeSlogan.length > 100) {
      newErrors.storeSlogan = 'Store slogan cannot exceed 100 characters'
    }

    if (formData.storeDescription && formData.storeDescription.length > 500) {
      newErrors.storeDescription = 'Store description cannot exceed 500 characters'
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

  const handleFileChange = (field: 'logoFile' | 'bannerFile', file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, [field]: null }))
      if (field === 'logoFile') setLogoPreview(null)
      if (field === 'bannerFile') setBannerPreview(null)
      return
    }

    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [field]: 'File size must be less than 5MB' }))
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [field]: 'Only image files are allowed' }))
      return
    }

    setFormData(prev => ({ ...prev, [field]: file }))
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      if (field === 'logoFile') {
        setLogoPreview(reader.result as string)
      } else {
        setBannerPreview(reader.result as string)
      }
    }
    reader.readAsDataURL(file)

    // Clear error
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
    setUploadProgress(0)
    
    try {
      let logoUrl = ''
      let bannerUrl = ''

      // Upload logo if provided
      if (formData.logoFile) {
        setUploadProgress(25)
        const logoUpload = await fileUploadService.uploadStoreLogo(formData.logoFile)
        if (logoUpload.success && logoUpload.data) {
          logoUrl = logoUpload.data.url
        }
      }

      // Upload banner if provided
      if (formData.bannerFile) {
        setUploadProgress(50)
        const bannerUpload = await fileUploadService.uploadStoreBanner(formData.bannerFile)
        if (bannerUpload.success && bannerUpload.data) {
          bannerUrl = bannerUpload.data.url
        }
      }

      setUploadProgress(75)

      // Update seller settings
      const settingsData = {
        store: {
          storeName: formData.storeName.trim(),
          storeSlogan: formData.storeSlogan.trim(),
          storeDescription: formData.storeDescription.trim(),
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          ...(logoUrl && { logoUrl }),
          ...(bannerUrl && { bannerUrl })
        }
      }

      const response = await sellerSettingsService.updateSellerSettings(settingsData)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update store settings')
      }

      setUploadProgress(100)
      setIsSuccess(true)
      
      // Redirect to seller dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/seller?setup=complete')
      }, 2000)
      
    } catch (error) {
      console.error('Store setup error:', error)
      setApiError(error instanceof Error ? error.message : 'Failed to setup store')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard/seller?setup=skipped')
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <Spinner size="lg" text="Loading..." />
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
              Store Setup Complete!
            </h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your store has been successfully configured. Welcome to Ishq Gems seller platform!
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to your seller dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
              Set Up Your Store
            </h1>
            <p className="text-muted-foreground">
              Customize your store profile to attract more buyers
            </p>
          </div>

          {/* Info Alert */}
          <div className="mb-6">
            <AlertBox
              type="info"
              message="You can skip this step and complete your store setup later from your seller settings."
              autoDismiss={false}
              placement="inline"
            />
          </div>

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
            {/* Store Name */}
            <div className="space-y-2">
              <label htmlFor="storeName" className="block text-sm font-medium text-foreground">
                Store Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="storeName"
                  type="text"
                  placeholder="Enter your store name"
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-background/50 border rounded-xl placeholder:text-muted-foreground text-foreground",
                    "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-primary/50",
                    errors.storeName ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
                  )}
                  required
                />
              </div>
              {errors.storeName && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.storeName}
                </p>
              )}
            </div>

            {/* Store Slogan */}
            <div className="space-y-2">
              <label htmlFor="storeSlogan" className="block text-sm font-medium text-foreground">
                Store Slogan <span className="text-muted-foreground text-xs">(Optional)</span>
              </label>
              <input
                id="storeSlogan"
                type="text"
                placeholder="A catchy tagline for your store"
                value={formData.storeSlogan}
                onChange={(e) => handleInputChange('storeSlogan', e.target.value)}
                className={cn(
                  "w-full px-4 py-3 bg-background/50 border rounded-xl placeholder:text-muted-foreground text-foreground",
                  "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-primary/50",
                  errors.storeSlogan ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
                )}
              />
              {errors.storeSlogan && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.storeSlogan}
                </p>
              )}
            </div>

            {/* Store Description */}
            <div className="space-y-2">
              <label htmlFor="storeDescription" className="block text-sm font-medium text-foreground">
                Store Description <span className="text-muted-foreground text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <textarea
                  id="storeDescription"
                  rows={4}
                  placeholder="Tell buyers about your store and what makes it unique..."
                  value={formData.storeDescription}
                  onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-background/50 border rounded-xl placeholder:text-muted-foreground text-foreground resize-none",
                    "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-primary/50",
                    errors.storeDescription ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/20 focus:border-primary"
                  )}
                />
              </div>
              {errors.storeDescription && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.storeDescription}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.storeDescription.length}/500 characters
              </p>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Primary Color */}
              <div className="space-y-2">
                <label htmlFor="primaryColor" className="block text-sm font-medium text-foreground">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Palette className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      id="primaryColor"
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-foreground">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Palette className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      id="secondaryColor"
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Store Logo <span className="text-muted-foreground text-xs">(Optional)</span>
              </label>
              <div className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 hover:border-primary/50",
                errors.logoFile ? "border-red-500" : "border-border",
                logoPreview ? "border-green-500 bg-green-500/5" : ""
              )}>
                {logoPreview ? (
                  <div className="space-y-3">
                    <Image src={logoPreview} alt="Logo preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                    <button
                      type="button"
                      onClick={() => handleFileChange('logoFile', null)}
                      className="text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Drop your logo here or click to upload
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('logoFile', e.target.files?.[0] || null)}
                      className="hidden"
                      id="logoFile"
                    />
                    <label htmlFor="logoFile" className="cursor-pointer text-primary hover:text-accent transition-colors">
                      Choose File
                    </label>
                  </>
                )}
              </div>
              {errors.logoFile && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.logoFile}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Recommended: Square image, at least 200x200px (Max 5MB)
              </p>
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Store Banner <span className="text-muted-foreground text-xs">(Optional)</span>
              </label>
              <div className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 hover:border-primary/50",
                errors.bannerFile ? "border-red-500" : "border-border",
                bannerPreview ? "border-green-500 bg-green-500/5" : ""
              )}>
                {bannerPreview ? (
                  <div className="space-y-3">
                    <Image src={bannerPreview} alt="Banner preview" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => handleFileChange('bannerFile', null)}
                      className="text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Drop your banner here or click to upload
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('bannerFile', e.target.files?.[0] || null)}
                      className="hidden"
                      id="bannerFile"
                    />
                    <label htmlFor="bannerFile" className="cursor-pointer text-primary hover:text-accent transition-colors">
                      Choose File
                    </label>
                  </>
                )}
              </div>
              {errors.bannerFile && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.bannerFile}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Recommended: 1200x400px (Max 5MB)
              </p>
            </div>

            {/* Upload Progress */}
            {isLoading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={handleSkip}
                disabled={isLoading}
                className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 bg-secondary/50 hover:bg-secondary text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2',
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
                    Setting up store...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

