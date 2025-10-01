'use client'

import { useState } from 'react'
import { 
  Heart, 
  Flag, 
  Star, 
  Shield, 
  Calendar, 
  Globe, 
  Award, 
  Package,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PublicSellerProfile } from '@/types'
import S3Image from '@/components/common/S3Image'
import Button from '@/components/buttons/Button'
import MessageSellerButton from '@/components/messages/MessageSellerButton'

interface SellerProfileCardProps {
  profile: PublicSellerProfile
  onAddToFavorites?: () => void
  onReportSeller?: () => void
  isFavorited?: boolean
  className?: string
}

export default function SellerProfileCard({
  profile,
  onAddToFavorites,
  onReportSeller,
  isFavorited = false,
  className
}: SellerProfileCardProps) {
  const [isAddingFavorite, setIsAddingFavorite] = useState(false)
  
  // Strictly use store branding; do not fall back to seller personal details
  const displayName = profile.storeSettings?.storeName || 'Unnamed Store'
  const displayLogo = profile.storeSettings?.logoUrl || undefined
  const displaySlogan = profile.storeSettings?.storeSlogan
  const displayDescription = profile.storeSettings?.storeDescription
  const bannerImage = profile.storeSettings?.bannerUrl
  const primaryColor = profile.storeSettings?.primaryColor || '#3B82F6'
  const secondaryColor = profile.storeSettings?.secondaryColor || '#10B981'

  const handleAddToFavorites = async () => {
    if (!onAddToFavorites) return
    
    setIsAddingFavorite(true)
    try {
      await onAddToFavorites()
    } finally {
      setIsAddingFavorite(false)
    }
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  const renderStars = (rating: number, showNumber: boolean = true) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 text-primary fill-primary" />
        )
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-4 h-4 text-primary fill-primary/50" />
        )
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-border" />
        )
      }
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        {showNumber && (
          <span className="text-sm text-muted-foreground ml-1">
            {rating > 0 ? `${rating.toFixed(1)}` : 'New'}
          </span>
        )}
      </div>
    )
  }

  const renderRatingDistribution = () => {
    const total = profile.totalReviews
    if (total === 0) return null

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = profile.ratingDistribution[rating as keyof typeof profile.ratingDistribution] || 0
          const percentage = total > 0 ? (count / total) * 100 : 0
          
          return (
            <div key={rating} className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 w-8">
                <span className="text-muted-foreground text-xs">{rating}</span>
                <Star className="w-3 h-3 text-accent fill-accent" />
              </div>
              <div className="flex-1 bg-muted/50 dark:bg-muted/30 rounded-full h-2 min-w-0">
                <div 
                  className="bg-gradient-to-r from-primary to-accent rounded-full h-2 transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.max(percentage, 0)}%`,
                    minWidth: percentage > 0 ? '2px' : '0'
                  }}
                />
              </div>
              <span className="text-muted-foreground text-xs w-6 text-right font-mono">
                {count}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 relative",
      className
    )}>
      {/* Banner Background */}
      {bannerImage ? (
        <div className="relative h-48 overflow-hidden">
          <S3Image
            src={bannerImage}
            alt={`${displayName} banner`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/15 dark:from-primary/30 dark:via-accent/15 dark:to-primary/25" />
      )}
      
      {/* Header with profile info overlay */}
      <div className="relative -mt-20 p-6 pb-3">
        <div className="flex items-start gap-4">
          {/* Store Logo/Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-card/95 backdrop-blur-sm border-4 border-card/60 shadow-lg flex items-center justify-center">
              {displayLogo ? (
                <S3Image
                  src={displayLogo}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="96px"
                  fallbackText={displayName.charAt(0)}
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {displayName.charAt(0)}
                </span>
              )}
            </div>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-card shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Store Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-serif font-bold text-card-foreground mb-2 drop-shadow-lg">
              {displayName}
            </h1>
            {displaySlogan && (
              <p className="text-card-foreground/90 text-lg font-medium mb-2 drop-shadow">
                {displaySlogan}
              </p>
            )}
            <p className="text-card-foreground/80 text-sm mb-2 drop-shadow">
              {profile.supplierType} • {profile.yearsOfExperience}
            </p>
            
            {/* Rating */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1 bg-card/20 backdrop-blur-sm rounded-full px-3 py-1 border border-card/30">
                {renderStars(profile.rating, false)}
                <span className="text-sm text-card-foreground/90 ml-1 font-medium">
                  {profile.rating > 0 ? `${profile.rating.toFixed(1)}` : 'New'}
                </span>
              </div>
              <span className="text-sm text-card-foreground/80 drop-shadow">
                ({profile.totalReviews} reviews)
              </span>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/90 text-white rounded-full text-xs font-medium backdrop-blur-sm border border-green-400/30">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
              {profile.hasNGJALicense && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/90 text-white rounded-full text-xs font-medium backdrop-blur-sm border border-blue-400/30">
                  <Award className="w-3 h-3" />
                  NGJA Licensed
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-card/30 text-card-foreground rounded-full text-xs font-medium backdrop-blur-sm border border-card/40">
                <TrendingUp className="w-3 h-3" />
                {profile.responseTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-4">
        {/* Store Description */}
        {displayDescription && (
          <div className="mb-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 dark:border-primary/30">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              About Our Store
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {displayDescription}
            </p>
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <MessageSellerButton
            sellerId={profile.id}
            sellerName={displayName}
            variant="primary"
            className="flex-1"
          />
          
          <Button
            onClick={handleAddToFavorites}
            disabled={isAddingFavorite}
            variant="outline"
            className={cn(
              isFavorited 
                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
          </Button>
          
          <Button
            onClick={onReportSeller}
            variant="ghost"
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div 
            className="text-center p-4 rounded-xl border"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)`,
              borderColor: `${primaryColor}20`
            }}
          >
            <div 
              className="text-2xl font-bold mb-1"
              style={{ color: primaryColor }}
            >
              {profile.totalGems}
            </div>
            <div className="text-sm text-muted-foreground">
              Active Listings
            </div>
          </div>
          
          <div 
            className="text-center p-4 rounded-xl border"
            style={{
              background: `linear-gradient(135deg, ${secondaryColor}10, ${primaryColor}10)`,
              borderColor: `${secondaryColor}20`
            }}
          >
            <div 
              className="text-2xl font-bold mb-1"
              style={{ color: secondaryColor }}
            >
              {profile.totalReviews}
            </div>
            <div className="text-sm text-muted-foreground">
              Reviews
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {profile.totalReviews > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-accent rounded-full" />
              Rating Breakdown
            </h3>
            <div className="bg-secondary/30 dark:bg-secondary/20 rounded-xl p-4">
              {renderRatingDistribution()}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium text-foreground">
              {formatDate(profile.memberSince)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Languages</span>
            <span className="font-medium text-foreground">
              {profile.languages.join(', ')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Specializes in</span>
            <div className="flex-1">
              <div className="flex flex-wrap gap-1">
                {profile.specializations.map((spec: string, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 rounded-lg text-xs font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 