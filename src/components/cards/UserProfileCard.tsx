'use client'

import { useState, useRef } from 'react'
import { Camera, Edit3, Save, X, User, Mail, Phone, Calendar, Shield, Star, Gem, ShoppingBag, Heart, Check, AlertTriangle } from 'lucide-react'
import { UserProfile, UpdateProfileRequest } from '@/types'
import { cn } from '@/lib/utils'
import { useAlert } from '@/components/providers'
import UploadProgress from '@/components/loading/UploadProgress'
import S3Image from '@/components/common/S3Image'

interface UserProfileCardProps {
  profile: UserProfile
  isEditing: boolean
  onToggleEdit: () => void
  onUpdateProfile: (data: UpdateProfileRequest) => Promise<void>
  onUpdateAvatar: (file: File) => Promise<void>
  isLoading?: boolean
  uploadProgress?: number
}

export default function UserProfileCard({
  profile,
  isEditing,
  onToggleEdit,
  onUpdateProfile,
  onUpdateAvatar,
  isLoading = false,
  uploadProgress = 0
}: UserProfileCardProps) {
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: profile.fullName,
    phone: profile.phone || '',
    bio: profile.bio || ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const showAlert = useAlert()

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.fullName?.trim()) {
      errors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters'
    }
    
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\+]?[0-9][\d\s\-\(\)]{8,15}$/
      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = 'Please enter a valid phone number'
      }
    }
    
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (validateForm()) {
      await onUpdateProfile(formData)
      onToggleEdit()
    }
  }

  const handleCancel = () => {
    setFormData({
      fullName: profile.fullName,
      phone: profile.phone || '',
      bio: profile.bio || ''
    })
    setFormErrors({})
    onToggleEdit()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showAlert({
          type: 'error',
          message: 'File size must be less than 5MB'
        })
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showAlert({
          type: 'error',
          message: 'Please select an image file'
        })
        return
      }
      
      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      onUpdateAvatar(file)
    }
  }

  const getRoleBadge = () => {
    switch (profile.role) {
      case 'buyer':
        return {
          label: `Buyer since ${new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
          icon: <ShoppingBag className="w-4 h-4" />,
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        }
      case 'seller':
        const sellerStatus = profile.isVerifiedSeller ? 'Verified Seller' : 
                            profile.sellerStatus === 'pending' ? 'Pending Verification' :
                            profile.sellerStatus === 'rejected' ? 'Application Rejected' : 'Seller'
        return {
          label: sellerStatus,
          icon: <Gem className="w-4 h-4" />,
          color: profile.isVerifiedSeller 
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : profile.sellerStatus === 'rejected'
            ? 'bg-red-500/20 text-red-400 border-red-500/30'
            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        }
      case 'admin':
        return {
          label: 'Platform Administrator',
          icon: <Shield className="w-4 h-4" />,
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        }
      default:
        return {
          label: 'User',
          icon: <User className="w-4 h-4" />,
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }
  }

  const roleBadge = getRoleBadge()

  return (
    <div className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="space-y-1">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">Your Profile</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage your account information and preferences</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isEditing && (
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 font-medium bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 hover:text-gray-700 text-sm sm:text-base"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Cancel</span>
              <span className="sm:hidden">✕</span>
            </button>
          )}
          <button
            onClick={isEditing ? handleSave : onToggleEdit}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 font-medium text-sm sm:text-base",
              isEditing
                ? "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/25"
                : "bg-primary/10 hover:bg-primary/20 text-primary hover:shadow-lg hover:shadow-primary/25"
            )}
          >
            {isEditing ? <Save className="w-3 h-3 sm:w-4 sm:h-4" /> : <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />}
            {isEditing ? (
              <>
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="relative self-center sm:self-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-primary/30 transition-colors">
            {avatarPreview || profile.avatar ? (
              <S3Image 
                src={avatarPreview || profile.avatar || '/images/default-avatar.webp'} 
                alt="Profile" 
                className="w-full h-full object-cover"
                width={96}
                height={96}
                fallbackSrc="/images/default-avatar.webp"
                showFallbackIcon={true}
              />
            ) : (
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            )}
          </div>
          
          {isEditing && (
            <button
              title="Change profile picture"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors shadow-lg hover:shadow-primary/25"
            >
              <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
          
          <input
            title="Upload profile picture"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
              {profile.fullName}
            </h3>
            <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg border text-xs transition-colors self-center sm:self-auto", roleBadge.color)}>
              {roleBadge.icon}
              <span className="text-xs">{roleBadge.label}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-muted-foreground">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-sm sm:text-base break-all">{profile.email}</span>
            </div>
            {profile.isEmailVerified && (
              <div className="flex items-center gap-1 text-green-400 justify-center sm:justify-start">
                <Shield className="w-3 h-3" />
                <span className="text-xs">Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-4 sm:mb-6">
          <UploadProgress 
            progress={uploadProgress} 
            text="Uploading profile image..." 
            fileName={avatarFile?.name}
          />
        </div>
      )}

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Personal Information */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <User className="w-4 h-4 text-primary" />
            Personal Information
          </h4>
          
          {/* Full Name */}
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="fullName" className="text-xs sm:text-sm font-medium text-muted-foreground">
              Full Name *
            </label>
            {isEditing ? (
              <div className="space-y-1">
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev: UpdateProfileRequest) => ({ ...prev, fullName: e.target.value }))}
                  className={cn(
                    "w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm sm:text-base",
                    formErrors.fullName ? "border-red-500" : "border-border"
                  )}
                  placeholder="Enter your full name"
                />
                {formErrors.fullName && (
                  <p className="text-red-500 text-xs">{formErrors.fullName}</p>
                )}
              </div>
            ) : (
              <p className="text-foreground text-sm sm:text-base">{profile.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="phone" className="text-xs sm:text-sm font-medium text-muted-foreground">
              Phone Number
            </label>
            {isEditing ? (
              <div className="space-y-1">
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev: UpdateProfileRequest) => ({ ...prev, phone: e.target.value }))}
                  className={cn(
                    "w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm sm:text-base",
                    formErrors.phone ? "border-red-500" : "border-border"
                  )}
                  placeholder="Enter phone number"
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-xs">{formErrors.phone}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className="text-sm sm:text-base">{profile.phone || 'Not provided'}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="bio" className="text-xs sm:text-sm font-medium text-muted-foreground">
              Bio
              {isEditing && formData.bio && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({formData.bio.length}/500)
                </span>
              )}
            </label>
            {isEditing ? (
              <div className="space-y-1">
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData((prev: UpdateProfileRequest) => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className={cn(
                    "w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-colors text-sm sm:text-base",
                    formErrors.bio ? "border-red-500" : "border-border"
                  )}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
                {formErrors.bio && (
                  <p className="text-red-500 text-xs">{formErrors.bio}</p>
                )}
              </div>
            ) : (
              <p className="text-foreground text-sm sm:text-base">{profile.bio || 'No bio provided'}</p>
            )}
          </div>
        </div>

        {/* Role-Specific Information */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            {profile.role === 'buyer' ? (
              <>
                <ShoppingBag className="w-4 h-4 text-blue-500" />
                Buyer Stats
              </>
            ) : profile.role === 'seller' ? (
              <>
                <Gem className="w-4 h-4 text-accent" />
                Seller Stats
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-purple-500" />
                Admin Info
              </>
            )}
          </h4>

          {profile.role === 'buyer' && (
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-background/50 rounded-lg border border-border/30 hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                  <span className="text-xs sm:text-sm font-medium">Orders</span>
                </div>
                <span className="font-bold text-blue-500 text-sm sm:text-base">{profile.orderCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-background/50 rounded-lg border border-border/30 hover:border-red-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                  <span className="text-xs sm:text-sm font-medium">Wishlist Items</span>
                </div>
                <span className="font-bold text-red-500 text-sm sm:text-base">{profile.wishlistCount || 0}</span>
              </div>
            </div>
          )}

          {profile.role === 'seller' && (
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-background/50 rounded-lg border border-border/30 hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Gem className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  <span className="text-xs sm:text-sm font-medium">Gems Listed</span>
                </div>
                <span className="font-bold text-accent text-sm sm:text-base">{profile.gemsListedCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-background/50 rounded-lg border border-border/30 hover:border-green-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
                  <span className="text-xs sm:text-sm font-medium">Verification Status</span>
                </div>
                <div className="flex items-center gap-1">
                  {profile.isVerifiedSeller && <Check className="w-3 h-3 text-green-400" />}
                  <span className={cn(
                    "text-xs sm:text-sm font-medium",
                    profile.isVerifiedSeller ? "text-green-400" : "text-yellow-400"
                  )}>
                    {profile.isVerifiedSeller ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              {profile.sellerStatus && (
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Application Status</label>
                  <div className={cn(
                    "px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium",
                    profile.sellerStatus === 'verified' ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                    profile.sellerStatus === 'pending' ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" :
                    profile.sellerStatus === 'rejected' ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                    "bg-gray-500/10 text-gray-600 border border-gray-500/20"
                  )}>
                    {profile.sellerStatus.charAt(0).toUpperCase() + profile.sellerStatus.slice(1)}
                  </div>
                </div>
              )}
            </div>
          )}

          {profile.role === 'admin' && (
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-background/50 rounded-lg border border-border/30 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                  <span className="text-xs sm:text-sm font-medium">Admin Since</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-purple-400">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Administrative Permissions</label>
                <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                  {profile.adminPermissions?.map((permission: string) => (
                    <div key={permission} className="flex items-center gap-2 text-xs sm:text-sm p-2 bg-purple-500/5 rounded-lg border border-purple-500/10">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <span className="capitalize">
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    </div>
                  )) || (
                    <div className="text-xs sm:text-sm text-muted-foreground p-2 bg-gray-500/5 rounded-lg">
                      Standard admin permissions
                    </div>
                  )}
                </div>
              </div>

              <div className="p-2.5 sm:p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                  <span className="text-xs sm:text-sm font-semibold text-purple-600">Administrator Access</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Full access to platform management, user administration, and system configuration.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="pt-4 sm:pt-6 border-t border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
          {profile.lastLogin && (
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Last active {new Date(profile.lastLogin).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {/* Role-specific quick actions */}
        {profile.role === 'seller' && !profile.isVerifiedSeller && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
              <span className="text-xs sm:text-sm font-medium text-yellow-600">Verification Pending</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your seller application is being reviewed. You will receive an email once the verification is complete.
            </p>
          </div>
        )}
        
        {profile.role === 'seller' && profile.sellerStatus === 'rejected' && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
              <span className="text-xs sm:text-sm font-medium text-red-600">Application Rejected</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your seller application was not approved. Please contact support for more information.
            </p>
          </div>
        )}
        
        {profile.role === 'admin' && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
              <span className="text-xs sm:text-sm font-medium text-purple-600">Administrator Dashboard</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Access advanced platform management tools and user administration features.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 