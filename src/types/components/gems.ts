/**
 * Gem component-related types and interfaces
 */

import { ListingType, MediaType, WeightUnit } from '../entities/gem'

// ============================================================================
// Gem Filter Types (for components)
// ============================================================================

/**
 * Extended gem type interface for component usage
 */
export interface ComponentGemType {
  id: string
  name: string
  category: string
}

/**
 * Gem filter configuration
 */
export interface GemFilter {
  id: string
  name: string
  options: string[]
}

/**
 * Filter options for gem search/filtering
 */
export interface FilterOptions {
  gemTypes: string[]
  colors: string[]
  shapes: string[]
  origins: string[]
  clarities: string[]
  treatments: string[]
  investmentGrades: string[]
  fluorescenceTypes: string[]
  polishGrades: string[]
  symmetryGrades: string[]
  priceRange: { min: number; max: number }
  caratRange: { min: number; max: number }
  labNames: string[]
}

/**
 * Gem listing type for component display
 */
export interface GemListingType {
  _id: string
  gemType: string
  color: string
  weight: {
    value: number
    unit: WeightUnit
  }
  price?: number
  startingBid?: number
  listingType: ListingType
  origin: string
  clarity: string
  shapeCut?: string
  treatments?: string
  investmentGrade?: string
  sellerId: {
    _id: string
    fullName: string
    email: string
  }
  media: Array<{
    _id: string
    type: MediaType
    url: string
    isPrimary?: boolean
    order: number
  }>
  views: number
  likes: number
  submittedAt: string
  featured: boolean
}

// ============================================================================
// Search Component Types
// ============================================================================

/**
 * Search bar component props
 */
export interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  initialValue?: string
}

// ============================================================================
// Cart Component Types
// ============================================================================

/**
 * Cart item display interface (for UI components)
 */
export interface CartItemDisplay {
  id: string
  name: string
  image: string
  price: string
  priceNumber: number
  location: string
  carat?: string
  rarity?: string
  quantity: number
}

/**
 * Cart button component state
 */
export interface CartButtonState {
  isVisible: boolean
  isAnimating: boolean
  totalItems: number
  totalPrice: number
}
