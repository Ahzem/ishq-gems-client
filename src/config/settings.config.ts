import { 
  Settings, 
  CreditCard, 
  Shield, 
  Bell, 
  Users, 
  ShoppingCart, 
  Truck, 
  FileText, 
  Zap 
} from 'lucide-react'
import { SettingsTabConfig } from '@/types/entities/settings'

export const SETTINGS_TABS: SettingsTabConfig[] = [
  {
    id: 'general',
    label: 'General',
    icon: 'Settings',
    description: 'Basic platform configuration',
    order: 1,
    fields: [
      {
        key: 'siteName',
        label: 'Site Name',
        type: 'text',
        required: true,
        placeholder: 'Ishq Gems',
        description: 'The name of your platform that appears in headers and emails',
        group: 'basic',
        order: 1
      },
      {
        key: 'siteDescription',
        label: 'Site Description',
        type: 'textarea',
        required: true,
        placeholder: 'Premium gemstone marketplace...',
        description: 'A brief description used for SEO and social media',
        group: 'basic',
        order: 2
      },
      {
        key: 'siteUrl',
        label: 'Site URL',
        type: 'url',
        required: true,
        placeholder: 'https://ishqgems.com',
        description: 'The primary URL of your platform',
        group: 'basic',
        order: 3
      },
      {
        key: 'supportEmail',
        label: 'Support Email',
        type: 'email',
        required: true,
        placeholder: 'support@ishqgems.com',
        description: 'Email address for customer support inquiries',
        group: 'contact',
        order: 4
      },
      {
        key: 'contactEmail',
        label: 'Contact Email',
        type: 'email',
        required: true,
        placeholder: 'contact@ishqgems.com',
        description: 'General contact email displayed publicly',
        group: 'contact',
        order: 5
      },
      {
        key: 'companyName',
        label: 'Company Name',
        type: 'text',
        required: true,
        placeholder: 'Ishq Gems LLC',
        description: 'Legal company name for invoices and documents',
        group: 'company',
        order: 6
      },
      {
        key: 'companyAddress',
        label: 'Company Address',
        type: 'textarea',
        required: true,
        placeholder: '123 Business St, City, State 12345',
        description: 'Physical address for legal and shipping purposes',
        group: 'company',
        order: 7
      },
      {
        key: 'defaultLanguage',
        label: 'Default Language',
        type: 'select',
        required: true,
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Chinese', value: 'zh' },
          { label: 'Japanese', value: 'ja' }
        ],
        group: 'localization',
        order: 8
      },
      {
        key: 'defaultTimezone',
        label: 'Default Timezone',
        type: 'select',
        required: true,
        options: [
          { label: 'UTC', value: 'UTC' },
          { label: 'Eastern Time', value: 'America/New_York' },
          { label: 'Central Time', value: 'America/Chicago' },
          { label: 'Mountain Time', value: 'America/Denver' },
          { label: 'Pacific Time', value: 'America/Los_Angeles' },
          { label: 'London', value: 'Europe/London' },
          { label: 'Paris', value: 'Europe/Paris' },
          { label: 'Tokyo', value: 'Asia/Tokyo' }
        ],
        group: 'localization',
        order: 9
      },
      {
        key: 'maintenanceMode',
        label: 'Maintenance Mode',
        type: 'toggle',
        description: 'Enable to temporarily disable public access to the platform',
        group: 'system',
        order: 10
      },
      {
        key: 'allowRegistration',
        label: 'Allow New Registrations',
        type: 'toggle',
        description: 'Allow new users to create accounts',
        group: 'system',
        order: 11
      },
      {
        key: 'enableAnalytics',
        label: 'Enable Analytics',
        type: 'toggle',
        description: 'Enable Google Analytics or other tracking',
        group: 'analytics',
        order: 12
      },
      {
        key: 'analyticsId',
        label: 'Analytics ID',
        type: 'text',
        placeholder: 'GA-XXXXXXXXX',
        description: 'Google Analytics tracking ID',
        dependency: { field: 'enableAnalytics', value: true, operator: 'equals' },
        group: 'analytics',
        order: 13
      }
    ]
  },
  {
    id: 'payment',
    label: 'Payment',
    icon: 'CreditCard',
    description: 'Payment processing and fees',
    order: 2,
    fields: [
      {
        key: 'commissionRate',
        label: 'Commission Rate (%)',
        type: 'number',
        required: true,
        validation: { min: 0, max: 50 },
        description: 'Percentage commission charged to sellers per transaction',
        group: 'fees',
        order: 1
      },
      {
        key: 'platformFeeRate',
        label: 'Platform Fee Rate (%)',
        type: 'number',
        required: true,
        validation: { min: 0, max: 10 },
        description: 'Additional platform fee charged to buyers',
        group: 'fees',
        order: 2
      },
      {
        key: 'minOrderAmount',
        label: 'Minimum Order Amount',
        type: 'number',
        required: true,
        validation: { min: 0 },
        description: 'Minimum order value required for checkout',
        group: 'limits',
        order: 3
      },
      {
        key: 'maxOrderAmount',
        label: 'Maximum Order Amount',
        type: 'number',
        required: true,
        validation: { min: 100 },
        description: 'Maximum order value allowed per transaction',
        group: 'limits',
        order: 4
      },
      {
        key: 'currency',
        label: 'Primary Currency',
        type: 'select',
        required: true,
        options: [
          { label: 'US Dollar (USD)', value: 'USD' },
          { label: 'Euro (EUR)', value: 'EUR' },
          { label: 'British Pound (GBP)', value: 'GBP' },
          { label: 'Canadian Dollar (CAD)', value: 'CAD' },
          { label: 'Australian Dollar (AUD)', value: 'AUD' },
          { label: 'Japanese Yen (JPY)', value: 'JPY' }
        ],
        group: 'currency',
        order: 5
      },
      {
        key: 'supportedCurrencies',
        label: 'Supported Currencies',
        type: 'multiselect',
        options: [
          { label: 'US Dollar (USD)', value: 'USD' },
          { label: 'Euro (EUR)', value: 'EUR' },
          { label: 'British Pound (GBP)', value: 'GBP' },
          { label: 'Canadian Dollar (CAD)', value: 'CAD' },
          { label: 'Australian Dollar (AUD)', value: 'AUD' },
          { label: 'Japanese Yen (JPY)', value: 'JPY' },
          { label: 'Swiss Franc (CHF)', value: 'CHF' },
          { label: 'Chinese Yuan (CNY)', value: 'CNY' }
        ],
        description: 'Additional currencies supported for international customers',
        group: 'currency',
        order: 6
      },
      {
        key: 'paymentMethods',
        label: 'Payment Methods',
        type: 'multiselect',
        required: true,
        options: [
          { label: 'Credit/Debit Cards', value: 'card' },
          { label: 'PayPal', value: 'paypal' },
          { label: 'Bank Transfer', value: 'bank-transfer' },
          { label: 'Apple Pay', value: 'apple_pay' },
          { label: 'Google Pay', value: 'google_pay' },
          { label: 'Cryptocurrency', value: 'crypto' }
        ],
        description: 'Available payment methods for customers',
        group: 'methods',
        order: 7
      },
      {
        key: 'autoPayoutEnabled',
        label: 'Enable Auto Payouts',
        type: 'toggle',
        description: 'Automatically pay sellers based on payout schedule',
        group: 'payouts',
        order: 8
      },
      {
        key: 'payoutThreshold',
        label: 'Payout Threshold',
        type: 'number',
        required: true,
        validation: { min: 0 },
        description: 'Minimum amount required before payout is processed',
        dependency: { field: 'autoPayoutEnabled', value: true, operator: 'equals' },
        group: 'payouts',
        order: 9
      },
      {
        key: 'payoutSchedule',
        label: 'Payout Schedule',
        type: 'select',
        required: true,
        options: [
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' }
        ],
        dependency: { field: 'autoPayoutEnabled', value: true, operator: 'equals' },
        group: 'payouts',
        order: 10
      },
      {
        key: 'escrowEnabled',
        label: 'Enable Escrow',
        type: 'toggle',
        description: 'Hold payments until order completion',
        group: 'escrow',
        order: 11
      },
      {
        key: 'escrowReleaseDays',
        label: 'Escrow Release Days',
        type: 'number',
        required: true,
        validation: { min: 1, max: 30 },
        description: 'Days to hold payment after delivery confirmation',
        dependency: { field: 'escrowEnabled', value: true, operator: 'equals' },
        group: 'escrow',
        order: 12
      },
      {
        key: 'taxCalculationEnabled',
        label: 'Enable Tax Calculation',
        type: 'toggle',
        description: 'Automatically calculate taxes based on location',
        group: 'tax',
        order: 13
      },
      {
        key: 'defaultTaxRate',
        label: 'Default Tax Rate (%)',
        type: 'number',
        validation: { min: 0, max: 50 },
        description: 'Default tax rate when location-based calculation fails',
        dependency: { field: 'taxCalculationEnabled', value: true, operator: 'equals' },
        group: 'tax',
        order: 14
      }
    ]
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'Shield',
    description: 'Security and authentication settings',
    order: 3,
    fields: [
      {
        key: 'requireEmailVerification',
        label: 'Require Email Verification',
        type: 'toggle',
        description: 'Users must verify email before account activation',
        group: 'authentication',
        order: 1
      },
      {
        key: 'twoFactorEnabled',
        label: 'Enable Two-Factor Authentication',
        type: 'toggle',
        description: 'Allow users to enable 2FA for enhanced security',
        group: 'authentication',
        order: 2
      },
      {
        key: 'sessionTimeout',
        label: 'Session Timeout (minutes)',
        type: 'number',
        required: true,
        validation: { min: 5, max: 1440 },
        description: 'Auto-logout users after period of inactivity',
        group: 'session',
        order: 3
      },
      {
        key: 'maxLoginAttempts',
        label: 'Max Login Attempts',
        type: 'number',
        required: true,
        validation: { min: 3, max: 10 },
        description: 'Lock account after failed login attempts',
        group: 'protection',
        order: 4
      },
      {
        key: 'lockoutDuration',
        label: 'Lockout Duration (minutes)',
        type: 'number',
        required: true,
        validation: { min: 5, max: 1440 },
        description: 'How long to lock account after max attempts',
        group: 'protection',
        order: 5
      },
      {
        key: 'passwordMinLength',
        label: 'Password Minimum Length',
        type: 'number',
        required: true,
        validation: { min: 6, max: 128 },
        description: 'Minimum characters required for passwords',
        group: 'password',
        order: 6
      },
      {
        key: 'passwordRequireSpecialChars',
        label: 'Require Special Characters',
        type: 'toggle',
        description: 'Passwords must contain special characters',
        group: 'password',
        order: 7
      },
      {
        key: 'passwordRequireNumbers',
        label: 'Require Numbers',
        type: 'toggle',
        description: 'Passwords must contain at least one number',
        group: 'password',
        order: 8
      },
      {
        key: 'passwordRequireUppercase',
        label: 'Require Uppercase Letters',
        type: 'toggle',
        description: 'Passwords must contain uppercase letters',
        group: 'password',
        order: 9
      },
      {
        key: 'allowedFileTypes',
        label: 'Allowed File Types',
        type: 'multiselect',
        required: true,
        options: [
          { label: 'Images (JPG, PNG, WebP)', value: 'images' },
          { label: 'Documents (PDF)', value: 'pdf' },
          { label: 'Videos (MP4, WebM)', value: 'videos' },
          { label: 'Certificates (PDF, JPG)', value: 'certificates' }
        ],
        description: 'File types allowed for uploads',
        group: 'uploads',
        order: 10
      },
      {
        key: 'maxFileSize',
        label: 'Max File Size (MB)',
        type: 'number',
        required: true,
        validation: { min: 1, max: 100 },
        description: 'Maximum file size allowed for uploads',
        group: 'uploads',
        order: 11
      },
      {
        key: 'enableRateLimiting',
        label: 'Enable Rate Limiting',
        type: 'toggle',
        description: 'Limit API requests to prevent abuse',
        group: 'api',
        order: 12
      },
      {
        key: 'rateLimitRequests',
        label: 'Rate Limit Requests',
        type: 'number',
        validation: { min: 10, max: 1000 },
        description: 'Max requests per time window',
        dependency: { field: 'enableRateLimiting', value: true, operator: 'equals' },
        group: 'api',
        order: 13
      },
      {
        key: 'rateLimitWindow',
        label: 'Rate Limit Window (minutes)',
        type: 'number',
        validation: { min: 1, max: 60 },
        description: 'Time window for rate limiting',
        dependency: { field: 'enableRateLimiting', value: true, operator: 'equals' },
        group: 'api',
        order: 14
      },
      {
        key: 'enableCaptcha',
        label: 'Enable CAPTCHA',
        type: 'toggle',
        description: 'Use CAPTCHA for form submissions',
        group: 'captcha',
        order: 15
      },
      {
        key: 'captchaSiteKey',
        label: 'CAPTCHA Site Key',
        type: 'text',
        description: 'reCAPTCHA site key for client-side integration',
        dependency: { field: 'enableCaptcha', value: true, operator: 'equals' },
        group: 'captcha',
        order: 16
      }
    ]
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'Bell',
    description: 'Email and push notification settings',
    order: 4,
    fields: [
      {
        key: 'emailNotifications',
        label: 'Enable Email Notifications',
        type: 'toggle',
        description: 'Send notifications via email',
        group: 'channels',
        order: 1
      },
      {
        key: 'pushNotifications',
        label: 'Enable Push Notifications',
        type: 'toggle',
        description: 'Send browser push notifications',
        group: 'channels',
        order: 2
      },
      {
        key: 'smsNotifications',
        label: 'Enable SMS Notifications',
        type: 'toggle',
        description: 'Send notifications via SMS',
        group: 'channels',
        order: 3
      },
      {
        key: 'orderNotifications',
        label: 'Order Notifications',
        type: 'toggle',
        description: 'Notify users about order status changes',
        group: 'types',
        order: 4
      },
      {
        key: 'paymentNotifications',
        label: 'Payment Notifications',
        type: 'toggle',
        description: 'Notify users about payment events',
        group: 'types',
        order: 5
      },
      {
        key: 'securityNotifications',
        label: 'Security Notifications',
        type: 'toggle',
        description: 'Notify users about security events',
        group: 'types',
        order: 6
      },
      {
        key: 'marketingEmails',
        label: 'Marketing Emails',
        type: 'toggle',
        description: 'Send promotional and marketing emails',
        group: 'types',
        order: 7
      },
      {
        key: 'systemAlerts',
        label: 'System Alerts',
        type: 'toggle',
        description: 'Send system status and error alerts to admins',
        group: 'admin',
        order: 8
      },
      {
        key: 'maintenanceAlerts',
        label: 'Maintenance Alerts',
        type: 'toggle',
        description: 'Notify users about scheduled maintenance',
        group: 'admin',
        order: 9
      },
      {
        key: 'weeklyReports',
        label: 'Weekly Reports',
        type: 'toggle',
        description: 'Send weekly activity reports to admins',
        group: 'reports',
        order: 10
      },
      {
        key: 'monthlyReports',
        label: 'Monthly Reports',
        type: 'toggle',
        description: 'Send monthly summary reports to admins',
        group: 'reports',
        order: 11
      },
      {
        key: 'notificationFrequency',
        label: 'Notification Frequency',
        type: 'select',
        required: true,
        options: [
          { label: 'Immediate', value: 'immediate' },
          { label: 'Hourly Digest', value: 'hourly' },
          { label: 'Daily Digest', value: 'daily' }
        ],
        description: 'How often to send non-critical notifications',
        group: 'delivery',
        order: 12
      }
    ]
  },
  {
    id: 'seller',
    label: 'Sellers',
    icon: 'Users',
    description: 'Seller management and requirements',
    order: 5,
    fields: [
      {
        key: 'verificationRequired',
        label: 'Require Seller Verification',
        type: 'toggle',
        description: 'Sellers must be verified before listing items',
        group: 'verification',
        order: 1
      },
      {
        key: 'autoApproveListings',
        label: 'Auto-Approve Listings',
        type: 'toggle',
        description: 'Automatically approve new listings without manual review',
        group: 'listings',
        order: 2
      },
      {
        key: 'maxListingsPerSeller',
        label: 'Max Listings Per Seller',
        type: 'number',
        required: true,
        validation: { min: 1, max: 10000 },
        description: 'Maximum number of active listings per seller',
        group: 'listings',
        order: 3
      },
      {
        key: 'listingFee',
        label: 'Listing Fee',
        type: 'number',
        validation: { min: 0 },
        description: 'Fee charged for each new listing (0 for free)',
        group: 'fees',
        order: 4
      },
      {
        key: 'featuredListingFee',
        label: 'Featured Listing Fee',
        type: 'number',
        validation: { min: 0 },
        description: 'Additional fee for featured/promoted listings',
        group: 'fees',
        order: 5
      },
      {
        key: 'allowSellerPromotions',
        label: 'Allow Seller Promotions',
        type: 'toggle',
        description: 'Allow sellers to create discount codes and promotions',
        group: 'promotions',
        order: 6
      },
      {
        key: 'requireSellerAgreement',
        label: 'Require Seller Agreement',
        type: 'toggle',
        description: 'Sellers must accept terms before listing',
        group: 'legal',
        order: 7
      },
      {
        key: 'sellerAgreementUrl',
        label: 'Seller Agreement URL',
        type: 'url',
        description: 'Link to seller terms and conditions',
        dependency: { field: 'requireSellerAgreement', value: true, operator: 'equals' },
        group: 'legal',
        order: 8
      },
      {
        key: 'enableSellerRatings',
        label: 'Enable Seller Ratings',
        type: 'toggle',
        description: 'Allow buyers to rate and review sellers',
        group: 'ratings',
        order: 9
      },
      {
        key: 'minSellerRating',
        label: 'Minimum Seller Rating',
        type: 'number',
        validation: { min: 1, max: 5 },
        description: 'Minimum rating required to remain active',
        dependency: { field: 'enableSellerRatings', value: true, operator: 'equals' },
        group: 'ratings',
        order: 10
      },
      {
        key: 'enableSellerBadges',
        label: 'Enable Seller Badges',
        type: 'toggle',
        description: 'Display achievement badges on seller profiles',
        group: 'gamification',
        order: 11
      },
      {
        key: 'sellerOnboardingRequired',
        label: 'Require Seller Onboarding',
        type: 'toggle',
        description: 'New sellers must complete onboarding process',
        group: 'onboarding',
        order: 12
      }
    ]
  }
]

// Icon mapping for dynamic icon loading
export const ICON_MAP = {
  Settings,
  CreditCard,
  Shield,
  Bell,
  Users,
  ShoppingCart,
  Truck,
  FileText,
  Zap
} as const

export type IconName = keyof typeof ICON_MAP
