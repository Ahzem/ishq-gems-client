'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, ExternalLink, Trash2 } from 'lucide-react'
import { SELLER_SETTINGS_TABS, SELLER_ICON_MAP, SellerIconName } from '@/config/seller-settings.config'
import { SettingsFieldConfig } from '@/types/entities/settings'
import { 
  SellerSettings, 
  DEFAULT_SELLER_SETTINGS,
  SellerSettingsErrors,
  SellerPaymentMethod 
} from '@/types/entities/seller-settings'
import SettingsLayout from '@/components/settings/SettingsLayout'
import SettingsTab from '@/components/settings/SettingsTab'
import SettingsSection from '@/components/settings/SettingsSection'
import PaymentDetailsForm from '@/components/forms/PaymentDetailsForm'
import StoreSettingsSection from '@/components/seller/StoreSettingsSection'
import type { PaymentDetailsFormData } from '@/types'
import sellerSettingsService from '@/services/seller-settings.service'
import fileUploadService from '@/services/file-upload.service'

type SettingsFieldValue = string | number | boolean | string[] | File | null | undefined

export default function SellerSettingsPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, hasRole } = useAuth()
  
  // State management
  const [settings, setSettings] = useState<SellerSettings>(DEFAULT_SELLER_SETTINGS)
  const [originalSettings, setOriginalSettings] = useState<SellerSettings>(DEFAULT_SELLER_SETTINGS)
  const [activeTab, setActiveTab] = useState('store')
  const [errors, setErrors] = useState<SellerSettingsErrors>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      setErrorMessage(undefined)
      
      const response = await sellerSettingsService.getSellerSettings()
      
      if (response.success && response.data) {
        // Transform response data to match our interface
        const settingsData: SellerSettings = {
          store: response.data.store || DEFAULT_SELLER_SETTINGS.store,
          payment: response.data.payment || DEFAULT_SELLER_SETTINGS.payment,
          shipping: response.data.shipping || DEFAULT_SELLER_SETTINGS.shipping,
          notifications: response.data.notifications || DEFAULT_SELLER_SETTINGS.notifications,
          policies: response.data.policies || DEFAULT_SELLER_SETTINGS.policies,
          verification: response.data.verification || DEFAULT_SELLER_SETTINGS.verification
        }
        
        setSettings(settingsData)
        setOriginalSettings(settingsData)
        
        console.log('Seller settings loaded successfully:', settingsData)
      } else {
        throw new Error(response.message || 'Failed to load settings')
      }
    } catch (error) {
      console.error('Failed to load seller settings:', error)
      
      // Handle specific error types
      let message = 'Failed to load settings. Using defaults.'
      
      if (error instanceof Error) {
        if (error.message.includes('complete your store setup') || error.message.includes('need to be initialized')) {
          message = 'Welcome! Please complete your store setup to get started selling.'
        } else if (error.message.includes('seller privileges') || error.message.includes('Access denied')) {
          message = 'Seller access required. Please ensure your account has seller privileges.'
        } else if (error.message.includes('validation')) {
          message = 'Settings validation error. Please check your data and try again.'
        } else if (error.message.includes('not found')) {
          message = 'Seller account not found. Please contact support if this persists.'
        }
      }
      
      setErrorMessage(message)
      setSettings(DEFAULT_SELLER_SETTINGS)
      setOriginalSettings(DEFAULT_SELLER_SETTINGS)
    }
  }, [])

  // Redirect if not seller
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasRole('seller'))) {
      router.push('/signin?message=Seller access required&redirect=/seller/settings')
    }
  }, [isAuthenticated, isLoading, hasRole, router])

  // Load settings on mount
  useEffect(() => {
    if (isAuthenticated && hasRole('seller')) {
      loadSettings()
    }
  }, [isAuthenticated, hasRole, loadSettings])

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)
  const hasErrors = Object.values(errors).some(tabErrors => Object.keys(tabErrors).length > 0)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleFieldChange = (category: keyof SellerSettings, key: string, value: unknown) => {
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

    SELLER_SETTINGS_TABS.forEach(tab => {
      const tabErrors: Record<string, string> = {}
      
      tab.fields.forEach(field => {
        const categorySettings = settings[tab.id as keyof SellerSettings] as unknown as Record<string, SettingsFieldValue>
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
        setSaveStatus('error')
        setErrorMessage('Some fields have validation errors')
        return
      }

      // Create a copy of settings to process file uploads
      const processedSettings = { ...settings }

      // Handle file uploads for store settings
      if (settings.store.logoUrl && settings.store.logoUrl instanceof File) {
        try {
          const logoResponse = await fileUploadService.uploadStoreLogo(settings.store.logoUrl)
          if (logoResponse.success && logoResponse.data) {
            // Store S3 key, not full URL
            processedSettings.store.logoUrl = logoResponse.data.url
          } else {
            throw new Error('Failed to upload logo')
          }
        } catch {
          setSaveStatus('error')
          setErrorMessage('Failed to upload store logo. Please try again.')
          return
        }
      }

      if (settings.store.bannerUrl && settings.store.bannerUrl instanceof File) {
        try {
          const bannerResponse = await fileUploadService.uploadStoreBanner(settings.store.bannerUrl)
          if (bannerResponse.success && bannerResponse.data) {
            // Store S3 key, not full URL
            processedSettings.store.bannerUrl = bannerResponse.data.url
          } else {
            throw new Error('Failed to upload banner')
          }
        } catch {
          setSaveStatus('error')
          setErrorMessage('Failed to upload store banner. Please try again.')
          return
        }
      }

      // Calculate what has changed (using processed settings)
      const changes: Record<string, unknown> = {}
      Object.keys(processedSettings).forEach(category => {
        const categoryKey = category as keyof SellerSettings
        const originalCategory = originalSettings[categoryKey]
        const currentCategory = processedSettings[categoryKey]
        
        if (JSON.stringify(originalCategory) !== JSON.stringify(currentCategory)) {
          changes[category] = currentCategory
        }
      })

      if (Object.keys(changes).length === 0) {
        setSaveStatus('success')
        return
      }

      const response = await sellerSettingsService.updateSellerSettings(changes)
      
      if (response.success) {
        // Update both current and original settings with processed URLs
        setSettings(processedSettings)
        setOriginalSettings(processedSettings)
        setSaveStatus('success')
        
        // Clear any validation errors after successful save
        setErrors({})
        
        console.log('Seller settings saved successfully')
      } else {
        throw new Error(response.message || 'Failed to save settings')
      }
      
    } catch (error) {
      console.error('Failed to save seller settings:', error)
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

  const handlePaymentSubmit = async (data: PaymentDetailsFormData) => {
    try {
      // Update payment settings
      setSettings(prev => ({
        ...prev,
        payment: {
          ...prev.payment,
          paymentMethod: data.paymentMethod as SellerPaymentMethod, // Type assertion for compatibility
          bankDetails: {
            bankName: data.bankName,
            accountHolderName: data.accountHolderName,
            accountNumber: data.accountNumber,
            iban: data.iban || '',
            swiftCode: data.swiftCode,
            bankBranch: data.bankBranch
          },
          isSetup: true
        }
      }))
      
      setShowPaymentForm(false)
      setSaveStatus('idle') // Mark as having changes
    } catch (error) {
      console.error('Error saving payment details:', error)
    }
  }

  // Don't render if not authenticated or not seller
  if (isLoading || !isAuthenticated || !hasRole('seller')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading seller settings...</p>
        </div>
      </div>
    )
  }

  const activeTabConfig = SELLER_SETTINGS_TABS.find(tab => tab.id === activeTab)
  if (!activeTabConfig) return null

  const tabHasChanges = (tabId: string) => {
    const originalTabSettings = originalSettings[tabId as keyof SellerSettings] as unknown as Record<string, SettingsFieldValue>
    const currentTabSettings = settings[tabId as keyof SellerSettings] as unknown as Record<string, SettingsFieldValue>
    return JSON.stringify(originalTabSettings) !== JSON.stringify(currentTabSettings)
  }

  const tabHasErrors = (tabId: string) => {
    return Object.keys(errors[tabId] || {}).length > 0
  }

  // Custom content for special tabs
  const renderCustomContent = () => {
    if (activeTab === 'store') {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Store Settings</h2>
            <p className="text-muted-foreground">Customize your store appearance and branding</p>
          </div>
          
          <StoreSettingsSection
            settings={settings.store}
            onChange={(key, value) => handleFieldChange('store', key, value)}
            errors={errors.store || {}}
            disabled={isSaving}
          />
        </div>
      )
    }
    
    if (activeTab === 'payment') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Payment Setup</h2>
              <p className="text-muted-foreground">Configure how you receive payments from customers</p>
            </div>
            {!showPaymentForm && !settings.payment.isSetup && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Setup Payment
              </button>
            )}
                </div>

          {showPaymentForm ? (
            <PaymentDetailsForm
              onSubmit={handlePaymentSubmit}
              onCancel={() => setShowPaymentForm(false)}
              isLoading={false}
              isEditing={false}
            />
          ) : settings.payment.isSetup ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-green-800 dark:text-green-200">Payment Setup Complete</h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your payment details have been configured successfully.
                </p>
              </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background/50 border border-border/30 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Bank Details</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-medium">Bank:</span> {settings.payment.bankDetails.bankName}</p>
                    <p><span className="font-medium">Account:</span> {settings.payment.bankDetails.accountHolderName}</p>
                    <p><span className="font-medium">SWIFT:</span> {settings.payment.bankDetails.swiftCode}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-background/50 border border-border/30 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Payment Method</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {settings.payment.paymentMethod.replace('-', ' ')}
                  </p>
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="mt-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Edit Payment Details
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-medium text-amber-800 dark:text-amber-200">Payment Setup Required</h3>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You need to set up your payment details to receive payments from customers.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background/50 border border-border/30 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Bank Transfer</h4>
                  <p className="text-sm text-muted-foreground">Direct bank transfers to your account</p>
                  </div>
                <div className="p-4 bg-background/50 border border-border/30 rounded-lg opacity-50">
                  <h4 className="font-medium text-muted-foreground mb-2">Digital Wallets</h4>
                  <p className="text-sm text-muted-foreground">PayPal, Wise (Coming Soon)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'verification') {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Verification Status</h2>
            <p className="text-muted-foreground">Your seller verification progress and requirements</p>
            </div>

          {/* Overall Status */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800/30 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">Verified Seller</h3>
                <p className="text-sm text-green-700 dark:text-green-300">Your account is fully verified</p>
              </div>
                </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-green-200 dark:bg-green-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full"></div>
              </div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">100%</span>
            </div>
          </div>

          {/* Verification Items */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Verification Checklist</h3>
              
              <div className="space-y-3">
              {[
                { label: 'Email Verification', status: 'completed', description: 'Email address verified' },
                { label: 'Identity Verification', status: 'completed', description: 'NIC documents verified' },
                { label: 'Business Information', status: 'completed', description: 'Business details confirmed' },
                { label: 'Payment Setup', status: settings.payment.isSetup ? 'completed' : 'pending', description: 'Bank details configured' },
                { label: 'NGJA License', status: 'completed', description: 'License verified' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-background/50 border border-border/30 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.status === 'completed' ? 'bg-green-500/20 text-green-600' : 'bg-amber-500/20 text-amber-600'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{item.label}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'completed' 
                      ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {item.status === 'completed' ? 'Verified' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === 'account') {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Account Management</h2>
            <p className="text-muted-foreground">Manage your seller account and data</p>
                </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Data Management</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-background/50 border border-border/30 rounded-lg hover:border-primary/30 transition-colors">
                <div>
                  <h4 className="font-medium text-foreground">Export Data</h4>
                  <p className="text-sm text-muted-foreground">Download a copy of your seller data</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  Export
                </button>
              </div>
                  </div>
                </div>
                
          {/* Legal & Privacy */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Legal & Privacy</h3>
            
            <div className="space-y-3">
              {[
                { label: 'Seller Agreement', description: 'Terms specific to selling on our platform', url: '/seller-agreement' },
                { label: 'Privacy Policy', description: 'How we collect, use, and protect your data', url: '/privacy' },
                { label: 'Terms of Service', description: 'Legal terms and conditions', url: '/terms' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-background/50 border border-border/30 rounded-lg hover:border-purple-500/30 transition-colors">
                  <div>
                    <h4 className="font-medium text-foreground">{item.label}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <button 
                    onClick={() => router.push(item.url)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-lg transition-colors"
                  >
                    View
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4">
            <h3 className="font-medium text-red-600">Danger Zone</h3>
            
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-600">Delete Seller Account</h4>
                  <p className="text-sm text-red-500">Permanently delete your seller account and all data</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 border border-red-500/20 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <SettingsLayout
      title="Seller Settings"
      description="Configure your seller profile, store, and preferences"
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
            {SELLER_SETTINGS_TABS.map((tab) => {
              const IconComponent = SELLER_ICON_MAP[tab.icon as SellerIconName]
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
          {renderCustomContent() || (
            <SettingsSection
              title={activeTabConfig.label}
              description={activeTabConfig.description}
              icon={SELLER_ICON_MAP[activeTabConfig.icon as SellerIconName]}
              fields={activeTabConfig.fields as SettingsFieldConfig[]}
              values={settings[activeTab as keyof SellerSettings] as unknown as Record<string, SettingsFieldValue>}
              errors={errors[activeTab] || {}}
              onChange={(key, value) => handleFieldChange(activeTab as keyof SellerSettings, key, value)}
              disabled={isSaving}
            />
          )}
        </div>
      </div>
    </SettingsLayout>
  )
} 