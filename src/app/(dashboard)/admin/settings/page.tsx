'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { PlatformSettings } from '@/types/entities/settings'
import { SETTINGS_TABS, ICON_MAP, IconName } from '@/config/settings.config'
import SettingsLayout from '@/components/settings/SettingsLayout'
import SettingsTab from '@/components/settings/SettingsTab'
import SettingsSection from '@/components/settings/SettingsSection'
import settingsService from '@/services/settings.service'

type SettingsFieldValue = string | number | boolean | string[] | File | null | undefined

// Default settings values
const DEFAULT_SETTINGS: PlatformSettings = {
  general: {
    siteName: 'Ishq Gems',
    siteDescription: 'Premium gemstone marketplace connecting buyers with verified sellers worldwide',
    siteUrl: 'https://ishqgems.com',
    supportEmail: 'support@ishqgems.com',
    contactEmail: 'contact@ishqgems.com',
    companyName: 'Ishq Gems LLC',
    companyAddress: '123 Business Street, Suite 100\nNew York, NY 10001\nUnited States',
    maintenanceMode: false,
    allowRegistration: true,
    defaultLanguage: 'en',
    defaultTimezone: 'UTC',
    enableAnalytics: true,
    analyticsId: 'GA-XXXXXXXXX'
  },
  payment: {
    commissionRate: 5,
    platformFeeRate: 2.5,
    minOrderAmount: 50,
    maxOrderAmount: 100000,
    currency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    paymentMethods: ['card', 'paypal', 'bank-transfer'],
    autoPayoutEnabled: true,
    payoutThreshold: 100,
    payoutSchedule: 'weekly',
    escrowEnabled: true,
    escrowReleaseDays: 7,
    refundPolicy: 'Standard 30-day return policy applies to all purchases.',
    taxCalculationEnabled: true,
    defaultTaxRate: 8.5
  },
  security: {
    requireEmailVerification: true,
    twoFactorEnabled: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    allowedFileTypes: ['images', 'pdf', 'certificates'],
    maxFileSize: 10,
    enableRateLimiting: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15,
    enableCaptcha: true,
    captchaSiteKey: '6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    paymentNotifications: true,
    securityNotifications: true,
    marketingEmails: false,
    systemAlerts: true,
    maintenanceAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    notificationFrequency: 'immediate'
  },
  seller: {
    verificationRequired: true,
    autoApproveListings: false,
    maxListingsPerSeller: 100,
    listingFee: 0,
    featuredListingFee: 25,
    allowSellerPromotions: true,
    sellerCommissionTiers: [
      { id: '1', name: 'Bronze', minSales: 0, maxSales: 10000, commissionRate: 5, isActive: true },
      { id: '2', name: 'Silver', minSales: 10000, maxSales: 50000, commissionRate: 4, isActive: true },
      { id: '3', name: 'Gold', minSales: 50000, commissionRate: 3, isActive: true }
    ],
    requireSellerAgreement: true,
    sellerAgreementUrl: 'https://ishqgems.com/seller-agreement',
    enableSellerRatings: true,
    minSellerRating: 3.0,
    enableSellerBadges: true,
    sellerOnboardingRequired: true,
    calendlyMeetingLink: 'https://calendly.com/gemsishq/30min',
    meetingDuration: 30,
    meetingInstructions: 'Please prepare your gemstone samples and certificates for the meeting. We will discuss your experience, verify your documentation, and answer any questions you may have about selling on Ishq Gems.'
  },
  buyer: {
    guestCheckoutEnabled: true,
    requireBuyerVerification: false,
    enableBuyerProtection: true,
    buyerProtectionFee: 1.5,
    enableWishlist: true,
    enableComparisonTool: true,
    maxCartItems: 50,
    cartExpiryDays: 30,
    enableBuyerReviews: true,
    requirePurchaseForReview: true,
    enableBuyerRewards: true,
    rewardPointsRate: 1
  },
  shipping: {
    enableShipping: true,
    freeShippingThreshold: 500,
    defaultShippingRate: 15,
    internationalShippingRate: 35,
    enableExpressShipping: true,
    expressShippingRate: 25,
    shippingZones: [
      { id: '1', name: 'Domestic', countries: ['US'], regions: [], shippingRate: 15, freeShippingThreshold: 500, isActive: true },
      { id: '2', name: 'International', countries: [], regions: ['Europe', 'Asia'], shippingRate: 35, isActive: true }
    ],
    enableTrackingNumbers: true,
    requireSignatureConfirmation: false,
    insuranceEnabled: true,
    defaultInsuranceRate: 2
  },
  content: {
    enableBlog: true,
    enableFAQ: true,
    enableLiveChat: true,
    chatWidgetId: 'ishqgems-chat-widget',
    enableSocialLogin: true,
    socialLoginProviders: ['google', 'facebook', 'apple'],
    enableNewsletter: true,
    newsletterApiKey: 'newsletter-api-key',
    privacyPolicyUrl: 'https://ishqgems.com/privacy',
    termsOfServiceUrl: 'https://ishqgems.com/terms',
    returnPolicyUrl: 'https://ishqgems.com/returns',
    cookiePolicyUrl: 'https://ishqgems.com/cookies',
    enableCookieConsent: true
  },
  api: {
    enablePublicApi: true,
    apiRateLimit: 1000,
    apiKeyRequired: true,
    enableWebhooks: true,
    webhookEndpoints: [
      { id: '1', name: 'Order Events', url: 'https://webhook.site/orders', events: ['order.created', 'order.updated'], isActive: true, secret: 'webhook-secret' }
    ],
    enableCors: true,
    allowedOrigins: ['https://ishqgems.com', 'https://admin.ishqgems.com'],
    apiVersioning: true,
    currentApiVersion: 'v1'
  }
}

