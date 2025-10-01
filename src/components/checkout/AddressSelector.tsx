'use client'

import React, { useState, useEffect } from 'react'
import { Plus, MapPin, Home, Truck, Star, Check, ChevronDown } from 'lucide-react'
import { UserAddress } from '@/types/common/base'
import { CreateAddressRequest } from '@/types/entities/user'
import userService from '@/services/user.service'

interface AddressSelectorProps {
  selectedAddressId?: string
  onAddressSelect: (addressId: string, address: UserAddress) => void
  addressType?: 'personal' | 'delivery' | 'all'
  className?: string
  label?: string
  required?: boolean
  error?: string
}

interface AddressFormData {
  type: 'personal' | 'delivery'
  label: string
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  isDefault?: boolean
}

const initialFormData: AddressFormData = {
  type: 'delivery',
  label: '',
  street: '',
  city: '',
  state: '',
  country: 'Sri Lanka',
  zipCode: '',
  isDefault: false
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddressId,
  onAddressSelect,
  addressType = 'all',
  className = '',
  label = 'Select Address',
  required = true,
  error
}) => {
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [formData, setFormData] = useState<AddressFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setIsLoading(true)
      const response = await userService.getAddresses()
      if (response.success && response.data) {
        setAddresses(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter addresses based on type
  const filteredAddresses = addresses.filter(addr => {
    if (addressType === 'personal') return addr.type === 'personal'
    if (addressType === 'delivery') return addr.type === 'delivery'
    return true // 'all'
  })

  const selectedAddress = filteredAddresses.find(addr => addr.id === selectedAddressId)

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setFormError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.label.trim()) {
      setFormError('Address label is required')
      return false
    }
    if (!formData.street.trim()) {
      setFormError('Street address is required')
      return false
    }
    if (!formData.city.trim()) {
      setFormError('City is required')
      return false
    }
    if (!formData.state.trim()) {
      setFormError('State is required')
      return false
    }
    if (!formData.country.trim()) {
      setFormError('Country is required')
      return false
    }
    if (!formData.zipCode.trim()) {
      setFormError('ZIP code is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const createData: CreateAddressRequest = formData
      const response = await userService.createAddress(createData)
      
      if (response.success && response.data) {
        const newAddress = response.data
        setAddresses(prev => [...prev, newAddress])
        onAddressSelect(newAddress.id, newAddress)
        setShowAddressForm(false)
        setFormData(initialFormData)
      } else {
        setFormError(response.message || 'Failed to create address')
      }
    } catch (err) {
      setFormError('An error occurred while saving the address')
      console.error('Address save error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const AddressCard = ({ address, isSelected = false, onClick }: { 
    address: UserAddress
    isSelected?: boolean
    onClick: () => void
  }) => (
    <div 
      onClick={onClick}
      className={`
        p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:border-primary/50
        ${isSelected 
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
          : 'border-border hover:bg-secondary/30'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {address.type === 'personal' ? (
            <Home className="w-4 h-4 text-primary flex-shrink-0" />
          ) : (
            <Truck className="w-4 h-4 text-blue-500 flex-shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground">{address.label}</h4>
              {address.isDefault && (
                <Star className="w-3 h-3 text-amber-500 fill-current" />
              )}
            </div>
            <div className="text-sm text-muted-foreground space-y-1 mt-1">
              <p>{address.street}</p>
              <p>{address.city}, {address.state} {address.zipCode}</p>
              <p>{address.country}</p>
            </div>
          </div>
        </div>
        {isSelected && (
          <div className="p-1 bg-primary rounded-full">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="animate-pulse bg-secondary/50 h-12 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Address Selector Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            w-full flex items-center justify-between p-3 border rounded-lg bg-background text-left
            ${error 
              ? 'border-red-500 ring-1 ring-red-500/20' 
              : 'border-border hover:border-primary/50'
            }
            ${selectedAddress ? 'text-foreground' : 'text-muted-foreground'}
          `}
        >
          <div className="flex items-center gap-3">
            {selectedAddress ? (
              <>
                {selectedAddress.type === 'personal' ? (
                  <Home className="w-4 h-4 text-primary" />
                ) : (
                  <Truck className="w-4 h-4 text-blue-500" />
                )}
                <span>{selectedAddress.label}</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Select an address...</span>
              </>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {filteredAddresses.length > 0 ? (
              <div className="p-2 space-y-2">
                {filteredAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    isSelected={address.id === selectedAddressId}
                    onClick={() => {
                      onAddressSelect(address.id, address)
                      setIsDropdownOpen(false)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No addresses found</p>
              </div>
            )}
            
            {/* Add New Address Button */}
            <div className="border-t border-border p-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddressForm(true)
                  setIsDropdownOpen(false)
                  setFormData({
                    ...initialFormData,
                    type: addressType === 'personal' ? 'personal' : 'delivery'
                  })
                }}
                className="w-full flex items-center gap-2 p-3 text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Address Preview */}
      {selectedAddress && (
        <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">{selectedAddress.label}</p>
            <p>{selectedAddress.street}</p>
            <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}</p>
            <p>{selectedAddress.country}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {/* Add Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Add New Address
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Address Type */}
              {addressType === 'all' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleInputChange('type', 'personal')}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.type === 'personal'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50 text-muted-foreground'
                      }`}
                    >
                      <Home className="w-4 h-4 mx-auto mb-1" />
                      Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('type', 'delivery')}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.type === 'delivery'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50 text-muted-foreground'
                      }`}
                    >
                      <Truck className="w-4 h-4 mx-auto mb-1" />
                      Delivery
                    </button>
                  </div>
                </div>
              )}

              {/* Address Label */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address Label
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  placeholder={formData.type === 'personal' ? 'e.g., Home' : 'e.g., Office, Warehouse'}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  required
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="123 Main Street, Apt 4B"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  required
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Colombo"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Western Province"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Country & ZIP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    required
                  >
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="10001"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Set as Default (for delivery addresses) */}
              {formData.type === 'delivery' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault || false}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20"
                  />
                  <label htmlFor="isDefault" className="text-sm text-foreground">
                    Set as default delivery address
                  </label>
                </div>
              )}

              {/* Error Display */}
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-3">
                  <p className="text-red-700 dark:text-red-400 text-sm">{formError}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false)
                    setFormData(initialFormData)
                    setFormError(null)
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}

export default AddressSelector
