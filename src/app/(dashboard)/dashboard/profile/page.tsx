'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, Settings, AlertTriangle, Shield, Star, Store } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Spinner from '@/components/loading/Spinner'
import UserProfileCard from '@/components/cards/UserProfileCard'
import AddressManager from '@/components/settings/AddressManager'
import userService from '@/services/user.service'
import { UserProfile, UpdateProfileRequest, UserAddress } from '@/types'
import Link from 'next/link'
import PageTitle from '@/components/dashboard/PageTitle'

// Toast notification component
const Toast = ({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: 'success' | 'error' | 'info'; 
  onClose: () => void 
}) => (
  <div className={`fixed top-4 right-4 z-[100] p-4 rounded-xl shadow-lg border transition-all duration-300 max-w-sm ${
    type === 'success' 
      ? 'bg-green-500/10 text-green-600 border-green-500/20' 
      : type === 'error'
      ? 'bg-red-500/10 text-red-600 border-red-500/20'
      : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  }`}>
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="text-current hover:opacity-70 transition-opacity"
      >
        ×
      </button>
    </div>
  </div>
)

export default function ProfilePage() {
  const { user, isLoading: authLoading, hasRole } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Auth protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin?message=Please login to access your profile&redirect=/dashboard/profile')
      return
    }
  }, [user, authLoading, router])

  // Fetch profile data and addresses
  const fetchProfile = useCallback(async () => {
    if (!user) return
  
    try {
      setIsLoading(true)
      
      // Fetch profile and addresses in parallel
      const [profileResponse, addressesResponse] = await Promise.all([
        userService.getProfile(),
        userService.getAddresses()
      ])
  
      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data)
      } else {
        setToast({
          message: profileResponse.message || 'Failed to load profile',
          type: 'error'
        })
      }

      if (addressesResponse.success && addressesResponse.data) {
        setAddresses(addressesResponse.data)
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      setToast({
        message: 'Failed to load profile',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }, [user])
  
  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile()
    }
  }, [user, authLoading, fetchProfile])

  const handleUpdateProfile = async (updateData: UpdateProfileRequest) => {
    try {
      const response = await userService.updateProfile(updateData)
      
      if (response.success && response.data) {
        setProfile(response.data)
        setToast({
          message: 'Profile updated successfully',
          type: 'success'
        })
      } else {
        setToast({
          message: response.message || 'Failed to update profile',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setToast({
        message: 'Failed to update profile',
        type: 'error'
      })
    }
  }

  const handleUpdateAvatar = async (file: File) => {
    try {
      setUploadProgress(10)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      const response = await userService.updateAvatar(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (response.success && response.data) {
        // Update profile with new avatar
        if (profile) {
          setProfile({
            ...profile,
            avatar: response.data.avatar
          })
        }
        
        setToast({
          message: 'Profile image updated successfully',
          type: 'success'
        })
        
        setTimeout(() => setUploadProgress(0), 1000)
      } else {
        setUploadProgress(0)
        setToast({
          message: response.message || 'Failed to update profile image',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Avatar update error:', error)
      setUploadProgress(0)
      setToast({
        message: 'Failed to update profile image',
        type: 'error'
      })
    }
  }

  const handleToggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleAddressChange = (updatedAddresses: UserAddress[]) => {
    setAddresses(updatedAddresses)
  }

  const closeToast = () => {
    setToast(null)
  }

  // Get role-specific configuration
  const getRoleConfig = () => {
    if (hasRole('admin')) {
      return {
        title: 'Admin Profile',
        subtitle: 'Manage your administrator profile and Ishq Gems account settings',
        icon: Shield,
        badge: 'Administrator',
        badgeColor: 'text-primary',
        badgeIcon: Star,
        headerGradient: 'from-primary/10 to-accent/10',
        notice: null
      }
    } else if (hasRole('seller')) {
      return {
        title: 'Seller Profile', 
        subtitle: 'Manage your seller profile and Ishq Gems account settings',
        icon: Store,
        badge: 'Seller Profile',
        badgeColor: 'text-primary',
        badgeIcon: Store,
        headerGradient: 'from-primary/10 to-accent/10',
        notice: {
          title: 'Professional Seller Profile',
          description: 'Your profile represents your brand on Ishq Gems. Keep your information accurate and professional.',
          color: 'green'
        }
      }
    } else {
      return {
        title: 'My Profile',
        subtitle: 'Manage your profile and Ishq Gems account settings',
        icon: User,
        badge: 'Buyer Profile',
        badgeColor: 'text-primary',
        badgeIcon: User,
        headerGradient: 'from-blue-500/10 to-purple-500/10',
        notice: null
      }
    }
  }

  // Get role-specific action cards
  const getRoleActions = () => {
    const baseActions = [
      {
        title: 'Account Settings',
        description: 'Manage your password, security settings, and account preferences.',
        href: hasRole('admin') ? '/admin/settings' : '/account/settings',
        icon: Settings,
        color: 'blue'
      }
    ]

    if (hasRole('admin')) {
      return [
        ...baseActions,
        {
          title: 'Admin Dashboard',
          description: 'Access your admin dashboard to manage the platform and users.',
          href: '/admin',
          icon: Shield,
          color: 'purple'
        }
      ]
    } else if (hasRole('seller')) {
      return [
        {
          title: 'Gem Listings',
          description: 'View and manage your gem listings. Add new gems or update existing ones.',
          href: '/dashboard/listings',
          icon: User,
          color: 'primary'
        },
        {
          title: 'Add New Gem',
          description: 'List a new gemstone in our marketplace. Upload images, set prices, and describe your gem.',
          href: '/dashboard/add-gem',
          icon: Settings,
          color: 'green'
        },
        ...baseActions
      ]
    } else {
      return [
        {
          title: 'My Orders',
          description: 'View your order history and track current purchases.',
          href: '/account/orders',
          icon: User,
          color: 'primary'
        },
        {
          title: 'Wishlist',
          description: 'Manage your saved gemstones and favorite items.',
          href: '/account/wishlist',
          icon: Settings,
          color: 'green'
        },
        ...baseActions
      ]
    }
  }

  const roleConfig = getRoleConfig()
  const roleActions = getRoleActions()

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Redirecting...</p>
        </div>
      </div>
    )
  }

  // No profile data
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            Profile Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            Unable to load your profile information.
          </p>
          <button
            onClick={fetchProfile}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle title={roleConfig.title} />
        <div className="space-y-6">
          {/* Dynamic Header */}
          <div className={`bg-gradient-to-r ${roleConfig.headerGradient} border border-primary/20 rounded-xl p-6 mb-8`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <roleConfig.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                    {roleConfig.title}
                    <roleConfig.badgeIcon className="w-5 h-5 text-amber-500" />
                  </h1>
                  <p className="text-muted-foreground">
                    {roleConfig.subtitle.replace('Ishq Gems', '')}
                    <span className="font-semibold text-primary">Ishq Gems</span>
                    {roleConfig.subtitle.includes('settings') ? ' account settings' : ''}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <roleConfig.badgeIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{roleConfig.badge}</span>
              </div>
            </div>
          </div>

          {/* Role-specific Notice */}
          {roleConfig.notice && (
            <div className={`bg-${roleConfig.notice.color}-50 dark:bg-${roleConfig.notice.color}-900/10 border border-${roleConfig.notice.color}-200 dark:border-${roleConfig.notice.color}-800/30 rounded-xl p-4 mb-8`}>
              <div className="flex items-start gap-3">
                <roleConfig.badgeIcon className={`w-5 h-5 text-${roleConfig.notice.color}-600 mt-0.5`} />
                <div>
                  <h3 className={`font-semibold text-${roleConfig.notice.color}-800 dark:text-${roleConfig.notice.color}-300`}>
                    {roleConfig.notice.title}
                  </h3>
                  <p className={`text-sm text-${roleConfig.notice.color}-700 dark:text-${roleConfig.notice.color}-400 mt-1`}>
                    {roleConfig.notice.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div className="mx-auto">
            <UserProfileCard
              profile={profile}
              isEditing={isEditing}
              onToggleEdit={handleToggleEdit}
              onUpdateProfile={handleUpdateProfile}
              onUpdateAvatar={handleUpdateAvatar}
              isLoading={isLoading}
              uploadProgress={uploadProgress}
            />
          </div>

          {/* Address Management */}
          <div className="mx-auto mt-8">
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <AddressManager
                addresses={addresses}
                onAddressChange={handleAddressChange}
              />
            </div>
          </div>

          {/* Role-specific Action Cards */}
          <div className="mx-auto mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roleActions.map((action, index) => (
              <div key={index} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-br from-${action.color === 'primary' ? 'primary' : action.color + '-500'}/20 to-${action.color === 'primary' ? 'accent' : action.color + '-600'}/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-5 h-5 text-${action.color === 'primary' ? 'primary' : action.color + '-500'}`} />
                  </div>
                  <h3 className="font-semibold text-foreground">{action.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {action.description}
                </p>
                <Link
                  href={action.href}
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-sm font-medium group-hover:translate-x-1 transform transition-transform"
                >
                  {action.title.includes('Manage') || action.title.includes('Add') ? action.title : `Go to ${action.title}`} →
                </Link>
              </div>
            ))}
          </div>

          {/* Quick Stats for Mobile */}
          <div className="mx-auto mt-8 sm:hidden">
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {hasRole('seller') 
                      ? profile.gemsListedCount || 0 
                      : profile.orderCount || 0
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hasRole('seller') ? 'Gems Listed' : 'Orders'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">
                    {hasRole('seller') 
                      ? (profile.isVerifiedSeller ? '✓' : '⏳')
                      : profile.wishlistCount || 0
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hasRole('seller') ? 'Status' : 'Wishlist'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Toast Notification */}
      {toast && toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </>
  )
}
