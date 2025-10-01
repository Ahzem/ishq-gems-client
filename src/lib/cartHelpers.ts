import { EnhancedGem, GemMedia, CartItem } from '@/types'

export interface SellerInfo {
  id: string
  name: string // Store name only - derived from storeSettings
  verified: boolean
  rating: number
  totalReviews: number
  location: string
  country?: string
  shippingMode: 'seller_direct' | 'ishq_gems' | 'in_person'
  shippingFee: number
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

export interface GroupedSellerData {
  seller: SellerInfo
  items: CartItem[]
  subtotal: number
}

export interface GroupedCartItems {
  [sellerId: string]: GroupedSellerData
}

/**
 * Groups cart items by seller and enriches with seller information
 */
export function groupCartItemsBySeller(cartItems: CartItem[]): GroupedCartItems {
  const grouped: GroupedCartItems = {}
  
  // Validate cart items first to ensure no undefined properties
  const validatedItems = validateCartItems(cartItems)

  validatedItems.forEach(item => {
    // Use seller information from the cart item directly (no fake data lookup)
    if (!item.seller) {
      console.warn(`Cart item ${item.id} missing seller information`)
      return
    }

    const sellerId = item.seller.id
    
    if (!grouped[sellerId]) {
      // Extract country from seller location with safety checks
      const sellerLocation = item.seller.location || 'Unknown Location'
      const country = sellerLocation.includes(', ') 
        ? sellerLocation.split(', ').pop() || sellerLocation 
        : sellerLocation
      
      // Determine shipping mode and fee based on seller information
      const getShippingInfo = (sellerId: string, sellerName: string) => {
        const displayName = sellerName
        // Check if this is Ishq Gems (platform seller)
        if (sellerId === 'ishq-gems' || displayName.toLowerCase().includes('ishq')) {
          return { shippingMode: 'ishq_gems' as const, shippingFee: 200 }
        }
        
        // For third-party sellers, default to seller direct
        // This could be enhanced based on seller preferences from backend
        return { shippingMode: 'seller_direct' as const, shippingFee: 50 }
      }

      // Get display name from store settings only
      const displayName = item.seller.storeSettings?.storeName || 'Unnamed Store'
      const shippingInfo = getShippingInfo(sellerId, displayName)
      
      grouped[sellerId] = {
        seller: {
          id: item.seller.id || 'unknown',
          name: displayName, // Store name only
          verified: item.seller.verified ?? false,
          rating: item.seller.rating ?? 0,
          totalReviews: item.seller.totalReviews ?? 0,
          location: sellerLocation,
          storeSettings: item.seller.storeSettings || {
            storeName: 'Unnamed Store',
            primaryColor: '#3B82F6',
            secondaryColor: '#10B981',
            logoUrl: null,
            bannerUrl: null
          },
          country: country,
          shippingMode: shippingInfo.shippingMode,
          shippingFee: shippingInfo.shippingFee
        },
        items: [],
        subtotal: 0
      }
    }

    grouped[sellerId].items.push(item)
    grouped[sellerId].subtotal += item.priceNumber
  })

  return grouped
}

/**
 * Calculate total number of sellers in cart
 */
export function getTotalSellers(groupedItems: GroupedCartItems): number {
  return Object.keys(groupedItems).length
}

/**
 * Calculate grand total of all items in cart
 */
export function getGrandTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => total + item.priceNumber, 0)
}

/**
 * Get seller avatar fallback initials
 */
export function getSellerInitials(sellerName: string): string {
  return sellerName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Format price with currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

/**
 * Get country region classification for styling
 */
export function getCountryRegion(country: string): 'asia' | 'americas' | 'africa' | 'europe' | 'oceania' | 'other' {
  const regions: { [key: string]: 'asia' | 'americas' | 'africa' | 'europe' | 'oceania' | 'other' } = {
    'Sri Lanka': 'asia',
    'Myanmar': 'asia',
    'Colombia': 'americas',
    'Tanzania': 'africa',
    'Brazil': 'americas',
    'Madagascar': 'africa',
    'Thailand': 'asia',
    'Kenya': 'africa',
    'Afghanistan': 'asia',
    'Cambodia': 'asia',
    'India': 'asia',
    'Australia': 'oceania',
    'Zambia': 'africa',
    'Nigeria': 'africa',
    'USA': 'americas',
    'Canada': 'americas',
    'Germany': 'europe',
    'France': 'europe',
    'Italy': 'europe',
    'Spain': 'europe',
    'United Kingdom': 'europe',
    'Japan': 'asia',
    'China': 'asia',
    'South Korea': 'asia'
  }
  
  return regions[country] || 'other'
}

/**
 * Get star rating component data for rendering
 */
export function getStarRatingData(rating: number): { fullStars: number; hasHalfStar: boolean; emptyStars: number } {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return { fullStars, hasHalfStar, emptyStars }
}

/**
 * Get rarity badge color
 */
export function getRarityBadgeColor(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 'ultra rare':
      return 'badge-rarity-ultra-rare badge-enhanced'
    case 'exceptional':
      return 'badge-rarity-exceptional badge-enhanced'
    case 'premium':
      return 'badge-rarity-premium badge-enhanced'
    case 'fine':
      return 'badge-rarity-fine badge-enhanced'
    case 'good':
      return 'badge-rarity-good badge-enhanced'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 badge-enhanced'
  }
}

/**
 * Check if item is featured or new (based on cart item properties)
 */
export function getItemBadges(item: CartItem): { isNew: boolean; isFeatured: boolean; isLabCertified: boolean } {
  return {
    isNew: false, // Could be enhanced to track new items
    isFeatured: false, // Could be enhanced based on backend data
    isLabCertified: item.labCertified || false
  }
}

/**
 * Get shipping method display information
 */
