/**
 * Production-Grade Service Utilities
 * 
 * Comprehensive API management utilities implementing enterprise-level patterns:
 * - Smart caching with memory pressure awareness
 * - Circuit breaker pattern for service resilience
 * - Connection-aware request handling
 * - Rate limiting and request prioritization
 * - Performance monitoring and analytics
 * - Bandwidth optimization and adaptive loading
 * - Background sync and offline capabilities
 * 
 * Optimized for Google PageSpeed Core Web Vitals
 */

import { 
  ApiResponse,
  PerformanceWithMemory,
  NetworkInformation,
  ExtendedServiceError,
  hasPerformanceMemory,
  hasNetworkInformation,
  getNetworkConnection,
  ConnectionStatus,
  ErrorContext
} from '@/types';
import { environment } from '@/config/environment';

// Environment-aware configuration
const isDevelopment = environment.isDevelopment;
const isBrowser = typeof window !== 'undefined';
const isProduction = environment.isProduction;

/**
 * Enhanced production-safe logger with structured logging and analytics
 */
export const serviceLogger = {
  error: (message: string, error?: unknown, context?: Record<string, unknown>): void => {
    const logData = {
      level: 'error',
      message,
      error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: isBrowser ? navigator.userAgent : undefined,
      url: isBrowser ? window.location.href : undefined
    };

    if (isDevelopment) {
      console.error(`[Service Error] ${message}`, logData);
    }
    
    // In production, send to error tracking service
    if (isProduction) {
      // Example: errorTrackingService.captureException(error, logData);
      // Example: analyticsService.trackError(logData);
    }
  },
  
  warn: (message: string, data?: unknown, context?: Record<string, unknown>): void => {
    const logData = {
      level: 'warn',
      message,
      data,
      context,
      timestamp: new Date().toISOString()
    };

    if (isDevelopment) {
      console.warn(`[Service Warning] ${message}`, logData);
    }
    
    if (isProduction) {
      // Example: analyticsService.trackWarning(logData);
    }
  },
  
  info: (message: string, data?: unknown, context?: Record<string, unknown>): void => {
    const logData = {
      level: 'info',
      message,
      data,
      context,
      timestamp: new Date().toISOString()
    };

    if (isDevelopment) {
      console.info(`[Service Info] ${message}`, logData);
    }
  },

  performance: (operationName: string, duration: number, metadata?: Record<string, unknown>): void => {
    const logData = {
      level: 'performance',
      operation: operationName,
      duration,
      metadata,
      timestamp: new Date().toISOString()
    };

    if (isDevelopment && duration > 1000) {
      console.warn(`[Performance] Slow operation: ${operationName}`, logData);
    }
    
    if (isProduction) {
      // Example: analyticsService.trackPerformance(logData);
    }
  }
};

