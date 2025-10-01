'use client'

import React, { useState } from 'react'
import { Plus, MapPin, Edit2, Trash2, Home, Truck, Star } from 'lucide-react'
import { UserAddress} from '@/types/common/base'
import { CreateAddressRequest, UpdateAddressRequest } from '@/types/entities/user'
import userService from '@/services/user.service'

interface AddressManagerProps {
  addresses: UserAddress[]
  onAddressChange: (addresses: UserAddress[]) => void
  className?: string
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
  type: 'personal',
  label: '',
  street: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  isDefault: false
}

const AddressManager: React.FC<AddressManagerProps> = ({
  addresses,
  onAddressChange,
  className = ''
}) => {
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
  const [formData, setFormData] = useState<AddressFormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Separate addresses by type
  const personalAddress = addresses.find(addr => addr.type === 'personal')
  const deliveryAddresses = addresses.filter(addr => addr.type === 'delivery')

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.label.trim()) {
      setError('Address label is required')
      return false
    }
    if (!formData.street.trim()) {
      setError('Street address is required')
      return false
    }
    if (!formData.city.trim()) {
      setError('City is required')
      return false
    }
    if (!formData.state.trim()) {
      setError('State is required')
      return false
    }
    if (!formData.country.trim()) {
      setError('Country is required')
      return false
    }
    if (!formData.zipCode.trim()) {
      setError('ZIP code is required')
      return false
    }

    // Check if trying to add multiple personal addresses
    if (formData.type === 'personal' && personalAddress && !editingAddress) {
      setError('You can only have one personal address')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (editingAddress) {
        // Update existing address
        const updateData: UpdateAddressRequest = {
          id: editingAddress.id,
          ...formData
        }
        const response = await userService.updateAddress(updateData)
        
        if (response.success && response.data) {
          const updatedAddresses = addresses.map(addr => 
            addr.id === editingAddress.id ? response.data! : addr
          )
          onAddressChange(updatedAddresses)
          setEditingAddress(null)
        } else {
          setError(response.message || 'Failed to update address')
        }
      } else {
        // Create new address
        const createData: CreateAddressRequest = formData
        const response = await userService.createAddress(createData)
        
        if (response.success && response.data) {
          onAddressChange([...addresses, response.data])
        } else {
          setError(response.message || 'Failed to create address')
        }
      }
      
      if (!error) {
        setFormData(initialFormData)
        setIsAddingAddress(false)
      }
    } catch (err) {
      setError('An error occurred while saving the address')
      console.error('Address save error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address)
    setFormData({
      type: address.type,
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
      isDefault: address.isDefault
    })
    setIsAddingAddress(true)
    setError(null)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    setIsLoading(true)
    try {
      const response = await userService.deleteAddress({ id: addressId })
      
      if (response.success) {
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId)
        onAddressChange(updatedAddresses)
      } else {
        setError(response.message || 'Failed to delete address')
      }
    } catch (err) {
      setError('An error occurred while deleting the address')
      console.error('Address delete error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsAddingAddress(false)
    setEditingAddress(null)
    setFormData(initialFormData)
    setError(null)
  }

  const AddressCard = ({ address }: { address: UserAddress }) => (
    <div className="bg-card border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {address.type === 'personal' ? (
            <Home className="w-4 h-4 text-primary" />
          ) : (
            <Truck className="w-4 h-4 text-blue-500" />
          )}
          <h4 className="font-medium text-foreground">{address.label}</h4>
          {address.isDefault && (
            <Star className="w-3 h-3 text-amber-500 fill-current" />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleEdit(address)}
            className="p-1 hover:bg-primary/10 rounded text-primary transition-colors"
            title="Edit address"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleDelete(address.id)}
            className="p-1 hover:bg-red-500/10 rounded text-red-500 transition-colors"
            title="Delete address"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-1">
        <p>{address.street}</p>
        <p>{address.city}, {address.state} {address.zipCode}</p>
        <p>{address.country}</p>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-full">
          {address.type === 'personal' ? 'Personal Address' : 'Delivery Address'}
        </span>
      </div>
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Address Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage your personal and delivery addresses
          </p>
        </div>
        {!isAddingAddress && (
          <button
            onClick={() => setIsAddingAddress(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Personal Address Section */}
      <div>
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <Home className="w-4 h-4 text-primary" />
          Personal Address
          <span className="text-xs text-muted-foreground">(Maximum 1)</span>
        </h4>
        
        {personalAddress ? (
          <AddressCard address={personalAddress} />
        ) : (
          <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No personal address added</p>
            <button
              onClick={() => {
                setFormData({ ...initialFormData, type: 'personal' })
                setIsAddingAddress(true)
              }}
              className="mt-2 text-primary hover:text-primary/80 text-sm font-medium"
            >
              Add Personal Address
            </button>
          </div>
        )}
      </div>

      {/* Delivery Addresses Section */}
      <div>
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-500" />
          Delivery Addresses
          <span className="text-xs text-muted-foreground">(Multiple allowed)</span>
        </h4>
        
        {deliveryAddresses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {deliveryAddresses.map(address => (
              <AddressCard key={address.id} address={address} />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
            <Truck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No delivery addresses added</p>
            <button
              onClick={() => {
                setFormData({ ...initialFormData, type: 'delivery' })
                setIsAddingAddress(true)
              }}
              className="mt-2 text-primary hover:text-primary/80 text-sm font-medium"
            >
              Add Delivery Address
            </button>
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      {isAddingAddress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Address Type */}
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
                    disabled={personalAddress && !editingAddress}
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
                    placeholder="New York"
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
                    placeholder="NY"
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
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="United States"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    required
                  />
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

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingAddress ? 'Update' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressManager
