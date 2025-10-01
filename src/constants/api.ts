/**
 * API Configuration
 * 
 * @deprecated This file is deprecated. Use the centralized configuration from:
 * @see /src/config/environment.ts
 * 
 * This file is kept for backward compatibility but should be gradually migrated.
 */

import { apiConfig } from '@/config/environment';

// Re-export from centralized configuration
export const API_BASE_URL = apiConfig.baseUrl;

export const API_ENDPOINTS = {
  GEMS: '/gems',
  AUTH: '/auth', 
  PAYMENTS: '/payments',
  USERS: '/users',
  BIDS: '/bids'
} as const;