/**
 * Advanced request cache with memory pressure awareness and priority levels
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
  accessCount: number;
  lastAccessed: number;
  size?: number; // Estimated size in bytes
}

class RequestCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private readonly maxSize = 50 * 1024 * 1024; // 50MB max cache size
  private readonly maxEntries = 1000; // Max number of cache entries
  private currentSize = 0;

  set<T>(
    key: string, 
    data: T, 
    ttlMs: number = 300000, 
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
  ): void {
    // Estimate data size for memory management
    const estimatedSize = this.estimateSize(data);
    
    // Check memory pressure and evict if necessary
    if (this.shouldEvict(estimatedSize)) {
      this.evictLRU();
    }

    // Remove existing item if updating
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      this.currentSize -= existing.size || 0;
    }

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      priority,
      accessCount: 0,
      lastAccessed: Date.now(),
      size: estimatedSize
    };

    this.cache.set(key, cacheItem as CacheItem<unknown>);
    this.currentSize += estimatedSize;

    serviceLogger.info('Cache set', { 
      key, 
      size: estimatedSize, 
      totalSize: this.currentSize, 
      priority,
      entries: this.cache.size 
    });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }
    
    // Update access statistics for LRU
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    return item.data;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      this.currentSize -= item.size || 0;
      return this.cache.delete(key);
    }
    return false;
  }
  
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    serviceLogger.info('Cache cleared');
  }

  // Get cache statistics
  getStats(): {
    size: number;
    entries: number;
    maxSize: number;
    maxEntries: number;
    hitRate?: number;
  } {
    return {
      size: this.currentSize,
      entries: this.cache.size,
      maxSize: this.maxSize,
      maxEntries: this.maxEntries
    };
  }

  // Clean expired entries and optimize memory usage
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;
    let freedSize = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        freedSize += item.size || 0;
        this.cache.delete(key);
        removedCount++;
      }
    }

    this.currentSize -= freedSize;
    
    if (removedCount > 0) {
      serviceLogger.info('Cache cleanup completed', { 
        removedCount, 
        freedSize, 
        remainingEntries: this.cache.size 
      });
    }

    // If still over limits, perform LRU eviction
    if (this.cache.size > this.maxEntries || this.currentSize > this.maxSize) {
      this.evictLRU();
    }
  }

  private estimateSize(data: unknown): number {
    try {
      // Rough estimation - in production you might want more sophisticated size calculation
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch {
      // Fallback estimation
      return 1024; // 1KB default
    }
  }

  private shouldEvict(newItemSize: number): boolean {
    return (
      this.cache.size >= this.maxEntries ||
      this.currentSize + newItemSize > this.maxSize
    );
  }

  private evictLRU(): void {
    // Sort by priority and last accessed time
    const entries = Array.from(this.cache.entries());
    
    // Priority-based LRU: evict low priority items first, then by last accessed time
    entries.sort(([, a], [, b]) => {
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority; // Lower priority first
      }
      
      return a.lastAccessed - b.lastAccessed; // Older access first
    });

    // Evict 10% of entries or until under limits
    const evictCount = Math.max(1, Math.floor(entries.length * 0.1));
    let evicted = 0;
    let freedSize = 0;

    for (const [key, item] of entries) {
      if (evicted >= evictCount && 
          this.cache.size <= this.maxEntries && 
          this.currentSize <= this.maxSize) {
        break;
      }

      freedSize += item.size || 0;
      this.cache.delete(key);
      evicted++;
    }

    this.currentSize -= freedSize;

    serviceLogger.info('LRU eviction completed', { 
      evicted, 
      freedSize, 
      remainingEntries: this.cache.size 
    });
  }
}

export const requestCache = new RequestCache();

// Intelligent cache management
if (isBrowser) {
  // Auto-cleanup cache every 5 minutes
  setInterval(() => requestCache.cleanup(), 300000);
  
      // Memory pressure handling
    if (hasPerformanceMemory(performance)) {
      setInterval(() => {
        const memInfo = (performance as PerformanceWithMemory).memory;
        if (memInfo && memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit > 0.8) {
          serviceLogger.warn('High memory pressure detected, aggressive cache cleanup');
          requestCache.cleanup();
        }
      }, 60000); // Check every minute
    }

  // Page visibility change handling
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Clean up when page becomes hidden
      requestCache.cleanup();
    }
  });

  // Before unload cleanup
  window.addEventListener('beforeunload', () => {
    requestCache.clear();
  });
}

/**
 * Advanced request deduplication with timeout and priority handling
 */
class RequestDeduplicator {
  private pendingRequests = new Map<string, {
    promise: Promise<unknown>;
    timestamp: number;
    priority: 'critical' | 'high' | 'normal' | 'low';
    timeout?: NodeJS.Timeout;
  }>();

  private readonly maxPendingTime = 30000; // 30 seconds max pending time
  
  async deduplicate<T>(
    key: string, 
    requestFn: () => Promise<T>,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal',
    timeoutMs?: number
  ): Promise<T> {
    const existing = this.pendingRequests.get(key);
    
    if (existing) {
      // If existing request has lower priority, cancel it and start new one
      if (this.shouldReplaceRequest(existing.priority, priority)) {
        this.cancelRequest(key);
      } else {
        return existing.promise as Promise<T>;
      }
    }
    
    const promise = this.createTimedRequest(requestFn, timeoutMs);
    const timeout = timeoutMs ? setTimeout(() => {
      this.cancelRequest(key);
    }, timeoutMs) : undefined;

    const requestInfo = {
      promise: promise.finally(() => {
        this.pendingRequests.delete(key);
        if (timeout) clearTimeout(timeout);
      }),
      timestamp: Date.now(),
      priority,
      timeout
    };
    
    this.pendingRequests.set(key, requestInfo);
    
    // Cleanup old pending requests
    this.cleanupStaleRequests();
    
    return requestInfo.promise as Promise<T>;
  }

