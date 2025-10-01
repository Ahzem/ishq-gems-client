/**
 * Filter types and interfaces
 */

import { GemCategory, GemType } from '../entities/gem'

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Sort field options
 */
export type SortField = 'price' | 'date' | 'popularity' | 'rating' | 'weight'

/**
 * Price range filter
 */
export interface PriceRange {
  min: number
  max: number
}

/**
 * Weight range filter
 */
export interface WeightRange {
  min: number
  max: number
}

/**
 * Gem filter options
 */
export interface GemFilterOptions {
  category?: GemCategory[]
  type?: GemType[]
  priceRange?: PriceRange
  weight?: WeightRange
  color?: string[]
  cut?: string[]
  clarity?: string[]
  origin?: string[]
  treatment?: string[]
  labCertified?: boolean
  sortBy?: SortField
  sortOrder?: SortOrder
  search?: string
  featured?: boolean
  seller?: string
  availability?: string[]
}

/**
 * Filter state interface
 */
export interface FilterState {
  filters: GemFilterOptions
  isLoading: boolean
  appliedFilters: number
  hasActiveFilters: boolean
}

/**
 * Filter action types
 */
export type FilterAction = 
  | { type: 'SET_FILTER'; payload: { key: keyof GemFilterOptions; value: GemFilterOptions[keyof GemFilterOptions] } }
  | { type: 'CLEAR_FILTER'; payload: keyof GemFilterOptions }
  | { type: 'CLEAR_ALL_FILTERS' }
  | { type: 'SET_LOADING'; payload: boolean } 