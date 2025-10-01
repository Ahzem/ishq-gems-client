// Optimized exports for better tree-shaking and bundle splitting
// Using dynamic imports for better code splitting and production performance

// Core services - loaded eagerly for better UX
export { default as authService } from './auth.service';
export { default as userService } from './user.service';

// Feature-specific services - loaded lazily to reduce initial bundle size
export const lazyServices = {
  // Gem and marketplace services
  gemService: () => import('./gem.service').then(m => m.default),
  bidService: () => import('./bid.service').then(m => m.default),
  wishlistService: () => import('./wishlist.service').then(m => m.default),
  
  // Admin services
  adminService: () => import('./admin.service').then(m => m.default),
  adminGemService: () => import('./admin-gem.service').then(m => m.default),
  
  // E-commerce services
  checkoutService: () => import('./checkout.service').then(m => m.checkoutService),
  orderService: () => import('./order.service').then(m => m.default),
  paymentService: () => import('./payment.service').then(m => m.default),
  
  // Communication services
  messageService: () => import('./message.service').then(m => m.default),
  notificationService: () => import('./notification.service').then(m => m.default),
  
  // Other services
  sellerService: () => import('./seller.service').then(m => m.default),
  reviewService: () => import('./review.service').then(m => m.default),
  emailVerificationService: () => import('./email-verification.service').then(m => m.default)
};

// Service loader utility for production optimization
export class ServiceLoader {
  private static serviceCache = new Map<string, unknown>();
  
  /**
   * Load service with caching to prevent duplicate imports
   */
  static async loadService<T = unknown>(serviceName: keyof typeof lazyServices): Promise<T> {
    if (this.serviceCache.has(serviceName)) {
      return this.serviceCache.get(serviceName) as T;
    }
    
    const service = await lazyServices[serviceName]();
    this.serviceCache.set(serviceName, service);
    return service as T;
  }
  
  /**
   * Preload critical services for better performance
   */
  static async preloadCriticalServices(): Promise<void> {
    if (typeof window === 'undefined') return; // SSR guard
    
    // Preload services likely to be used soon
    const criticalServices = ['gemService', 'notificationService', 'wishlistService'];
    
    await Promise.allSettled(
      criticalServices.map(service => 
        this.loadService(service as keyof typeof lazyServices)
      )
    );
  }
  
  /**
   * Clear service cache (useful for testing or memory cleanup)
   */
  static clearCache(): void {
    this.serviceCache.clear();
  }
}

// Export types with better tree-shaking support
export type * from './auth.service';
export type * from './email-verification.service';
export type * from './user.service';
export type * from './wishlist.service';

// Lazy type exports to reduce initial TypeScript compilation time
export type LazyServiceTypes = {
  MessageService: typeof import('./message.service').default;
  // Admin types are now in centralized @types/ directory
};
