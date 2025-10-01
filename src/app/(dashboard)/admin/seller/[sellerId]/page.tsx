'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Share2, ExternalLink, Shield, Settings, Users } from 'lucide-react'
import { PublicSellerProfile } from '@/types'
import sellerService from '@/services/seller.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import SellerProfileCard from '@/components/seller/SellerProfileCard'
import SellerListingsGrid from '@/components/seller/SellerListingsGrid'
import SellerReviewsSection from '@/components/seller/SellerReviewsSection'
import Spinner from '@/components/loading/Spinner'

import { cn } from '@/lib/utils'

export default function SellerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const sellerId = params.sellerId as string
  
  const [profile, setProfile] = useState<PublicSellerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings')
  const [isFavorited, setIsFavorited] = useState(false)

  // Role-based checks
  const isOwnProfile = user?.id === sellerId
  const isAdmin = user?.role === 'admin'
  const isSeller = user?.role === 'seller'

  const fetchSellerProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await sellerService.getSellerProfile(sellerId)
      
      if (response.success && response.data) {
        setProfile(response.data)
        
        // Set the page title
        document.title = `${response.data.storeSettings?.storeName || response.data.fullName} - Seller Profile | Ishq Gems`
      } else {
        setError(response.message || 'Failed to load seller profile')
      }
    } catch (_error) {
      console.error('Error fetching seller profile:', _error)
      setError('Failed to load seller profile')
    } finally {
      setIsLoading(false)
    }
  }, [sellerId])

  useEffect(() => {
    if (sellerId) {
      fetchSellerProfile()
    }
  }, [sellerId, fetchSellerProfile])



  const handleAddToFavorites = async () => {
    if (!user) {
      router.push('/signin?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    
    if (isOwnProfile) return
    
    // TODO: Implement favorites functionality
    setIsFavorited(!isFavorited)
  }

  const handleReportSeller = () => {
    if (!user) {
      router.push('/signin?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    
    if (isOwnProfile) return
    
    // TODO: Implement report functionality
    console.log('Report seller:', sellerId)
  }

  const handleEditProfile = () => {
    if (isOwnProfile) {
      router.push('/dashboard/profile')
    } else if (isAdmin) {
      router.push(`/admin/sellers/${sellerId}`)
    }
  }

  const handleManageSeller = () => {
    if (isAdmin) {
      router.push(`/admin/sellers/${sellerId}`)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.storeSettings?.storeName || profile?.fullName} - Seller Profile`,
          text: `Check out this seller on Ishq Gems`,
          url: url
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        // TODO: Show toast notification
        console.log('Link copied to clipboard')
      } catch (error) {
        console.log('Error copying to clipboard:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || 'Seller not found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              The seller profile you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <button
                onClick={fetchSellerProfile}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-2">
            {/* Role-specific Actions */}
            {isOwnProfile && (
              <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </button>
            )}

            {isAdmin && !isOwnProfile && (
              <button
                onClick={handleManageSeller}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Manage Seller
              </button>
            )}

            {isSeller && !isOwnProfile && (
              <div className="flex items-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
                <Users className="w-4 h-4" />
                Fellow Seller
              </div>
            )}
            
            <button
              onClick={handleShare}
              className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <a
              href={`/admin/seller/${sellerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Role-specific Notices */}
        {isOwnProfile && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Your Seller Profile</span>
            </div>
            <p className="text-blue-600 dark:text-blue-300 text-sm mt-1">
              This is how buyers and other users see your profile on the platform. You can edit your profile information from your dashboard.
            </p>
          </div>
        )}

        {isAdmin && !isOwnProfile && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Admin View</span>
            </div>
            <p className="text-amber-600 dark:text-amber-300 text-sm mt-1">
              You&apos;re viewing this seller&apos;s profile with administrative privileges. You can manage this seller from the admin dashboard.
            </p>
          </div>
        )}

        {isSeller && !isOwnProfile && !isAdmin && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Users className="w-5 h-5" />
              <span className="font-medium">Seller Network</span>
            </div>
            <p className="text-green-600 dark:text-green-300 text-sm mt-1">
              You&apos;re viewing a fellow seller&apos;s profile. Connect and build relationships within the Ishq Gems seller community.
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Seller Profile */}
          <div className="lg:col-span-1">
            <SellerProfileCard
              profile={profile}
              onAddToFavorites={isOwnProfile ? undefined : handleAddToFavorites}
              onReportSeller={isOwnProfile ? undefined : handleReportSeller}
              isFavorited={isFavorited}
              className="sticky top-8"
            />
          </div>

          {/* Right Column - Listings & Reviews */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 mb-6 border-b border-border">
              <button
                onClick={() => setActiveTab('listings')}
                className={cn(
                  "px-4 py-3 font-medium transition-colors border-b-2 border-transparent",
                  activeTab === 'listings'
                    ? "text-primary border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Listings ({profile.totalGems})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={cn(
                  "px-4 py-3 font-medium transition-colors border-b-2 border-transparent",
                  activeTab === 'reviews'
                    ? "text-primary border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Reviews ({profile.totalReviews})
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
              {activeTab === 'listings' ? (
                <SellerListingsGrid sellerId={sellerId} />
              ) : (
                <SellerReviewsSection sellerId={sellerId} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 