/**
 * Base interfaces and utility types used across the application
 */

/**
 * Base entity structure for all database entities
 */
export interface BaseEntity {
  _id: string
  createdAt: string
  updatedAt: string
}

/**
 * Utility type for making all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Utility type for making specific keys optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Utility type for making specific keys required
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Common address interface
 */
export interface Address {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  label?: string
}

/**
 * Address type for different use cases
 */
export type AddressType = 'personal' | 'delivery'

/**
 * Enhanced address interface with type and metadata
 */
export interface UserAddress extends Address {
  id: string
  type: AddressType
  label: string
  isDefault?: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Common pagination information
 */
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Common sort options
 */
export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

/**
 * Common filter options
 */
export interface FilterOptions {
  search?: string
  dateRange?: {
    start: string
    end: string
  }
  status?: string[]
  tags?: string[]
}

/**
 * Common query parameters for API requests
 */
export interface QueryParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
  status?: string
} 