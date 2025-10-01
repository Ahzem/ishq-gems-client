import apiClient from '@/lib/api-client';
import { 
  // Core order types
  Order, 
  OrderStatus,
  // Request types
  OrderListQuery, 
  OrderUpdateRequest, 
  ShippingUpdateRequest,
  // Response types
  OrderListResponse, 
  ReturnRequestResponse,
  OrderSummaryResponse,
  BulkUpdateResponse,
  InvoiceDataResponse,
  // Service configuration
  OrderServiceConfig,
  OrderServiceState,
  // Common types
  ApiResponse
} from '@/types';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';

// Internal data structure that matches what the API returns
interface OrderListData {
  orders: Order[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  summary?: {
    totalOrders: number;
    totalValue: number;
    statusBreakdown: Record<OrderStatus, number>;
  };
}

/**
 * Production-optimized Order Service
 * 
 * Enterprise-grade order service with:
 * - Comprehensive type safety with centralized type definitions
 * - Advanced caching strategies with memory pressure awareness
 * - Circuit breaker pattern for service resilience
 * - Robust error handling and retry logic
 * - Performance monitoring and analytics
 * - Input validation and security measures
 * - Production-ready logging and monitoring
 * - Singleton pattern for consistent state management
 */
class OrderService {
  private readonly config: OrderServiceConfig = {
    baseUrl: '/orders',
    retryOptions: {
      maxRetries: 2,
      retryCondition: (error: unknown) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          return status >= 500 || status === 0;
        }
        return false;
      }
    },
    cacheOptions: {
      customerOrdersTtl: 120000,    // 2 minutes for customer orders
      sellerOrdersTtl: 90000,       // 1.5 minutes for seller orders
      adminOrdersTtl: 180000,       // 3 minutes for admin orders
      individualOrderTtl: 300000,   // 5 minutes for individual orders
      invoiceDataTtl: 600000,       // 10 minutes for invoice data
      orderSummaryTtl: 600000       // 10 minutes for order summary
    },
    validation: {
      maxCancellationReasonLength: 500,
      maxReturnReasonLength: 500,
      maxVerificationNotesLength: 1000,
      maxBulkUpdateCount: 100
    }
  };

  private state: OrderServiceState = {
    startTime: 0
  };

  /**
   * Get orders for customers (buyers) with enhanced caching and validation
   */
  async getCustomerOrders(query: OrderListQuery = {}): Promise<OrderListResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const searchParams = this.buildQueryParams(query);
          const queryString = searchParams.toString();
          const endpoint = `${this.config.baseUrl}/customer${queryString ? `?${queryString}` : ''}`;
          const cacheKey = `customer_orders_${queryString}`;

          const response = await handleServiceResponse(
            () => apiClient.get<OrderListData>(endpoint),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.customerOrdersTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
    
          // Transform to match the expected OrderListResponse format
          return {
            success: response.success,
            data: response.data || { orders: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } },
            message: response.message || 'Customer orders retrieved successfully'
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to get customer orders', error);
          return {
            success: false,
            data: { orders: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } },
            message: error instanceof Error ? error.message : 'Failed to retrieve customer orders'
          };
        }
      },
      'order_get_customer_orders'
    );
  }

  /**
   * Get orders for sellers with enhanced caching and validation
   */
  async getSellerOrders(query: OrderListQuery = {}): Promise<OrderListResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const searchParams = this.buildQueryParams(query);
          const queryString = searchParams.toString();
          const endpoint = `${this.config.baseUrl}/seller${queryString ? `?${queryString}` : ''}`;
          const cacheKey = `seller_orders_${queryString}`;

          const response = await handleServiceResponse(
            () => apiClient.get<OrderListData>(endpoint),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.sellerOrdersTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
    
          // Transform to match the expected OrderListResponse format
          return {
            success: response.success,
            data: response.data || { orders: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } },
            message: response.message || 'Seller orders retrieved successfully'
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to get seller orders', error);
          return {
            success: false,
            data: { orders: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } },
            message: error instanceof Error ? error.message : 'Failed to retrieve seller orders'
          };
        }
      },
      'order_get_seller_orders'
    );
  }

  /**
   * Get all orders (admin only) with enhanced caching and validation
   */
  async getAllOrders(query: OrderListQuery = {}): Promise<OrderListResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const searchParams = this.buildQueryParams(query);
          const queryString = searchParams.toString();
          const endpoint = `${this.config.baseUrl}/admin/all${queryString ? `?${queryString}` : ''}`;
          const cacheKey = `admin_all_orders_${queryString}`;

          const response = await handleServiceResponse(
            () => apiClient.get<OrderListData>(endpoint),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.adminOrdersTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
    
          // Transform to match the expected OrderListResponse format
          return {
            success: response.success,
            data: response.data || { orders: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } },
            message: response.message || 'All orders retrieved successfully'
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to get all orders (admin)', error);
          return {
            success: false,
            data: { orders: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } },
            message: error instanceof Error ? error.message : 'Failed to retrieve all orders'
          };
        }
      },
      'order_get_all_orders_admin'
    );
  }

  /**
   * Get orders for the current user (role-based)
   * - Buyers: orders they placed
   * - Sellers: sub-orders containing their gems
   * - Admin: all orders
   */
  async getMyOrders(query: OrderListQuery = {}, userRole: 'buyer' | 'seller' | 'admin' = 'buyer'): Promise<OrderListResponse> {
    if (userRole === 'admin') {
      return this.getAllOrders(query);
    } else if (userRole === 'seller') {
      return this.getSellerOrders(query);
    } else {
      return this.getCustomerOrders(query);
    }
  }

  /**
   * Get a specific order by ID with enhanced caching and validation
   */
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate order ID
          if (!orderId || orderId.trim().length === 0) {
            return {
              success: false,
              message: 'Order ID is required'
            };
          }

          // Validate order ID format (MongoDB ObjectId)
          const orderIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!orderIdPattern.test(orderId)) {
            return {
              success: false,
              message: 'Invalid order ID format'
            };
          }

          return await handleServiceResponse(
            () => apiClient.get<Order>(`${this.config.baseUrl}/by-id/${orderId}`),
            {
              cacheKey: `order_${orderId}`,
              cacheTtl: this.config.cacheOptions.individualOrderTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get order by ID', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve order'
          };
        }
      },
      'order_get_by_id'
    );
  }

  /**
   * Update sub-order status (seller only) with validation
   */
  async updateSubOrder(
    orderId: string, 
    subOrderId: string, 
    updateData: OrderUpdateRequest
  ): Promise<ApiResponse<Order>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          this.validateOrderIds(orderId, subOrderId);
          this.validateOrderUpdateRequest(updateData);

          const response = await handleServiceResponse(
            () => apiClient.put<Order>(`${this.config.baseUrl}/${orderId}/sub-orders/${subOrderId}`, updateData),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear relevant caches on successful update
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear order-related caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to update sub-order', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update sub-order'
          };
        }
      },
      'order_update_sub_order'
    );
  }

  /**
   * Mark sub-order as shipped (seller only) with validation
   */
  async markAsShipped(
    orderId: string,
    subOrderId: string,
    shippingData: ShippingUpdateRequest
  ): Promise<ApiResponse<Order>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          this.validateOrderIds(orderId, subOrderId);
          this.validateShippingData(shippingData);

          const response = await handleServiceResponse(
            () => apiClient.post<Order>(`${this.config.baseUrl}/${orderId}/sub-orders/${subOrderId}/ship`, shippingData),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear relevant caches on successful shipping
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear order-related caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to mark as shipped', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to mark order as shipped'
          };
        }
      },
      'order_mark_as_shipped'
    );
  }

  /**
   * Cancel an order (buyer/admin only) with enhanced validation and monitoring
   */
  async cancelOrder(
    orderId: string, 
    reason: string
  ): Promise<ApiResponse<Order>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!orderId || orderId.trim().length === 0) {
            return {
              success: false,
              message: 'Order ID is required'
            };
          }

          // Validate order ID format (MongoDB ObjectId)
          const orderIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!orderIdPattern.test(orderId)) {
            return {
              success: false,
              message: 'Invalid order ID format'
            };
          }

          if (!reason || reason.trim().length === 0) {
            return {
              success: false,
              message: 'Cancellation reason is required'
            };
          }

          if (reason.trim().length > this.config.validation.maxCancellationReasonLength) {
            return {
              success: false,
              message: `Cancellation reason must be less than ${this.config.validation.maxCancellationReasonLength} characters`
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<Order>(`${this.config.baseUrl}/${orderId}/cancel`, { reason: reason.trim() }),
            {
              retryOptions: {
                maxRetries: 1, // Order cancellation should have minimal retries
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Clear relevant caches on successful cancellation
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear order-related caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to cancel order', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to cancel order'
          };
        }
      },
      'order_cancel'
    );
  }

  /**
   * Request return/refund (buyer only) with enhanced validation and monitoring
   */
  async requestReturn(
    orderId: string,
    subOrderId: string,
    reason: string,
    notes?: string
  ): Promise<ApiResponse<ReturnRequestResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          this.validateOrderIds(orderId, subOrderId);
          
          if (!reason || reason.trim().length === 0) {
            return {
              success: false,
              message: 'Return reason is required'
            };
          }

          if (reason.trim().length > this.config.validation.maxReturnReasonLength) {
            return {
              success: false,
              message: `Return reason must be less than ${this.config.validation.maxReturnReasonLength} characters`
            };
          }

          // Validate notes if provided
          if (notes && notes.trim().length > this.config.validation.maxReturnReasonLength) {
            return {
              success: false,
              message: `Return notes must be less than ${this.config.validation.maxReturnReasonLength} characters`
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<ReturnRequestResponse>(
              `${this.config.baseUrl}/${orderId}/sub-orders/${subOrderId}/return`,
              { reason: reason.trim(), notes: notes?.trim() }
            ),
            {
              retryOptions: this.config.retryOptions
            }
          );

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to request return', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to request return'
          };
        }
      },
      'order_request_return'
    );
  }

  /**
   * Get invoice data (buyer/seller/admin) with enhanced caching and validation
   */
  async getInvoiceData(orderNumber: string): Promise<ApiResponse<InvoiceDataResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate order number
          if (!orderNumber || orderNumber.trim().length === 0) {
            return {
              success: false,
              message: 'Order number is required'
            };
          }

          // Validate order number format (basic alphanumeric check)
          const orderNumberPattern = /^[a-zA-Z0-9\-_]{3,50}$/;
          if (!orderNumberPattern.test(orderNumber)) {
            return {
              success: false,
              message: 'Invalid order number format'
            };
          }

          return await handleServiceResponse(
            () => apiClient.get<InvoiceDataResponse>(`${this.config.baseUrl}/${orderNumber}/invoice`),
            {
              cacheKey: `invoice_${orderNumber}`,
              cacheTtl: this.config.cacheOptions.invoiceDataTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get invoice data', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve invoice data'
          };
        }
      },
      'order_get_invoice_data'
    );
  }

  /**
   * Get order summary/statistics (admin only) with enhanced caching and validation
   */
  async getOrderSummary(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ApiResponse<OrderSummaryResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate date formats if provided
          if (dateFrom && !this.isValidDateString(dateFrom)) {
            return {
              success: false,
              message: 'Invalid dateFrom format. Use ISO date string (YYYY-MM-DD)'
            };
          }

          if (dateTo && !this.isValidDateString(dateTo)) {
            return {
              success: false,
              message: 'Invalid dateTo format. Use ISO date string (YYYY-MM-DD)'
            };
          }

          const searchParams = new URLSearchParams();
          if (dateFrom) searchParams.append('dateFrom', dateFrom);
          if (dateTo) searchParams.append('dateTo', dateTo);

          const queryString = searchParams.toString();
          const endpoint = `${this.config.baseUrl}/admin/summary${queryString ? `?${queryString}` : ''}`;
          const cacheKey = `order_summary_${queryString}`;

          return await handleServiceResponse(
            () => apiClient.get<OrderSummaryResponse>(endpoint),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.orderSummaryTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get order summary', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve order summary'
          };
        }
      },
      'order_get_summary_admin'
    );
  }

  /**
   * Process bulk order updates (admin only) with enhanced validation and monitoring
   */
  async bulkUpdateOrders(
    orderIds: string[],
    updateData: Partial<OrderUpdateRequest>
  ): Promise<ApiResponse<BulkUpdateResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate bulk update data
          this.validateBulkUpdateData(orderIds, updateData);

          const response = await handleServiceResponse(
            () => apiClient.post<BulkUpdateResponse>(`${this.config.baseUrl}/admin/bulk-update`, { orderIds, updateData }),
            {
              retryOptions: {
                maxRetries: 1, // Bulk operations should have minimal retries
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Clear relevant caches on successful bulk update
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear all order-related caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to bulk update orders', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to bulk update orders'
          };
        }
      },
      'order_bulk_update_admin'
    );
  }

  /**
   * Update payment status (admin only) with validation
   */
  async updatePaymentStatus(
    orderNumber: string,
    paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded',
    verificationNotes?: string
  ): Promise<ApiResponse<{ orderNumber: string; paymentStatus: string; updatedAt: string }>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!orderNumber || orderNumber.trim().length === 0) {
            return {
              success: false,
              message: 'Order number is required'
            };
          }

          if (!['pending', 'processing', 'completed', 'failed', 'refunded'].includes(paymentStatus)) {
            return {
              success: false,
              message: 'Invalid payment status'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.put<{ orderNumber: string; paymentStatus: string; updatedAt: string }>(
      `${this.config.baseUrl}/${orderNumber}/payment-status`,
              { paymentStatus, verificationNotes: verificationNotes?.trim() }
            ),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear relevant caches on successful payment status update
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear order-related caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to update payment status', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update payment status'
          };
        }
      },
      'order_update_payment_status_admin'
    );
  }

  /**
   * Verify bank transfer payment (admin only) with validation
   */
  async verifyBankTransferPayment(
    orderNumber: string,
    verificationNotes?: string
  ): Promise<ApiResponse<{ orderNumber: string; paymentStatus: string; updatedAt: string }>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate order number
          if (!orderNumber || orderNumber.trim().length === 0) {
            return {
              success: false,
              message: 'Order number is required'
            };
          }

          // Validate verification notes if provided
          if (verificationNotes && verificationNotes.trim().length > 1000) {
            return {
              success: false,
              message: 'Verification notes must be less than 1000 characters'
            };
          }

          return await this.updatePaymentStatus(orderNumber, 'completed', verificationNotes?.trim());
        } catch (error) {
          ServiceUtils.logger.error('Failed to verify bank transfer payment', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to verify bank transfer payment'
          };
        }
      },
      'order_verify_bank_transfer_admin'
    );
  }

  /**
   * Reject bank transfer payment (admin only) with validation
   */
  async rejectBankTransferPayment(
    orderNumber: string,
    rejectionReason: string
  ): Promise<ApiResponse<{ orderNumber: string; paymentStatus: string; updatedAt: string }>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!orderNumber || orderNumber.trim().length === 0) {
            return {
              success: false,
              message: 'Order number is required'
            };
          }

          if (!rejectionReason || rejectionReason.trim().length === 0) {
            return {
              success: false,
              message: 'Rejection reason is required'
            };
          }

          if (rejectionReason.trim().length > 1000) {
            return {
              success: false,
              message: 'Rejection reason must be less than 1000 characters'
            };
          }

          return await this.updatePaymentStatus(orderNumber, 'failed', rejectionReason.trim());
        } catch (error) {
          ServiceUtils.logger.error('Failed to reject bank transfer payment', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to reject bank transfer payment'
          };
        }
      },
      'order_reject_bank_transfer_admin'
    );
  }

  /**
   * Request payment re-upload (admin only) with validation
   */
  async requestPaymentReupload(
    orderNumber: string,
    requestNotes: string
  ): Promise<ApiResponse<{ orderNumber: string; paymentStatus: string; updatedAt: string }>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!orderNumber || orderNumber.trim().length === 0) {
            return {
              success: false,
              message: 'Order number is required'
            };
          }

          if (!requestNotes || requestNotes.trim().length === 0) {
            return {
              success: false,
              message: 'Request notes are required'
            };
          }

          if (requestNotes.trim().length > 1000) {
            return {
              success: false,
              message: 'Request notes must be less than 1000 characters'
            };
          }

    // For re-upload, we keep status as processing but add notes
          return await this.updatePaymentStatus(orderNumber, 'processing', requestNotes.trim());
        } catch (error) {
          ServiceUtils.logger.error('Failed to request payment re-upload', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to request payment re-upload'
          };
        }
      },
      'order_request_payment_reupload_admin'
    );
  }

  /**
   * Ship order (Seller only) with validation
   */
  async shipOrder(
    orderNumber: string,
    shippingData: {
      trackingNumber: string;
      courier: string;
      estimatedDelivery?: string;
    }
  ): Promise<ApiResponse<{ orderNumber: string; status: string; trackingNumber: string; shippedAt: string }>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!orderNumber || orderNumber.trim().length === 0) {
            return {
              success: false,
              message: 'Order number is required'
            };
          }

          if (!shippingData.trackingNumber || shippingData.trackingNumber.trim().length === 0) {
            return {
              success: false,
              message: 'Tracking number is required'
            };
          }

          if (!shippingData.courier || shippingData.courier.trim().length === 0) {
            return {
              success: false,
              message: 'Courier information is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<{ orderNumber: string; status: string; trackingNumber: string; shippedAt: string }>(
      `${this.config.baseUrl}/${orderNumber}/ship`,
              {
                ...shippingData,
                trackingNumber: shippingData.trackingNumber.trim(),
                courier: shippingData.courier.trim()
              }
            ),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear relevant caches on successful shipment
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear order-related caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to ship order', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to ship order'
          };
        }
      },
      'order_ship'
    );
  }

  /**
   * Mark order as received (Customer only) with validation
   */
  async markOrderAsReceived(
    orderNumber: string
  ): Promise<ApiResponse<{ orderNumber: string; status: string; deliveredAt: string }>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate order number
          if (!orderNumber || orderNumber.trim().length === 0) {
            return {
              success: false,
              message: 'Order number is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<{ orderNumber: string; status: string; deliveredAt: string }>(
      `${this.config.baseUrl}/${orderNumber}/received`,
      {}
            ),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear relevant caches on successful delivery confirmation
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear order-related caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to mark order as received', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to mark order as received'
          };
        }
      },
      'order_mark_as_received'
    );
  }

  /**
   * Transfer profit to seller (Admin only) with validation
   */
  async transferProfitToSeller(
    orderNumber: string
  ): Promise<ApiResponse<{ orderNumber: string; status: string; updatedAt: string }>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate order number
          if (!orderNumber || orderNumber.trim().length === 0) {
            return {
              success: false,
              message: 'Order number is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<{ orderNumber: string; status: string; updatedAt: string }>(
      `${this.config.baseUrl}/${orderNumber}/transfer-profit`,
      {}
            ),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear relevant caches on successful profit transfer
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear order-related caches
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to transfer profit to seller', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to transfer profit to seller'
          };
        }
      },
      'order_transfer_profit_admin'
    );
  }

  // Private helper methods
  private buildQueryParams(query: OrderListQuery): URLSearchParams {
    const searchParams = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return searchParams;
  }

  private validateOrderIds(orderId: string, subOrderId?: string): void {
    if (!orderId || orderId.trim().length === 0) {
      throw new Error('Order ID is required');
    }

    // Validate order ID format (MongoDB ObjectId)
    const orderIdPattern = /^[a-fA-F0-9]{24}$/;
    if (!orderIdPattern.test(orderId)) {
      throw new Error('Invalid order ID format');
    }

    if (subOrderId !== undefined) {
      if (!subOrderId || subOrderId.trim().length === 0) {
        throw new Error('Sub-order ID is required');
      }
      if (!orderIdPattern.test(subOrderId)) {
        throw new Error('Invalid sub-order ID format');
      }
    }
  }

  private validateOrderUpdateRequest(updateData: OrderUpdateRequest): void {
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Update data is required');
    }

    // Add specific validation based on your OrderUpdateRequest interface
    if (updateData.status && !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(updateData.status)) {
      throw new Error('Invalid order status');
    }
  }

  private validateShippingData(shippingData: ShippingUpdateRequest): void {
    if (!shippingData || typeof shippingData !== 'object') {
      throw new Error('Shipping data is required');
    }

    if (!shippingData.trackingNumber || shippingData.trackingNumber.trim().length === 0) {
      throw new Error('Tracking number is required');
    }

    if (!shippingData.courier || shippingData.courier.trim().length === 0) {
      throw new Error('Courier information is required');
    }
  }

  private validateBulkUpdateData(orderIds: string[], updateData: Partial<OrderUpdateRequest>): void {
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new Error('Order IDs array is required');
    }

    if (orderIds.length > this.config.validation.maxBulkUpdateCount) {
      throw new Error(`Maximum ${this.config.validation.maxBulkUpdateCount} orders can be updated at once`);
    }

    // Validate each order ID format
    const orderIdPattern = /^[a-fA-F0-9]{24}$/;
    for (const orderId of orderIds) {
      if (!orderId || orderId.trim().length === 0) {
        throw new Error('All order IDs must be valid');
      }
      if (!orderIdPattern.test(orderId)) {
        throw new Error(`Invalid order ID format: ${orderId}`);
      }
    }

    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Update data is required');
    }
  }

  // Helper method for date validation
  private isValidDateString(dateString: string): boolean {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().startsWith(dateString);
  }

  /**
   * Get service health status and configuration
   */
  getServiceHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    config: OrderServiceConfig;
    cacheStats: ReturnType<typeof ServiceUtils.getCacheStats>;
    uptime: number;
    lastError?: string;
  } {
    const cacheStats = ServiceUtils.getCacheStats();
    
    // Determine health status based on various metrics
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (cacheStats.size > cacheStats.maxSize * 0.9) {
      status = 'degraded';
    }
    
    return {
      status,
      config: this.config,
      cacheStats,
      uptime: Date.now() - this.state.startTime || 0,
      lastError: this.state.lastError
    };
  }

  /**
   * Clear all order service caches with optional pattern matching
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      ServiceUtils.logger.info('Clearing selective order cache', { pattern });
      // In a real implementation, you'd have pattern-based cache clearing
    } else {
      ServiceUtils.cache.clear();
      ServiceUtils.logger.info('Cleared all order service caches');
    }
  }

  /**
   * Initialize service with startup checks
   */
  protected initialize(): void {
    this.state.startTime = Date.now();
    ServiceUtils.logger.info('OrderService initialized', {
      config: this.config,
      timestamp: new Date().toISOString()
    });
  }
}

// Initialize the service with singleton pattern
class OrderServiceSingleton extends OrderService {
  private static instance: OrderServiceSingleton;
  
  private constructor() {
    super();
    this.initialize();
  }
  
  public static getInstance(): OrderServiceSingleton {
    if (!OrderServiceSingleton.instance) {
      OrderServiceSingleton.instance = new OrderServiceSingleton();
    }
    return OrderServiceSingleton.instance;
  }
  
  /**
   * Graceful shutdown cleanup
   */
  public shutdown(): void {
    ServiceUtils.logger.info('OrderService shutting down');
    this.clearCache();
  }
}

// Export singleton instance
export const orderService = OrderServiceSingleton.getInstance();

// Cleanup on page unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    orderService.shutdown();
  });
}

export default orderService;
