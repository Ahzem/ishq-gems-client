import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types';
import { handleServiceResponse, withPerformanceMonitoring } from './service-utils';
import {
  SellerSettingsResponse,
  UpdateSellerSettingsRequest,
  UpdateSellerSettingsResponse,
} from '@/types/entities/seller-settings';

class SellerSettingsService {
  private readonly baseUrl = '/seller-settings';

  /**
   * Get seller settings for the authenticated user.
   */
  async getSellerSettings(): Promise<ApiResponse<SellerSettingsResponse>> {
    return withPerformanceMonitoring(
      async () => {
        return await handleServiceResponse(
          () => apiClient.get<SellerSettingsResponse>(this.baseUrl),
          {
            cacheKey: 'seller_settings_current_user',
            cacheTtl: 60000, // 1 minute
            useCache: true,
          }
        );
      },
      'seller_settings_get_own'
    );
  }

  /**
   * Update seller settings for the authenticated user.
   */
  async updateSellerSettings(
    updateData: UpdateSellerSettingsRequest
  ): Promise<ApiResponse<UpdateSellerSettingsResponse>> {
    return withPerformanceMonitoring(
      async () => {
        const response = await handleServiceResponse(
          () => apiClient.put<UpdateSellerSettingsResponse>(this.baseUrl, updateData)
        );
        return response;
      },
      'seller_settings_update_own'
    );
  }

}

// Export singleton instance
const sellerSettingsService = new SellerSettingsService();
export default sellerSettingsService;