/**
 * Order entity types and interfaces
 */

import { BaseEntity, Address } from '../common/base'

/**
 * Order status types
 */
export type OrderStatus = 
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'returned'

/**
 * Sub-order status (for individual seller items)
 */
export type SubOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

/**
 * Payment method types
 */
export type PaymentMethod = 
  | 'credit-card'
  | 'paypal'
  | 'bank-transfer'
  | 'crypto'
  | 'wallet'

/**
 * Shipping method types
 */
export type ShippingMethod =
  | 'standard'
  | 'express'
  | 'overnight'
  | 'international'

/**
 * Order source types
 */
export type OrderSource =
  | 'cart'
  | 'auction'
  | 'direct'

/**
 * Order item interface
 */
export interface OrderItem {
  _id: string
  gemId: string
  gemDetails: {
    name: string
    gemType: string
    color: string
    weight: { value: number; unit: string }
    image?: string
    reportNumber?: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
  commission: number
  sellerId: string
  sellerName: string
}

/**
 * Sub-order interface (grouped by seller)
 */
export interface SubOrder {
  _id: string
  sellerId: string
  sellerDetails: {
    name: string
    avatar?: string
    country?: string
    isVerified: boolean
    rating: number
    // Store settings for display
    storeSettings?: {
      storeName: string
      storeSlogan?: string
      storeDescription?: string
      primaryColor?: string
      secondaryColor?: string
      logoUrl?: string | null
      bannerUrl?: string | null
    }
  }
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  totalAmount: number
  status: SubOrderStatus
  shippingMethod: ShippingMethod
  trackingNumber?: string
  courier?: string
  shippedAt?: string
  deliveredAt?: string
  estimatedDelivery?: string
  notes?: string
}

/**
 * Payment details interface
 */
export interface PaymentDetails {
  method: PaymentMethod
  transactionId: string
  gateway?: string
  paidAt: string
  amount: number
  fees: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
}

/**
 * Shipping details interface
 */
export interface ShippingDetails {
  address: Address
  method: ShippingMethod
  cost: number
  estimatedDelivery?: string
  specialInstructions?: string
}

/**
 * Main Order entity (parent order)
 */
export interface Order extends BaseEntity {
  orderNumber: string
  buyerId: string
  buyerDetails: {
    name: string
    email: string
    avatar?: string
    country?: string
  }
  subOrders: SubOrder[]
  totalItems: number
  subtotal: number
  totalShipping: number
  totalAmount: number
  status: OrderStatus
  source: OrderSource
  paymentDetails: PaymentDetails
  shippingDetails: ShippingDetails
  invoiceUrl?: string
  notes?: string
  placedAt: string
  confirmedAt?: string
  shippedAt?: string
  deliveredAt?: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
}

/**
 * Order list query parameters
 */
export interface OrderListQuery {
  page?: number
  limit?: number
  status?: OrderStatus | OrderStatus[]
  source?: OrderSource
  sellerId?: string
  buyerId?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  search?: string
  sortBy?: 'createdAt' | 'totalAmount' | 'status'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Order list response
 */
export interface OrderListResponse {
  success: boolean
  data: {
    orders: Order[]
    pagination: {
      total: number
      pages: number
      page: number
      limit: number
    }
    summary?: {
      totalOrders: number
      totalValue: number
      statusBreakdown: Record<OrderStatus, number>
    }
  }
  message?: string
}

/**
 * Order update request
 */
export interface OrderUpdateRequest {
  status?: SubOrderStatus
  trackingNumber?: string
  courier?: string
  notes?: string
  estimatedDelivery?: string
}

/**
 * Shipping update request
 */
export interface ShippingUpdateRequest {
  trackingNumber: string
  courier: string
  estimatedDelivery?: string
  notes?: string
}

/**
 * Checkout-specific types
 */

/**
 * Billing information for checkout
 */
export interface BillingInfo {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

/**
 * Updated billing information for checkout with address ID
 */
export interface CheckoutBillingInfo {
  fullName: string
  email: string
  phone: string
  addressId?: string  // Reference to user's saved address
  country: string
}

/**
 * Simplified order item for checkout
 */
export interface CheckoutOrderItem {
  gemId: string
  quantity: number
  price: number
}

/**
 * Order data for checkout submission
 */
export interface CheckoutOrderData {
  items: CheckoutOrderItem[]
  billingInfo: BillingInfo
  paymentMethod: string
  paymentReceipt?: File
  subtotal: number
  shippingFee: number
  taxes: number
  total: number
}

/**
 * Updated order data for checkout submission with address ID
 */
export interface CheckoutOrderDataWithAddressId {
  items: CheckoutOrderItem[]
  billingInfo: CheckoutBillingInfo
  shippingAddressId: string  // Reference to user's saved address for shipping
  paymentMethod: string
  paymentReceipt?: File
  subtotal: number
  shippingFee: number
  taxes: number
  total: number
}

/**
 * Place order response
 */
export interface PlaceOrderResponse {
  success: boolean
  orderNumber: string
  status?: string
  paymentStatus?: string
  total?: number
  estimatedProcessing?: string
  message?: string
}

/**
 * Bank details response for checkout
 */
export interface CheckoutBankDetailsResponse {
  success: boolean
  data: {
    bankName: string
    accountName: string
    accountNumber: string
    swiftCode: string
    branch: string
  }
  message?: string
}

/**
 * Saved billing info response from server
 */
export interface SavedBillingInfoResponse {
  success: boolean
  data: {
    fullName: string
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      country: string
      zipCode: string
    }
  }
  message?: string
}

/**
 * Payment method information
 */
export interface PaymentMethodInfo {
  id: string
  name: string
  description: string
  available: boolean
  comingSoon?: boolean
}

/**
 * Payment methods response
 */
export interface PaymentMethodsResponse {
  success: boolean
  methods: PaymentMethodInfo[]
}

/**
 * Payment verification response
 */
export interface PaymentVerificationResponse {
  success: boolean
  status: 'pending' | 'verified' | 'failed'
  message?: string
}

/**
 * Order totals calculation response
 */
export interface OrderTotalsResponse {
  success: boolean
  subtotal: number
  shippingFee: number
  taxes: number
  total: number
}

/**
 * File upload response for receipts
 */
export interface ReceiptUploadResponse {
  success: boolean
  message?: string
}

/**
 * Checkout service configuration
 */
export interface CheckoutServiceConfig {
  retryOptions: {
    maxRetries: number
    retryCondition: (error: unknown) => boolean
  }
  cacheOptions: {
    bankDetailsTtl: number
    paymentStatusTtl: number
    paymentMethodsTtl: number
    orderTotalsTtl: number
  }
  validation: {
    maxReceiptSize: number
    allowedReceiptTypes: string[]
    maxOrderTotal: number
  }
}

/**
 * Checkout service state interface
 */
export interface CheckoutServiceState {
  startTime: number
  lastError?: string
}

/**
 * Order service configuration interface
 */
export interface OrderServiceConfig {
  baseUrl: string
  retryOptions: {
    maxRetries: number
    retryCondition: (error: unknown) => boolean
  }
  cacheOptions: {
    customerOrdersTtl: number
    sellerOrdersTtl: number
    adminOrdersTtl: number
    individualOrderTtl: number
    invoiceDataTtl: number
    orderSummaryTtl: number
  }
  validation: {
    maxCancellationReasonLength: number
    maxReturnReasonLength: number
    maxVerificationNotesLength: number
    maxBulkUpdateCount: number
  }
}

/**
 * Order service state interface
 */
export interface OrderServiceState {
  startTime: number
  lastError?: string
}

/**
 * Return request response interface
 */
export interface ReturnRequestResponse {
  success: boolean
  message: string
  returnId: string
  status: 'pending' | 'approved' | 'rejected'
  estimatedRefund?: number
}

/**
 * Order summary response interface
 */
export interface OrderSummaryResponse {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  statusBreakdown: Record<OrderStatus, number>
  topSellers: Array<{
    sellerId: string
    sellerName: string
    totalOrders: number
    totalRevenue: number
  }>
  recentOrders: Order[]
  monthlyTrends: Array<{
    month: string
    orders: number
    revenue: number
  }>
}

/**
 * Bulk update response interface
 */
export interface BulkUpdateResponse {
  success: boolean
  message: string
  updatedCount: number
  failedUpdates: Array<{
    orderId: string
    error: string
  }>
} 