/**
 * Environment Configuration
 * 
 * This file centralizes ALL environment-dependent configuration.
 * It follows the 12-factor app methodology for configuration management.
 * 
 * ALL environment variables should be accessed through this file.
 * DO NOT use process.env directly in other files.
 */

// Type definitions for better type safety
interface EnvironmentConfig {
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;
}

interface APIConfig {
  readonly baseUrl: string;
  readonly legacyUrl: string; // For backward compatibility with NEXT_PUBLIC_API_URL
  readonly timeout: number;
  readonly maxRetries: number;
}

interface AppConfig {
  readonly name: string;
  readonly version: string;
  readonly baseUrl: string;
  readonly domain: string;
}

interface ExternalServicesConfig {
  readonly turnstile: {
    readonly siteKey: string;
  };
  readonly cloudinary: {
    readonly cloudName: string;
    readonly uploadPreset: string;
    readonly apiKey: string;
  };
  readonly google: {
    readonly clientId: string;
  };
}

// Environment detection with proper fallbacks
const getEnvironment = (): EnvironmentConfig => {
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvironmentConfig['NODE_ENV'];
  
  return {
    NODE_ENV: nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
  } as const;
};

// Required environment variables validation
const validateRequiredEnvVars = () => {
  // Skip validation during build time as we have proper fallbacks
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }
  
  const required = [
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_APP_BASE_URL',
  ];
  
  const missing = required.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing required environment variables: ${missing.join(', ')}`);
    // Only throw in production runtime, not during build
    if (environment.isProduction && typeof window !== 'undefined') {
      throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
    }
  }
};

// Environment configuration
export const environment = getEnvironment();

// API Configuration
export const apiConfig: APIConfig = {
  baseUrl: (() => {
    // Get the base URL from environment or use defaults
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl) return envUrl;
    
    // Fallback based on environment
    if (environment.isProduction) {
      return envUrl || 'http://34.229.40.129:5000/api';
    }
    
    // Development fallback - ensure it's a full URL for build time
    return 'http://localhost:5000/api';
  })(),
  // Legacy URL for backward compatibility (without /api suffix)
  legacyUrl: (() => {
    // Check both NEXT_PUBLIC_API_URL and NEXT_PUBLIC_API_BASE_URL
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (envUrl) return envUrl;
    if (envBaseUrl) {
      // Remove /api suffix if present
      return envBaseUrl.replace(/\/api$/, '');
    }
    
    // Fallback based on environment
    if (environment.isProduction) {
      return 'http://34.229.40.129:5000';
    }
    
    return 'http://localhost:5000';
  })(),
  timeout: 300000, // 5 minutes for file uploads
  maxRetries: 3,
} as const;

// App Configuration
export const appConfig: AppConfig = {
  name: 'Ishq Gems',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  baseUrl: process.env.NEXT_PUBLIC_APP_BASE_URL || 
    (environment.isProduction 
      ? 'https://ishqgems.com' 
      : 'http://localhost:3000'
    ),
  domain: environment.isProduction ? 'ishqgems.com' : 'localhost',
} as const;

// External Services Configuration
export const externalServices: ExternalServicesConfig = {
  turnstile: {
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
  },
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
  },
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  },
} as const;

// URL Builder utilities
export const urls = {
  api: (endpoint: string) => `${apiConfig.baseUrl}${endpoint}`,
  app: (path: string) => `${appConfig.baseUrl}${path}`,
} as const;

// Validate environment on module load
if (typeof window === 'undefined') {
  // Only validate on server-side to avoid client-side errors
  validateRequiredEnvVars();
}

// Export commonly used values for backward compatibility
export const API_BASE_URL = apiConfig.baseUrl;
export const API_URL = apiConfig.legacyUrl; // For NEXT_PUBLIC_API_URL compatibility
export const APP_BASE_URL = appConfig.baseUrl;

// Centralized environment variable access
export const env = {
  // Core environment
  NODE_ENV: environment.NODE_ENV,
  isDevelopment: environment.isDevelopment,
  isProduction: environment.isProduction,
  isTest: environment.isTest,
  
  // API URLs
  API_BASE_URL: apiConfig.baseUrl,
  API_URL: apiConfig.legacyUrl,
  
  // App URLs
  APP_BASE_URL: appConfig.baseUrl,
  APP_URL: appConfig.baseUrl, // Alias
  
  // External services
  TURNSTILE_SITE_KEY: externalServices.turnstile.siteKey,
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: externalServices.cloudinary.cloudName,
  CLOUDINARY_UPLOAD_PRESET: externalServices.cloudinary.uploadPreset,
  CLOUDINARY_API_KEY: externalServices.cloudinary.apiKey,
  
  // Google OAuth
  GOOGLE_CLIENT_ID: externalServices.google.clientId,
} as const;

// Debug helper (only in development)
if (environment.isDevelopment && typeof window !== 'undefined') {
  console.group('🔧 Environment Configuration');
  console.log('Environment:', environment.NODE_ENV);
  console.log('API Base URL:', apiConfig.baseUrl);
  console.log('App Base URL:', appConfig.baseUrl);
  console.groupEnd();
} 