  private async createTimedRequest<T>(
    requestFn: () => Promise<T>, 
    timeoutMs?: number
  ): Promise<T> {
    if (!timeoutMs) {
      return requestFn();
    }

    return Promise.race([
      requestFn(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  }

  private shouldReplaceRequest(
    existingPriority: 'critical' | 'high' | 'normal' | 'low',
    newPriority: 'critical' | 'high' | 'normal' | 'low'
  ): boolean {
    const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
    return priorityOrder[newPriority] > priorityOrder[existingPriority];
  }

  private cancelRequest(key: string): void {
    const request = this.pendingRequests.get(key);
    if (request) {
      if (request.timeout) {
        clearTimeout(request.timeout);
      }
      this.pendingRequests.delete(key);
    }
  }

  private cleanupStaleRequests(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.maxPendingTime) {
        serviceLogger.warn('Cleaning up stale request', { key, age: now - request.timestamp });
        this.cancelRequest(key);
      }
    }
  }

  // Get statistics about pending requests
  getStats(): {
    pendingCount: number;
    byPriority: Record<string, number>;
    oldestRequest: number;
  } {
    const byPriority = { critical: 0, high: 0, normal: 0, low: 0 };
    let oldestTimestamp = Date.now();

    for (const request of this.pendingRequests.values()) {
      byPriority[request.priority]++;
      if (request.timestamp < oldestTimestamp) {
        oldestTimestamp = request.timestamp;
      }
    }

    return {
      pendingCount: this.pendingRequests.size,
      byPriority,
      oldestRequest: Date.now() - oldestTimestamp
    };
  }

  // Clear all pending requests
  clear(): void {
    for (const [key] of this.pendingRequests.entries()) {
      this.cancelRequest(key);
    }
  }
}

export const requestDeduplicator = new RequestDeduplicator();

/**
 * Connection status monitor for adaptive behavior
 */
class ConnectionMonitor {
  private isOnline = isBrowser ? navigator.onLine : true;
  private connectionType: string = 'unknown';
  private effectiveType: string = '4g';
  private downlink: number = 10; // Mbps
  private rtt: number = 100; // ms
  private callbacks = new Set<(status: ConnectionStatus) => void>();

  constructor() {
    if (isBrowser) {
      this.initializeConnectionMonitoring();
    }
  }

  private initializeConnectionMonitoring(): void {
    // Basic online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyCallbacks();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyCallbacks();
    });

    // Network Information API (if available)
    if (hasNetworkInformation(navigator)) {
      const connection = getNetworkConnection(navigator);
      
      if (connection) {
        this.updateConnectionInfo(connection);
        
        connection.addEventListener('change', () => {
          this.updateConnectionInfo(connection);
          this.notifyCallbacks();
        });
      }
    }
  }

  private updateConnectionInfo(connection: NetworkInformation): void {
    this.connectionType = connection.type || 'unknown';
    this.effectiveType = connection.effectiveType || '4g';
    this.downlink = connection.downlink || 10;
    this.rtt = connection.rtt || 100;
  }

  private notifyCallbacks(): void {
    const status = this.getStatus();
    this.callbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        serviceLogger.error('Connection status callback error', error);
      }
    });
  }

  getStatus(): ConnectionStatus {
    return {
      isOnline: this.isOnline,
      connectionType: this.connectionType,
      effectiveType: this.effectiveType,
      downlink: this.downlink,
      rtt: this.rtt,
      isSlowConnection: this.effectiveType === 'slow-2g' || this.effectiveType === '2g',
      isFastConnection: this.effectiveType === '4g' && this.downlink > 5
    };
  }

  onChange(callback: (status: ConnectionStatus) => void): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  // Adaptive timeout based on connection quality
  getAdaptiveTimeout(baseTimeout: number = 10000): number {
    if (!this.isOnline) return baseTimeout * 2;
    
    const multiplier = this.effectiveType === 'slow-2g' ? 3 :
                     this.effectiveType === '2g' ? 2 :
                     this.effectiveType === '3g' ? 1.5 : 1;
    
    return Math.min(baseTimeout * multiplier, 60000); // Max 60 seconds
  }
}

