'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBackNavigation } from '@/hooks/useBackNavigation'
import { 
  ArrowLeft, 
  Package, 
  FileText,
  Flag,
  MapPin,
  Upload
} from 'lucide-react'
import orderService from '@/services/order.service'
import { Order } from '@/types/entities/order'
import S3Image from '@/components/common/S3Image'
import ReceiptReuploadModal from '@/components/orders/ReceiptReuploadModal'
import { ViewInvoiceButton } from '@/components/orders/InvoiceButtons'

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const { goBackWithFallback } = useBackNavigation({
    fallbackRoute: '/account/orders',
    excludeRoutes: ['/signin', '/signup']
  })
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [id, setId] = useState<string | null>(null)
  const [showReuploadModal, setShowReuploadModal] = useState(false)

  // Handle async params in useEffect for client components
  useEffect(() => {
    params.then(({ id: paramId }) => {
      setId(paramId)
    })
  }, [params])

  const fetchOrder = useCallback(async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const response = await orderService.getOrderById(id)
      if (response.success) {
        setOrder(response.data || null)
      } else {
        // Handle specific error cases
        if (response.message?.includes('Access denied') || response.message?.includes('403')) {
          setError('You do not have permission to view this order.')
        } else {
          setError(response.message || 'Failed to fetch order details')
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      
      // Handle network/axios errors with 403 status
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Access denied')) {
          setError('You do not have permission to view this order.')
        } else {
          setError('An error occurred while fetching order details')
        }
      } else {
        setError('An error occurred while fetching order details')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (isAuthenticated && !isLoading && id) {
      fetchOrder()
    }
  }, [isAuthenticated, isLoading, id, fetchOrder])

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin?message=Please sign in to view order details')
    }
  }, [isAuthenticated, isLoading, router])


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

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading order details...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-destructive mb-4 text-2xl">⚠️</div>
          <p className="text-muted-foreground text-sm sm:text-base">{error}</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or no order
  if (!isAuthenticated || !user || !order) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => goBackWithFallback('/account/orders')}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                title="Back to Orders"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <Package className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-serif font-bold text-foreground">
                    Order #{order.orderNumber}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Placed on {formatDate(order.placedAt)}
                  </p>
                </div>
              </div>
            </div>
            
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
              className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 self-start sm:self-auto"
            />
          </div>
        </div>
      </div>

      {/* Order Status */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden mb-4 sm:mb-8">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                    {order.status === 'delivered' ? `Delivered on ${formatDate(order.deliveredAt!)}` :
                     order.status === 'shipped' ? `Shipped on ${formatDate(order.shippedAt!)}` :
                     order.status === 'cancelled' ? `Cancelled on ${formatDate(order.cancelledAt!)}` :
                     `Order placed on ${formatDate(order.placedAt)}`}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-serif font-bold text-primary">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Left Column - Items */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {order.subOrders.map((subOrder) => (
                <div 
                  key={subOrder._id}
                  className="bg-card rounded-xl border border-border/50 overflow-hidden"
                >
                  {/* Seller Info */}
                  <div className="p-4 sm:p-6 border-b border-border/30">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <S3Image
                        src={subOrder.sellerDetails.storeSettings?.logoUrl || ''}
                        alt={subOrder.sellerDetails.storeSettings?.storeName || 'Store'}
                        width={40}
                        height={40}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        showFallbackIcon={true}
                        fallbackText={(subOrder.sellerDetails.storeSettings?.storeName || 'Store').charAt(0)}
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/seller/${subOrder.sellerId}`}
                          className="font-medium hover:text-primary transition-colors text-sm sm:text-base block truncate"
                        >
                          {subOrder.sellerDetails.storeSettings?.storeName || 'Unnamed Store'}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                          {subOrder.sellerDetails.country && (
                            <>
                              <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="truncate">{subOrder.sellerDetails.country}</span>
                            </>
                          )}
                          {subOrder.sellerDetails.isVerified && (
                            <span className="seller-verified px-1.5 py-0.5 rounded-full text-xs whitespace-nowrap">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4 sm:p-6">
                    <div className="space-y-4 sm:space-y-6">
                      {subOrder.items.map((item) => (
                        <div key={item._id} className="flex items-start gap-3 sm:gap-4">
                          <S3Image
                            src={item.gemDetails.image || ''}
                            alt={item.gemDetails.name}
                            width={80}
                            height={80}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                            fallbackSrc="/images/gem-placeholder.svg"
                            showFallbackIcon={true}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium mb-1 text-sm sm:text-base truncate">{item.gemDetails.name}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                              {item.gemDetails.gemType} • {item.gemDetails.color} • 
                              {item.gemDetails.weight?.value || 0}{item.gemDetails.weight?.unit || 'ct'}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <p className="text-xs sm:text-sm">
                                Qty: <span className="font-medium">{item.quantity}</span>
                              </p>
                              <p className="text-sm sm:text-base font-medium text-primary">
                                ${item.totalPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Subtotal */}
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/30">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Subtotal</span>
                        <span className="font-medium text-sm sm:text-base">${subOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1.5 sm:mt-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">Shipping</span>
                        <span className="font-medium text-sm sm:text-base">${subOrder.shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1.5 sm:mt-2 text-base sm:text-lg font-medium">
                        <span>Total</span>
                        <span className="text-primary">${subOrder.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Order Info */}
            <div className="space-y-4 sm:space-y-6">
              {/* Shipping Details */}
              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h3 className="font-serif font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Shipping Details
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">Delivery Address</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {order.shippingDetails.address.street}<br />
                        {order.shippingDetails.address.city}, {order.shippingDetails.address.state} {order.shippingDetails.address.zipCode}<br />
                        {order.shippingDetails.address.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">Shipping Method</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {order.shippingDetails.method}
                      </p>
                    </div>
                    {order.shippingDetails.specialInstructions && (
                      <div>
                        <p className="text-xs sm:text-sm font-medium mb-1">Special Instructions</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {order.shippingDetails.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h3 className="font-serif font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Payment Details
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">Payment Method</p>
                      <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                        {order.paymentDetails.method.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">Transaction ID</p>
                      <p className="text-xs sm:text-sm text-muted-foreground break-all">
                        {order.paymentDetails.transactionId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium mb-1">Payment Status</p>
                      <div className="flex items-center gap-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentDetails.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {order.paymentDetails.status.charAt(0).toUpperCase() + order.paymentDetails.status.slice(1)}
                        </span>
                        
                        {/* Show re-upload button for bank transfer orders with processing status */}
                        {order.paymentDetails.method === 'bank-transfer' && 
                         order.paymentDetails.status === 'processing' && (
                          <button
                            onClick={() => setShowReuploadModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors dark:text-orange-300 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:border-orange-800"
                          >
                            <Upload className="w-3 h-3" />
                            Re-upload Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Re-upload Modal */}
      {order && showReuploadModal && (
        <ReceiptReuploadModal
          isOpen={showReuploadModal}
          onClose={() => setShowReuploadModal(false)}
          orderNumber={order.orderNumber}
          onSuccess={() => {
            setShowReuploadModal(false)
            fetchOrder() // Refresh order data
          }}
        />
      )}
    </div>
  )
} 