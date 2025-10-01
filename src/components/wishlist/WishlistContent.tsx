'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import S3Image from '@/components/common/S3Image'
import { Heart, Trash2, ShoppingBag, Eye, Sparkles, Gem, Star, MapPin, RefreshCw } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { WishlistItem } from '@/types/entities/cart'
import { useUserCart } from '@/hooks/useUserCart'
import { cn } from '@/lib/utils'
import { CartSeller } from '@/types/entities/cart'
import wishlistService from '@/services/wishlist.service'
import gemService from '@/services/gem.service'
import { EnhancedGem, FlexibleGemListResponseData, WishlistResponse, WishlistApiResponse, WishlistApiItem, WishlistApiGem, WishlistApiGemSeller } from '@/types'

interface WishlistContentProps {
  className?: string
  emptyStateHref?: string
  emptyStateText?: string
}

export default function WishlistContent({ 
  className,
  emptyStateHref = "/explore",
  emptyStateText = "Explore Gemstones"
}: WishlistContentProps) {
  const { isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { addItem: addToCart, items: cartItems } = useUserCart()
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [suggestedGems, setSuggestedGems] = useState<EnhancedGem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin?message=Please sign in to view your wishlist')
    }
  }, [isAuthenticated, authLoading, router])

  // Validate wishlist response structure
  const validateWishlistResponse = (response: unknown): response is WishlistResponse => {
    if (!response || typeof response !== 'object') return false
    const resp = response as Record<string, unknown>
    return (
      typeof resp.success === 'boolean' &&
      (!resp.data || (
        typeof resp.data === 'object' &&
        Array.isArray((resp.data as Record<string, unknown>).items)
      ))
    )
  }

  // Fetch wishlist data
  const fetchWishlist = useCallback(async (page: number = 1) => {
    if (!isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await wishlistService.getUserWishlist(page, 20)
      
      // Validate response structure
      if (!validateWishlistResponse(response)) {
        setError('Invalid response format from server')
        return
      }
      
      if (response.success && response.data) {
        // Transform the API response to match the expected WishlistItem structure
        const apiResponse = response as unknown as WishlistApiResponse
        const transformedItems = apiResponse.data.items.map((item: WishlistApiItem) => {
          const gem: WishlistApiGem = item.gem || {} as WishlistApiGem;
          const seller: WishlistApiGemSeller = gem.seller || {} as WishlistApiGemSeller;
          
          // Create a meaningful name from gem data
          const gemName = [
            gem.variety || gem.gemType,
            gem.color,
            gem.weight?.value ? `${gem.weight.value}${gem.weight.unit || 'ct'}` : null
          ].filter(Boolean).join(' ') || gem.title || 'Untitled Gem';
          
          return {
            id: item.id,
            gemId: item.gemId,
            name: gemName,
            type: gem.variety || gem.gemType || gem.category || 'Gemstone',
            price: gem.price ? `$${gem.price.toLocaleString()}` : 'Price on request',
            priceNumber: gem.price || 0,
            location: gem.origin || 'Unknown Origin',
            image: gem.images?.[0] || '/images/gem-placeholder.svg',
            carat: gem.weight?.value ? `${gem.weight.value} ${gem.weight.unit || 'ct'}` : 'Unknown',
            rarity: gem.investmentGrade || 'Fine',
            color: gem.color || 'Unknown',
            clarity: gem.clarity || 'Unknown',
            cut: gem.shapeCut || 'Unknown',
            treatment: gem.treatments || 'Unknown',
            labCertified: gem.labName ? true : false,
            seller: seller.id ? {
              name: seller.storeSettings?.storeName || 'Unknown Seller',
              verified: true, // Assuming verified for now
              rating: 4.5, // Default rating
              totalReviews: 0 // Default reviews
            } : undefined,
            dateAdded: item.dateAdded
          };
        });
        
        setWishlistItems(transformedItems)
        setCurrentPage(response.data.pagination.page)
        setTotalPages(response.data.pagination.pages)
      } else {
        // Check if it's a server not ready issue
        if (response.message?.includes('API endpoint not found') || response.message?.includes('not found')) {
          setError('Wishlist feature is currently being set up. Please try again later.')
        } else {
          setError(response.message || 'Failed to fetch wishlist')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wishlist'
      // Check if it's a network/server issue
      if (errorMessage.includes('API endpoint not found') || errorMessage.includes('not found')) {
        setError('Wishlist feature is currently being set up. Please try again later.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Fetch suggested gems when wishlist is empty
  const fetchSuggestedGems = async () => {
    try {
      const response = await gemService.getAllGems({ 
        page: 1, 
        limit: 6, 
        status: 'published',
        featured: true 
      })
      
      if (response.success && response.data) {
        // Handle the actual API response structure using type-safe approach
        const responseData = response.data as FlexibleGemListResponseData;
        
        // Check if it's the direct structure
        if ('gems' in responseData && Array.isArray(responseData.gems)) {
          setSuggestedGems(responseData.gems)
        } else if ('data' in responseData && responseData.data?.gems) {
          // Nested structure: { data: { gems: [...], pagination: {...} } }
          setSuggestedGems(responseData.data.gems)
        }
      }
    } catch (err) {
      console.error('Error fetching suggested gems:', err)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated, fetchWishlist])

  // Fetch suggested gems when wishlist is empty
  useEffect(() => {
    if (wishlistItems.length === 0 && !isLoading) {
      fetchSuggestedGems()
    }
  }, [wishlistItems.length, isLoading])

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const handleRemoveFromWishlist = async (id: string, gemId: string, name: string) => {
    try {
      const response = await wishlistService.removeFromWishlist(gemId)
      
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item.id !== id))
        setShowToast(`${name} removed from wishlist`)
      } else {
        setError(response.message || 'Failed to remove item')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item')
    }

    setTimeout(() => setShowToast(null), 2000)
  }

  const handleAddToCart = (item: WishlistItem) => {
    const isInCart = cartItems.some((cartItem) => cartItem.id === item.id)
    
    if (!isInCart) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        priceNumber: item.priceNumber,
        location: item.location,
        image: item.image,
        carat: item.carat,
        rarity: item.rarity,
        seller: item.seller as unknown as CartSeller
      })
      setShowToast(`${item.name} added to cart`)
      setTimeout(() => setShowToast(null), 2000)
    }
  }

  const handleRefresh = () => {
    fetchWishlist(currentPage)
  }

  const isInCart = (id: string) => cartItems.some(item => item.id === id)

  const getRarityColor = (grade?: string) => {
    switch (grade?.toLowerCase()) {
      case 'investment': 
      case 'ultra rare': return 'badge-rarity-ultra-rare'
      case 'premium':
      case 'exceptional': return 'badge-rarity-exceptional'
      case 'fine':
      case 'good': return 'badge-rarity-premium'
      case 'fair':
      case 'commercial': return 'badge-rarity-fine'
      default: return 'badge-rarity-good'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Error state
  if (error) {
    return (
      <div className={cn("min-h-[400px] flex items-center justify-center", className)}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Wishlist</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length === 0 
              ? "No items saved yet" 
              : `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved`
            }
          </p>
        </div>
        {wishlistItems.length > 0 && (
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your wishlist...</p>
          </div>
        </div>
      ) : wishlistItems.length === 0 ? (
        // Empty State
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="mb-8">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-8">
              Start building your dream collection by saving gems you love
            </p>
            <Link
              href={emptyStateHref}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform"
            >
              <Sparkles className="w-5 h-5" />
              {emptyStateText}
            </Link>
          </div>

          {/* Suggested Gems */}
          {suggestedGems.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-8 justify-center">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                <h3 className="text-xl font-serif font-bold text-foreground">
                  Suggested for You
                </h3>
                <div className="w-1 h-6 bg-gradient-to-b from-accent to-primary rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedGems.map((gem) => (
                  <Link
                    key={gem._id}
                    href={`/gem/${gem._id}`}
                    className="group bg-card rounded-xl border border-border hover:border-primary/30 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform"
                  >
                      <div className="relative aspect-square overflow-hidden">
                        <S3Image
                          src={gem.media?.[0]?.url || '/images/gem-placeholder.svg'}
                          alt={`${gem.gemType} ${gem.color}`.trim()}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(gem.investmentGrade || 'Good')}`}>
                          {gem.investmentGrade || 'Good'}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                          {`${gem.gemType} ${gem.color}`.trim()}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">{gem.origin}</p>
                        <div className="text-lg font-bold text-primary">
                          {gem.price ? `$${gem.price.toLocaleString()}` : 
                           gem.startingBid ? `Starting at $${gem.startingBid.toLocaleString()}` : 
                           'Price on request'}
                        </div>
                      </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Wishlist Items
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item, index) => (
              <div
                key={item.id}
                className="group bg-card rounded-xl border border-border hover:border-primary/30 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <S3Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id, item.gemId || item.id, item.name)}
                    className="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {item.rarity && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </div>
                    )}
                    {item.labCertified && (
                      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        CERT
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Link
                      href={`/gem/${item.id}`}
                      className="w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all duration-300 border border-border/50"
                      title="View details"
                    >
                      <Eye className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3 text-primary/60" />
                      <span className="truncate">{item.location}</span>
                      {item.carat && (
                        <>
                          <span>•</span>
                          <span>{item.carat}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Seller Info */}
                  {item.seller && (
                    <div className="flex items-center justify-between text-xs bg-secondary/20 rounded-lg p-2">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">by</span>
                        <span className="font-medium text-foreground truncate">{item.seller.name}</span>
                        {item.seller.verified && (
                          <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        <span className="text-muted-foreground">{item.seller.rating}</span>
                      </div>
                    </div>
                  )}

                  {/* Price and Date */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-primary">
                      {item.price}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added {formatDate(item.dateAdded)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={isInCart(item.id)}
                      className={cn(
                        "w-full py-2 px-3 rounded-lg font-medium transition-all duration-300 text-sm",
                        isInCart(item.id)
                          ? "bg-green-500 text-white cursor-default"
                          : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-accent hover:to-primary"
                      )}
                    >
                      {isInCart(item.id) ? (
                        <span className="flex items-center justify-center gap-2">
                          <Gem className="w-4 h-4" />
                          In Cart
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </span>
                      )}
                    </button>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/gem/${item.id}`}
                        className="flex-1 text-center py-2 px-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-primary/10 hover:text-primary transition-all duration-300 text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id, item.gemId || item.id, item.name)}
                        className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 text-sm"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchWishlist(page)}
                  disabled={isLoading}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg transition-colors",
                    page === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-medium text-foreground">{showToast}</p>
        </div>
      )}
    </div>
  )
} 