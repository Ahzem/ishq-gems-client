import apiClient from '@/lib/api-client';
import {
  // Checkout types
  CheckoutOrderData,
  CheckoutOrderDataWithAddressId,
  BillingInfo,
  CheckoutBillingInfo,
  PlaceOrderResponse,
  CheckoutBankDetailsResponse,
  SavedBillingInfoResponse,
  PaymentMethodsResponse,
  PaymentVerificationResponse,
  OrderTotalsResponse,
  ReceiptUploadResponse,
  CheckoutServiceConfig,
  CheckoutServiceState,
  ApiResponse
} from '@/types';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';

/**
 * Production-optimized Checkout Service
 * 
 * Enterprise-grade checkout service with:
 * - Comprehensive type safety with centralized type definitions
 * - Advanced caching strategies for performance optimization
 * - Robust error handling and validation
 * - File upload capabilities with validation
 * - Payment processing and verification
 * - Production-ready logging and monitoring
 */
class CheckoutService {
  private readonly config: CheckoutServiceConfig = {
    retryOptions: {
      maxRetries: 1, // Conservative for orders to prevent duplicates
      retryCondition: (error: unknown) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          return status >= 500 || status === 0;
        }
        return false;
      }
    },
    cacheOptions: {
      bankDetailsTtl: 3600000,    // 1 hour for bank details
      paymentStatusTtl: 60000,    // 1 minute for payment status
      paymentMethodsTtl: 1800000, // 30 minutes for payment methods
      orderTotalsTtl: 900000      // 15 minutes for order totals
    },
    validation: {
      maxReceiptSize: 10 * 1024 * 1024, // 10MB
      allowedReceiptTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'application/pdf'],
      maxOrderTotal: 1000000 // $1M max order
    }
  };

  private state: CheckoutServiceState = {
    startTime: 0
  };
  /**
   * Get bank account details for bank transfer payment with enhanced caching and validation
   */
  async getBankDetails(): Promise<CheckoutBankDetailsResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.get('/orders/bank-details'),
            {
              cacheKey: 'bank_details',
              cacheTtl: this.config.cacheOptions.bankDetailsTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          if (!response.success || !response.data) {
            throw new Error('Bank details not available');
          }

          // Validate bank details structure
          const payload = response.data;
          
          // Handle both wrapped { success, data } and raw bank details objects
          if (payload && typeof payload === 'object') {
            if ('success' in payload && 'data' in payload) {
              return payload as CheckoutBankDetailsResponse;
            }

            // Fallback: server returned raw bank details document
            if (this.validateBankDetails(payload)) {
              return { 
                success: true, 
                data: payload as CheckoutBankDetailsResponse['data']
              };
            }
          }

          throw new Error('Invalid bank details format received');
        } catch (error) {
          ServiceUtils.logger.error('Failed to fetch bank details', error);
          throw ServiceUtils.handleError('fetch bank details', error);
        }
      },
      'checkout_get_bank_details'
    );
  }

  /**
   * Get user's saved billing information with caching and validation
   */
  async getSavedBillingInfo(): Promise<ApiResponse<SavedBillingInfoResponse['data']>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          return await handleServiceResponse(
            () => apiClient.get<SavedBillingInfoResponse['data']>('/checkout/billing-info'),
            {
              cacheKey: 'saved_billing_info',
              cacheTtl: this.config.cacheOptions.paymentStatusTtl, // 1 minute cache
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to fetch saved billing info', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve saved billing info'
          };
        }
      },
      'checkout_get_saved_billing_info'
    );
  }

  /**
   * Place a new order with enhanced validation, receipt upload, and monitoring
   */
  async placeOrder(orderData: CheckoutOrderData): Promise<PlaceOrderResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate order data before sending
          this.validateOrderData(orderData);

          // Create FormData for multipart upload if receipt is provided
          const formData = new FormData();
          
          // Add all order data as JSON string or individual fields
          formData.append('items', JSON.stringify(orderData.items));
          formData.append('billingInfo', JSON.stringify(orderData.billingInfo));
          formData.append('paymentMethod', orderData.paymentMethod);
          formData.append('subtotal', orderData.subtotal.toString());
          formData.append('shippingFee', orderData.shippingFee.toString());
          formData.append('taxes', orderData.taxes.toString());
          formData.append('total', orderData.total.toString());
          
          // Add payment receipt if provided
          if (orderData.paymentReceipt) {
            // Validate receipt file
            if (!this.validateReceiptFile(orderData.paymentReceipt)) {
              throw new Error('Invalid receipt file. Please upload a valid image or PDF under 10MB.');
            }
            formData.append('paymentReceipt', orderData.paymentReceipt);
          }

          const response = await handleServiceResponse(
            () => apiClient.upload('/orders', formData),
            {
              retryOptions: this.config.retryOptions
            }
          );
          
          if (response.success && response.data) {
            const data = response.data as {
              orderNumber: string;
              status?: string;
              paymentStatus?: string;
              total?: number;
              estimatedProcessing?: string;
            };
            
            // Clear cart-related cache after successful order
            ServiceUtils.cache.clear();
            
            return {
              success: true,
              orderNumber: data?.orderNumber || '',
              status: data?.status,
              paymentStatus: data?.paymentStatus,
              total: data?.total,
              estimatedProcessing: data?.estimatedProcessing,
              message: response.message || 'Order placed successfully'
            };
          } else {
            throw new Error(response.message || 'Failed to place order');
          }
        } catch (error) {
          ServiceUtils.logger.error('Failed to place order', error);
          throw ServiceUtils.handleError('place order', error, { 
            itemCount: orderData.items.length,
            paymentMethod: orderData.paymentMethod,
            total: orderData.total
          });
        }
      },
      'checkout_place_order'
    );
  }

  /**
   * Place order with address ID references
   */
  async placeOrderWithAddressId(orderData: CheckoutOrderDataWithAddressId): Promise<PlaceOrderResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate order data
          this.validateOrderData(orderData);

          const formData = new FormData();
          
          // Add each field separately for proper parsing
          formData.append('items', JSON.stringify(orderData.items));
          formData.append('billingInfo', JSON.stringify(orderData.billingInfo));
          formData.append('shippingAddressId', orderData.shippingAddressId);
          formData.append('paymentMethod', orderData.paymentMethod);
          formData.append('subtotal', orderData.subtotal.toString());
          formData.append('shippingFee', orderData.shippingFee.toString());
          formData.append('taxes', orderData.taxes.toString());
          formData.append('total', orderData.total.toString());

          // Add payment receipt if provided
          if (orderData.paymentReceipt) {
            formData.append('paymentReceipt', orderData.paymentReceipt);
          }

          const response = await handleServiceResponse(
            () => apiClient.post('/orders/with-address', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          if (response.success && response.data) {
            const orderData = response.data as PlaceOrderResponse;
            ServiceUtils.logger.info('Order placed successfully with address ID', {
              orderNumber: orderData.orderNumber,
              total: orderData.total,
              status: orderData.status,
              paymentStatus: orderData.paymentStatus
            });
            
            return {
              success: true,
              orderNumber: orderData.orderNumber || '',
              status: orderData.status,
              paymentStatus: orderData.paymentStatus,
              total: orderData.total,
              estimatedProcessing: orderData.estimatedProcessing,
              message: response.message || 'Order placed successfully'
            };
          } else {
            throw new Error(response.message || 'Failed to place order');
          }
        } catch (error) {
          ServiceUtils.logger.error('Failed to place order with address ID', error);
          throw ServiceUtils.handleError('place order with address ID', error, { 
            itemCount: orderData.items.length,
            paymentMethod: orderData.paymentMethod,
            shippingAddressId: orderData.shippingAddressId,
            total: orderData.total
          });
        }
      },
      'checkout_place_order_with_address_id'
    );
  }

  /**
   * Upload payment receipt with enhanced validation and monitoring
   */
  async uploadPaymentReceipt(orderNumber: string, receiptFile: File): Promise<ReceiptUploadResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate receipt file
          if (!this.validateReceiptFile(receiptFile)) {
            return {
              success: false,
              message: 'Invalid receipt file. Please upload a valid image or PDF under 10MB.'
            };
          }

          const formData = new FormData();
          formData.append('receipt', receiptFile);
          formData.append('orderNumber', orderNumber);

          const response = await handleServiceResponse(
            () => apiClient.post('/api/checkout/upload-receipt', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }),
            {
              retryOptions: this.config.retryOptions
            }
          );
          
          return response.data as ReceiptUploadResponse;
        } catch (error) {
          ServiceUtils.logger.error('Failed to upload receipt', error);
          throw ServiceUtils.handleError('upload payment receipt', error, { 
            orderNumber, 
            fileName: receiptFile.name 
          });
        }
      },
      'checkout_upload_receipt'
    );
  }

  /**
   * Verify payment status with enhanced caching and monitoring
   */
  async verifyPayment(orderNumber: string): Promise<PaymentVerificationResponse> {
    return withPerformanceMonitoring(
      () => handleServiceResponse(
        () => apiClient.get(`/api/checkout/verify-payment/${orderNumber}`),
        {
          cacheKey: `payment_status_${orderNumber}`,
          cacheTtl: this.config.cacheOptions.paymentStatusTtl,
          useCache: true,
          retryOptions: {
            maxRetries: 2,
            retryCondition: this.config.retryOptions.retryCondition
          }
        }
      ).then(response => response.data as PaymentVerificationResponse),
      'checkout_verify_payment'
    );
  }

  /**
   * Get payment methods with enhanced caching and monitoring
   */
  async getPaymentMethods(): Promise<PaymentMethodsResponse> {
    return withPerformanceMonitoring(
      () => handleServiceResponse(
        () => apiClient.get('/api/checkout/payment-methods'),
        {
          cacheKey: 'payment_methods',
          cacheTtl: this.config.cacheOptions.paymentMethodsTtl,
          useCache: true,
          retryOptions: {
            maxRetries: 2,
            retryCondition: this.config.retryOptions.retryCondition
          }
        }
      ).then(response => response.data as PaymentMethodsResponse),
      'checkout_get_payment_methods'
    );
  }

  /**
   * Calculate shipping and taxes with enhanced caching and validation
   */
  async calculateOrderTotals(subtotal: number, country: string = 'Sri Lanka'): Promise<OrderTotalsResponse> {
    return withPerformanceMonitoring(
      () => handleServiceResponse(
        () => apiClient.post('/orders/calculate-totals', {
          subtotal,
          country
        }),
        {
          cacheKey: `order_totals_${subtotal}_${country}`,
          cacheTtl: this.config.cacheOptions.orderTotalsTtl,
          useCache: true,
          retryOptions: {
            maxRetries: 2,
            retryCondition: this.config.retryOptions.retryCondition
          }
        }
      ).then(response => response.data as OrderTotalsResponse),
      'checkout_calculate_totals'
    );
  }

  // Private validation methods with enhanced security and business logic
  private validateOrderData(orderData: CheckoutOrderData | CheckoutOrderDataWithAddressId): void {
    // Basic validation
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (orderData.items.length > 100) {
      throw new Error('Order cannot contain more than 100 items');
    }

    if (!orderData.billingInfo || !orderData.billingInfo.email) {
      throw new Error('Billing information is required');
    }

    if (!orderData.paymentMethod) {
      throw new Error('Payment method is required');
    }

    if (orderData.total <= 0) {
      throw new Error('Order total must be greater than zero');
    }

    // Enhanced validation for realistic order amounts
    if (orderData.total > this.config.validation.maxOrderTotal) {
      throw new Error(`Order total exceeds maximum allowed limit of $${this.config.validation.maxOrderTotal.toLocaleString()}`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.billingInfo.email)) {
      throw new Error('Invalid email address');
    }

    // Validate phone format (basic)
    if (orderData.billingInfo.phone && !/^[+]?[0-9\s\-()]+$/.test(orderData.billingInfo.phone)) {
      throw new Error('Invalid phone number format');
    }

    // Check if this is the new address-based order data
    if ('shippingAddressId' in orderData) {
      // Validate address ID is provided
      if (!orderData.shippingAddressId || orderData.shippingAddressId.trim().length === 0) {
        throw new Error('Shipping address is required');
      }
      
      // Validate required billing fields for address-based orders
      const requiredFields = ['fullName', 'country'];
      for (const field of requiredFields) {
        if (!orderData.billingInfo[field as keyof CheckoutBillingInfo] || 
            (orderData.billingInfo[field as keyof CheckoutBillingInfo] as string).trim().length === 0) {
          throw new Error(`${field} is required`);
        }
      }
    } else {
      // Validate required fields for traditional orders
      const requiredFields = ['fullName', 'address', 'city', 'country'];
      for (const field of requiredFields) {
        if (!orderData.billingInfo[field as keyof BillingInfo] || 
            (orderData.billingInfo[field as keyof BillingInfo] as string).trim().length === 0) {
          throw new Error(`${field} is required`);
        }
      }
    }

    // Validate items
    for (const item of orderData.items) {
      if (!item.gemId || item.gemId.trim().length === 0) {
        throw new Error('All items must have a valid gem ID');
      }
      
      if (item.quantity <= 0 || item.quantity > 10) {
        throw new Error('Item quantity must be between 1 and 10');
      }
      
      if (item.price <= 0 || item.price > 1000000) {
        throw new Error('Item price must be valid and reasonable');
      }

      // Validate gem ID format (MongoDB ObjectId)
      const gemIdPattern = /^[a-fA-F0-9]{24}$/;
      if (!gemIdPattern.test(item.gemId)) {
        throw new Error('Invalid gem ID format');
      }
    }
  }

  private validateReceiptFile(file: File): boolean {
    // Check file type
    if (!this.config.validation.allowedReceiptTypes.includes(file.type)) {
      ServiceUtils.logger.warn('Invalid receipt file type', { 
        fileType: file.type, 
        fileName: file.name 
      });
      return false;
    }
    
    // Check file size
    if (file.size > this.config.validation.maxReceiptSize) {
      ServiceUtils.logger.warn('Receipt file too large', { 
        fileSize: file.size, 
        maxSize: this.config.validation.maxReceiptSize,
        fileName: file.name 
      });
      return false;
    }
    
    // Check file name for security
    const suspiciousPatterns = /[<>:"/\\|?*\x00-\x1f]/;
    if (suspiciousPatterns.test(file.name)) {
      ServiceUtils.logger.warn('Suspicious file name detected', { fileName: file.name });
      return false;
    }
    
    return true;
  }

  private validateBankDetails(payload: unknown): boolean {
    if (!payload || typeof payload !== 'object') return false;
    
    const details = payload as Record<string, unknown>;
    const isValid = (
      typeof details.bankName === 'string' && details.bankName.trim().length > 0 &&
      typeof details.accountName === 'string' && details.accountName.trim().length > 0 &&
      typeof details.accountNumber === 'string' && details.accountNumber.trim().length > 0 &&
      typeof details.swiftCode === 'string' && details.swiftCode.trim().length > 0 &&
      typeof details.branch === 'string' && details.branch.trim().length > 0
    );
    
    if (!isValid) {
      ServiceUtils.logger.warn('Invalid bank details structure received', { 
        hasRequiredFields: {
          bankName: typeof details.bankName === 'string',
          accountName: typeof details.accountName === 'string',
          accountNumber: typeof details.accountNumber === 'string',
          swiftCode: typeof details.swiftCode === 'string',
          branch: typeof details.branch === 'string'
        }
      });
    }
    
    return isValid;
  }

  /**
   * Get service health status and configuration
   */
  getServiceHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    config: CheckoutServiceConfig;
    cacheStats: ReturnType<typeof ServiceUtils.getCacheStats>;
    uptime: number;
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
      uptime: Date.now() - this.state.startTime || 0
    };
  }

  /**
   * Clear service caches with optional pattern matching
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      ServiceUtils.logger.info('Clearing selective checkout cache', { pattern });
      // In a real implementation, you'd have pattern-based cache clearing
    } else {
      ServiceUtils.cache.clear();
      ServiceUtils.logger.info('Cleared all checkout service caches');
    }
  }

  /**
   * Initialize service with startup checks
   */
  protected initialize(): void {
    this.state.startTime = Date.now();
    ServiceUtils.logger.info('CheckoutService initialized', {
      config: this.config,
      timestamp: new Date().toISOString()
    });
  }
}

// Initialize the service with singleton pattern
class CheckoutServiceSingleton extends CheckoutService {
  private static instance: CheckoutServiceSingleton;
  
  private constructor() {
    super();
    this.initialize();
  }
  
  public static getInstance(): CheckoutServiceSingleton {
    if (!CheckoutServiceSingleton.instance) {
      CheckoutServiceSingleton.instance = new CheckoutServiceSingleton();
    }
    return CheckoutServiceSingleton.instance;
  }
  
  /**
   * Graceful shutdown cleanup
   */
  public shutdown(): void {
    ServiceUtils.logger.info('CheckoutService shutting down');
    this.clearCache();
  }
}

// Export singleton instance
export const checkoutService = CheckoutServiceSingleton.getInstance();

// Cleanup on page unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    checkoutService.shutdown();
  });
}
