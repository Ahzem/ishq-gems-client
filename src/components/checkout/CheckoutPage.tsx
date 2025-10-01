'use client'

import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCart } from '@/store/useCart'
import PaymentMethods from './PaymentMethods'
import OrderSummary from './OrderSummary'
import BillingShipping from './BillingShipping'
import CheckoutSuccess from './CheckoutSuccess'
import Button from '@/components/buttons/Button'
import { checkoutService } from '@/services/checkout.service'
import { useUI } from '@/components/providers/UIProvider'
import { CartItem } from '@/types/entities/cart'
import { CheckoutBillingInfo } from '@/types'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, totalAmount, shippingFee, taxes, clearCart } = useCart()
  const router = useRouter()
  const { showToast } = useUI()
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('bank-transfer')
  const [billingInfo, setBillingInfo] = useState<CheckoutBillingInfo>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.address?.country || 'Sri Lanka'
  })
  const [shippingAddressId, setShippingAddressId] = useState<string>('')
  const [paymentReceipt, setPaymentReceipt] = useState<File | undefined>(undefined)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  
  // Fetch and initialize billing info from saved data
  useEffect(() => {
    const fetchSavedBillingInfo = async () => {
      if (!user) return

      try {
        const response = await checkoutService.getSavedBillingInfo()
        
        if (response.success && response.data) {
          setBillingInfo({
            fullName: response.data.fullName || user.fullName || '',
            email: response.data.email || user.email || '',
            phone: response.data.phone || '',
            country: response.data.address?.country || 'Sri Lanka'
          })
        } else {
          // Fallback to user data if no saved billing info
          setBillingInfo({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: '',
            country: 'Sri Lanka'
          })
        }
      } catch (error) {
        console.error('Failed to fetch billing info:', error)
        // Fallback to user data on error
        setBillingInfo({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: '',
          country: 'Sri Lanka'
        })
      }
    }

    fetchSavedBillingInfo()
  }, [user])

  const handleBillingInfoChange = useCallback((info: CheckoutBillingInfo) => {
    setBillingInfo(info)
    // Clear errors when user starts typing
    setErrors(prev => Object.keys(prev).length > 0 ? {} : prev)
  }, [])

  const handleShippingAddressChange = useCallback((addressId: string) => {
    setShippingAddressId(addressId)
    // Clear shipping address error
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.shippingAddress
      return newErrors
    })
  }, [])

  const validateBillingInfo = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!billingInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!billingInfo.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingInfo.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!billingInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    
    if (!shippingAddressId.trim()) {
      newErrors.shippingAddress = 'Please select a shipping address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePlaceOrder = async () => {
    if (!validateBillingInfo()) {
      showToast({ message: 'Please fill in all required fields', type: 'error' })
      return
    }

    // Validate payment receipt for bank transfer
    if (selectedPaymentMethod === 'bank-transfer' && !paymentReceipt) {
      showToast({ message: 'Please upload your payment receipt to proceed', type: 'error' })
      return
    }

    setIsProcessing(true)
    
    try {
      const orderData = {
        items: items.map((item: CartItem) => ({
          gemId: item.id,
          quantity: item.quantity,
          price: item.priceNumber
        })),
        billingInfo,
        shippingAddressId,
        paymentMethod: selectedPaymentMethod,
        paymentReceipt: paymentReceipt,
        subtotal: totalAmount,
        shippingFee,
        taxes,
        total: totalAmount + shippingFee + taxes
      }

      const response = await checkoutService.placeOrderWithAddressId(orderData)
      
      if (response.success) {
        setOrderNumber(response.orderNumber)
        setOrderComplete(true)
        clearCart()
        showToast({ message: 'Order placed successfully!', type: 'success' })
      } else {
        throw new Error(response.message || 'Failed to place order')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      showToast({ 
        message: error instanceof Error ? error.message : 'Failed to place order', 
        type: 'error' 
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (orderComplete) {
    return <CheckoutSuccess orderNumber={orderNumber} paymentMethod={selectedPaymentMethod} />
  }

  const finalTotal = totalAmount + shippingFee + taxes

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/30">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <div className="h-4 sm:h-6 w-px bg-border/50" />
            <h1 className="text-lg sm:text-2xl font-serif font-bold text-foreground">Secure Checkout</h1>
            <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8 mb-20">
            {/* Billing & Shipping */}
            <BillingShipping 
              billingInfo={billingInfo}
              setBillingInfo={handleBillingInfoChange}
              shippingAddressId={shippingAddressId}
              setShippingAddressId={handleShippingAddressChange}
              errors={errors}
            />

            {/* Payment Methods */}
            <PaymentMethods 
              selectedMethod={selectedPaymentMethod}
              onMethodSelect={setSelectedPaymentMethod}
              paymentReceipt={paymentReceipt}
              onReceiptUpload={(file) => setPaymentReceipt(file || undefined)}
              totalAmount={totalAmount}
              shippingFee={shippingFee}
              taxes={taxes}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">
              {/* Order Summary */}
              <OrderSummary 
                items={items as CartItem[]}
                subtotal={totalAmount}
                shippingFee={shippingFee}
                taxes={taxes}
                total={finalTotal}
              />

              {/* Place Order - Desktop Only */}
              <div className="hidden lg:block bg-card rounded-xl border border-border/30 p-6 space-y-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Your order is secured with SSL encryption</span>
                </div>
                
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || items.length === 0 || !shippingAddressId || (selectedPaymentMethod === 'bank-transfer' && !paymentReceipt)}
                  className="w-full h-12 text-lg font-semibold"
                  loading={isProcessing}
                >
                  {isProcessing ? 'Processing Order...' : 
                   !shippingAddressId ? 'Select Shipping Address' :
                   selectedPaymentMethod === 'bank-transfer' && !paymentReceipt ? 'Upload Receipt to Continue' :
                   `Place Order • $${finalTotal.toFixed(2)}`}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border/30 p-4 safe-area-pb z-50">
        <div className="container mx-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3 flex-shrink-0" />
              <span>Secured with SSL encryption</span>
            </div>
            
            <Button
              onClick={handlePlaceOrder}
              disabled={isProcessing || items.length === 0 || !shippingAddressId || (selectedPaymentMethod === 'bank-transfer' && !paymentReceipt)}
              className="w-full h-12 text-base font-semibold"
              loading={isProcessing}
            >
              {isProcessing ? 'Processing Order...' : 
               !shippingAddressId ? 'Select Shipping Address' :
               selectedPaymentMethod === 'bank-transfer' && !paymentReceipt ? 'Upload Receipt to Continue' :
               `Place Order • $${finalTotal.toFixed(2)}`}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              By placing your order, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
