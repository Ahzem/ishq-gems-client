'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, Settings, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Spinner from '@/components/loading/Spinner'
import UserProfileCard from '@/components/cards/UserProfileCard'
import AddressManager from '@/components/settings/AddressManager'
import userService from '@/services/user.service'
import { UserProfile, UpdateProfileRequest, UserAddress } from '@/types'
import Link from 'next/link'

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
      router.push('/signin?message=Please login to access your profile&redirect=/account/profile')
      return
    }
  }, [user, authLoading, router])

  // Fetch profile data when user is available
  
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

  // Loading state
  if (authLoading || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background pt-16 sm:pt-20 px-4">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-muted-foreground mt-4 text-sm sm:text-base">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background pt-16 sm:pt-20 px-4">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-muted-foreground mt-4 text-sm sm:text-base">Redirecting...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // No profile data
  if (!profile) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background pt-16 sm:pt-20 px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">
              Profile Not Found
            </h1>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Unable to load your profile information.
            </p>
            <button
              onClick={fetchProfile}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-medium text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 pt-16 sm:pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">

          {/* Profile Card */}
          <div className="max-w-6xl mx-auto">
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
          <div className="max-w-6xl mx-auto mt-6 sm:mt-8">
            <div className="bg-card border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <AddressManager
                addresses={addresses}
                onAddressChange={handleAddressChange}
              />
            </div>
          </div>

          {/* Additional Account Actions */}
          <div className="max-w-6xl mx-auto mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Become Seller Card */}
            {hasRole('buyer') && (
              <div className="bg-card border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Become a Seller</h3>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm mb-4">
                  Join our verified seller network and start selling your gemstones to buyers worldwide.
                </p>
                <Link
                  href="/account/become-seller"
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-xs sm:text-sm font-medium group-hover:translate-x-1 transform transition-transform"
                >
                  Apply Now →
                </Link>
              </div>
            )}

            {/* Settings Card */}
            <div className="bg-card border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/30 transition-colors group">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Account Settings</h3>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mb-4">
                Manage your password, security settings, and account preferences.
              </p>
              <Link
                href="/account/settings"
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-xs sm:text-sm font-medium group-hover:translate-x-1 transform transition-transform"
              >
                Manage Settings →
              </Link>
            </div>

            {/* Dashboard Link for Sellers/Admins */}
            {(hasRole('seller') || hasRole('admin')) && (
              <div className="bg-card border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">
                    {hasRole('admin') ? 'Admin Dashboard' : 'Seller Dashboard'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm mb-4">
                  Access your {hasRole('admin') ? 'admin' : 'seller'} dashboard to manage your account and business.
                </p>
                <Link
                  href={hasRole('admin') ? '/admin' : '/seller'}
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-xs sm:text-sm font-medium group-hover:translate-x-1 transform transition-transform"
                >
                  Go to Dashboard →
                </Link>
              </div>
            )}
          </div>

          {/* Profile Statistics for Mobile */}
          <div className="max-w-6xl mx-auto mt-6 sm:mt-8 sm:hidden">
            <div className="bg-card border border-border/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">
                    {profile.role === 'buyer' ? profile.orderCount || 0 : profile.gemsListedCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile.role === 'buyer' ? 'Orders' : 'Gems Listed'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-accent">
                    {profile.role === 'buyer' ? profile.wishlistCount || 0 : (profile.isVerifiedSeller ? '✓' : '⏳')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile.role === 'buyer' ? 'Wishlist' : 'Status'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </>
  )
} 