'use client'

import React, { useEffect, useState } from 'react'
import { User, Mail, Phone, MapPin, AlertCircle } from 'lucide-react'
import { CheckoutBillingInfo } from '@/types/entities/order'
import AddressSelector from './AddressSelector'

interface BillingShippingProps {
  billingInfo: CheckoutBillingInfo
  setBillingInfo: (info: CheckoutBillingInfo) => void
  shippingAddressId?: string
  setShippingAddressId: (addressId: string) => void
  errors: Record<string, string>
}

type IconType = React.ComponentType<{ className?: string }>

const BillingFormField = React.memo(function BillingFormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon: Icon,
  required = true,
  error
}: {
  label: string
  value: string
  onChange: (val: string) => void
  type?: string
  placeholder?: string
  icon?: IconType
  required?: boolean
  error?: string
}) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full h-10 sm:h-12 rounded-lg sm:rounded-xl border transition-all duration-200 text-sm sm:text-base
            ${Icon ? 'pl-9 sm:pl-11 pr-3 sm:pr-4' : 'px-3 sm:px-4'}
            ${error 
              ? 'border-red-500 bg-red-50 dark:bg-red-950/20 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-border bg-background focus:border-primary focus:ring-primary/20'
            }
            focus:outline-none focus:ring-3
          `}
        />
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-xs sm:text-sm text-red-500">
          <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
})

function BillingShipping({ 
  billingInfo, 
  setBillingInfo, 
  shippingAddressId,
  setShippingAddressId,
  errors 
}: BillingShippingProps) {
  // Internal state to manage form data
  const [formData, setFormData] = useState<CheckoutBillingInfo>(billingInfo)

  // Sync internal state with props when they change
  useEffect(() => {
    setFormData(billingInfo)
  }, [billingInfo])

  const handleInputChange = (field: keyof CheckoutBillingInfo, value: string) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    setBillingInfo(updatedData)
  }

  const handleAddressSelect = (addressId: string) => {
    setShippingAddressId(addressId)
  }

  return (
    <div className="bg-card rounded-lg sm:rounded-xl border border-border/30 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-serif font-semibold text-foreground mb-4 sm:mb-6 flex items-center space-x-2">
        <User className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
        <span>Billing & Shipping Information</span>
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-3 sm:mb-4">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <BillingFormField
              label="Full Name"
              value={formData.fullName}
              onChange={(v) => handleInputChange('fullName', v)}
              placeholder="Enter your full name"
              icon={User}
              error={errors.fullName}
            />
            
            <BillingFormField
              label="Email Address"
              value={formData.email}
              onChange={(v) => handleInputChange('email', v)}
              type="email"
              placeholder="your@email.com"
              icon={Mail}
              error={errors.email}
            />
            
            <BillingFormField
              label="Phone Number"
              value={formData.phone}
              onChange={(v) => handleInputChange('phone', v)}
              type="tel"
              placeholder="+94 XX XXX XXXX"
              icon={Phone}
              error={errors.phone}
            />
            
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className={`
                  w-full h-10 sm:h-12 rounded-lg sm:rounded-xl border px-3 sm:px-4 transition-all duration-200 text-sm sm:text-base
                  ${errors.country 
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                    : 'border-border bg-background focus:border-primary'
                  }
                  focus:outline-none focus:ring-3 focus:ring-primary/20
                `}
              >
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
              {errors.country && (
                <div className="flex items-center space-x-1 text-xs sm:text-sm text-red-500">
                  <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span>{errors.country}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address Selector */}
        <div>
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-3 sm:mb-4 flex items-center space-x-2">
            <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
            <span>Shipping Address</span>
          </h3>
          
          <AddressSelector
            selectedAddressId={shippingAddressId}
            onAddressSelect={handleAddressSelect}
            addressType="all"
            label="Select Shipping Address"
            required={true}
            error={errors.shippingAddress}
            className="w-full"
          />
        </div>

        {/* Additional Information */}
        <div className="bg-secondary/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-accent/20 rounded-lg">
              <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Shipping Information</h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Select a saved address or add a new one for shipping. 
                We will send tracking information to your email once your order ships.
              </p>
            </div>
          </div>
        </div>

        {/* Save Information Note */}
        <div className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 bg-background/50 rounded-lg sm:rounded-xl border border-border/30">
          <div className="p-1 bg-primary/10 rounded-full mt-0.5">
            <User className="w-3 h-3 text-primary" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-foreground font-medium">
              Address Management
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your addresses are automatically saved to your profile for future use. 
              You can manage them from your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(BillingShipping)
