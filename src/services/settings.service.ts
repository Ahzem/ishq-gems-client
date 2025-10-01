import apiClient from '@/lib/api-client';
import { 
  PlatformSettings, 
  GeneralSettings,
  SettingsUpdateRequest,
  SettingsValidationResponse,
  SettingsServiceConfig,
  SettingsUpdateResponse,
  SettingsHealthResponse
} from '@/types';

class SettingsService {
  private config: SettingsServiceConfig = {
    baseUrl: '/admin/settings' // Relative path since apiClient handles base URL
  };

  private cache: {
    settings?: PlatformSettings;
    timestamp?: number;
    ttl: number;
  } = {
    ttl: 5 * 60 * 1000 // 5 minutes
  };

  /**
   * Get current platform settings
   */
  async getSettings(useCache: boolean = true): Promise<PlatformSettings> {
    try {
      // Check cache first
      if (useCache && this.isCacheValid()) {
        console.log('Settings retrieved from cache');
        return this.cache.settings!;
      }

      const response = await apiClient.get<PlatformSettings>(this.config.baseUrl);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to retrieve settings');
      }

      // Update cache
      this.updateCache(response.data);

      return response.data;
    } catch (error) {
      console.error('Failed to get settings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update platform settings by category
   */
  async updateSettings(
    category: keyof PlatformSettings,
    settings: Partial<PlatformSettings[keyof PlatformSettings]>
  ): Promise<SettingsUpdateResponse> {
    try {
      const requestData: SettingsUpdateRequest = {
        category,
        settings
      };

      const response = await apiClient.put<SettingsUpdateResponse>(this.config.baseUrl, requestData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update settings');
      }

      // Clear cache to force refresh
      this.clearCache();

      return response.data as SettingsUpdateResponse;
    } catch (error) {
      console.error(`Failed to update ${category} settings:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Update general settings specifically
   */
  async updateGeneralSettings(settings: Partial<GeneralSettings>): Promise<SettingsUpdateResponse> {
    try {
      const requestData = { settings };

      const response = await apiClient.put<SettingsUpdateResponse>(`${this.config.baseUrl}/general`, requestData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update general settings');
      }

      // Clear cache to force refresh
      this.clearCache();

      return response.data as SettingsUpdateResponse;
    } catch (error) {
      console.error('Failed to update general settings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Validate settings without saving
   */
  async validateSettings(
    category: keyof PlatformSettings,
    settings: Partial<PlatformSettings[keyof PlatformSettings]>
  ): Promise<SettingsValidationResponse> {
    try {
      const requestData = {
        category,
        settings
      };

      const response = await apiClient.post<SettingsValidationResponse>(`${this.config.baseUrl}/validate`, requestData);
      
      return {
        isValid: response.data?.isValid || false,
        errors: response.data?.errors || [],
        warnings: response.data?.warnings || []
      } as SettingsValidationResponse;
    } catch (error) {
      console.error(`Failed to validate ${category} settings:`, error);
      
      // Return validation failed response
      return {
        isValid: false,
        errors: [{
          field: 'validation',
          message: error instanceof Error ? error.message : 'Validation failed',
          code: 'VALIDATION_ERROR'
        }]
      };
    }
  }

  /**
   * Initialize default settings (first-time setup)
   */
  async initializeSettings(): Promise<PlatformSettings> {
    try {
      const response = await apiClient.post<PlatformSettings>(`${this.config.baseUrl}/initialize`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to initialize settings');
      }

      // Update cache
      this.updateCache(response.data);

      return response.data;
    } catch (error) {
      console.error('Failed to initialize settings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check settings system health
   */
  async healthCheck(): Promise<SettingsHealthResponse> {
    try {
      const response = await apiClient.get<SettingsHealthResponse>(`${this.config.baseUrl}/health`);
      return response.data as SettingsHealthResponse;
    } catch (error) {
      console.error('Settings health check failed:', error);
      return {
        success: false,
        data: {
          status: 'unhealthy',
          timestamp: new Date(),
          settingsInitialized: false,
          categories: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Clear settings cache
   */
  clearCache(): void {
    this.cache.settings = undefined;
    this.cache.timestamp = undefined;
  }

  /**
   * Get cached settings if available and valid
   */
  getCachedSettings(): PlatformSettings | null {
    if (this.isCacheValid()) {
      return this.cache.settings!;
    }
    return null;
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    return !!(
      this.cache.settings && 
      this.cache.timestamp && 
      Date.now() - this.cache.timestamp < this.cache.ttl
    );
  }

  /**
   * Update cache with new settings
   */
  private updateCache(settings: PlatformSettings): void {
    this.cache.settings = settings;
    this.cache.timestamp = Date.now();
  }


  /**
   * Handle and normalize errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      return new Error(
        (errorObj.message as string) || 
        (errorObj.error as string) || 
        'Unknown error occurred'
      );
    }
    
    return new Error('Unknown error occurred');
  }

  /**
   * Get service configuration
   */
  getConfig(): SettingsServiceConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<SettingsServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create and export singleton instance
const settingsService = new SettingsService();
export default settingsService;
