'use client'

import { S3Image } from '../common'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check, Star, MapPin, Eye, Heart, Gavel, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CartItem } from '@/types'
import { useUserCart } from '@/hooks/useUserCart'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useState } from 'react'
import AuctionTimer from '@/components/bidding/AuctionTimer'

// Updated seller interface to include store settings
interface GemCardSeller {
  id?: string
  verified: boolean
  rating: number
  totalReviews: number
  location: string
  // Store settings - the only source of seller display info for buyers
  storeSettings: {
    storeName: string
    storeSlogan?: string
    storeDescription?: string
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string | null
    bannerUrl?: string | null
  }
}

interface LuxuryGemCardProps {
  id: string
  name: string
  price: string
  priceNumber: number
  location: string
  image: string
  carat?: string
  rarity?: string
  color?: string
  clarity?: string
  cut?: string
  treatment?: string
  seller?: GemCardSeller // Use updated interface
  labCertified?: boolean
  popularity?: number
  className?: string
  isPlatformGem?: boolean // Add flag for admin/platform gems
  priority?: boolean // Add priority prop for LCP optimization
  layout?: 'grid' | 'list' // Add layout prop for different display modes
  // Auction-specific properties
  listingType?: 'direct-sale' | 'auction'
  auctionStartTime?: string
  auctionEndTime?: string
  currentHighestBid?: number
  reservePrice?: number
  totalBids?: number
  auctionStatus?: 'not-started' | 'active' | 'ending-soon' | 'ended'
  views?: number // Add views count
}