export default function PlatformSettingsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  
  // State management
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS)
  const [originalSettings, setOriginalSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS)
  const [activeTab, setActiveTab] = useState('general')
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const loadSettings = useCallback(async () => {
    try {
      setErrorMessage(undefined)
      
      // Try to get settings from API
      const settingsData = await settingsService.getSettings()
      setSettings(settingsData)
      setOriginalSettings(settingsData)
      
      console.log('Settings loaded successfully:', settingsData)
    } catch (error) {
      console.error('Failed to load settings:', error)
      
      // If settings don't exist, try to initialize them
      if (error instanceof Error && error.message.includes('not initialized')) {
        try {
          console.log('Initializing default settings...')
          const initializedSettings = await settingsService.initializeSettings()
          setSettings(initializedSettings)
          setOriginalSettings(initializedSettings)
          console.log('Default settings initialized successfully')
        } catch (initError) {
          console.error('Failed to initialize settings:', initError)
          setErrorMessage('Failed to initialize settings. Using defaults.')
          // Fall back to default settings
          setSettings(DEFAULT_SETTINGS)
          setOriginalSettings(DEFAULT_SETTINGS)
        }
      } else {
        setErrorMessage('Failed to load settings. Using defaults.')
        // Fall back to default settings
        setSettings(DEFAULT_SETTINGS)
        setOriginalSettings(DEFAULT_SETTINGS)
      }
    }
  }, [])

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/signin?message=Admin access required')
    }
  }, [isAuthenticated, isLoading, user?.role, router])

  // Load settings on mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadSettings()
    }
  }, [isAuthenticated, user?.role, loadSettings])

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)
  const hasErrors = Object.values(errors).some(tabErrors => Object.keys(tabErrors).length > 0)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleFieldChange = (category: keyof PlatformSettings, key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))

    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors[category]) {
        const categoryErrors = { ...newErrors[category] }
        delete categoryErrors[key]
        newErrors[category] = categoryErrors
      }
      return newErrors
    })

    // Reset save status
    if (saveStatus === 'success') {
      setSaveStatus('idle')
    }
  }

  const validateSettings = (): boolean => {
    const newErrors: Record<string, Record<string, string>> = {}

    SETTINGS_TABS.forEach(tab => {
      const tabErrors: Record<string, string> = {}
      
      tab.fields.forEach(field => {
        const categorySettings = settings[tab.id as keyof PlatformSettings] as unknown as Record<string, SettingsFieldValue>
        const value = categorySettings?.[field.key]
        
        // Required field validation
        if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
          tabErrors[field.key] = `${field.label} is required`
        }
        
        // Type-specific validation
        if (value && field.validation) {
          const { min, max, pattern } = field.validation
          
          if (field.type === 'number') {
            const numValue = Number(value)
            if (min !== undefined && numValue < min) {
              tabErrors[field.key] = `${field.label} must be at least ${min}`
            }
            if (max !== undefined && numValue > max) {
              tabErrors[field.key] = `${field.label} must not exceed ${max}`
            }
          }
          
          if (field.type === 'text' && typeof value === 'string') {
            if (min && value.length < min) {
              tabErrors[field.key] = `${field.label} must be at least ${min} characters`
            }
            if (max && value.length > max) {
              tabErrors[field.key] = `${field.label} must not exceed ${max} characters`
            }
            if (pattern && !new RegExp(pattern).test(value)) {
              tabErrors[field.key] = `${field.label} format is invalid`
            }
          }
        }
      })
      
      if (Object.keys(tabErrors).length > 0) {
        newErrors[tab.id] = tabErrors
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('saving')
    setErrorMessage(undefined)

    try {
      const isValid = validateSettings()
      
      if (!isValid && hasErrors) {
        // Allow saving with errors if user confirms
        setSaveStatus('error')
        setErrorMessage('Some fields have validation errors')
        return
      }

      // Determine which categories have changed
      const changedCategories: (keyof PlatformSettings)[] = []
      
      for (const category of Object.keys(settings) as (keyof PlatformSettings)[]) {
        if (JSON.stringify(settings[category]) !== JSON.stringify(originalSettings[category])) {
          changedCategories.push(category)
        }
      }

      if (changedCategories.length === 0) {
        setSaveStatus('success')
        setErrorMessage('No changes to save')
        return
      }

      // Save each changed category
      for (const category of changedCategories) {
        console.log(`Saving ${category} settings...`)
        await settingsService.updateSettings(category, settings[category])
      }
      
      // Reload settings to get the latest version
      const updatedSettings = await settingsService.getSettings(false) // Don't use cache
      setSettings(updatedSettings)
      setOriginalSettings(updatedSettings)
      
      setSaveStatus('success')
      console.log('Settings saved successfully:', changedCategories)
      
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
      
      if (error instanceof Error) {
        setErrorMessage(`Failed to save settings: ${error.message}`)
      } else {
        setErrorMessage('Failed to save settings. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(originalSettings)
    setErrors({})
    setSaveStatus('idle')
    setErrorMessage(undefined)
  }

  // Don't render if not authenticated or not admin
  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  const activeTabConfig = SETTINGS_TABS.find(tab => tab.id === activeTab)
  if (!activeTabConfig) return null

  const tabHasChanges = (tabId: string) => {
    const originalTabSettings = originalSettings[tabId as keyof PlatformSettings] as unknown as Record<string, SettingsFieldValue>
    const currentTabSettings = settings[tabId as keyof PlatformSettings] as unknown as Record<string, SettingsFieldValue>
    return JSON.stringify(originalTabSettings) !== JSON.stringify(currentTabSettings)
  }

  const tabHasErrors = (tabId: string) => {
    return Object.keys(errors[tabId] || {}).length > 0
  }

  return (
    <SettingsLayout
      title="Platform Settings"
      description={`Configure system-wide settings for Ishq Gems platform`}
      onSave={handleSave}
      onReset={handleReset}
      hasChanges={hasChanges}
      hasErrors={hasErrors}
      isSaving={isSaving}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
    >
      {/* Sidebar */}
      <div className="lg:w-80">
        <div className="bg-card border border-border/30 rounded-xl p-4 sticky top-6">
          <nav className="space-y-2">
            {SETTINGS_TABS.map((tab) => {
              const IconComponent = ICON_MAP[tab.icon as IconName]
              return (
                <SettingsTab
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={IconComponent}
                  description={tab.description}
                  isActive={activeTab === tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  hasChanges={tabHasChanges(tab.id)}
                  hasErrors={tabHasErrors(tab.id)}
                />
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="bg-card border border-border/30 rounded-xl p-8">
          <SettingsSection
            title={activeTabConfig.label}
            description={activeTabConfig.description}
            icon={ICON_MAP[activeTabConfig.icon as IconName]}
            fields={activeTabConfig.fields}
            values={settings[activeTab as keyof PlatformSettings] as unknown as Record<string, SettingsFieldValue>}
            errors={errors[activeTab] || {}}
            onChange={(key, value) => handleFieldChange(activeTab as keyof PlatformSettings, key, value)}
            disabled={isSaving}
          />
        </div>
      </div>
    </SettingsLayout>
  )
} 