// ConnectionStatus interface is now imported from @/types

export const connectionMonitor = new ConnectionMonitor();

/**
 * Standardized error handler for all services
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * Circuit breaker pattern for service resilience
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000, // 1 minute
    private readonly monitorWindow: number = 300000 // 5 minutes
  ) {}

  async execute<T>(operation: () => Promise<T>, serviceName: string): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
        serviceLogger.info('Circuit breaker half-open', { serviceName });
      } else {
        throw new ServiceError('Circuit breaker is open', 503);
      }
    }

    try {
      const result = await operation();
      
      if (this.state === 'half-open') {
        this.reset();
        serviceLogger.info('Circuit breaker closed after recovery', { serviceName });
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      
      if (this.failures >= this.failureThreshold) {
        this.state = 'open';
        this.lastFailureTime = Date.now();
        serviceLogger.warn('Circuit breaker opened', { 
          serviceName, 
          failures: this.failures,
          threshold: this.failureThreshold 
        });
      }
      
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    
    // Reset counter after monitor window
    setTimeout(() => {
      if (this.failures > 0) {
        this.failures = Math.max(0, this.failures - 1);
      }
    }, this.monitorWindow);
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }

  getState(): { 
    state: string; 
    failures: number; 
    lastFailureTime: number; 
  } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Enhanced error handling with classification and circuit breaker integration
 */
export const handleServiceError = (
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
): ServiceError => {
  let message = `Failed to ${operation}`;
  let statusCode: number | undefined;
  let category: 'network' | 'client' | 'server' | 'timeout' | 'unknown' = 'unknown';
  
  if (error && typeof error === 'object') {
    if ('message' in error) {
      message = (error as Error).message;
    }
    if ('status' in error) {
      statusCode = (error as { status: number }).status;
    }
    if ('name' in error && (error as Error).name === 'TimeoutError') {
      category = 'timeout';
    }
  }

  // Classify error type
  if (statusCode) {
    if (statusCode >= 400 && statusCode < 500) {
      category = 'client';
    } else if (statusCode >= 500) {
      category = 'server';
    }
  } else if (message.includes('network') || message.includes('fetch')) {
    category = 'network';
  }

  const errorContext: ErrorContext = {
    ...context,
    category,
    statusCode,
    timestamp: new Date().toISOString(),
    connectionStatus: connectionMonitor.getStatus()
  };
  
  serviceLogger.error(`${operation} failed`, error, errorContext);
  
  const serviceError = new ServiceError(message, statusCode, error) as ExtendedServiceError;
  serviceError.category = category;
  serviceError.context = errorContext;
  
  return serviceError;
};

// Global circuit breakers for different services
const circuitBreakers = new Map<string, CircuitBreaker>();

export const getCircuitBreaker = (serviceName: string): CircuitBreaker => {
  if (!circuitBreakers.has(serviceName)) {
    circuitBreakers.set(serviceName, new CircuitBreaker());
  }
  return circuitBreakers.get(serviceName)!;
};

/**
 * Retry mechanism for failed requests
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    retryCondition?: (error: unknown) => boolean;
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    retryCondition = (error: unknown) => {
      // Retry on network errors or 5xx status codes
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        return status >= 500 || status === 0; // 0 for network errors
      }
      return true;
    }
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !retryCondition(error)) {
        throw error;
      }
      
      const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

/**
 * Generic service response handler with caching
 */