export default function LuxuryGemCard({ 
  id,
  name, 
  price,
  priceNumber, 
  location, 
  image, 
  carat,
  rarity,
  color,
  clarity,
  cut,
  treatment,
  seller,
  labCertified,
  className,
  isPlatformGem = false,
  priority = false,
  layout = 'grid',
  // Auction properties
  listingType = 'direct-sale',
  auctionStartTime,
  auctionEndTime,
  currentHighestBid,
  reservePrice,
  totalBids = 0,
  auctionStatus,
  views
}: LuxuryGemCardProps) {
  const { addItem, items, isAuthenticated } = useUserCart()
  const { addItem: addToWishlist, toggleItem: toggleWishlistItem, isInWishlist } = useWishlistStore()
  const { user } = useAuth()
  const router = useRouter()
  const [showSaveToast, setShowSaveToast] = useState<string | null>(null)
  
  const isInCart = items.some((item: CartItem) => item.id === id)
  const isWishlisted = isInWishlist(id)
  const isAuction = listingType === 'auction'
  
  // Get display name for seller - only use store name for buyers
  const getSellerDisplayName = () => {
    if (!seller?.storeSettings?.storeName) return 'Unnamed Store'
    return seller.storeSettings.storeName
  }
  
  // Auction utility functions
  const formatAuctionPrice = () => {
    if (!isAuction) return price
    
    if (currentHighestBid && currentHighestBid > 0) {
      return `$${currentHighestBid.toLocaleString()}`
    }
    
    // Show starting bid if no bids yet
    if (priceNumber) {
      return `$${priceNumber.toLocaleString()}`
    }
    
    return 'No bids yet'
  }
  
  const getAuctionButtonText = () => {
    if (!isAuction) return 'Add to Cart'
    
    switch (auctionStatus) {
      case 'not-started':
        return 'Auction Not Started'
      case 'ended':
        return 'Auction Ended'
      case 'ending-soon':
      case 'active':
        return `Place Bid ${totalBids ? `(${totalBids} bids)` : ''}`
      default:
        return `Place Bid ${totalBids ? `(${totalBids} bids)` : ''}`
    }
  }
  
  const canBidOrCart = () => {
    if (!isAuction) return !isInCart
    
    return auctionStatus === 'active' || auctionStatus === 'ending-soon'
  }

  // const renderStars = (rating: number) => {
  //   // For new sellers with no ratings, show empty stars
  //   const displayRating = rating > 0 ? rating : 0
  //   return [...Array(5)].map((_, i) => (
  //     <Star 
  //       key={i} 
  //       className={`w-3 h-3 ${i < Math.floor(displayRating) ? 'fill-primary text-primary' : 'text-border'}`} 
  //     />
  //   ))
  // }

  const handleSellerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!seller?.id) {
      console.warn('Seller ID not available for navigation')
      return
    }

    // Role-based routing for seller profiles
    router.push(`/seller/${seller.id}`)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Role-based routing for gem details
    if (!user) {
      router.push(`/gem/${id}`)
    } else {
      switch (user.role) {
        case 'admin':
          router.push(`/gem/${id}`)
          break
        case 'seller':
          router.push(`/gem/${id}`)
          break
        default:
          router.push(`/gem/${id}`)
      }
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent Link navigation
    e.stopPropagation()
    
    if (!isInCart && seller) {
      try {
        addItem({
          id,
          name,
          price,
          priceNumber,
          location,
          image,
          carat: carat || 'Unknown',
          rarity: rarity || 'Fine',
          seller: {
            id: seller.id || 'unknown',
            name: getSellerDisplayName(), // Store name only
            verified: seller.verified ?? false,
            rating: seller.rating ?? 0,
            totalReviews: seller.totalReviews ?? 0,
            location: seller.location || location || 'Unknown',
            storeSettings: seller.storeSettings // Store settings for display
          },
          gemType: name.split(' - ')[0] || 'Unknown',
          color: color || 'Unknown',
          clarity: clarity || 'Unknown',
          labCertified: labCertified || false,
          listingType: listingType || 'direct-sale'
        })
        setShowSaveToast('Added to cart')
      } catch (error) {
        // Handle self-purchase attempt
        if (error instanceof Error && error.message.includes('your own gems')) {
          setShowSaveToast('Cannot add your own gems to cart')
        } else {
          setShowSaveToast('Failed to add to cart')
          console.error('Error adding to cart:', error)
        }
      }
    }
  }

  const handlePlaceBid = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Navigate to gem detail page for bidding
    router.push(`/gem/${id}`)
  }

  const handleSaveToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      setShowSaveToast('Please sign in to save gems to your wishlist')
      setTimeout(() => setShowSaveToast(null), 3000)
      return
    }

    try {
      const result = await toggleWishlistItem(id)
      
      if (result.success) {
        if (result.action === 'added') {
          setShowSaveToast('Added to wishlist')
        } else {
          setShowSaveToast('Removed from wishlist')
        }
      } else {
        // Fallback to local storage method for backward compatibility
        if (isWishlisted) {
          // This shouldn't happen with toggle, but just in case
          setShowSaveToast('Failed to update wishlist')
        } else {
          addToWishlist({
            id,
            name,
            type: rarity || 'Gemstone',
            price,
            priceNumber,
            location,
            image,
            carat: carat || '',
            rarity: rarity || '',
            color,
            clarity,
            cut,
            treatment,
            labCertified,
            seller: seller ? {
              name: getSellerDisplayName(), // Use store name for wishlist
              verified: seller.verified,
              rating: seller.rating,
              totalReviews: seller.totalReviews
            } : undefined
          })
          setShowSaveToast('Added to wishlist')
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      setShowSaveToast('Failed to update wishlist')
    }
    
    setTimeout(() => setShowSaveToast(null), 2000)
  }

  if (layout === 'list') {
    return (
      <div className={cn(
        "group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden",
        "hover:border-primary/40 luxury-fade-in touch-manipulation",
        className
      )}>
        <div className="flex flex-col sm:flex-row h-full">
          {/* Image Container - Responsive Enhanced Focus */}
          <div className="relative flex-shrink-0 overflow-hidden group/image w-full sm:w-48 md:w-64 lg:w-72 xl:w-80 aspect-[4/3] sm:aspect-square">
            <S3Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 192px, (max-width: 1024px) 256px, (max-width: 1280px) 288px, 320px"
              priority={priority}
            />
            
            {/* Luxury Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-700" />
            
            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 sm:group-hover:opacity-100 transition-all duration-500 z-20">
              <button 
                onClick={handleSaveToWishlist}
                className={cn(
                  "w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer",
                  isWishlisted 
                    ? "bg-red-500/90 text-white" 
                    : "bg-white/90 hover:bg-white text-gray-800 hover:scale-110"
                )}>
                <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
              </button>
              <button 
                onClick={handleViewDetails}
                className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white text-gray-800 transition-all duration-300 shadow-lg hover:scale-110 cursor-pointer">
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {isPlatformGem && (
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1 sm:gap-1.5">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="text-xs sm:text-sm">ISHQ GEMS</span>
                </div>
              )}
              {isAuction && (
                <div className={cn(
                  "text-white font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1 sm:gap-1.5",
                  auctionStatus === 'ending-soon' ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse" :
                  auctionStatus === 'active' ? "bg-gradient-to-r from-purple-500 to-purple-600" :
                  "bg-gradient-to-r from-blue-500 to-blue-600"
                )}>
                  <Gavel className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="text-xs sm:text-sm">AUCTION</span>
                </div>
              )}
            </div>

            {/* Carat Badge */}
            {carat && (
              <div className="absolute bottom-4 left-4 z-10">
                <div className="bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {carat}
                </div>
              </div>
            )}
          </div>

          {/* Content Section - Responsive Minimalist */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-between min-w-0">
            <div className="space-y-3 sm:space-y-4">
              {/* Title - Responsive */}
              <div>
                <h3 className="font-serif text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight line-clamp-2">
                  {name}
                </h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary/60 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                  {views !== undefined && views > 0 && (
                    <>
                      <span className="text-primary/40 hidden sm:inline">•</span>
                      <div className="flex items-center gap-1 hidden sm:flex">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{views.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  {labCertified && (
                    <>
                      <span className="text-primary/40 hidden md:inline">•</span>
                      <span className="font-medium text-green-600 hidden md:inline">Certified</span>
                    </>
                  )}
                </div>
              </div>

              {/* Seller Info - Responsive */}
              {seller && (
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className="text-muted-foreground">by</span>
                  <button
                    onClick={handleSellerClick}
                    className="font-medium text-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                  >
                    {isPlatformGem && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />}
                    <span className="truncate">{getSellerDisplayName()}</span>
                    {seller.verified && (
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Price and Actions - Responsive */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatAuctionPrice()}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {isAuction ? 'Current Bid' : 'Price'}
                  </div>
                </div>
                
                {isAuction && auctionStartTime && auctionEndTime && (
                  <div className="text-right">
                    <AuctionTimer
                      auctionStartTime={auctionStartTime}
                      auctionEndTime={auctionEndTime}
                      currentHighestBid={currentHighestBid}
                      reservePrice={reservePrice}
                      compact={true}
                      showLabels={true}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                )}
              </div>
              
              {/* Action Buttons - Responsive Design */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={isAuction ? handlePlaceBid : handleAddToCart}
                  disabled={isAuction ? !canBidOrCart() : isInCart}
                  className={cn(
                    "flex-1 h-10 sm:h-12 lg:h-14 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 relative overflow-hidden",
                    "shadow-lg hover:shadow-xl transform hover:translate-y-[-1px] active:scale-95",
                    "flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer",
                    (isInCart && !isAuction) || (isAuction && auctionStatus === 'ended')
                      ? "bg-gray-500 text-white"
                      : isAuction 
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
                        : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-accent hover:to-primary"
                  )}
                  title={getAuctionButtonText()}
                >
                  {isAuction ? (
                    <>
                      <Gavel className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Place Bid</span>
                    </>
                  ) : isInCart ? (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Add to Cart</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleViewDetails}
                  className="px-4 sm:px-6 h-10 sm:h-12 lg:h-14 bg-secondary/80 hover:bg-secondary text-secondary-foreground rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-105 cursor-pointer"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium text-sm sm:text-base">Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Luxury Border Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

        {/* Toast */}
        {showSaveToast && (
          <div className="absolute top-4 left-4 right-4 bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg z-30">
            <p className="text-sm text-center font-medium text-foreground">{showSaveToast}</p>
          </div>
        )}
      </div>
    )
  }

  // Grid Layout - Modern Image-Focused Design
  return (
    <div className={cn(
      "group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden",
      "hover:border-primary/40 luxury-fade-in touch-manipulation h-full flex flex-col",
      className
    )}>
      {/* Image Container - Hero Focus */}
      <div className="relative aspect-[4/3] overflow-hidden group/image">
        <S3Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
          sizes="(max-width: 475px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          priority={priority}
        />
        
        {/* Luxury Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-700" />
        
        {/* Floating Action Buttons - Responsive */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2 opacity-0 sm:group-hover:opacity-100 transition-all duration-500 z-20">
          <button 
            onClick={handleSaveToWishlist}
            className={cn(
              "w-8 h-8 sm:w-9 sm:h-9 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer",
              isWishlisted 
                ? "bg-red-500/90 text-white" 
                : "bg-white/90 hover:bg-white text-gray-800 hover:scale-110"
            )}>
            <Heart className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isWishlisted && "fill-current")} />
          </button>
          <button 
            onClick={handleViewDetails}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white text-gray-800 transition-all duration-300 shadow-lg hover:scale-110 cursor-pointer">
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Status Badges - Responsive Top Left */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-1.5 z-10">
          {isPlatformGem && (
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-0.5 sm:gap-1">
              <Sparkles className="w-2 h-2 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline text-xs">ISHQ</span>
            </div>
          )}
          {isAuction && (
            <div className={cn(
              "text-white font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-0.5 sm:gap-1",
              auctionStatus === 'ending-soon' ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse" :
              auctionStatus === 'active' ? "bg-gradient-to-r from-purple-500 to-purple-600" :
              "bg-gradient-to-r from-blue-500 to-blue-600"
            )}>
              <Gavel className="w-2 h-2 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline text-xs">AUCTION</span>
              <span className="sm:hidden text-[10px]">BID</span>
            </div>
          )}
        </div>

        {/* Carat Badge - Responsive Bottom Left */}
        {carat && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-10">
            <div className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
              {carat}
            </div>
          </div>
        )}

        {/* Certified Badge - Responsive Bottom Right */}
        {labCertified && (
          <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-10 opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
            <div className="bg-green-500/90 text-white text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg backdrop-blur-sm">
              CERT
            </div>
          </div>
        )}
      </div>

      {/* Content Section - Responsive */}
      <div className="flex-1 p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3 flex flex-col">
        {/* Title & Location */}
        <div className="flex-shrink-0">
          <h3 className="font-serif text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight line-clamp-2 mb-1">
            {name}
          </h3>
          
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary/60 flex-shrink-0" />
            <span className="truncate text-xs sm:text-sm">{location}</span>
            {views !== undefined && views > 0 && (
              <>
                <span className="text-primary/40 hidden sm:inline">•</span>
                <div className="flex items-center gap-1 hidden sm:flex">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{views.toLocaleString()}</span>
                </div>
              </>
            )}
            {labCertified && (
              <>
                <span className="text-primary/40 hidden md:inline">•</span>
                <span className="font-medium text-green-600 text-xs sm:text-sm hidden md:inline">Certified</span>
              </>
            )}
          </div>
        </div>

        {/* Seller Info - Responsive */}
        {seller && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <span className="text-muted-foreground">by</span>
            <button
              onClick={handleSellerClick}
              className="font-medium text-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 sm:gap-1.5 truncate cursor-pointer"
            >
              {isPlatformGem && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />}
              <span className="truncate text-xs sm:text-sm">{getSellerDisplayName()}</span>
              {seller.verified && (
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full flex-shrink-0"></div>
              )}
            </button>
          </div>
        )}

        {/* Price Section - Responsive */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex items-end justify-between mb-2 sm:mb-3">
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {formatAuctionPrice()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {isAuction ? 'Current Bid' : 'Price'}
              </div>
            </div>
            
            {/* Auction Timer - Responsive */}
            {isAuction && auctionStartTime && auctionEndTime && (
              <div className="text-right">
                <AuctionTimer
                  auctionStartTime={auctionStartTime}
                  auctionEndTime={auctionEndTime}
                  currentHighestBid={currentHighestBid}
                  reservePrice={reservePrice}
                  compact={true}
                  showLabels={false}
                  className="text-xs sm:text-sm"
                />
              </div>
            )}
          </div>
          
          {/* Action Buttons - Responsive Layout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={isAuction ? handlePlaceBid : handleAddToCart}
              disabled={isAuction ? !canBidOrCart() : isInCart}
              className={cn(
                "flex-1 h-9 sm:h-10 lg:h-11 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 relative overflow-hidden",
                "shadow-lg hover:shadow-xl transform hover:translate-y-[-1px] active:scale-95",
                "flex items-center justify-center gap-1 sm:gap-2 cursor-pointer",
                (isInCart && !isAuction) || (isAuction && auctionStatus === 'ended')
                  ? "bg-gray-500 text-white cursor-default"
                  : isAuction 
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
                    : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-accent hover:to-primary"
              )}
              title={getAuctionButtonText()}
            >
              {isAuction ? (
                <>
                  <Gavel className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-bold">BID</span>
                </>
              ) : isInCart ? (
                <>
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-bold">ADDED</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-bold">CART</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleViewDetails}
              className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-secondary/80 hover:bg-secondary text-secondary-foreground rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center hover:scale-105 cursor-pointer"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Luxury Border Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      {/* Toast */}
      {showSaveToast && (
        <div className="absolute top-3 left-3 right-3 bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-2 shadow-lg z-30">
          <p className="text-xs text-center font-medium text-foreground">{showSaveToast}</p>
        </div>
      )}
    </div>
  )
} 