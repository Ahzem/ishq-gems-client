/**
 * Main types export file
 * 
 * This file exports all types from the organized type system.
 * Import from here for better tree-shaking and cleaner imports.
 */

// Common types
export * from './common'

// API types
export * from './api'

// Entity types
export * from './entities'

// Auth types
export * from './auth'

// Form types
export * from './forms'

// Component types (explicit exports to avoid conflicts)
export type {
  // Notification component types
  BidEvent,
  BackendNotification,
  BiddingNotificationsProps,
  NotificationBellProps,
  NotificationModalProps,
  NotificationSystemProps,
  NotificationItemProps,
  RealTimeNotificationsProps,
  NotificationDropdownProps,
  NotificationPosition,
  NotificationPriority,
  BidEventType,
  NotificationFilter,
  NotificationSoundConfig,
  // Auth component types (renamed to avoid conflicts)
  ComponentAuthContextType,
  LegacyUser,
  LegacyAuthState,
  // Gem component types
  ComponentGemType,
  GemFilter,
  SearchBarProps,
  GemListingType,
  // Form component types (these are defined in forms, not components)
  // Common component types
  SEOProps,
  AlertType,
  AlertPlacement
} from './components'

// Filter types
export * from './filters'

// Hook types (explicit exports to avoid conflicts)
export type {
  UseUserCartReturn,
  UseRealTimeNotificationsOptions,
  NotificationBidUpdate,
  SystemMessage,
  UseRealTimeNotificationsReturn,
  SocketWithTransport,
  ConnectionError,
  IncomingMessageData,
  TypingIndicator,
  ReadReceipt,
  UseRealTimeMessagesOptions,
  UseRealTimeMessagesReturn,
  BidUpdateEvent,
  AuctionData,
  UseRealTimeBidsOptions,
  UseRealTimeBidsReturn,
  UseRealTimeAuctionReturn,
  OnlineStatusHook,
  GemFiltersState,
  UseGemFiltersReturn,
  UseCaptchaOptions,
  UseCaptchaReturn,
  UseLabReportStorageReturn,
  UseBackNavigationOptions,
  UseBackNavigationReturn,
  UseLocalStorageReturn,
  CartStore,
  UseCartReturn,
  WishlistStore
} from './hooks'

// Settings types
export * from './entities/settings'

// Legacy exports for backward compatibility
// TODO: Remove these after all imports are updated
export type { 
  // Keep some key exports for backward compatibility during migration
  User,
  UserProfile,
  UserRole,
  SellerInfo,
  UserServiceConfig,
  UserServiceState,
  AvatarUploadResponse,
  UserStatistics,
  EnhancedUserPreferences,
  Gem,
  EnhancedGem,
  GemSeller,
  BidData,
  Order,
  Notification,
  PlatformReview,
  PublicSellerProfile,
  SellerReview,
  SellerGem,
  SellerServiceConfig,
  SellerServiceState,
  SellerApplicationStatusResponse,
  SellerSetupTokenResponse,
  SellerSetupAccountResponse,
  GemData,
  CartItem,
  WishlistItem,
  // Message types
  Message,
  ChatThread,
  MessageUser,
  LinkPreview,
  // Address types
  CreateAddressRequest,
  UpdateAddressRequest,
  DeleteAddressRequest,
  AddressResponse,
  AddressListResponse
} from './entities'

export type {
  ApiResponse,
  AdminGemResponse,
  AdminGemsListResponse,
  BidResponse,
  BidListResponse,
  BidStatsResponse,
  GemListResponse,
  DirectGemListResponse,
  FlexibleGemListResponseData,
  LabReportExtractionResponse,
  ExtractionInfoResponse,
  JobProgress,
  NotificationResponse,
  MessageUnreadCountResponse,
  ReviewsResponse,
  ReviewStatsResponse,
  InvoiceDataResponse,
  // Seller response types
  SellerReviewsResponse,
  SellerGemsResponse,
  ReviewLikeResponse,
  FollowResponse,
  FollowersResponse,
  // Auth response types
  AuthUser,
  LoginResponse,
  SignupResponse,
  TokenVerificationResponse,
  RefreshTokenResponse,
  PasswordResetResponse,
  PasswordResetConfirmResponse,
  ChangePasswordResponse,
  EmailVerificationResponse,
  LogoutResponse,
  LoginApiResponse,
  SignupApiResponse,
  TokenVerificationApiResponse,
  RefreshTokenApiResponse,
  PasswordResetApiResponse,
  PasswordResetConfirmApiResponse,
  ChangePasswordApiResponse,
  EmailVerificationApiResponse,
  LogoutApiResponse,
  // Admin response types
  AdminActionResponse,
  ContactResponse,
  BlockResponse,
  VerificationResponse,
  MeetLinkResponse,
  SellerUsersResponse,
  SellerApplicationsResponse,
  BuyersResponse,
  AdminFlaggedReviewsResponse,
  MessageResponse,
  AdminDashboardStatsResponse,
  AdminRecentActivityResponse,
  AdminBuyerStatsResponse,
  AdminFlaggedReviewsStatsResponse,
  AdminSellerApplicationResponse,
  AdminBuyerUserResponse,
  // Message types
  MessagesResponse,
  ChatsResponse,
  SendMessageResponse,
  UserInfoResponse,
  BlockedUsersResponse,
  MessageActionResponse
} from './api'

export type {
  AuthTokens,
  LoginCredentials,
  RegisterCredentials
} from './auth'

export type {
  PlaceBidRequest,
  UpdateBidRequest,
  GemListQuery,
  CreateGemRequest,
  UpdateGemRequest,
  FileUploadRequest,
  S3UploadResponse,
  CreateNotificationRequest,
  UpdateProfileRequest,
  CreateReviewRequest,
  CreatePlatformReviewRequest,
  NotificationQuery,
  SellerReviewQuery,
  SellerGemsQuery,
  AdminBidFilters,
  AuctionOptions,
  // Auth types
  LoginRequest,
  SignupRequest,
  RefreshTokenRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  ChangePasswordRequest,
  EmailVerificationRequest,
  ResendVerificationRequest,
  // Admin types
  ContactSellerRequest,
  BlockSellerRequest,
  UpdateBuyerStatusRequest,
  AdminSellersQuery,
  AdminBuyersQuery,
  AdminSellerApplicationsQuery,
  AdminFlaggedReviewsQuery,
  AdminRecentActivityQuery,
  RejectSellerRequest,
  RejectReviewRequest,
  // Message types
  SendMessageRequest,
  GetMessagesRequest,
  GetChatsRequest,
  MarkAsReadRequest,
  ReportMessageRequest,
  BlockUserRequest,
  UnblockUserRequest
} from './api'

// Additional wishlist types from entities
export type {
  WishlistServiceConfig,
  WishlistServiceState,
  WishlistResponse,
  WishlistAddResponse,
  WishlistCheckResponse,
  WishlistCountResponse,
  WishlistMoveToCartResponse,
  WishlistStatsResponse,
  WishlistQueryParams
} from './entities/cart'

// Wishlist API types
export type {
  WishlistApiGemSeller,
  WishlistApiGem,
  WishlistApiItem,
  WishlistApiPagination,
  WishlistApiResponse,
  WishlistToggleApiResponse
} from './api/wishlist.types'

// Additional review types from entities
export type {
  ReviewServiceConfig,
  ReviewServiceState,
  ReviewQueryParams,
  CreatePlatformReviewResponse
} from './entities/review' 