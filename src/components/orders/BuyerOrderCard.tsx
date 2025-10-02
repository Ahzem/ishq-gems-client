import { useState, useMemo } from 'react'
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

  // Memoize invoice data to prevent unnecessary re-renders
  const invoiceData = useMemo(() => ({
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
      taxes: 0,
      total: order.totalAmount || 0
    },
    status: (order.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled') || 'draft'
  }), [order])

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
    <div className="bg-card rounded-lg sm:rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Order Header */}
      <div className="p-2 sm:p-3 lg:p-4 border-b border-border/30">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <h3 className="font-serif font-semibold text-sm sm:text-base truncate">
                  Order #{order.orderNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <p className="text-xs text-muted-foreground">
                  {formatDate(order.placedAt)}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Show Mark as Received button for shipped orders */}
              {order.status === 'shipped' && (
                <button
                  onClick={handleMarkAsReceived}
                  disabled={markingAsReceived}
                  className="flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline">{markingAsReceived ? 'Processing...' : 'Received'}</span>
                </button>
              )}
              <InvoiceButtons
                invoiceData={invoiceData}
                variant="compact"
                showPrintButton={false}
                showDownloadButton={true}
                showViewButton={true}
                className="scale-75 sm:scale-100"
              />
              <Link
                href={`/account/orders/${order._id}`}
                className="flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">View</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-2 sm:p-3 lg:p-4 bg-secondary/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <div>
              <p className="text-xs font-medium text-foreground">Total Amount</p>
              <p className="text-base sm:text-lg lg:text-xl font-serif font-bold text-primary">
                ${order.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="hidden sm:block h-4 w-px bg-border" />
            <div>
              <p className="text-xs font-medium text-foreground">Items</p>
              <p className="text-sm sm:text-base font-medium">{order.totalItems}</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-secondary/50 hover:bg-secondary rounded-md"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 flex-shrink-0" />
                <span className="hidden sm:inline">Hide</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
                <span className="hidden sm:inline">Show</span>
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
              className={`p-2 sm:p-3 lg:p-4 ${index < order.subOrders.length - 1 ? 'border-b border-border/30' : ''}`}
            >
              {/* Seller Info */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <S3Image
                  src={subOrder.sellerDetails.storeSettings?.logoUrl || ''}
                  alt={subOrder.sellerDetails.storeSettings?.storeName || 'Store'}
                  width={40}
                  height={40}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                  showFallbackIcon={true}
                  fallbackText={(subOrder.sellerDetails.storeSettings?.storeName || 'Store').charAt(0)}
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/seller/${subOrder.sellerId}`}
                    className="font-medium hover:text-primary transition-colors cursor-pointer text-xs sm:text-sm truncate block"
                  >
                    {subOrder.sellerDetails.storeSettings?.storeName || 'Unnamed Store'}
                  </Link>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    {subOrder.sellerDetails.country && (
                      <>
                        <Flag className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{subOrder.sellerDetails.country}</span>
                      </>
                    )}
                    {subOrder.sellerDetails.isVerified && (
                      <span className="seller-verified px-1 py-0.5 rounded-full text-xs whitespace-nowrap">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Status */}
              <div className="bg-secondary/50 rounded-md sm:rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                  <span className="font-medium text-xs sm:text-sm">
                    {subOrder.status === 'shipped' ? 'Shipped' : 
                     subOrder.status === 'delivered' ? 'Delivered' :
                     'Processing'}
                  </span>
                </div>
                {subOrder.trackingNumber && (
                  <p className="text-xs text-muted-foreground">
                    Tracking: {subOrder.trackingNumber}
                    {subOrder.courier && ` via ${subOrder.courier}`}
                  </p>
                )}
                {subOrder.estimatedDelivery && (
                  <p className="text-xs text-muted-foreground">
                    Estimated delivery: {formatDate(subOrder.estimatedDelivery.toString())}
                  </p>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2 sm:space-y-3">
                {subOrder.items.map((item) => (
                  <div key={item._id} className="flex items-start gap-2 sm:gap-3">
                    <S3Image
                      src={item.gemDetails.image || ''}
                      alt={item.gemDetails.name}
                      width={64}
                      height={64}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-md sm:rounded-lg object-cover flex-shrink-0"
                      fallbackSrc="/images/gem-placeholder.svg"
                      showFallbackIcon={true}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-0.5 text-xs sm:text-sm truncate">{item.gemDetails.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.gemDetails.gemType} • {item.gemDetails.color} • 
                        {item.gemDetails.weight?.value || 0}{item.gemDetails.weight?.unit || 'ct'}
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <p className="text-xs">
                          Qty: <span className="font-medium">{item.quantity}</span>
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-primary">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-xs sm:text-sm">${subOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">Shipping</span>
                  <span className="font-medium text-xs sm:text-sm">${subOrder.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-1 text-sm sm:text-base font-medium">
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