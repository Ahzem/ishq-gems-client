import apiClient from '@/lib/api-client';
import { AdminGemData, AdminGemResponse, AdminGemsListResponse } from '@/types';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';

/**
 * Production-optimized Admin Gem Service
 * Handles admin gem operations with caching, validation, and performance monitoring
 */
class AdminGemService {
  private readonly baseUrl = '/admin/gems';

  /**
   * Create a new admin gem listing with validation and performance monitoring
   */
  async createAdminGem(gemData: AdminGemData): Promise<{ success: boolean; data?: AdminGemResponse; message?: string }> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate required fields
          this.validateAdminGemData(gemData);

          ServiceUtils.logger.info('Creating admin gem', {
            reportNumber: gemData.reportNumber,
            gemType: gemData.gemType,
            mediaFilesCount: gemData.mediaFiles?.length || 0,
            isPlatformGem: gemData.isPlatformGem
          });

          const response = await handleServiceResponse(
            () => apiClient.post<AdminGemResponse>(this.baseUrl, gemData),
            {
              retryOptions: {
                maxRetries: 1, // Limited retries for creation operations
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          if (response.success) {
            ServiceUtils.logger.info('Admin gem created successfully', { gemId: response.data?._id });
            ServiceUtils.cache.clear(); // Clear admin gem lists cache
            
            return {
              success: true,
              data: response.data,
              message: 'Admin gem created successfully'
            };
          }

          return {
            success: false,
            message: response.message || 'Failed to create admin gem'
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to create admin gem', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create admin gem'
          };
        }
      },
      'admin_gem_create'
    );
  }

  /**
   * Get all admin gems with pagination and caching
   */
  async getAdminGems(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string
  ): Promise<AdminGemsListResponse> {
    return withPerformanceMonitoring(
      async () => {
        const cacheKey = `admin_gems_${page}_${limit}_${status || 'all'}_${search || ''}`;
        
        const response = await handleServiceResponse(
          () => {
            const params = new URLSearchParams({
              page: page.toString(),
              limit: limit.toString(),
              ...(status && { status }),
              ...(search && { search })
            });
            
            return apiClient.get<{
              gems: AdminGemResponse[]
              total: number
              page: number
              totalPages: number
            }>(`${this.baseUrl}?${params}`);
          },
          {
            cacheKey,
            cacheTtl: 180000, // 3 minutes cache for admin gem lists
            useCache: !search, // Don't cache search results
            retryOptions: {
              maxRetries: 2,
              retryCondition: (error) => {
                if (error && typeof error === 'object' && 'status' in error) {
                  const status = (error as { status: number }).status;
                  return status >= 500 || status === 0;
                }
                return false;
              }
            }
          }
        );

        // Return the full response structure, not just the data
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data,
            message: response.message
          } as AdminGemsListResponse;
        }
        
        return {
          success: false,
          message: response.message || 'Failed to fetch admin gems'
        } as AdminGemsListResponse;
      },
      'admin_gems_get_list'
    );
  }

  /**
   * Get a specific admin gem by ID with caching
   */
  async getAdminGemById(gemId: string): Promise<{ success: boolean; data?: AdminGemResponse; message?: string }> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!gemId || gemId.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.get<AdminGemResponse>(`${this.baseUrl}/${gemId}`),
            {
              cacheKey: `admin_gem_${gemId}`,
              cacheTtl: 300000, // 5 minutes cache for individual gems
              useCache: true,
              retryOptions: {
                maxRetries: 2,
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          return {
            success: response.success,
            data: response.data,
            message: response.message
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to fetch admin gem', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch admin gem'
          };
        }
      },
      'admin_gem_get_by_id'
    );
  }

  /**
   * Update an admin gem with validation
   */
  async updateAdminGem(
    gemId: string, 
    gemData: Partial<AdminGemData>
  ): Promise<{ success: boolean; data?: AdminGemResponse; message?: string }> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!gemId || gemId.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          if (!gemData || Object.keys(gemData).length === 0) {
            return {
              success: false,
              message: 'Update data is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.put<AdminGemResponse>(`${this.baseUrl}/${gemId}`, gemData),
            {
              retryOptions: {
                maxRetries: 2,
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          // Clear cache on successful update
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear all admin gem related cache
          }

          return {
            success: response.success,
            data: response.data,
            message: response.message
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to update admin gem', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update admin gem'
          };
        }
      },
      'admin_gem_update'
    );
  }

  /**
   * Delete an admin gem
   */
  async deleteAdminGem(gemId: string): Promise<{ success: boolean; message?: string }> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!gemId || gemId.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.delete<{ message: string }>(`${this.baseUrl}/${gemId}`),
            {
              retryOptions: {
                maxRetries: 1, // Limited retries for deletion
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          // Clear cache on successful deletion
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear all admin gem related cache
          }

          return {
            success: response.success,
            message: response.message || 'Admin gem deleted successfully'
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to delete admin gem', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to delete admin gem'
          };
        }
      },
      'admin_gem_delete'
    );
  }

  /**
   * Toggle publish status of an admin gem
   */
  async togglePublishAdminGem(
    gemId: string, 
    published: boolean
  ): Promise<{ success: boolean; data?: AdminGemResponse; message?: string }> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate inputs
          if (!gemId || gemId.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.patch<AdminGemResponse>(`${this.baseUrl}/${gemId}/publish`, { published }),
            {
              retryOptions: {
                maxRetries: 2,
                retryCondition: (error) => {
                  if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status: number }).status;
                    return status >= 500 || status === 0;
                  }
                  return false;
                }
              }
            }
          );

          // Clear cache on successful update
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear admin gem cache
          }

          return {
            success: response.success,
            data: response.data,
            message: response.message
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to toggle publish status', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to toggle publish status'
          };
        }
      },
      'admin_gem_toggle_publish'
    );
  }

  /**
   * Get admin gem statistics with caching
   */
  async getAdminGemStats(): Promise<{
    success: boolean
    data?: {
      total: number
      published: number
      totalViews: number
      totalValue: number
    }
    message?: string
  }> {
    return withPerformanceMonitoring(
      () => handleServiceResponse(
        () => apiClient.get<{
          total: number
          published: number
          totalViews: number
          totalValue: number
        }>(`${this.baseUrl}/stats`),
        {
          cacheKey: 'admin_gem_stats',
          cacheTtl: 600000, // 10 minutes cache for statistics
          useCache: true,
          retryOptions: {
            maxRetries: 2,
            retryCondition: (error) => {
              if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as { status: number }).status;
                return status >= 500 || status === 0;
              }
              return false;
            }
          }
        }
      ).then(response => ({
        success: response.success,
        data: response.data,
        message: response.message
      })),
      'admin_gem_get_stats'
    );
  }

  // Private validation methods
  private validateAdminGemData(gemData: AdminGemData): void {
    if (!gemData.reportNumber || gemData.reportNumber.trim().length === 0) {
      throw new Error('Report number is required');
    }

    if (!gemData.gemType || gemData.gemType.trim().length === 0) {
      throw new Error('Gem type is required');
    }

    if (!gemData.weight || gemData.weight.value <= 0) {
      throw new Error('Valid weight is required');
    }

    if (!gemData.dimensions || !gemData.dimensions.length || !gemData.dimensions.width || !gemData.dimensions.height) {
      throw new Error('Valid dimensions are required');
    }

    // Validate media files if present
    if (gemData.mediaFiles && gemData.mediaFiles.length === 0) {
      throw new Error('At least one media file is required');
    }
  }
}

const adminGemService = new AdminGemService()
export default adminGemService 