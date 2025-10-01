import { useState } from 'react'
import Link from 'next/link'
import { 
  Package, 
  ChevronDown, 
  ChevronUp, 
  Truck, 
  Flag,
  ExternalLink,
  CheckCircle
} from 'lucide-react'
import { Order, SubOrder } from '@/types'
import orderService from '@/services/order.service'
import S3Image from '@/components/common/S3Image'
import InvoiceButtons from './InvoiceButtons'



interface BuyerOrderCardProps {
  order: Order
}

export default function BuyerOrderCard({ order }: BuyerOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [markingAsReceived, setMarkingAsReceived] = useState(false)

  const handleMarkAsReceived = async () => {
    try {
      setMarkingAsReceived(true)
      await orderService.markOrderAsReceived(order.orderNumber)
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Failed to mark order as received:', error)
      alert('Failed to mark order as received. Please try again.')
    } finally {
      setMarkingAsReceived(false)
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
      paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.placedAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Show Mark as Received button for shipped orders */}
            {order.status === 'shipped' && (
              <button
                onClick={handleMarkAsReceived}
                disabled={markingAsReceived}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                {markingAsReceived ? 'Processing...' : 'Mark as Received'}
              </button>
            )}
            <InvoiceButtons
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
                items: order.subOrders.flatMap(subOrder => 
                  subOrder.items.map(item => ({
                    name: item.gemDetails?.name || 'N/A',
                    gemType: item.gemDetails?.gemType || 'N/A',
                    color: item.gemDetails?.color || 'N/A',
                    weight: item.gemDetails?.weight?.value || 0,
                    reportNumber: item.gemDetails?.reportNumber,
                    sellerName: subOrder.sellerDetails?.storeSettings?.storeName || subOrder.sellerDetails?.name || 'N/A',
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || 0,
                    totalPrice: item.totalPrice || 0
                  }))
                ),
                payment: {
                  method: order.paymentDetails?.method || 'N/A',
                  status: (order.paymentDetails?.status === 'refunded' ? 'failed' : order.paymentDetails?.status) || 'pending',
                  transactionId: order.paymentDetails?.transactionId || 'N/A',
                  hasReceipt: false,
                  paidAt: order.paymentDetails?.paidAt
                },
                totals: {
                  subtotal: order.subtotal || 0,
                  shipping: order.totalShipping || 0,
                  taxes: 0, // taxes not available in current Order interface
                  total: order.totalAmount || 0
                },
                status: (order.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled') || 'draft'
              }}
              variant="compact"
              showPrintButton={false}
              showDownloadButton={true}
              showViewButton={true}
            />
            <Link
              href={`/account/orders/${order._id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              View Details
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-4 sm:p-6 bg-secondary/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Total Amount</p>
              <p className="text-2xl font-serif font-bold text-primary">
                ${order.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="h-8 w-px bg-border mx-2" />
            <div>
              <p className="text-sm font-medium text-foreground">Items</p>
              <p className="text-lg font-medium">{order.totalItems}</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Details
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border/30">
          {order.subOrders.map((subOrder: SubOrder, index: number) => (
            <div 
              key={subOrder._id}
              className={`p-4 sm:p-6 ${index < order.subOrders.length - 1 ? 'border-b border-border/30' : ''}`}
            >
              {/* Seller Info */}
              <div className="flex items-center gap-4 mb-6">
                <S3Image
                  src={subOrder.sellerDetails.storeSettings?.logoUrl || ''}
                  alt={subOrder.sellerDetails.storeSettings?.storeName || 'Store'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  showFallbackIcon={true}
                  fallbackText={(subOrder.sellerDetails.storeSettings?.storeName || 'Store').charAt(0)}
                />
                <div>
                  <Link
                    href={`/seller/${subOrder.sellerId}`}
                    className="font-medium hover:text-primary transition-colors cursor-pointer"
                  >
                    {subOrder.sellerDetails.storeSettings?.storeName || 'Unnamed Store'}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {subOrder.sellerDetails.country && (
                      <>
                        <Flag className="w-4 h-4" />
                        <span>{subOrder.sellerDetails.country}</span>
                      </>
                    )}
                    {subOrder.sellerDetails.isVerified && (
                      <span className="seller-verified px-2 py-0.5 rounded-full text-xs">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Status */}
              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {subOrder.status === 'shipped' ? 'Shipped' : 
                     subOrder.status === 'delivered' ? 'Delivered' :
                     'Processing'}
                  </span>
                </div>
                {subOrder.trackingNumber && (
                  <p className="text-sm text-muted-foreground">
                    Tracking: {subOrder.trackingNumber}
                    {subOrder.courier && ` via ${subOrder.courier}`}
                  </p>
                )}
                {subOrder.estimatedDelivery && (
                  <p className="text-sm text-muted-foreground">
                    Estimated delivery: {formatDate(subOrder.estimatedDelivery.toString())}
                  </p>
                )}
              </div>

              {/* Items */}
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

              {/* Subtotal */}
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
          ))}
        </div>
      )}

    </div>
  )
} 