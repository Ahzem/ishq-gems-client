/**
 * Seller Settings Types for Frontend
 */

/**
 * Main Seller Settings Interface
 */
export interface SellerSettings {
  store: StoreSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  notifications: NotificationSettings;
  policies: PolicySettings;
  verification: VerificationSettings;
}

/**
 * Individual Settings Categories
 */
export interface StoreSettings {
  storeName: string;
  storeSlogan: string;
  storeDescription: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | File;
  bannerUrl?: string | File;
}

export interface PaymentSettings {
  paymentMethod: SellerPaymentMethod;
  bankDetails: BankDetails;
  isSetup: boolean;
}

export interface BankDetails {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
  bankBranch: string;
}

export interface ShippingSettings {
  domesticShipping: boolean;
  internationalShipping: boolean;
  processingTime: SellerProcessingTime;
  customProcessingTime?: string;
  defaultShippingRate: number;
  freeShippingThreshold: number;
  packagingInstructions: string;
  shippingRegions: string[];
}

export interface NotificationSettings {
  orderNotifications: boolean;
  bidNotifications: boolean;
  reviewNotifications: boolean;
  marketingEmails: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  pushNotifications: boolean;
  emailFrequency: SellerEmailFrequency;
}

export interface PolicySettings {
  returnPolicy: string;
  shippingPolicy: string;
  warrantyPolicy: string;
  termsOfService?: string;
}

export interface VerificationSettings {
  isVerified: boolean;
  verificationLevel: SellerVerificationLevel;
  status: SellerVerificationStatus;
  requirements: VerificationRequirements;
}

export interface VerificationRequirements {
  nicSubmitted: boolean;
  ngjaLicenseSubmitted: boolean;
  backgroundCheckPassed: boolean;
  interviewCompleted: boolean;
  documentsVerified: boolean;
}

/**
 * API Request/Response Types
 */
export interface SellerSettingsResponse {
  sellerId: string;
  store: StoreSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  notifications: NotificationSettings;
  policies: PolicySettings;
  verification: VerificationSettings;
  updatedAt: string;
  createdAt: string;
}

export interface UpdateSellerSettingsRequest {
  store?: Partial<StoreSettings>;
  payment?: Partial<PaymentSettings>;
  shipping?: Partial<ShippingSettings>;
  notifications?: Partial<NotificationSettings>;
  policies?: Partial<PolicySettings>;
  verification?: Partial<VerificationSettings>;
}

export interface UpdateSellerSettingsResponse {
  sellerId: string;
  updatedFields: string[];
  updatedAt: string;
  message: string;
}

/**
 * Form and UI Types
 */
export type SellerSettingsFormData = SellerSettings;

export interface SellerSettingsErrors {
  [category: string]: {
    [field: string]: string;
  };
}

export interface SellerSettingsValidationError {
  field: string;
  message: string;
  category?: string;
}

/**
 * Enums
 */
export enum SellerPaymentMethod {
  BANK_TRANSFER = 'bank-transfer',
  PAYPAL = 'paypal',
  WISE = 'wise'
}

export enum SellerProcessingTime {
  ONE_TO_TWO_DAYS = '1-2_days',
  THREE_TO_FIVE_DAYS = '3-5_days',
  ONE_WEEK = '1_week',
  TWO_WEEKS = '2_weeks',
  CUSTOM = 'custom'
}

export enum SellerVerificationLevel {
  BASIC = 'basic',
  ENHANCED = 'enhanced',
  PREMIUM = 'premium'
}

export enum SellerVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum SellerEmailFrequency {
  IMMEDIATE = 'immediate',
  DAILY = 'daily',
  WEEKLY = 'weekly'
}

/**
 * Constants and Options
 */
export const PAYMENT_METHOD_OPTIONS = [
  { value: SellerPaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
  { value: SellerPaymentMethod.PAYPAL, label: 'PayPal (Coming Soon)' },
  { value: SellerPaymentMethod.WISE, label: 'Wise (Coming Soon)' }
] as const;

export const PROCESSING_TIME_OPTIONS = [
  { value: SellerProcessingTime.ONE_TO_TWO_DAYS, label: '1-2 Business Days' },
  { value: SellerProcessingTime.THREE_TO_FIVE_DAYS, label: '3-5 Business Days' },
  { value: SellerProcessingTime.ONE_WEEK, label: '1 Week' },
  { value: SellerProcessingTime.TWO_WEEKS, label: '2 Weeks' },
  { value: SellerProcessingTime.CUSTOM, label: 'Custom' }
] as const;

export const EMAIL_FREQUENCY_OPTIONS = [
  { value: SellerEmailFrequency.IMMEDIATE, label: 'Immediate' },
  { value: SellerEmailFrequency.DAILY, label: 'Daily Digest' },
  { value: SellerEmailFrequency.WEEKLY, label: 'Weekly Summary' }
] as const;

export const VERIFICATION_LEVEL_OPTIONS = [
  { value: SellerVerificationLevel.BASIC, label: 'Basic' },
  { value: SellerVerificationLevel.ENHANCED, label: 'Enhanced' },
  { value: SellerVerificationLevel.PREMIUM, label: 'Premium' }
] as const;

/**
 * Default Values
 */
export const DEFAULT_SELLER_SETTINGS: SellerSettings = {
  store: {
    storeName: '',
    storeSlogan: '',
    storeDescription: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    logoUrl: '',
    bannerUrl: ''
  },
  payment: {
    paymentMethod: SellerPaymentMethod.BANK_TRANSFER,
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      iban: '',
      swiftCode: '',
      bankBranch: ''
    },
    isSetup: false
  },
  shipping: {
    domesticShipping: true,
    internationalShipping: false,
    processingTime: SellerProcessingTime.ONE_TO_TWO_DAYS,
    customProcessingTime: '',
    defaultShippingRate: 5,
    freeShippingThreshold: 100,
    packagingInstructions: '',
    shippingRegions: []
  },
  notifications: {
    orderNotifications: true,
    bidNotifications: true,
    reviewNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
    monthlyReports: true,
    pushNotifications: false,
    emailFrequency: SellerEmailFrequency.IMMEDIATE
  },
  policies: {
    returnPolicy: '',
    shippingPolicy: '',
    warrantyPolicy: '',
    termsOfService: ''
  },
  verification: {
    isVerified: false,
    verificationLevel: SellerVerificationLevel.BASIC,
    status: SellerVerificationStatus.PENDING,
    requirements: {
      nicSubmitted: false,
      ngjaLicenseSubmitted: false,
      backgroundCheckPassed: false,
      interviewCompleted: false,
      documentsVerified: false
    }
  }
};

/**
 * Validation Rules (Frontend)
 */
export const SELLER_SETTINGS_VALIDATION = {
  store: {
    storeNameMinLength: 2,
    storeNameMaxLength: 50,
    storeSloganMaxLength: 100,
    storeDescriptionMaxLength: 500,
    colorPattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  payment: {
    bankNameMaxLength: 100,
    accountHolderNameMaxLength: 100,
    accountNumberMinLength: 8,
    accountNumberMaxLength: 20,
    ibanMaxLength: 34,
    swiftCodeLength: [8, 11],
    bankBranchMaxLength: 100
  },
  shipping: {
    customProcessingTimeMaxLength: 100,
    packagingInstructionsMaxLength: 500,
    maxShippingRate: 1000,
    maxFreeShippingThreshold: 10000
  },
  policies: {
    returnPolicyMaxLength: 2000,
    shippingPolicyMaxLength: 2000,
    warrantyPolicyMaxLength: 2000,
    termsOfServiceMaxLength: 5000
  }
} as const;
