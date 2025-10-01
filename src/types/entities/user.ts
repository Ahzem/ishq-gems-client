/**
 * User entity types and interfaces
 */

import { BaseEntity, Address, UserAddress } from '../common/base'

/**
 * User roles in the system
 */
export type UserRole = 'buyer' | 'seller' | 'admin'

/**
 * User preferences configuration
 */
export interface UserPreferences {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  currency: 'USD' | 'EUR' | 'GBP'
  language: 'en' | 'es' | 'fr'
}

/**
 * Core user entity
 */
export interface User extends BaseEntity {
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  isVerified: boolean
  phone?: string
  address?: Address // Legacy field for backward compatibility
  addresses?: UserAddress[] // New multiple addresses field
  preferences?: UserPreferences
}

/**
 * Extended user profile with additional fields
 */
export interface UserProfile extends User {
  id: string
  fullName: string
  isEmailVerified: boolean
  bio?: string
  lastLogin?: Date
  // Role-specific fields
  isVerifiedSeller?: boolean
  sellerStatus?: string
  gemsListedCount?: number
  orderCount?: number
  wishlistCount?: number
  adminPermissions?: string[]
}

/**
 * Seller-specific information
 */
export interface SellerInfo extends BaseEntity {
  userId: string
  businessType: 'individual' | 'company'
  taxId?: string
  bankAccount?: BankAccount
  commission: number
  totalSales: number
  rating: number
  isVerified: boolean
  documents: SellerDocument[]
}

/**
 * Bank account information for sellers
 */
export interface BankAccount {
  accountHolder: string
  accountNumber: string
  bankName: string
  routingNumber: string
}

/**
 * Seller document types
 */
export type SellerDocumentType = 'id' | 'business_license' | 'tax_document'

/**
 * Seller document status
 */
export type SellerDocumentStatus = 'pending' | 'approved' | 'rejected'

/**
 * Seller document interface
 */
export interface SellerDocument {
  type: SellerDocumentType
  url: string
  status: SellerDocumentStatus
  uploadedAt: string
}

/**
 * User service configuration interface
 */
export interface UserServiceConfig {
  baseUrl: string
  retryOptions: {
    maxRetries: number
    retryCondition: (error: unknown) => boolean
  }
  cacheOptions: {
    userProfileTtl: number
    userOrdersTtl: number
    userStatisticsTtl: number
    userPreferencesTtl: number
  }
  validation: {
    minPasswordLength: number
    maxFileSize: number
    allowedImageTypes: string[]
    maxBioLength: number
    maxBusinessNameLength: number
  }
}

/**
 * User service state interface
 */
export interface UserServiceState {
  startTime: number
  lastError?: string
}

/**
 * Avatar upload response interface
 */
export interface AvatarUploadResponse {
  avatar: string
}

/**
 * User statistics interface
 */
export interface UserStatistics {
  totalOrders: number
  totalSpent: number
  totalReviews: number
  averageRating: number
  wishlistCount: number
  accountAge: number // in days
  lastOrderDate?: string
  favoriteCategory?: string
}

/**
 * Enhanced user preferences interface
 */
export interface EnhancedUserPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  currency?: string
  emailNotifications?: boolean
  smsNotifications?: boolean
  marketingEmails?: boolean
  priceAlerts?: boolean
  bidNotifications?: boolean
  orderUpdates?: boolean
  newsletter?: boolean
  timezone?: string
  measurementUnit?: 'metric' | 'imperial'
  [key: string]: unknown // Allow additional preferences
}

/**
 * Address management request types
 */
export interface CreateAddressRequest {
  type: 'personal' | 'delivery'
  label: string
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  isDefault?: boolean
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  id: string
}

export interface DeleteAddressRequest {
  id: string
}

/**
 * Address management response types
 */
export interface AddressResponse {
  success: boolean
  message?: string
  data?: UserAddress
}

export interface AddressListResponse {
  success: boolean
  message?: string
  data?: UserAddress[]
} 