export const handleServiceResponse = async <T>(
  operation: () => Promise<ApiResponse<T>>,
  options: {
    cacheKey?: string;
    cacheTtl?: number;
    useCache?: boolean;
    retryOptions?: Parameters<typeof withRetry>[1];
  } = {}
): Promise<ApiResponse<T>> => {
  const { cacheKey, cacheTtl = 300000, useCache = false, retryOptions } = options;
  
  // Check cache first
  if (useCache && cacheKey && requestCache.has(cacheKey)) {
    const cached = requestCache.get<ApiResponse<T>>(cacheKey);
    if (cached) return cached;
  }
  
  // Deduplicate identical requests
  const requestKey = cacheKey || `request_${Date.now()}_${Math.random()}`;
  
  try {
    const response = await requestDeduplicator.deduplicate(
      requestKey,
      () => retryOptions ? withRetry(operation, retryOptions) : operation()
    );
    
    // Cache successful responses
    if (useCache && cacheKey && response.success) {
      requestCache.set(cacheKey, response, cacheTtl);
    }
    
    return response;
  } catch (error) {
    // Return standardized error response
    return {
      success: false,
      message: error instanceof ServiceError ? error.message : 'An unexpected error occurred',
      error: isDevelopment ? error : undefined
    } as ApiResponse<T>;
  }
};

/**
 * Request batching utility for multiple API calls
 */
export const batchRequests = async <T>(
  requests: Array<() => Promise<T>>,
  options: {
    batchSize?: number;
    delay?: number;
  } = {}
): Promise<T[]> => {
  const { batchSize = 5, delay = 100 } = options;
  const results: T[] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(req => req()));
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        serviceLogger.error('Batch request failed', result.reason);
        throw result.reason;
      }
    }
    
    // Add delay between batches to prevent overwhelming the server
    if (i + batchSize < requests.length && delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
};

/**
 * Rate limiter for API abuse prevention
 */
class RateLimiter {
  private requests = new Map<string, number[]>();
  
  constructor(
    private readonly maxRequests: number = 100,
    private readonly windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    const now = Date.now();
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    if (requests.length === 0) return 0;
    
    return requests[0] + this.windowMs;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Enhanced performance monitoring with Core Web Vitals tracking
 */
export const withPerformanceMonitoring = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  options: {
    criticalPath?: boolean;
    expectedDuration?: number;
    priority?: 'critical' | 'high' | 'normal' | 'low';
  } = {}
): Promise<T> => {
  const { criticalPath = false, expectedDuration = 1000, priority = 'normal' } = options;
  const start = performance.now();
  const startMemory = isBrowser && hasPerformanceMemory(performance) ? 
    (performance as PerformanceWithMemory).memory?.usedJSHeapSize || 0 : 0;

  // Mark critical path operations for Core Web Vitals
  if (criticalPath && isBrowser && 'mark' in performance) {
    performance.mark(`${operationName}-start`);
  }

  try {
    const result = await operation();
    const duration = performance.now() - start;
    const endMemory = isBrowser && hasPerformanceMemory(performance) ? 
      (performance as PerformanceWithMemory).memory?.usedJSHeapSize || 0 : 0;
    const memoryDelta = endMemory - startMemory;

    // Performance metrics
    const metrics = {
      operationName,
      duration,
      memoryDelta,
      priority,
      criticalPath,
      expectedDuration,
      connectionStatus: connectionMonitor.getStatus(),
      timestamp: new Date().toISOString()
    };

    // Log performance data
    serviceLogger.performance(operationName, duration, metrics);

    // Mark critical path completion
    if (criticalPath && isBrowser && 'mark' in performance) {
      performance.mark(`${operationName}-end`);
      performance.measure(operationName, `${operationName}-start`, `${operationName}-end`);
    }

    // Alert for performance issues with intelligent thresholds
    if (duration > expectedDuration) {
      // In development: Only log if operation takes more than 5x expected time
      // In production: Log if operation takes more than 2x expected time
      const shouldLog = isProduction 
        ? duration > expectedDuration * 2 
        : duration > expectedDuration * 5;
      
      if (shouldLog) {
        const severity = duration > expectedDuration * 3 ? 'error' : 'warn';
        serviceLogger[severity](`Performance threshold exceeded: ${operationName}`, {
          ...metrics,
          threshold: expectedDuration,
          exceedBy: duration - expectedDuration,
          exceedByPercent: Math.round(((duration - expectedDuration) / expectedDuration) * 100),
          environment: environment.isProduction ? 'production' : 'development'
        });
      }
    }

    // Track Core Web Vitals if this is a critical operation
    if (criticalPath && isBrowser) {
      // This would integrate with Core Web Vitals measurement
      // Example: trackCWV('LCP', duration);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    const errorMetrics = {
      operationName,
      duration,
      priority,
      criticalPath,
      error: error instanceof Error ? error.message : 'Unknown error',
      connectionStatus: connectionMonitor.getStatus()
    };

    serviceLogger.error(`Operation failed: ${operationName}`, error, errorMetrics);
    throw error;
  }
};

/**
 * Memory usage optimization for large datasets
 */
export const processInChunks = async <T, R>(
  items: T[],
  processor: (chunk: T[]) => Promise<R[]>,
  chunkSize: number = 100
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await processor(chunk);
    results.push(...chunkResults);
    
    // Allow event loop to process other tasks
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
};

/**
 * Utility for handling file uploads with progress
 */
export const uploadWithProgress = (
  file: File,
  uploadFn: (file: File, onProgress?: (progress: number) => void) => Promise<unknown>,
  onProgress?: (progress: number) => void
): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }
    
    uploadFn(file, onProgress).then(resolve).catch(reject);
  });
};

