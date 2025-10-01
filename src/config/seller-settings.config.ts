import { 
  Store, 
  CreditCard, 
  Truck, 
  Bell, 
  Shield, 
  Settings,
  Palette,
  FileText
} from 'lucide-react'

export interface SellerSettingsField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'multiselect' | 'color' | 'file'
  placeholder?: string
  description?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface SellerSettingsTab {
  id: string
  label: string
  description: string
  icon: string
  fields: SellerSettingsField[]
}

export const SELLER_SETTINGS_TABS: SellerSettingsTab[] = [
  {
    id: 'store',
    label: 'Store Settings',
    description: 'Customize your store appearance and branding',
    icon: 'Store',
    fields: [
      {
        key: 'storeName',
        label: 'Store Name',
        type: 'text',
        placeholder: 'Your store name',
        description: 'The name that appears on your store page',
        required: true,
        validation: { min: 2, max: 50 }
      },
      {
        key: 'storeSlogan',
        label: 'Store Slogan',
        type: 'text',
        placeholder: 'Your store slogan',
        description: 'A short tagline for your store',
        validation: { max: 100 }
      },
      {
        key: 'storeDescription',
        label: 'Store Description',
        type: 'textarea',
        placeholder: 'Describe your store and what makes it special...',
        description: 'Tell customers about your store and expertise',
        validation: { max: 500 }
      },
      {
        key: 'primaryColor',
        label: 'Primary Color',
        type: 'color',
        description: 'Main color for your store branding'
      },
      {
        key: 'secondaryColor',
        label: 'Secondary Color',
        type: 'color',
        description: 'Secondary color for accents'
      },
      {
        key: 'logoUrl',
        label: 'Store Logo',
        type: 'file',
        description: 'Upload your store logo (recommended: 200x200px, max 2MB)',
        validation: { max: 2 }
      },
      {
        key: 'bannerUrl',
        label: 'Store Banner',
        type: 'file',
        description: 'Upload your store banner image (recommended: 1200x400px, max 5MB)',
        validation: { max: 5 }
      }
    ]
  },
  {
    id: 'payment',
    label: 'Payment Setup',
    description: 'Configure how you receive payments from customers',
    icon: 'CreditCard',
    fields: [
      {
        key: 'paymentMethod',
        label: 'Payment Method',
        type: 'select',
        description: 'How you want to receive payments',
        required: true,
        options: [
          { value: 'bank-transfer', label: 'Bank Transfer' },
          { value: 'paypal', label: 'PayPal (Coming Soon)' },
          { value: 'wise', label: 'Wise (Coming Soon)' }
        ]
      },
      {
        key: 'bankName',
        label: 'Bank Name',
        type: 'text',
        placeholder: 'e.g., HSBC Bank',
        required: true
      },
      {
        key: 'accountHolderName',
        label: 'Account Holder Name',
        type: 'text',
        placeholder: 'Full name as on bank account',
        required: true
      },
      {
        key: 'accountNumber',
        label: 'Account Number',
        type: 'text',
        placeholder: '1234567890',
        required: true
      },
      {
        key: 'swiftCode',
        label: 'SWIFT Code',
        type: 'text',
        placeholder: 'HBUKGB4B',
        required: true
      },
      {
        key: 'bankBranch',
        label: 'Bank Branch',
        type: 'text',
        placeholder: 'e.g., London Main Branch',
        required: true
      }
    ]
  },
  {
    id: 'shipping',
    label: 'Shipping Settings',
    description: 'Configure your shipping preferences and policies',
    icon: 'Truck',
    fields: [
      {
        key: 'domesticShipping',
        label: 'Domestic Shipping',
        type: 'checkbox',
        description: 'Ship within Sri Lanka'
      },
      {
        key: 'internationalShipping',
        label: 'International Shipping',
        type: 'checkbox',
        description: 'Ship worldwide'
      },
      {
        key: 'processingTime',
        label: 'Processing Time',
        type: 'select',
        description: 'How long it takes to prepare orders',
        options: [
          { value: '1-2', label: '1-2 business days' },
          { value: '3-5', label: '3-5 business days' },
          { value: '1-2 weeks', label: '1-2 weeks' },
          { value: '2-4 weeks', label: '2-4 weeks' }
        ]
      },
      {
        key: 'freeShippingThreshold',
        label: 'Free Shipping Threshold ($)',
        type: 'number',
        placeholder: '0',
        description: 'Minimum order amount for free shipping',
        validation: { min: 0 }
      },
      {
        key: 'packagingInstructions',
        label: 'Packaging Instructions',
        type: 'textarea',
        placeholder: 'Special packaging instructions...',
        description: 'Any special instructions for packaging your items'
      }
    ]
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Control what notifications you receive',
    icon: 'Bell',
    fields: [
      {
        key: 'orderNotifications',
        label: 'Order Notifications',
        type: 'checkbox',
        description: 'Get notified about new orders and order updates'
      },
      {
        key: 'bidNotifications',
        label: 'Bid Notifications',
        type: 'checkbox',
        description: 'Get notified about new bids on your auctions'
      },
      {
        key: 'reviewNotifications',
        label: 'Review Notifications',
        type: 'checkbox',
        description: 'Get notified about new customer reviews'
      },
      {
        key: 'marketingEmails',
        label: 'Marketing Emails',
        type: 'checkbox',
        description: 'Receive promotional offers and platform updates'
      },
      {
        key: 'weeklyReports',
        label: 'Weekly Reports',
        type: 'checkbox',
        description: 'Receive weekly sales and performance reports'
      },
      {
        key: 'monthlyReports',
        label: 'Monthly Reports',
        type: 'checkbox',
        description: 'Receive monthly analytics and insights'
      },
      {
        key: 'pushNotifications',
        label: 'Push Notifications',
        type: 'checkbox',
        description: 'Receive push notifications in your browser'
      }
    ]
  },
  {
    id: 'verification',
    label: 'Verification Status',
    description: 'View your seller verification progress',
    icon: 'Shield',
    fields: []
  },
  {
    id: 'policies',
    label: 'Store Policies',
    description: 'Manage your store policies and terms',
    icon: 'FileText',
    fields: [
      {
        key: 'returnPolicy',
        label: 'Return Policy',
        type: 'textarea',
        placeholder: 'Describe your return policy...',
        description: 'Your policy for returns and exchanges',
        validation: { max: 1000 }
      },
      {
        key: 'shippingPolicy',
        label: 'Shipping Policy',
        type: 'textarea',
        placeholder: 'Describe your shipping policy...',
        description: 'Your shipping terms and conditions',
        validation: { max: 1000 }
      },
      {
        key: 'warrantyPolicy',
        label: 'Warranty Policy',
        type: 'textarea',
        placeholder: 'Describe your warranty policy...',
        description: 'Warranty terms for your products',
        validation: { max: 1000 }
      }
    ]
  },
  {
    id: 'account',
    label: 'Account Management',
    description: 'Manage your seller account and data',
    icon: 'Settings',
    fields: []
  }
]

export const SELLER_ICON_MAP = {
  Store,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Settings,
  Palette,
  FileText
} as const

export type SellerIconName = keyof typeof SELLER_ICON_MAP