export function getShippingMethodInfo(shippingMode: SellerInfo['shippingMode']): {
  label: string
  description: string
  icon: string
  hasInsurance: boolean
} {
  switch (shippingMode) {
    case 'ishq_gems':
      return {
        label: 'Handled by Ishq Gems (Insured)',
        description: 'Ishq Gems handles the shipping with full insurance coverage',
        icon: 'shield-check',
        hasInsurance: true
      }
    case 'seller_direct':
      return {
        label: 'Handled by Seller',
        description: 'Seller ships directly to you',
        icon: 'truck',
        hasInsurance: false
      }
    case 'in_person':
      return {
        label: 'In-Person at Ishq Gems Center',
        description: 'Pickup available at our showroom',
        icon: 'map-pin',
        hasInsurance: false
      }
    default:
      return {
        label: 'Standard Shipping',
        description: 'Standard delivery method',
        icon: 'package',
        hasInsurance: false
      }
  }
}

/**
 * Calculate total including shipping for a seller
 */
export function getSellerTotalWithShipping(items: CartItem[], shippingFee: number): number {
  const itemsTotal = items.reduce((total, item) => total + item.priceNumber, 0)
  return itemsTotal + shippingFee
}

/**
 * Calculate grand total including all shipping fees
 */
export function getGrandTotalWithShipping(groupedItems: GroupedCartItems): number {
  return Object.values(groupedItems).reduce((total, sellerData) => {
    const itemsTotal = sellerData.items.reduce((sum, item) => sum + item.priceNumber, 0)
    return total + itemsTotal + sellerData.seller.shippingFee
  }, 0)
}

/**
 * Convert backend gem data to cart item format
 */
/**
 * Validates and fixes cart items with missing or undefined seller properties
 */
export function validateCartItem(item: CartItem): CartItem {
  if (!item.seller) {
    return {
      ...item,
      seller: {
        id: 'unknown',
        name: 'Unnamed Store',
        verified: false,
        rating: 0,
        totalReviews: 0,
        location: item.location || 'Unknown',
        storeSettings: {
          storeName: 'Unnamed Store',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          logoUrl: null,
          bannerUrl: null
        }
      }
    }
  }

  return {
    ...item,
    seller: {
      id: item.seller.id || 'unknown',
      name: item.seller.storeSettings?.storeName || 'Unnamed Store', // Store name only
      verified: item.seller.verified ?? false,
      rating: item.seller.rating ?? 0,
      totalReviews: item.seller.totalReviews ?? 0,
      location: item.seller.location || item.location || 'Unknown',
      storeSettings: item.seller.storeSettings || {
        storeName: 'Unnamed Store',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        logoUrl: null,
        bannerUrl: null
      }
    }
  }
}

/**
 * Validates and fixes an array of cart items
 */
export function validateCartItems(items: CartItem[]): CartItem[] {
  return items.map(validateCartItem)
}

export function gemToCartItem(gem: EnhancedGem): Omit<CartItem, 'quantity'> {
  // Get primary image or fallback
  const primaryImage = gem.media?.find((m: GemMedia) => m.type === 'image' && m.isPrimary) || 
                      gem.media?.find((m: GemMedia) => m.type === 'image')

  // Format price based on listing type
  let price = 'Contact for price'
  let priceNumber = 0
  
  if (gem.listingType === 'direct-sale' && gem.price) {
    priceNumber = gem.price
    price = `$${gem.price.toLocaleString()}`
  } else if (gem.listingType === 'auction' && gem.startingBid) {
    priceNumber = gem.startingBid
    price = `Starting at $${gem.startingBid.toLocaleString()}`
  }

  // Determine rarity based on investment grade or other factors
  let rarity = 'Fine'
  if (gem.investmentGrade) {
    if (['A+', 'A'].includes(gem.investmentGrade)) rarity = 'Ultra Rare'
    else if (['A-', 'B+'].includes(gem.investmentGrade)) rarity = 'Exceptional'
    else if (['B', 'B-'].includes(gem.investmentGrade)) rarity = 'Premium'
    else if (['C+', 'C'].includes(gem.investmentGrade)) rarity = 'Good'
  }

  const displaySellerName = gem.sellerId.storeSettings?.storeName || 'Unnamed Store'

  const sellerRating = (gem as EnhancedGem & { sellerStats?: { averageRating?: number } }).sellerStats?.averageRating ?? gem.sellerId?.rating ?? 0
  const sellerTotalReviews = (gem as EnhancedGem & { sellerStats?: { totalReviews?: number } }).sellerStats?.totalReviews ?? gem.sellerId?.totalReviews ?? 0

  return {
    id: gem._id,
    name: `${gem.gemType} - ${gem.color}`,
    image: primaryImage?.url || '/images/gem-placeholder.svg',
    price,
    priceNumber,
    location: gem.origin || 'Unknown',
    carat: gem.weight ? `${gem.weight.value} ${gem.weight.unit}` : 'Unknown',
    rarity,
    seller: {
      id: gem.sellerId._id,
      name: displaySellerName, // Store name only
      verified: gem.sellerId.verified, // Real verification status
      rating: sellerRating, // Prefer sellerStats from backend
      totalReviews: sellerTotalReviews, // Prefer sellerStats from backend
      location: gem.sellerId.location || gem.origin || 'Unknown', // Real seller location
      storeSettings: gem.sellerId.storeSettings || {
        storeName: 'Unnamed Store',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        logoUrl: null,
        bannerUrl: null
      }
    },
    gemType: gem.gemType,
    color: gem.color,
    clarity: gem.clarity,
    origin: gem.origin,
    weight: gem.weight,
    listingType: gem.listingType,
    labCertified: !!gem.labReportId || !!gem.reportNumber
  }
} 