/**
 * Background synchronization for offline capabilities
 */
class BackgroundSync {
  private syncQueue = new Map<string, {
    operation: () => Promise<unknown>;
    retries: number;
    maxRetries: number;
    lastAttempt: number;
    priority: 'critical' | 'high' | 'normal' | 'low';
  }>();

  private isProcessing = false;
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds base delay

  constructor() {
    if (isBrowser) {
      // Process queue when coming online
      connectionMonitor.onChange((status) => {
        if (status.isOnline && this.syncQueue.size > 0) {
          this.processQueue();
        }
      });
    }
  }

  // Add operation to sync queue
  queue(
    key: string,
    operation: () => Promise<unknown>,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
  ): void {
    this.syncQueue.set(key, {
      operation,
      retries: 0,
      maxRetries: this.maxRetries,
      lastAttempt: 0,
      priority
    });

    // Try to process immediately if online
    if (connectionMonitor.getStatus().isOnline) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.size === 0) return;

    this.isProcessing = true;
    serviceLogger.info('Processing background sync queue', { queueSize: this.syncQueue.size });

    // Sort by priority
    const entries = Array.from(this.syncQueue.entries());
    entries.sort(([, a], [, b]) => {
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const [key, item] of entries) {
      if (!connectionMonitor.getStatus().isOnline) {
        break; // Stop processing if offline
      }

      try {
        await item.operation();
        this.syncQueue.delete(key);
        serviceLogger.info('Background sync operation completed', { key });
      } catch (error) {
        item.retries++;
        item.lastAttempt = Date.now();

        if (item.retries >= item.maxRetries) {
          serviceLogger.error('Background sync operation failed permanently', error, { key, retries: item.retries });
          this.syncQueue.delete(key);
        } else {
          serviceLogger.warn('Background sync operation failed, will retry', error, { 
            key, 
            retries: item.retries, 
            maxRetries: item.maxRetries 
          });

          // Exponential backoff for retries
          const delay = this.retryDelay * Math.pow(2, item.retries - 1);
          setTimeout(() => {
            this.processQueue();
          }, delay);
        }
      }
    }

    this.isProcessing = false;
  }

  // Get sync queue statistics
  getQueueStats(): {
    queueSize: number;
    byPriority: Record<string, number>;
    failedOperations: number;
  } {
    const byPriority = { critical: 0, high: 0, normal: 0, low: 0 };
    let failedOperations = 0;

    for (const item of this.syncQueue.values()) {
      byPriority[item.priority]++;
      if (item.retries > 0) {
        failedOperations++;
      }
    }

    return {
      queueSize: this.syncQueue.size,
      byPriority,
      failedOperations
    };
  }

