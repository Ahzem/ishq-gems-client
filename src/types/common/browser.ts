/**
 * Browser API type definitions for enhanced TypeScript support
 */

/**
 * Performance Memory API interface
 * Extends the standard Performance interface with memory information
 */
export interface PerformanceMemory {
  /** The total size of the heap, in bytes */
  totalJSHeapSize: number;
  /** The currently active segment of JS heap, in bytes */
  usedJSHeapSize: number;
  /** The maximum size of the heap, in bytes */
  jsHeapSizeLimit: number;
}

/**
 * Enhanced Performance interface with memory property
 */
export interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

/**
 * Network Information API interface
 * Provides information about the connection a user's device is using to communicate with the network
 */
export interface NetworkInformation extends EventTarget {
  /** The type of connection a device is using to communicate with the network */
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
  /** The effective type of the connection meaning one of 'slow-2g', '2g', '3g', or '4g' */
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  /** The estimated effective bandwidth of the network connection in Mbps */
  downlink?: number;
  /** The maximum downlink speed of the underlying connection technology in Mbps */
  downlinkMax?: number;
  /** The estimated round-trip time of the connection in milliseconds */
  rtt?: number;
  /** Whether the user has set a reduced data usage option on the user agent */
  saveData?: boolean;
  /** Event handler for connection changes */
  addEventListener(type: 'change', listener: (event: Event) => void): void;
  removeEventListener(type: 'change', listener: (event: Event) => void): void;
}

/**
 * Enhanced Navigator interface with connection property
 */
export interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Enhanced ServiceError interface with additional properties
 */
export interface ExtendedServiceError extends Error {
  statusCode?: number;
  originalError?: unknown;
  category?: 'network' | 'client' | 'server' | 'timeout' | 'unknown';
  context?: Record<string, unknown>;
}

/**
 * Type guards for browser API detection
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Type guard for Performance Memory API
 */
export function hasPerformanceMemory(performance: Performance): performance is PerformanceWithMemory {
  return 'memory' in performance;
}

/**
 * Type guard for Network Information API
 */
export function hasNetworkInformation(navigator: Navigator): navigator is NavigatorWithConnection {
  return 'connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator;
}

/**
 * Utility to get connection from navigator with cross-browser support
 */
export function getNetworkConnection(navigator: Navigator): NetworkInformation | undefined {
  const nav = navigator as NavigatorWithConnection;
  return nav.connection || nav.mozConnection || nav.webkitConnection;
}

/**
 * Performance monitoring utilities types
 */
export interface PerformanceMetrics {
  operationName: string;
  duration: number;
  memoryDelta?: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
  criticalPath: boolean;
  expectedDuration: number;
  connectionStatus: ConnectionStatus;
  timestamp: string;
}

/**
 * Connection status interface
 */
export interface ConnectionStatus {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  isSlowConnection: boolean;
  isFastConnection: boolean;
}

/**
 * Error context interface for enhanced error tracking
 */
export interface ErrorContext {
  category: 'network' | 'client' | 'server' | 'timeout' | 'unknown';
  statusCode?: number;
  timestamp: string;
  connectionStatus: ConnectionStatus;
  [key: string]: unknown;
}
