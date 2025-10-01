'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useUserCart } from '@/hooks/useUserCart'
import { useWishlistStore } from '@/store/wishlistStore'
import gemService from '@/services/gem.service'
import { gemToCartItem } from '@/lib/cartHelpers'
import { environment } from '@/config/environment'
import { 
  ArrowLeft,
  ChevronLeft, 
  ChevronRight,
  MapPin, 
  Download, 
  Play, 
  Shield, 
  Star, 
  Heart, 
  ShoppingBag, 
  Check,
  Expand,
  Loader2,
  AlertCircle,
  Gavel,
  Eye
} from 'lucide-react'
import BiddingSection from '@/components/bidding/BiddingSection'
import SocialShare from '@/components/social/SocialShare'
import StructuredData from '@/components/seo/StructuredData'
import { EnhancedGem, GemMedia, GemData, AuctionStatus, MarketplaceGemMedia } from '@/types/entities'
import { generateGemSEO } from '@/lib/seo'
import { GemSEOData } from '@/types/seo'
import MessageSellerButton from '@/components/messages/MessageSellerButton'

export default function GemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuth()
  const { addItem, items } = useUserCart()
  const { isInWishlist, addItemByGemId, removeItem: removeFromWishlist } = useWishlistStore()
  const gemId = params.id as string
  
  const [gem, setGem] = useState<GemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isImageExpanded, setIsImageExpanded] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [triggerPlaceBid, setTriggerPlaceBid] = useState(false) // Add state for triggering place bid
  
  // Wishlist states
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [showWishlistToast, setShowWishlistToast] = useState<string | null>(null)

  // Fetch gem data from backend
  useEffect(() => {
    const fetchGem = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await gemService.getGemById(gemId)
        
        if (response.success && response.data) {
          // Transform backend data to UI format
          const gemData = transformGemData(response.data as EnhancedGem)
          setGem(gemData)
        } else {
          setError(response.message || 'Failed to load gem details')
        }
      } catch (err) {
        console.error('Error fetching gem:', err)
        setError(err instanceof Error ? err.message : 'Failed to load gem details')
      } finally {
        setLoading(false)
      }
    }

    if (gemId) {
      fetchGem()
    }
  }, [gemId])

  // Track gem view when component mounts (excludes owner views)
  useEffect(() => {
    const trackView = async () => {
      if (!gemId) return;

      try {
        const response = await gemService.trackGemView(gemId);
        
        if (response.success && response.data) {
          // Update the view count in the gem data if available
          if (gem && response.data.tracked) {
            setGem(prevGem => prevGem ? {
              ...prevGem,
              views: response.data!.views
            } : null);
          }
          
          // Optional: Log view tracking for debugging
          if (environment.isDevelopment) {
            console.log('Gem view tracked:', {
              gemId,
              views: response.data.views,
              tracked: response.data.tracked
            });
          }
        }
      } catch (err) {
        // Silently handle view tracking errors - don't interrupt user experience
        console.warn('Failed to track gem view:', err);
      }
    };

    // Track view after gem data is loaded
    if (gem) {
      trackView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gemId, gem?._id]) // Only track when gem is loaded - excluding 'gem' to avoid infinite loop

  // Transform backend gem data to UI format
  const transformGemData = (backendGem: EnhancedGem): GemData => {
    // Extract images from media
    const images = backendGem.media
      ?.filter((media: GemMedia) => media.type === 'image')
      ?.sort((a: GemMedia, b: GemMedia) => a.order - b.order)
      ?.map((media: GemMedia) => ({
        url: media.url,
        alt: `${backendGem.gemType} - ${backendGem.color}`
      })) || []

    // Extract video URL
    const videoMedia = backendGem.media?.find((media: GemMedia) => media.type === 'video')
    const videoUrl = videoMedia?.url
    
    // Debug video information
    if (videoMedia) {
      console.log('Video media found:', {
        type: videoMedia.type,
        url: videoMedia.url,
        originalFilename: videoMedia.filename,
        size: videoMedia.fileSize,
        isAccessible: !!videoMedia.url
      })
    } else {
      console.log('No video media found in gem data')
    }

    // Validate video URL with more comprehensive checks
    const isValidVideoUrl = videoUrl && 
      typeof videoUrl === 'string' && 
      videoUrl.trim().length > 0 &&
      videoUrl !== 'undefined' &&
      videoUrl !== 'null' &&
      (
        videoUrl.startsWith('http') || 
        videoUrl.startsWith('/') ||
        videoUrl.startsWith('blob:')
      )

    // Create enhanced gem data for UI
    return {
      _id: backendGem._id || '',
      id: backendGem._id || '',
      gemType: backendGem.gemType || 'Unknown',
      variety: backendGem.variety,
      color: backendGem.color || 'Unknown',
      weight: backendGem.weight || { value: 0, unit: 'ct' },
      dimensions: backendGem.dimensions ? {
        length: backendGem.dimensions.length.toString(),
        width: backendGem.dimensions.width.toString(),
        height: backendGem.dimensions.height.toString(),
        unit: backendGem.dimensions.unit
      } : undefined,
      shapeCut: backendGem.shapeCut,
      clarity: backendGem.clarity || 'Unknown',
      origin: backendGem.origin || 'Unknown',
      treatments: backendGem.treatments,
      price: backendGem.price,
      startingBid: backendGem.startingBid,
      reservePrice: backendGem.reservePrice,
      listingType: backendGem.listingType || 'direct-sale',
      status: backendGem.status || 'pending',
      reportNumber: backendGem.reportNumber || 'Unknown',
      labName: backendGem.labName || 'Unknown',
      additionalComments: backendGem.additionalComments,
      auctionStartTime: backendGem.auctionStartTime,
      auctionEndTime: backendGem.auctionEndTime,
      currentHighestBid: backendGem.currentHighestBid,
      totalBids: backendGem.totalBids,
      auctionStatus: backendGem.auctionStatus as AuctionStatus,
      finalizedBidId: backendGem.finalizedBidId,
      media: backendGem.media as MarketplaceGemMedia[],
      labReportId: undefined, // Enhanced gem uses string labReportId, not object
      sellerId: backendGem.sellerId || { _id: '', email: '' },
      name: `${backendGem.gemType || 'Unknown'}${backendGem.variety ? ` - ${backendGem.variety}` : ''} - ${backendGem.color || 'Unknown'}`,
      carat: `${backendGem.weight?.value || 0} ${backendGem.weight?.unit || 'ct'}`,
      rarity: backendGem.investmentGrade || 'Premium',
      location: backendGem.origin || 'Unknown',
      category: backendGem.gemType || 'Unknown',
      description: backendGem.additionalComments || `A beautiful ${backendGem.color || 'colored'} ${backendGem.gemType || 'gemstone'} from ${backendGem.origin || 'unknown origin'}. ${backendGem.treatments ? `Treatment: ${backendGem.treatments}.` : ''}`,
      views: backendGem.views || 0,
      images,
      videoUrl: isValidVideoUrl ? videoUrl : undefined,
      hasLabReport: !!backendGem.labReportId,
      labReportUrl: (backendGem.labReportId && typeof backendGem.labReportId === 'object' && 'url' in backendGem.labReportId) 
        ? (backendGem.labReportId as { url: string }).url 
        : undefined,
      specifications: {
        weight: `${backendGem.weight?.value || 0} ${backendGem.weight?.unit || 'ct'}`,
        color: backendGem.color || 'Unknown',
        clarity: backendGem.clarity || 'Unknown',
        origin: backendGem.origin || 'Unknown',
        ...(backendGem.shapeCut && { cut: backendGem.shapeCut }),
        ...(backendGem.treatments && { treatment: backendGem.treatments }),
        ...(backendGem.dimensions && {
          dimensions: `${backendGem.dimensions.length} × ${backendGem.dimensions.width} × ${backendGem.dimensions.height} ${backendGem.dimensions.unit}`
        }),
        ...(backendGem.views !== undefined && backendGem.views > 0 && {
          views: `${backendGem.views.toLocaleString()} views`
        }),
        labName: backendGem.labName || 'Unknown',
        reportNumber: backendGem.reportNumber || 'Unknown'
      },
      seller: {
        id: backendGem.sellerId?._id || '',
        verified: backendGem.sellerId?.verified || true,
        type: backendGem.sellerType === 'Platform' ? 'Platform' : 'Third-Party' as const,
        rating: backendGem.sellerStats?.averageRating || 0,
        totalReviews: backendGem.sellerStats?.totalReviews || 0,
        yearsInBusiness: backendGem.sellerId?.yearsInBusiness || 1,
        location: backendGem.sellerId?.location || backendGem.origin || 'Unknown',
        storeSettings: backendGem.sellerId?.storeSettings || {
          storeName: 'Unnamed Store',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          logoUrl: null,
          bannerUrl: null
        }
      }
    }
  }

  // Get the appropriate back navigation path based on user role
  const getBackPath = () => {
    // Use browser history to go back if available
    if (window.history.length > 2) {
      return -1 // Return -1 to trigger history.back() navigation
    }
    // Fallback paths if no history
    if (!user) return '/explore'
    switch (user.role) {
      case 'admin':
        return '/dashboard/explore'
      case 'seller': 
        return '/dashboard/explore'
      default:
        return '/explore'
    }
  }

  const getBackLabel = () => {
    if (!user) return 'Back to Explore'
    
    switch (user.role) {
      case 'admin':
      case 'seller':
        return 'Back to Dashboard'
      default:
        return 'Back to Explore'
    }
  }

  // Check if gem is already in cart
  const isInCart = gem ? items.some(item => item.id === gem.id) : false

  // Handle video play - play directly without validation
  const handlePlayVideo = async () => {
    if (!gem?.videoUrl) {
      setVideoError('No video URL available')
      return
    }

    console.log('Playing video directly:', gem.videoUrl)
    setVideoError(null)
    setVideoLoading(false) // Don't show loading state
    setIsVideoPlaying(true) // Play immediately
  }

  // Handle 403 errors by refreshing media URLs
  const handleRefreshMediaUrls = async () => {
    if (!gem?.id) return

    console.log('Refreshing media URLs for gem:', gem.id)
    setVideoLoading(true)
    setVideoError(null)

    try {
      const response = await gemService.refreshGemMediaUrls(gem.id)
      
      if (response.success && response.data) {
        // Update gem data with fresh URLs
        const videoMedia = response.data.media.find(m => m.type === 'video')
        
        if (videoMedia) {
          // Update the gem state with fresh video URL
          setGem(prevGem => {
            if (!prevGem) return null
            
            // Find and update video URL in images/videoUrl
            const updatedGem = {
              ...prevGem,
              videoUrl: videoMedia.url,
              images: prevGem.images.map((img, index) => {
                // Update image URLs too
                const imageMedia = response.data!.media.find(m => 
                  m.type === 'image' && m.order === index
                )
                return imageMedia ? { ...img, url: imageMedia.url } : img
              })
            }
            
            return updatedGem
          })
          
          console.log('Media URLs refreshed successfully, new video URL:', videoMedia.url)
          setVideoLoading(false)
          setIsVideoPlaying(true)
        } else {
          throw new Error('No video found in refreshed media')
        }
      } else {
        throw new Error(response.message || 'Failed to refresh media URLs')
      }
    } catch (error) {
      console.error('Failed to refresh media URLs:', error)
      setVideoLoading(false)
      setVideoError('Failed to refresh video URL - please try again later')
    }
  }

  // Handle adding gem to cart
  const handleAddToCart = () => {
    if (!gem) return

    if (isInCart) {
      // If already in cart, navigate to appropriate cart page
      const cartPath = !user ? '/account/cart' : 
        user.role === 'admin' ? '/admin/cart' : 
        user.role === 'seller' ? '/seller/cart' : '/account/cart'
      router.push(cartPath)
      return
    }

    // Add to cart using the helper function
    try {
      addItem(gemToCartItem(gem as unknown as EnhancedGem))
      setShowWishlistToast('Added to cart successfully!')
      setTimeout(() => setShowWishlistToast(null), 3000)
    } catch (error) {
      // Handle self-purchase attempt
      if (error instanceof Error && error.message.includes('your own gems')) {
        setShowWishlistToast('You cannot add your own gems to cart')
      } else {
        setShowWishlistToast('Failed to add to cart')
        console.error('Error adding to cart:', error)
      }
      setTimeout(() => setShowWishlistToast(null), 3000)
    }
  }

  // Handle admin actions
  const handleManageGem = () => {
    if (user?.role === 'admin') {
      router.push(`/admin/gems/${gem?.id}`)
    }
  }

  const handleContactSeller = () => {
    if (gem?.seller?.id) {
      router.push(`/seller/${gem.seller.id}`)
    }
  }

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      setShowWishlistToast('Please sign in to save items to your wishlist')
      setTimeout(() => setShowWishlistToast(null), 3000)
      return
    }

    if (!gem?.id) return

    setWishlistLoading(true)

    try {
      const isCurrentlyInWishlist = isInWishlist(gem.id)

      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        await removeFromWishlist(gem.id)
        setShowWishlistToast('Removed from wishlist')
      } else {
        // Add to wishlist
        const success = await addItemByGemId(gem.id)
        if (success) {
          setShowWishlistToast('Added to wishlist')
        } else {
          setShowWishlistToast('Failed to add to wishlist')
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      setShowWishlistToast('Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
      setTimeout(() => setShowWishlistToast(null), 2000)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Loading Gem Details</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Please wait while we fetch the gemstone information...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !gem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {error ? 'Error Loading Gem' : 'Gem Not Found'}
          </h1>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                          {error || "The gemstone you&apos;re looking for doesn&apos;t exist."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
{getBackPath() === -1 ? (
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                {getBackLabel()}
              </button>
            ) : (
              <Link 
                href={getBackPath() as string}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                {getBackLabel()}
              </Link>
            )}
            {error && (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl text-sm sm:text-base hover:bg-secondary/80 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gem.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gem.images.length) % gem.images.length)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Ultra Rare': return 'from-red-500 to-red-600'
      case 'Exceptional': return 'from-purple-500 to-purple-600'
      case 'Premium': return 'from-primary to-accent'
      case 'Fine': return 'from-blue-500 to-blue-600'
      default: return 'from-primary to-accent'
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(rating) ? 'fill-primary text-primary' : 'text-border'}`} 
      />
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-Optimized Navigation Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
{getBackPath() === -1 ? (
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-secondary hover:bg-primary/10 text-foreground hover:text-primary rounded-lg transition-all duration-300 group text-sm sm:text-base"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="hidden xs:inline">{getBackLabel()}</span>
                <span className="xs:hidden">Back</span>
              </button>
            ) : (
              <Link 
                href={getBackPath() as string}
                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-secondary hover:bg-primary/10 text-foreground hover:text-primary rounded-lg transition-all duration-300 group text-sm sm:text-base"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="hidden xs:inline">{getBackLabel()}</span>
                <span className="xs:hidden">Back</span>
              </Link>
            )}
            
            <div className="flex items-center gap-2 sm:gap-3">
              {gem && (
                <SocialShare
                  title={gem.name}
                  description={gem.description || `Beautiful ${gem.color} ${gem.gemType} from ${gem.location}`}
                  url={typeof window !== 'undefined' ? `${window.location.origin}/gem/${gem.id}` : `/gem/${gem.id}`}
                  image={gem.images[0]?.url}
                  className=""
                />
              )}
              <button 
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                title={gem && isInWishlist(gem.id) ? "Remove from Wishlist" : "Add to Wishlist"} 
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 ${
                  gem && isInWishlist(gem.id)
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                    : 'bg-secondary hover:bg-red-50 dark:hover:bg-red-900/20 text-foreground hover:text-red-500'
                } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {wishlistLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${gem && isInWishlist(gem.id) ? 'fill-current' : ''}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Mobile-First Image Gallery */}
          <div className="space-y-4 sm:space-y-6">
            {/* Main Image Display */}
            <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-secondary/20 group">
              {!isVideoPlaying ? (
                <>
                  <Image
                    src={gem.images[currentImageIndex].url}
                    alt={gem.images[currentImageIndex].alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  
                  {/* Mobile-Optimized Navigation Arrows */}
                  {gem.images.length > 1 && (
                    <>
                      <button
                        title="Previous Image"
                        onClick={prevImage}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-background/90 backdrop-blur-sm text-foreground rounded-full flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        title="Next Image"
                        onClick={nextImage}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-background/90 backdrop-blur-sm text-foreground rounded-full flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  )}

                  {/* Mobile-Optimized Expand Button */}
                  <button
                    title="Expand Image"
                    onClick={() => setIsImageExpanded(true)}
                    className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-background/90 backdrop-blur-sm text-foreground rounded-full flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                  >
                    <Expand className="w-3 h-3 sm:w-5 sm:h-5" />
                  </button>
                </>
              ) : (
                <div className="relative w-full h-full bg-black rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center">
                  {videoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                  
                  {videoError ? (
                    <div className="text-center text-white p-4">
                      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                      <p className="text-sm mb-2">Unable to load video</p>
                      <p className="text-xs text-red-300 mb-4">{videoError}</p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                          onClick={handleRefreshMediaUrls}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-sm transition-colors"
                        >
                          Refresh URLs
                        </button>
                        <button
                          onClick={() => setIsVideoPlaying(false)}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                        >
                          Back to Images
                        </button>
                        {gem.videoUrl && (
                          <a
                            href={gem.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                          >
                            Open in New Tab
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    gem.videoUrl ? (
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                        onLoadStart={() => {
                          setVideoLoading(true)
                          // Set a longer timeout for video loading (30 seconds)
                          const timeout = setTimeout(() => {
                            setVideoLoading(false)
                            setVideoError('Video loading is taking longer than expected - please check your connection')
                          }, 30000)
                          setLoadingTimeout(timeout)
                        }}
                        onLoadedData={() => {
                          setVideoLoading(false)
                          // Clear the loading timeout
                          if (loadingTimeout) {
                            clearTimeout(loadingTimeout)
                            setLoadingTimeout(null)
                          }
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLVideoElement | HTMLSourceElement
                          let errorMessage = 'Unable to play video'
                          
                          if (target.tagName === 'VIDEO') {
                            const videoElement = target as HTMLVideoElement
                            const mediaError = videoElement.error
                            
                            // Only show error for genuine media errors, not network issues
                            switch (mediaError?.code) {
                              case MediaError.MEDIA_ERR_DECODE:
                                errorMessage = 'Video file is corrupted or invalid'
                                break
                              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                errorMessage = 'Video format not supported by browser'
                                break
                              case MediaError.MEDIA_ERR_ABORTED:
                                // Don't show error for aborted loading (user might have clicked away)
                                return
                              case MediaError.MEDIA_ERR_NETWORK:
                                // For network errors, try to continue playing - might be temporary
                                console.warn('Network error loading video, but continuing...')
                                return
                              default:
                                errorMessage = 'Unable to play video - please try refreshing'
                            }
                          }
                          
                          console.warn('Video error:', errorMessage)
                          
                          setVideoLoading(false)
                          setVideoError(errorMessage)
                          
                          // Clear the loading timeout
                          if (loadingTimeout) {
                            clearTimeout(loadingTimeout)
                            setLoadingTimeout(null)
                          }
                        }}
                        onEnded={() => {
                          setIsVideoPlaying(false)
                          // Clear any remaining timeout
                          if (loadingTimeout) {
                            clearTimeout(loadingTimeout)
                            setLoadingTimeout(null)
                          }
                        }}
                      >
                        {/* Only add MP4 source initially to avoid multiple error calls */}
                        <source src={gem.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white bg-gray-800">
                        <div className="text-center">
                          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                          <p className="text-sm">No valid video URL available</p>
                        </div>
                      </div>
                    )
                  )}
                  
                  {/* Close video button */}
                  <button
                    onClick={() => {
                      setIsVideoPlaying(false)
                      setVideoError(null)
                      setVideoLoading(false)
                      // Clear any remaining timeout
                      if (loadingTimeout) {
                        clearTimeout(loadingTimeout)
                        setLoadingTimeout(null)
                      }
                    }}
                    className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-background/90 backdrop-blur-sm text-foreground rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-300 z-20"
                    title="Close video"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Mobile-Optimized Badges */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2">
                {gem.carat && (
                  <div className="bg-background/90 backdrop-blur-sm text-foreground text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-border">
                    {gem.carat}
                  </div>
                )}
                {gem.rarity && (
                  <div className={`bg-gradient-to-r ${getRarityColor(gem.rarity)} text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-2 rounded-full shadow-lg`}>
                    {gem.rarity}
                  </div>
                )}
              </div>

              {/* Mobile-Optimized Image Counter */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-background/90 backdrop-blur-sm text-foreground text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-border">
                {currentImageIndex + 1} / {gem.images.length}
              </div>
            </div>

            {/* Mobile-Optimized Thumbnail Navigation */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {gem.images.map((image: { url: string; alt: string }, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  title={`View ${image.alt}`}
                  className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'border-primary shadow-lg scale-105' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 64px, 80px"
                  />
                </button>
              ))}
              
              {/* Mobile-Optimized Video Thumbnail */}
              {gem.videoUrl && (
                <button
                  onClick={handlePlayVideo}
                  title="Play video"
                  className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 bg-secondary/50 flex items-center justify-center group"
                >
                  <Play className="w-4 h-4 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 text-xs bg-primary text-primary-foreground px-1 rounded">
                    VIDEO
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Mobile-Optimized Gem Details */}
          <div className="space-y-6 sm:space-y-8">
            {/* Mobile-First Header Info */}
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                {gem.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-sm sm:text-base">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span>{gem.location}</span>
                </div>
                <span className="text-muted-foreground hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm font-medium text-primary bg-primary/10 px-2 sm:px-3 py-1 rounded-full">
                  {gem.category}
                </span>
                {gem.views !== undefined && gem.views > 0 && (
                  <>
                    <span className="text-muted-foreground hidden sm:inline">•</span>
                    <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-sm sm:text-base">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <span>{gem.views.toLocaleString()} views</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {gem.listingType === 'direct-sale' && gem.price
                  ? `$${gem.price.toLocaleString()}`
                  : gem.listingType === 'auction' && gem.startingBid
                  ? `Starting at $${gem.startingBid.toLocaleString()}`
                  : 'Price on request'}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
                Price includes certification & secure shipping
              </div>
            </div>

            {/* Mobile-Optimized Specifications */}
            <div className="bg-secondary/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50">
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {Object.entries(gem.specifications).map(([key, value]: [string, string]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-border/30 last:border-b-0 text-sm sm:text-base">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium text-foreground text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile-Optimized Description */}
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Description</h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {gem.description}
              </p>
            </div>

            {/* Bidding Section for Auction Gems */}
            {gem.listingType === 'auction' && (
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-4 sm:p-6 border border-primary/20 bidding-section">
                <BiddingSection
                  gemId={gem._id}
                  listingType={gem.listingType}
                  startingBid={gem.startingBid || 0}
                  reservePrice={gem.reservePrice || 0}
                  currentHighestBid={gem.currentHighestBid || 0}
                  totalBids={gem.totalBids || 0}
                  auctionStartTime={gem.auctionStartTime}
                  auctionEndTime={gem.auctionEndTime}
                  sellerId={gem.sellerId._id}
                  isFinalized={!!gem.finalizedBidId}
                  triggerPlaceBid={triggerPlaceBid}
                  onTriggerPlaceBidReset={() => setTriggerPlaceBid(false)}
                  onBidPlaced={() => {
                    // Refresh gem data to show updated bid info
                    // This could be improved with real-time updates
                  }}
                />
              </div>
            )}

            {/* Mobile-Optimized Seller Information */}
            <div className="bg-gradient-to-r from-secondary/20 to-secondary/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50">
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Seller Information
              </h3>
              
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button 
                      onClick={() => router.push(`/seller/${gem.seller.id}`)}
                      className="font-semibold text-foreground text-base sm:text-lg hover:text-yellow-600 transition-colors duration-200 text-left cursor-pointer"
                    >
                      {gem.seller.storeSettings.storeName}
                    </button>
                    {gem.seller.verified && (
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-2 h-2 sm:w-3 sm:h-3" />
                        VERIFIED
                      </div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <div>{gem.seller.type === 'Platform' ? 'Ishq Gems Official Seller' : 'Certified Third-Party Seller'}</div>
                    <div>{gem.seller.yearsInBusiness} years in business • {gem.seller.location}</div>
                  </div>
                </div>
                
                <MessageSellerButton
                  sellerId={gem.seller.id}
                  sellerName={gem.seller.storeSettings.storeName}
                  gemId={gem.id}
                  gemName={gem.name}
                  size="sm"
                  variant="outline"
                  className="self-start cursor-pointer"
                />
              </div>

              {/* Mobile-Optimized Seller Rating */}
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-background/50 rounded-xl">
                <div className="flex items-center gap-1">
                  {renderStars(gem.seller.rating)}
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold text-foreground">{gem.seller.rating}</span>
                  <span className="text-muted-foreground"> ({gem.seller.totalReviews} seller reviews)</span>
                </div>
              </div>
            </div>

            {/* Mobile-Optimized Lab Report */}
            <div className="bg-gradient-to-r from-secondary/20 to-secondary/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50">
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Certification</h3>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${gem.hasLabReport ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center`}>
                    {gem.hasLabReport && <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />}
                  </div>
                  <div>
                    <span className="text-foreground font-medium text-sm sm:text-base">
                      Lab Report: {gem.hasLabReport ? 'Available' : 'Not Provided'}
                    </span>
                    {gem.hasLabReport && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Certified by {gem.specifications.labName || 'Certified Laboratory'}
                      </div>
                    )}
                  </div>
                </div>
                
                {gem.hasLabReport && gem.labReportUrl && (
                  <button 
                    onClick={() => {
                      // Open the lab report URL in a new tab for download
                      window.open(gem.labReportUrl, '_blank')
                    }}
                    title="Download lab report"
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors duration-200 text-xs sm:text-sm font-medium border border-primary/20 self-start cursor-pointer">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    Download Report
                  </button>
                )}
              </div>
            </div>

            {/* Mobile-Optimized Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:pt-6 border-t border-border/50">
              {/* Admin Actions */}
              {user?.role === 'admin' && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Admin Actions
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleManageGem}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
                    >
                      Manage Gem
                    </button>
                    <button
                      onClick={handleContactSeller}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      View Seller Profile
                    </button>
                    <MessageSellerButton
                      sellerId={gem.seller.id}
                      sellerName={gem.seller.storeSettings.storeName}
                      gemId={gem.id}
                      gemName={gem.name}
                      size="sm"
                      variant="secondary"
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Regular User Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {gem.listingType === 'auction' ? (
                  <>
                    <button 
                      onClick={() => {
                        // Scroll to bidding section
                        const biddingSection = document.querySelector('.bidding-section')
                        if (biddingSection) {
                          biddingSection.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                      title="View auction details"
                      className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-6 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform text-sm sm:text-base bg-gradient-to-r from-primary to-accent text-primary-foreground cursor-pointer"
                    >
                      <Gavel className="w-4 h-4 sm:w-5 sm:h-5" />
                      View Auction Details
                    </button>
                    
                    <button 
                      onClick={() => {
                        // Trigger the place bid form
                        setTriggerPlaceBid(true)
                        // Scroll to bidding section
                        setTimeout(() => {
                          const biddingSection = document.querySelector('.bidding-section')
                          if (biddingSection) {
                            biddingSection.scrollIntoView({ behavior: 'smooth' })
                          }
                        }, 100)
                      }}
                      title="Place bid"
                      className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 border border-yellow-400 hover:border-yellow-500 font-semibold text-sm sm:text-base shadow-lg cursor-pointer">
                      Place Bid
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleAddToCart}
                      title={isInCart ? "View in cart" : "Add to cart"}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-6 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform text-sm sm:text-base cursor-pointer ${
                        isInCart 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                      {isInCart ? 'View in Cart' : 'Add to Cart'}
                    </button>
                    
                    <MessageSellerButton
                      sellerId={gem.seller.id}
                      sellerName={gem.seller.storeSettings.storeName}
                      gemId={gem.id}
                      gemName={gem.name}
                      size="md"
                      variant="outline"
                      className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Mobile-Optimized Trust Indicators */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border/50">
              <div className="text-center group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors duration-300">
                  <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">100% Authentic</span>
              </div>
              <div className="text-center group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors duration-300">
                  <Star className="w-4 h-4 sm:w-6 sm:h-6 text-primary fill-primary" />
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">Investment Grade</span>
              </div>
              <div className="text-center group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors duration-300">
                  <Download className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Expanded Image Modal */}
      {isImageExpanded && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="relative max-w-full max-h-full">
            <Image
              src={gem.images[currentImageIndex].url}
              alt={gem.images[currentImageIndex].alt}
              width={800}
              height={800}
              className="object-contain max-h-[90vh] max-w-[95vw]"
            />
              <button
                onClick={() => setIsImageExpanded(false)}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-background/90 backdrop-blur-sm text-foreground rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-300 text-lg sm:text-xl cursor-pointer"
                title="Close expanded image"
              >
                ×
              </button>
          </div>
        </div>
      )}

      {/* Wishlist Toast Notification */}
      {showWishlistToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-medium text-foreground">{showWishlistToast}</p>
        </div>
      )}

      {/* Structured Data for SEO */}
      {gem && (
        <StructuredData 
          data={generateGemSEO({
            id: gem.id,
            name: gem.name,
            gemType: gem.gemType || gem.category,
            color: gem.color || 'Unknown',
            weight: typeof gem.weight === 'string' 
              ? { value: parseFloat(gem.carat) || 0, unit: 'ct' }
              : gem.weight || { value: 0, unit: 'ct' },
            price: gem.price || undefined,
            startingBid: gem.startingBid || undefined,
            listingType: gem.listingType || 'direct-sale',
            origin: gem.location || gem.origin || 'Unknown',
            images: gem.images || [],
            seller: {
              name: gem.seller?.storeSettings?.storeName || 'Unknown Seller',
              verified: gem.seller?.verified || true
            },
            status: gem.status || 'published',
            description: gem.description
          } as GemSEOData).structuredData || []}
        />
      )}
    </div>
  )
} 