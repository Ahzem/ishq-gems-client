/**
 * Entity types exports
 */

// Explicitly export specific types from user to avoid conflicts
export type {
  User,
  UserProfile,
  UserRole,
  UserPreferences,
  SellerInfo,
  BankAccount,
  SellerDocument,
  SellerDocumentType,
  SellerDocumentStatus,
  UserServiceConfig,
  UserServiceState,
  AvatarUploadResponse,
  UserStatistics,
  EnhancedUserPreferences,
  CreateAddressRequest,
  UpdateAddressRequest,
  DeleteAddressRequest,
  AddressResponse,
  AddressListResponse
} from './user'
export * from './gem'
export * from './bid'
export * from './order'
export * from './notification'
export * from './review'
export * from './cart'
export * from './marketplace'
export * from './payment'
export * from './settings'
export * from './admin'
export * from './message'

// Explicitly export specific types from seller to avoid conflicts
export type { 
  PublicSellerProfile, 
  SellerReview, 
  SellerGem, 
  SellerStats,
  SellerApplication,
  SellerVerification,
  SellerMetrics,
  SellerDashboardData,
  SellerServiceConfig,
  SellerServiceState,
  SellerApplicationStatusResponse,
  SellerSetupTokenResponse,
  SellerSetupAccountResponse
} from './seller'