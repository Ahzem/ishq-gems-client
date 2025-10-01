'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBackNavigation } from '@/hooks/useBackNavigation'
import { ArrowLeft, Package, FileText, Truck, MapPin, Calendar, User } from 'lucide-react'
import orderService from '@/services/order.service'
import { Order } from '@/types/entities/order'
import SellerOrderActions from '@/components/orders/SellerOrderActions'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, isAuthenticated } = useAuth()
  const { goBackWithFallback } = useBackNavigation({
    fallbackRoute: '/dashboard/seller-orders',
    excludeRoutes: ['/signin', '/signup']
  })
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error' | 'info'
  }>({
    show: false,
    message: '',
    type: 'info'
  })

  const orderId = params?.id as string

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await orderService.getOrderById(orderId)
      if (response.success && response.data) {
        setOrder(response.data)
      } else {
        setError(response.message || 'Failed to fetch order details')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      setError('An error occurred while fetching order details')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (isAuthenticated && !isLoading && orderId && (user?.role === 'admin' || user?.role === 'seller')) {
      fetchOrderDetails()
    }
  }, [isAuthenticated, isLoading, orderId, user?.role, fetchOrderDetails])

  // Redirect if not authenticated or not admin/seller
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'seller'))) {
      router.push('/signin?message=Access denied')
    }
  }, [isAuthenticated, isLoading, user?.role, router])

  const handleViewInvoice = async () => {
    if (!order) return
    
    try {
      setDownloadingInvoice(true)
      const response = await orderService.getInvoiceData(order.orderNumber)
      if (response.success) {
        alert('Invoice data loaded successfully!')
      } else {
        alert('Failed to load invoice data.')
      }
    } catch (error) {
      console.error('Failed to load invoice:', error)
      alert('Failed to load invoice. Please try again.')
    } finally {
      setDownloadingInvoice(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
    return statusColors[status as keyof typeof statusColors] || statusColors.pending
  }

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push('/dashboard/my-orders')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated, wrong role, or no order
  if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'seller') || !order) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' :
          'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={hideToast}
              className="text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => goBackWithFallback('/dashboard/seller-orders')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Back to Manage Orders"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.placedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <button
            onClick={handleViewInvoice}
            disabled={downloadingInvoice}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            {downloadingInvoice ? 'Downloading...' : 'Invoice'}
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Order Total</p>
            <p className="text-2xl font-bold text-primary">${order.totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Items</p>
            <p className="text-xl font-semibold">{order.totalItems}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
            <p className="text-lg font-medium capitalize">{order.paymentDetails.method.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              order.paymentDetails.status === 'completed' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            }`}>
              {order.paymentDetails.status.charAt(0).toUpperCase() + order.paymentDetails.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Shipping Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Delivery Address</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{order.shippingDetails.address.street}</p>
              <p>{order.shippingDetails.address.city}, {order.shippingDetails.address.state} {order.shippingDetails.address.zipCode}</p>
              <p>{order.shippingDetails.address.country}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Shipping Details</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Method: {order.shippingDetails.method}</p>
              <p>Cost: ${order.shippingDetails.cost.toFixed(2)}</p>
              {order.shippingDetails.estimatedDelivery && (
                <p>Estimated Delivery: {formatDate(order.shippingDetails.estimatedDelivery)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seller Order Actions */}
      <SellerOrderActions
        order={order}
        onOrderUpdate={fetchOrderDetails}
        onShowToast={showToast}
      />

      {/* Order Items by Seller */}
      <div className="space-y-6">
        {order.subOrders.map((subOrder) => (
          <div key={subOrder._id} className="bg-card rounded-xl border border-border/50 p-6">
            {/* Seller Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {subOrder.sellerDetails.avatar ? (
                  <Image
                    src={subOrder.sellerDetails.avatar}
                    alt={subOrder.sellerDetails.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <Link
                    href={`/marketplace/seller/${subOrder.sellerId}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {subOrder.sellerDetails.name}
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    {subOrder.sellerDetails.country && (
                      <span>{subOrder.sellerDetails.country}</span>
                    )}
                    {subOrder.sellerDetails.isVerified && (
                      <span className="text-green-600">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">${subOrder.totalAmount.toFixed(2)}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subOrder.status)}`}>
                  {subOrder.status.charAt(0).toUpperCase() + subOrder.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Tracking Info */}
            {subOrder.trackingNumber && (
              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Tracking Information</p>
                    <p className="text-sm text-muted-foreground">
                      {subOrder.trackingNumber}
                      {subOrder.courier && ` via ${subOrder.courier}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="space-y-4">
              <h3 className="font-medium">Items from this seller</h3>
              {subOrder.items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden">
                    {item.gemDetails.image ? (
                      <Image
                        src={item.gemDetails.image}
                        alt={item.gemDetails.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{item.gemDetails.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.gemDetails.gemType} • {item.gemDetails.color} • 
                      {item.gemDetails.weight?.value || 0}{item.gemDetails.weight?.unit || 'ct'}
                    </p>
                    {item.gemDetails.reportNumber && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Report: {item.gemDetails.reportNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
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
              <div className="flex justify-between items-center mt-2 text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">${subOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Timeline */}
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Order Timeline
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium">Order Placed</p>
              <p className="text-sm text-muted-foreground">{formatDate(order.placedAt)}</p>
            </div>
          </div>
          {order.confirmedAt && (
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Order Confirmed</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.confirmedAt)}</p>
              </div>
            </div>
          )}
          {order.shippedAt && (
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div>
                <p className="font-medium">Order Shipped</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.shippedAt)}</p>
              </div>
            </div>
          )}
          {order.deliveredAt && (
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <div>
                <p className="font-medium">Order Delivered</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.deliveredAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
