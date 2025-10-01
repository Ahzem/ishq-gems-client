'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, AlertCircle } from 'lucide-react'
import { StoreSettings } from '@/types/entities/seller-settings'
import S3Image from '@/components/common/S3Image'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface StoreSettingsSectionProps {
  settings: StoreSettings
  onChange: (key: keyof StoreSettings, value: string | File) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export default function StoreSettingsSection({
  settings,
  onChange,
  errors = {},
  disabled = false
}: StoreSettingsSectionProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (
    file: File,
    type: 'logo' | 'banner',
    setPreview: (url: string | null) => void,
    setUploading: (loading: boolean) => void
  ) => {
    if (!file) return

    // Validate file size
    const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024 // 2MB for logo, 5MB for banner
    if (file.size > maxSize) {
      alert(`File size too large. Maximum ${type === 'logo' ? '2MB' : '5MB'} allowed.`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    try {
      setUploading(true)
      
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
      
      // For now, we'll pass the file to the parent component
      // The actual upload will be handled by the parent or service
      const key = type === 'logo' ? 'logoUrl' : 'bannerUrl'
      onChange(key, file)
      
    } catch (error) {
      console.error(`Failed to process ${type}:`, error)
      alert(`Failed to process ${type}. Please try again.`)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file, 'logo', setLogoPreview, setUploadingLogo)
    }
  }

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file, 'banner', setBannerPreview, setUploadingBanner)
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    onChange('logoUrl', '')
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const removeBanner = () => {
    setBannerPreview(null)
    onChange('bannerUrl', '')
    if (bannerInputRef.current) {
      bannerInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-8">
      {/* Store Banner Section - Facebook Style */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Store Banner</h3>
          <p className="text-sm text-muted-foreground">
            Upload a banner image for your store (recommended: 1200x400px, max 5MB)
          </p>
        </div>
        
        <div className="relative">
          <div className="relative w-full h-48 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl overflow-hidden border-2 border-dashed border-border/50 hover:border-primary/30 transition-colors">
            {/* Banner Image or Placeholder */}
            {bannerPreview || settings.bannerUrl ? (
              <div className="relative w-full h-full">
                {bannerPreview ? (
                  <Image
                    src={bannerPreview}
                    fill={true}
                    alt="Store banner preview"
                    className="w-full h-full object-cover"
                  />
                ) : settings.bannerUrl ? (
                  <S3Image
                    src={settings.bannerUrl as string}
                    fill={true}
                    alt="Store banner"
                    className="w-full h-full object-cover"
                    fallbackText="Banner Image"
                    showFallbackIcon={false}
                  />
                ) : null}
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={removeBanner}
                  disabled={disabled || uploadingBanner}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Upload Store Banner</span>
                <span className="text-xs">1200x400px recommended</span>
              </div>
            )}
            
            {/* Upload Button Overlay */}
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={disabled || uploadingBanner}
              className={cn(
                "absolute bottom-3 right-3 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-2 transition-colors shadow-lg",
                (disabled || uploadingBanner) && "opacity-50 cursor-not-allowed"
              )}
            >
              <Camera className="w-4 h-4" />
              <span className="text-sm font-medium">
                {uploadingBanner ? 'Uploading...' : bannerPreview || settings.bannerUrl ? 'Change' : 'Add'}
              </span>
            </button>
          </div>
          
          {errors.bannerUrl && (
            <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.bannerUrl}</span>
            </div>
          )}
        </div>
      </div>

      {/* Store Logo Section - Facebook Style */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Store Logo</h3>
          <p className="text-sm text-muted-foreground">
            Upload a logo for your store (recommended: 200x200px, max 2MB)
          </p>
        </div>
        
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="relative w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl overflow-hidden border-2 border-dashed border-border/50 hover:border-primary/30 transition-colors">
              {/* Logo Image or Placeholder */}
              {logoPreview || settings.logoUrl ? (
                <div className="relative w-full h-full">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      width={128}
                      height={128}
                      alt="Store logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : settings.logoUrl ? (
                    <S3Image
                      src={settings.logoUrl as string}
                      alt="Store logo"
                      className="w-full h-full object-cover"
                      fallbackText="Logo"
                      showFallbackIcon={false}
                      width={128}
                      height={128}
                    />
                  ) : null}
                  
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={removeLogo}
                    disabled={disabled || uploadingLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg z-10 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Logo</span>
                </div>
              )}
              
              {/* Upload Button Overlay */}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={disabled || uploadingLogo}
                className={cn(
                  "absolute bottom-2 right-2 w-8 h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center transition-colors shadow-lg",
                  (disabled || uploadingLogo) && "opacity-50 cursor-not-allowed"
                )}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            {errors.logoUrl && (
              <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.logoUrl}</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={disabled || uploadingLogo}
              className={cn(
                "px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-2 transition-colors",
                (disabled || uploadingLogo) && "opacity-50 cursor-not-allowed"
              )}
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">
                {uploadingLogo ? 'Uploading...' : logoPreview || settings.logoUrl ? 'Change Logo' : 'Upload Logo'}
              </span>
            </button>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Square format works best (200x200px)</p>
              <p>• Maximum file size: 2MB</p>
              <p>• Supported formats: JPG, PNG, WebP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Other Store Settings */}
      <div className="space-y-6 pt-6 border-t border-border/30">
        {/* Store Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Store Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => onChange('storeName', e.target.value)}
            placeholder="Your store name"
            disabled={disabled}
            className={cn(
              "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors",
              errors.storeName && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          {errors.storeName && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.storeName}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            The name that appears on your store page
          </p>
        </div>

        {/* Store Slogan */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Store Slogan</label>
          <input
            type="text"
            value={settings.storeSlogan}
            onChange={(e) => onChange('storeSlogan', e.target.value)}
            placeholder="Your store slogan"
            disabled={disabled}
            className={cn(
              "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors",
              errors.storeSlogan && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          {errors.storeSlogan && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.storeSlogan}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            A short tagline for your store
          </p>
        </div>

        {/* Store Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Store Description</label>
          <textarea
            value={settings.storeDescription}
            onChange={(e) => onChange('storeDescription', e.target.value)}
            placeholder="Describe your store and what makes it special..."
            rows={4}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none",
              errors.storeDescription && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          {errors.storeDescription && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.storeDescription}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Tell customers about your store and expertise
          </p>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => onChange('primaryColor', e.target.value)}
                disabled={disabled}
                className={cn(
                  "w-12 h-12 rounded-lg border border-border cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => onChange('primaryColor', e.target.value)}
                placeholder="#3B82F6"
                disabled={disabled}
                className={cn(
                  "flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors",
                  errors.primaryColor && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>
            {errors.primaryColor && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.primaryColor}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Main color for your store branding
            </p>
          </div>

          {/* Secondary Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => onChange('secondaryColor', e.target.value)}
                disabled={disabled}
                className={cn(
                  "w-12 h-12 rounded-lg border border-border cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) => onChange('secondaryColor', e.target.value)}
                placeholder="#10B981"
                disabled={disabled}
                className={cn(
                  "flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors",
                  errors.secondaryColor && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>
            {errors.secondaryColor && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.secondaryColor}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Secondary color for accents
            </p>
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerUpload}
        className="hidden"
      />
    </div>
  )
}
