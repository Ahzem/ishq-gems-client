/**
 * Platform Settings Types
 */

export interface GeneralSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  supportEmail: string
  contactEmail: string
  companyName: string
  companyAddress: string
  maintenanceMode: boolean
  allowRegistration: boolean
  defaultLanguage: string
  defaultTimezone: string
  enableAnalytics: boolean
  analyticsId?: string
}

export interface PaymentSettings {
  commissionRate: number
  platformFeeRate: number
  minOrderAmount: number
  maxOrderAmount: number
  currency: string
  supportedCurrencies: string[]
  paymentMethods: string[]
  autoPayoutEnabled: boolean
  payoutThreshold: number
  payoutSchedule: 'daily' | 'weekly' | 'monthly'
  escrowEnabled: boolean
  escrowReleaseDays: number
  refundPolicy: string
  taxCalculationEnabled: boolean
  defaultTaxRate: number
}

export interface SecuritySettings {
  requireEmailVerification: boolean
  twoFactorEnabled: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  lockoutDuration: number
  passwordMinLength: number
  passwordRequireSpecialChars: boolean
  passwordRequireNumbers: boolean
  passwordRequireUppercase: boolean
  allowedFileTypes: string[]
  maxFileSize: number
  enableRateLimiting: boolean
  rateLimitRequests: number
  rateLimitWindow: number
  enableCaptcha: boolean
  captchaSiteKey?: string
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  orderNotifications: boolean
  paymentNotifications: boolean
  securityNotifications: boolean
  marketingEmails: boolean
  systemAlerts: boolean
  maintenanceAlerts: boolean
  weeklyReports: boolean
  monthlyReports: boolean
  notificationFrequency: 'immediate' | 'hourly' | 'daily'
}

export interface SellerSettings {
  verificationRequired: boolean
  autoApproveListings: boolean
  maxListingsPerSeller: number
  listingFee: number
  featuredListingFee: number
  allowSellerPromotions: boolean
  sellerCommissionTiers: CommissionTier[]
  requireSellerAgreement: boolean
  sellerAgreementUrl?: string
  enableSellerRatings: boolean
  minSellerRating: number
  enableSellerBadges: boolean
  sellerOnboardingRequired: boolean
  calendlyMeetingLink: string
  meetingDuration: number
  meetingInstructions: string
}

export interface BuyerSettings {
  guestCheckoutEnabled: boolean
  requireBuyerVerification: boolean
  enableBuyerProtection: boolean
  buyerProtectionFee: number
  enableWishlist: boolean
  enableComparisonTool: boolean
  maxCartItems: number
  cartExpiryDays: number
  enableBuyerReviews: boolean
  requirePurchaseForReview: boolean
  enableBuyerRewards: boolean
  rewardPointsRate: number
}

export interface ShippingSettings {
  enableShipping: boolean
  freeShippingThreshold: number
  defaultShippingRate: number
  internationalShippingRate: number
  enableExpressShipping: boolean
  expressShippingRate: number
  shippingZones: ShippingZone[]
  enableTrackingNumbers: boolean
  requireSignatureConfirmation: boolean
  insuranceEnabled: boolean
  defaultInsuranceRate: number
}

export interface ContentSettings {
  enableBlog: boolean
  enableFAQ: boolean
  enableLiveChat: boolean
  chatWidgetId?: string
  enableSocialLogin: boolean
  socialLoginProviders: string[]
  enableNewsletter: boolean
  newsletterApiKey?: string
  privacyPolicyUrl: string
  termsOfServiceUrl: string
  returnPolicyUrl: string
  cookiePolicyUrl: string
  enableCookieConsent: boolean
}

export interface ApiSettings {
  enablePublicApi: boolean
  apiRateLimit: number
  apiKeyRequired: boolean
  enableWebhooks: boolean
  webhookEndpoints: WebhookEndpoint[]
  enableCors: boolean
  allowedOrigins: string[]
  apiVersioning: boolean
  currentApiVersion: string
}

export interface CommissionTier {
  id: string
  name: string
  minSales: number
  maxSales?: number
  commissionRate: number
  isActive: boolean
}

export interface ShippingZone {
  id: string
  name: string
  countries: string[]
  regions: string[]
  shippingRate: number
  freeShippingThreshold?: number
  isActive: boolean
}

export interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  secret?: string
}

export interface PlatformSettings {
  general: GeneralSettings
  payment: PaymentSettings
  security: SecuritySettings
  notifications: NotificationSettings
  seller: SellerSettings
  buyer: BuyerSettings
  shipping: ShippingSettings
  content: ContentSettings
  api: ApiSettings
}

export interface SettingsUpdateRequest {
  category: keyof PlatformSettings
  settings: Partial<PlatformSettings[keyof PlatformSettings]>
}

export interface SettingsResponse {
  success: boolean
  message?: string
  data?: PlatformSettings
}

export interface SettingsValidationError {
  field: string
  message: string
  code: string
}

export interface SettingsValidationResponse {
  isValid: boolean
  errors: SettingsValidationError[]
  warnings?: SettingsValidationError[]
}

// Form field types
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'password' 
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'checkbox' 
  | 'radio' 
  | 'toggle'
  | 'file'
  | 'color'
  | 'date'
  | 'time'
  | 'url'

export interface SettingsFieldConfig {
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  description?: string
  options?: { label: string; value: string | number }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    customValidator?: (value: unknown) => string | null
  }
  dependency?: {
    field: string
    value: string | number | boolean
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than'
  }
  group?: string
  order?: number
  disabled?: boolean
}

export interface SettingsTabConfig {
  id: string
  label: string
  icon: string
  description?: string
  fields: SettingsFieldConfig[]
  order?: number
  requiredRole?: string[]
}

// Service Configuration Types
export interface SettingsServiceConfig {
  baseUrl: string
}

// Service Response Types
export interface SettingsUpdateResponse {
  success: boolean
  message?: string
  data?: PlatformSettings
  version?: number
  updatedAt?: Date
}

export interface SettingsHealthResponse {
  success: boolean
  data?: {
    status: 'healthy' | 'unhealthy'
    timestamp: Date
    settingsInitialized: boolean
    categories: string[]
    version?: string
    error?: string
  }
}
