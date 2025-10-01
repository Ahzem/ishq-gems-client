import { useState } from 'react'
import Link from 'next/link'
import { 
  Package, 
  Truck, 
  Flag,
  Calendar,
  MapPin,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react'
import { Order, SubOrder, ShippingUpdateRequest } from '@/types'
import orderService from '@/services/order.service'
import S3Image from '@/components/common/S3Image'
import { ViewInvoiceButton } from './InvoiceButtons'

interface SellerOrderCardProps {
  order: Order
  subOrder: SubOrder
}

export default function SellerOrderCard({ order, subOrder }: SellerOrderCardProps) {
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false)
  const [shippingData, setShippingData] = useState<ShippingUpdateRequest>({
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

  const handleShipOrder = async () => {
    try {
      setIsSubmitting(true)
      await orderService.shipOrder(order.orderNumber, shippingData)
      setIsShippingModalOpen(false)
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Failed to mark order as shipped:', error)
      alert('Failed to ship order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    }
    return statusColors[status as keyof typeof statusColors] || statusColors.pending
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Order Header */}
      <div className="p-4 sm:p-6 border-b border-border/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="font-serif font-semibold text-lg">
                Order #{order.orderNumber}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subOrder.status)}`}>
                {subOrder.status.charAt(0).toUpperCase() + subOrder.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.placedAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Show Mark as Shipped button only if payment is verified and order is confirmed */}
            {(subOrder.status === 'confirmed' || (order.status as string) === 'payment_confirmed') && isPaymentVerified && (
              <button
                onClick={() => setIsShippingModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Truck className="w-4 h-4" />
                Mark as Shipped
              </button>
            )}
            
            {/* Show payment status message if payment is not verified */}
            {(subOrder.status === 'confirmed' || (order.status as string) === 'payment_confirmed') && !isPaymentVerified && (
              <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border/30 bg-secondary/30">
                {isPaymentPending && isBankTransfer && (
                  <>
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700 dark:text-yellow-300">Awaiting Payment Verification</span>
                  </>
                )}
                {isPaymentPending && !isBankTransfer && (
                  <>
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 dark:text-blue-300">Payment Processing</span>
                  </>
                )}
                {isPaymentFailed && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-700 dark:text-red-300">Payment Failed</span>
                  </>
                )}
              </div>
            )}
            
            <ViewInvoiceButton
              invoiceData={{
                orderNumber: order.orderNumber,
                orderDate: order.placedAt,
                customer: {
                  name: order.buyerDetails?.name || 'N/A',
                  email: order.buyerDetails?.email || 'N/A',
                  phone: undefined,
                  address: order.shippingDetails?.address ? {
                    street: order.shippingDetails.address.street || '',
                    city: order.shippingDetails.address.city || '',
                    state: order.shippingDetails.address.state || '',
                    country: order.shippingDetails.address.country || '',
                    zipCode: order.shippingDetails.address.zipCode || ''
                  } : undefined
                },
                items: subOrder.items.map(item => ({
                  name: item.gemDetails?.name || 'N/A',
                  gemType: item.gemDetails?.gemType || 'N/A',
                  color: item.gemDetails?.color || 'N/A',
                  weight: item.gemDetails?.weight?.value || 0,
                  reportNumber: item.gemDetails?.reportNumber,
                  sellerName: 'Your Store', // This is for the seller's own orders
                  quantity: item.quantity || 1,
                  unitPrice: item.unitPrice || 0,
                  totalPrice: item.totalPrice || 0
                })),
                payment: {
                  method: order.paymentDetails?.method || 'N/A',
                  status: (order.paymentDetails?.status === 'refunded' ? 'failed' : order.paymentDetails?.status) || 'pending',
                  transactionId: order.paymentDetails?.transactionId || 'N/A',
                  hasReceipt: false,
                  paidAt: order.paymentDetails?.paidAt
                },
                totals: {
                  subtotal: subOrder.subtotal || 0,
                  shipping: subOrder.shippingCost || 0,
                  taxes: 0,
                  total: subOrder.totalAmount || 0
                },
                status: (order.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled') || 'draft'
              }}
              className="group relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary-foreground hover:text-primary-foreground hover:bg-secondary rounded-lg transition-all duration-300 border border-border hover:border-secondary hover:shadow-md"
            >
              <FileText className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="relative text-xs">Invoice</span>
            </ViewInvoiceButton>
            
            <Link
              href={`/dashboard/seller-orders/${order._id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              View Details
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Buyer Info */}
      <div className="p-4 sm:p-6 bg-secondary/30">
        <div className="flex items-center gap-4">
          <S3Image
            src={order.buyerDetails.avatar || ''}
            alt={order.buyerDetails.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
            showFallbackIcon={true}
            fallbackText={order.buyerDetails.name.charAt(0)}
          />
          <div>
            <h4 className="font-medium">{order.buyerDetails.name}</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {order.buyerDetails.country && (
                <div className="flex items-center gap-1">
                  <Flag className="w-4 h-4" />
                  <span>{order.buyerDetails.country}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Customer since {formatDate(order.placedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Section */}
      <div className="p-4 sm:p-6 border-t border-border/30">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Payment Status
        </h4>
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Method: <span className="capitalize">{order.paymentDetails.method.replace('-', ' ')}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Amount: ${order.paymentDetails.amount.toFixed(2)} {order.paymentDetails.currency}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isPaymentVerified && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </div>
              )}
              {isPaymentPending && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  <Clock className="w-4 h-4" />
                  {isBankTransfer ? 'Pending Verification' : 'Processing'}
                </div>
              )}
              {isPaymentFailed && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  Failed
                </div>
              )}
            </div>
          </div>
          
          {/* Additional information for bank transfer */}
          {isBankTransfer && isPaymentPending && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Bank Transfer:</strong> Customer has uploaded payment receipt. 
                Waiting for admin verification before you can ship the order.
              </p>
            </div>
          )}
          
          {isPaymentFailed && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>Payment Failed:</strong> Customer needs to provide a valid payment method or receipt.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Shipping Details */}
      <div className="p-4 sm:p-6 border-t border-border/30">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Shipping Details
        </h4>
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-sm mb-2">
            <span className="font-medium">Method:</span> {subOrder.shippingMethod}
          </p>
          <p className="text-sm mb-2">
            <span className="font-medium">Address:</span><br />
            {order.shippingDetails.address.street}<br />
            {order.shippingDetails.address.city}, {order.shippingDetails.address.state} {order.shippingDetails.address.zipCode}<br />
            {order.shippingDetails.address.country}
          </p>
          {order.shippingDetails.specialInstructions && (
            <p className="text-sm mt-3">
              <span className="font-medium">Special Instructions:</span><br />
              {order.shippingDetails.specialInstructions}
            </p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4 sm:p-6 border-t border-border/30">
        <h4 className="font-medium mb-4">Order Items</h4>
        <div className="space-y-4">
          {subOrder.items.map((item) => (
            <div key={item._id} className="flex items-center gap-4">
              <S3Image
                src={item.gemDetails.image || ''}
                alt={item.gemDetails.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-lg object-cover"
                fallbackSrc="/images/gem-placeholder.svg"
                showFallbackIcon={true}
              />
              <div className="flex-1">
                <h4 className="font-medium mb-1">{item.gemDetails.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.gemDetails.gemType} • {item.gemDetails.color} • 
                  {item.gemDetails.weight?.value || 0}{item.gemDetails.weight?.unit || 'ct'}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm">
                    Qty: <span className="font-medium">{item.quantity}</span>
                  </p>
                  <p className="text-sm font-medium text-primary">
                    ${item.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-4 border-t border-border/30">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subOrder.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">Shipping</span>
            <span className="font-medium">${subOrder.shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-2 text-lg font-medium">
            <span>Total</span>
            <span className="text-primary">${subOrder.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Modal */}
      {isShippingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-serif font-bold mb-4">Mark Order as Shipped</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={shippingData.trackingNumber}
                  onChange={(e) => setShippingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="Enter tracking number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Courier</label>
                <input
                  type="text"
                  value={shippingData.courier}
                  onChange={(e) => setShippingData(prev => ({ ...prev, courier: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="Enter courier name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={shippingData.estimatedDelivery}
                  onChange={(e) => setShippingData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsShippingModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleShipOrder}
                disabled={isSubmitting || !shippingData.trackingNumber || !shippingData.courier}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
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