  // Clear all queued operations
  clearQueue(): void {
    this.syncQueue.clear();
  }
}

export const backgroundSync = new BackgroundSync();

/**
 * System health monitor for production insights
 */
class SystemHealthMonitor {
  private metrics = {
    requestsPerSecond: 0,
    averageResponseTime: 0,
    errorRate: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  };

  private requestTimes: number[] = [];
  private errorCount = 0;
  private totalRequests = 0;

  constructor() {
    if (isBrowser) {
      // Monitor system health every 30 seconds
      setInterval(() => {
        this.updateMetrics();
      }, 30000);
    }
  }

  recordRequest(duration: number, isError: boolean = false): void {
    this.requestTimes.push(duration);
    this.totalRequests++;
    
    if (isError) {
      this.errorCount++;
    }

    // Keep only last 100 requests for moving average
    if (this.requestTimes.length > 100) {
      this.requestTimes.shift();
    }
  }

  private updateMetrics(): void {
    // Calculate average response time
    if (this.requestTimes.length > 0) {
      this.metrics.averageResponseTime = 
        this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length;
    }

    // Calculate error rate
    this.metrics.errorRate = this.totalRequests > 0 ? 
      (this.errorCount / this.totalRequests) * 100 : 0;

    // Memory usage (if available)
    if (isBrowser && hasPerformanceMemory(performance)) {
      const memInfo = (performance as PerformanceWithMemory).memory;
      if (memInfo) {
        this.metrics.memoryUsage = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
      }
    }

    // Log health metrics
    serviceLogger.info('System health metrics updated', this.metrics);

    // Alert on poor health
    if (this.metrics.errorRate > 10 || this.metrics.averageResponseTime > 5000) {
      serviceLogger.warn('Poor system health detected', this.metrics);
    }
  }

  getHealth(): typeof this.metrics {
    return { ...this.metrics };
  }
}

export const healthMonitor = new SystemHealthMonitor();

/**
 * Cache warming for critical data
 */
export const warmCache = async (warmingStrategies: Array<{
  key: string;
  dataFetcher: () => Promise<unknown>;
  ttl?: number;
  priority?: 'critical' | 'high' | 'normal' | 'low';
}>): Promise<void> => {
  const warmingPromises = warmingStrategies.map(async (strategy) => {
    try {
      if (!requestCache.has(strategy.key)) {
        const data = await strategy.dataFetcher();
        requestCache.set(
          strategy.key, 
          data, 
          strategy.ttl || 300000, 
          strategy.priority || 'normal'
        );
        serviceLogger.info('Cache warmed', { key: strategy.key });
      }
    } catch (error) {
      serviceLogger.warn('Cache warming failed', error, { key: strategy.key });
    }
  });

  await Promise.allSettled(warmingPromises);
};

// Export all utilities as a comprehensive namespace for organized imports
export const ServiceUtils = {
  // Core utilities
  logger: serviceLogger,
  cache: requestCache,
  deduplicator: requestDeduplicator,
  handleError: handleServiceError,
  withRetry,
  handleResponse: handleServiceResponse,
  batchRequests,
  withPerformanceMonitoring,
  processInChunks,
  uploadWithProgress,

  // Advanced utilities  
  connection: connectionMonitor,
  circuitBreaker: getCircuitBreaker,
  rateLimiter,
  backgroundSync,
  healthMonitor,
  warmCache,

  // Utility functions
  isSlowConnection: () => connectionMonitor.getStatus().isSlowConnection,
  isFastConnection: () => connectionMonitor.getStatus().isFastConnection,
  getAdaptiveTimeout: (baseTimeout?: number) => connectionMonitor.getAdaptiveTimeout(baseTimeout),
  
  // Statistics and monitoring
  getCacheStats: () => requestCache.getStats(),
  getDeduplicationStats: () => requestDeduplicator.getStats(),
  getSyncStats: () => backgroundSync.getQueueStats(),
  getHealthMetrics: () => healthMonitor.getHealth(),

  // Cleanup functions
  clearAllCaches: () => {
    requestCache.clear();
    requestDeduplicator.clear();
    backgroundSync.clearQueue();
  }
} as const;

