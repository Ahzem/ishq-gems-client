'use client'

import { useState } from 'react'
import { Truck, Clock, AlertCircle, CheckCircle, Package } from 'lucide-react'
import { Order } from '@/types/entities/order'
import orderService from '@/services/order.service'
import { cn } from '@/lib/utils'

interface SellerOrderActionsProps {
  order: Order
  onOrderUpdate: () => void
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void
}

interface ShippingData {
  trackingNumber: string
  courier: string
  estimatedDelivery: string
}

export default function SellerOrderActions({
  order,
  onOrderUpdate,
  onShowToast
}: SellerOrderActionsProps) {
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false)
  const [shippingData, setShippingData] = useState<ShippingData>({
    trackingNumber: '',
    courier: '',
    estimatedDelivery: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check payment verification status
  const isPaymentVerified = order.paymentDetails.status === 'completed'
  const isPaymentPending = order.paymentDetails.status === 'pending' || order.paymentDetails.status === 'processing'
  const isPaymentFailed = order.paymentDetails.status === 'failed'
  const isBankTransfer = order.paymentDetails.method === 'bank-transfer'

  // Check if order can be shipped (payment verified and order confirmed)
  const canShipOrder = isPaymentVerified && (
    order.status === 'paid' ||
    order.status === 'processing'
  )

  const handleShipOrder = async () => {
    if (!shippingData.trackingNumber || !shippingData.courier) {
      onShowToast('Please provide tracking number and courier information', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await orderService.shipOrder(order.orderNumber, {
        trackingNumber: shippingData.trackingNumber,
        courier: shippingData.courier,
        estimatedDelivery: shippingData.estimatedDelivery
      })
      
      if (response.success) {
        onShowToast('Order marked as shipped successfully!', 'success')
        setIsShippingModalOpen(false)
        setShippingData({ trackingNumber: '', courier: '', estimatedDelivery: '' })
        onOrderUpdate()
      } else {
        onShowToast(response.message || 'Failed to ship order', 'error')
      }
    } catch (error) {
      console.error('Error shipping order:', error)
      onShowToast('Failed to ship order. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Don't show actions if order is already shipped or delivered
  if (order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled') {
    return null
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6">
      <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        Order Actions
      </h2>

      <div className="space-y-4">
        {/* Payment Status */}
        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-3">
            {isPaymentVerified ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : isPaymentPending ? (
              <Clock className="w-5 h-5 text-yellow-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <p className="font-medium">
                {isPaymentVerified ? 'Payment Verified' : 
                 isPaymentPending ? 'Payment Pending Verification' : 
                 'Payment Failed'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isPaymentVerified ? 'You can now ship this order' :
                 isPaymentPending && isBankTransfer ? 'Waiting for admin to verify bank transfer receipt' :
                 isPaymentPending ? 'Payment is being processed' :
                 'Payment verification failed'}
              </p>
            </div>
          </div>
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            isPaymentVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
            isPaymentPending ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          )}>
            {order.paymentDetails.status.charAt(0).toUpperCase() + order.paymentDetails.status.slice(1)}
          </span>
        </div>

        {/* Ship Order Button */}
        {canShipOrder && (
          <div className="flex justify-end">
            <button
              onClick={() => setIsShippingModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Truck className="w-4 h-4" />
              Mark as Shipped
            </button>
          </div>
        )}

        {/* Waiting Message */}
        {!canShipOrder && !isPaymentFailed && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              {isPaymentPending && isBankTransfer ? 
                'Waiting for admin verification before you can ship the order.' :
                'Order will be available for shipping once payment is confirmed.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Shipping Modal */}
      {isShippingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl border border-border/50 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Ship Order</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  value={shippingData.trackingNumber}
                  onChange={(e) => setShippingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Courier/Shipping Company *
                </label>
                <input
                  type="text"
                  value={shippingData.courier}
                  onChange={(e) => setShippingData(prev => ({ ...prev, courier: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., DHL, FedEx, UPS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimated Delivery (Optional)
                </label>
                <input
                  type="date"
                  value={shippingData.estimatedDelivery}
                  onChange={(e) => setShippingData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  min={formatDate(new Date().toISOString())}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsShippingModalOpen(false)
                  setShippingData({ trackingNumber: '', courier: '', estimatedDelivery: '' })
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShipOrder}
                disabled={isSubmitting || !shippingData.trackingNumber || !shippingData.courier}
                className="flex-1 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
