import apiClient from '@/lib/api-client';
import { apiConfig } from '@/config/environment';
import {
  // Core gem types
  EnhancedGem,
  // Request types
  CreateGemRequest,
  UpdateGemRequest,
  FileUploadRequest,
  GemListQuery,
  // Response types
  LabReportExtractionResponse,
  ExtractionInfoResponse,
  GemListResponse,
  GemHealthCheckResponse,
  LabReportDeleteResponse,
  GenerateUploadUrlsResponse,
  CreateGemResponse,
  SubmitGemAsyncResponse,
  JobStatusResponse,
  RefreshMediaUrlsResponse,
  GemDetailsResponse,
  // Service configuration
  GemServiceConfig,
  GemServiceState,
  // Common types
  ApiResponse,
  JobProgress,
  S3UploadResponse
} from '@/types';
import { ServiceUtils, handleServiceResponse, withPerformanceMonitoring } from './service-utils';
import { environment } from '@/config/environment'

/**
 * Production-optimized Gem Service
 * 
 * Enterprise-grade gem service with:
 * - Comprehensive type safety with centralized type definitions
 * - Advanced caching strategies with memory pressure awareness
 * - Circuit breaker pattern for service resilience
 * - File upload capabilities with progress tracking and validation
 * - Robust error handling and retry logic
 * - Performance monitoring and analytics
 * - Input validation and security measures
 * - Production-ready logging and monitoring
 * - Singleton pattern for consistent state management
 */
class GemService {
  private readonly config: GemServiceConfig = {
    baseUrl: '/gems',
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
      healthCheckTtl: 30000,      // 30 seconds for health checks
      extractionInfoTtl: 3600000, // 1 hour for extraction info
      jobStatusTtl: 10000,        // 10 seconds for job status
      myGemsTtl: 120000,          // 2 minutes for seller's gems
      allGemsTtl: 180000,         // 3 minutes for all gems
      filterOptionsTtl: 600000,   // 10 minutes for filter options
      gemDetailsTtl: 300000,      // 5 minutes for gem details
      pendingGemsTtl: 60000       // 1 minute for pending gems
    },
    validation: {
      maxLabReportSize: 10 * 1024 * 1024, // 10MB
      allowedLabReportTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxFileUploadCount: 20,
      maxGemPrice: 10000000 // $10M max gem price
    }
  };

  private state: GemServiceState = {
    startTime: 0
  };

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  /**
   * Extract gem metadata from uploaded lab report with validation and performance monitoring
   */
  async extractLabReport(file: File): Promise<LabReportExtractionResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate file before sending
          this.validateLabReportFile(file);

          // Create form data
          const formData = new FormData();
          formData.append('labReport', file);

          const response = await handleServiceResponse(
            () => apiClient.upload<LabReportExtractionResponse>(
              `${this.config.baseUrl}/extract-lab-report`,
              formData
            ),
            {
              retryOptions: {
                maxRetries: 1, // Conservative for file uploads
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          return response.data || { success: false, message: 'Failed to extract lab report' };
        } catch (error) {
          ServiceUtils.logger.error('Failed to extract lab report', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to extract lab report'
          };
        }
      },
      'gem_extract_lab_report'
    );
  }

  /**
   * Extract gem metadata from a stored file URL (S3 signed/public URL)
   */
  async extractLabReportByUrl(fileUrl: string): Promise<LabReportExtractionResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          if (!fileUrl || fileUrl.trim().length === 0) {
            return { success: false, message: 'fileUrl is required' };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<LabReportExtractionResponse>(
              `${this.config.baseUrl}/extract-lab-report/from-url`,
              { fileUrl }
            ),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Debug logging in development
          if (environment.isDevelopment) {
            console.log('Lab Report Extraction Response (from URL):', response);
          }
          
          // The response from handleServiceResponse is ApiResponse<LabReportExtractionResponse>
          // We need to return the LabReportExtractionResponse directly
          return response as LabReportExtractionResponse || { success: false, message: 'Failed to extract lab report' };
        } catch (error) {
          ServiceUtils.logger.error('Failed to extract lab report from URL', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to extract lab report from URL'
          };
        }
      },
      'gem_extract_lab_report_from_url'
    );
  }

  /**
   * Get information about lab report extraction service with caching
   */
  async getExtractionInfo(): Promise<ExtractionInfoResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.get<ExtractionInfoResponse>(`${this.config.baseUrl}/extract-lab-report/info`),
            {
              cacheKey: 'extraction_info',
              cacheTtl: this.config.cacheOptions.extractionInfoTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );

          return response.data || { success: false, message: 'Failed to get extraction info' };
        } catch (error) {
          ServiceUtils.logger.error('Failed to get extraction info', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get extraction info'
          };
        }
      },
      'gem_get_extraction_info'
    );
  }

  /**
   * Check health of gem services with caching
   */
  async checkHealth(): Promise<GemHealthCheckResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.get<GemHealthCheckResponse>(`${this.config.baseUrl}/health`),
            {
              cacheKey: 'gem_health_check',
              cacheTtl: this.config.cacheOptions.healthCheckTtl,
              useCache: true,
              retryOptions: {
                maxRetries: 1,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          return response.data || { success: false, message: 'Health check failed', timestamp: new Date().toISOString() };
        } catch (error) {
          ServiceUtils.logger.error('Failed to check health', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Health check failed',
            timestamp: new Date().toISOString()
          };
        }
      },
      'gem_check_health'
    );
  }

  /**
   * Delete lab report from S3 with validation
   */
  async deleteLabReport(s3Key: string): Promise<LabReportDeleteResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate S3 key
          if (!s3Key || s3Key.trim().length === 0) {
            return {
              success: false,
              message: 'S3 key is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<LabReportDeleteResponse>(`${this.config.baseUrl}/delete-lab-report`, { s3Key }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          return response.data || { success: false, message: 'Failed to delete lab report' };
        } catch (error) {
          ServiceUtils.logger.error('Failed to delete lab report', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to delete lab report'
          };
        }
      },
      'gem_delete_lab_report'
    );
  }

  /**
   * Generate pre-signed URLs for file uploads with validation
   */
  async generateUploadUrls(files: FileUploadRequest[]): Promise<GenerateUploadUrlsResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate file upload request
          this.validateFileUploadRequest(files);

          // Server returns ApiResponse<S3UploadResponse[]>; map to GenerateUploadUrlsResponse
          const response = await handleServiceResponse(
            () => apiClient.post<S3UploadResponse[]>(`${this.config.baseUrl}/upload-urls`, { files }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          return {
            success: response.success,
            data: response.data || [],
            message: response.message
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to generate upload URLs', error);
          return {
            success: false,
            data: [],
            message: error instanceof Error ? error.message : 'Failed to generate upload URLs'
          };
        }
      },
      'gem_generate_upload_urls'
    );
  }

  /**
   * Upload file to S3 using pre-signed URL with progress tracking
   */
  async uploadToS3(
    file: File, 
    uploadUrl: string, 
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = Math.round((e.loaded * 100) / e.total);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            const errorMessage = `Upload failed: ${xhr.status} ${xhr.statusText}`;
            reject(new Error(errorMessage));
          }
        });

        xhr.addEventListener('error', () => {
          const errorMessage = 'Network error: Unable to connect to S3. Please check your internet connection and try again.';
          reject(new Error(errorMessage));
        });

        xhr.addEventListener('timeout', () => {
          const errorMessage = 'Upload timeout: The file upload took too long. Please try again.';
          reject(new Error(errorMessage));
        });

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.timeout = 5 * 60 * 1000; // 5 minutes timeout
        xhr.send(file);
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`S3 upload failed: ${error.message}`);
      }
      
      throw new Error('Unknown error occurred during S3 upload');
    }
  }

  /**
   * Create a new gem listing with validation and performance monitoring
   */
  async createGem(gemData: CreateGemRequest): Promise<CreateGemResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem data
          this.validateGemData(gemData);

          // Server returns ApiResponse<EnhancedGem>
          const response = await handleServiceResponse(
            () => apiClient.post<EnhancedGem>(this.config.baseUrl, gemData),
            {
              retryOptions: {
                maxRetries: 1, // Gem creation should have minimal retries
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Clear relevant caches on successful creation
          if (response.success) {
            ServiceUtils.cache.clear(); // Clear gem-related caches
          }

          return {
            success: response.success,
            data: (response.data || ({} as EnhancedGem)) as EnhancedGem,
            message: response.message || (response.success ? 'Gem created successfully' : 'Failed to create gem')
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to create gem', error);
          return {
            success: false,
            data: {} as EnhancedGem,
            message: error instanceof Error ? error.message : 'Failed to create gem'
          };
        }
      },
      'gem_create'
    );
  }

  /**
   * Submit a gem for async processing
   */
  async submitGemAsync(gemData: CreateGemRequest): Promise<SubmitGemAsyncResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem data
          this.validateGemData(gemData);

          // Server returns ApiResponse<{ jobId: string; status: string; message: string }>
          const response = await handleServiceResponse(
            () => apiClient.post<{ jobId: string; status: string; message: string }>(`${this.config.baseUrl}/submit`, gemData),
            {
              retryOptions: {
                maxRetries: 1,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );
          return {
            success: response.success,
            data: response.data,
            message: response.message || (response.success ? 'Gem submitted for processing' : 'Failed to submit gem for processing')
          };
    } catch (error) {
          ServiceUtils.logger.error('Failed to submit gem async', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit gem for processing'
          };
      }
      },
      'gem_submit_async'
    );
  }

  /**
   * Get job status and progress
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate job ID
          if (!jobId || jobId.trim().length === 0) {
            return {
              success: false,
              message: 'Job ID is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.get<JobStatusResponse>(`${this.config.baseUrl}/status/${jobId}`),
            {
              cacheKey: `job_status_${jobId}`,
              cacheTtl: this.config.cacheOptions.jobStatusTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );

          return response.data || { success: false, message: 'Failed to get job status' };
    } catch (error) {
          ServiceUtils.logger.error('Failed to get job status', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get job status'
          };
      }
      },
      'gem_get_job_status'
    );
  }

  /**
   * Poll job status until completion
   */
  async pollJobStatus(
    jobId: string,
    onProgress: (progress: JobProgress) => void,
    pollInterval: number = 2000,
    timeout: number = 300000 // 5 minutes
  ): Promise<JobProgress> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const poll = async () => {
        try {
          // Check timeout
          if (Date.now() - startTime > timeout) {
            reject(new Error('Job polling timeout'))
            return
          }

          const response = await this.getJobStatus(jobId)
          
          if (!response.success || !response.data) {
            setTimeout(poll, pollInterval)
            return
          }

          const progress = response.data
          onProgress(progress)

          if (progress.status === 'completed' || progress.status === 'failed') {
            resolve(progress)
            return
          }

          // Continue polling
          setTimeout(poll, pollInterval)
        } catch (error) {
          reject(error)
        }
      }

      poll()
    })
  }

  /**
   * Upload progress callback type
   */
  onUploadProgress?: (progressEvent: ProgressEvent) => void;

  /**
   * Extract lab report with progress tracking
   */
  async extractLabReportWithProgress(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<LabReportExtractionResponse> {
    try {
      // Validate file before sending
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF and image files (JPEG, PNG) are allowed');
      }

      const token = this.getAuthToken();
      const formData = new FormData();
      formData.append('labReport', file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = Math.round((e.loaded * 100) / e.total);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || errorData.error || `HTTP error! status: ${xhr.status}`));
            } catch {
              reject(new Error(`HTTP error! status: ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Request timeout'));
        });

        xhr.open('POST', `${apiConfig.baseUrl}${this.config.baseUrl}/extract-lab-report`);
        
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.timeout = 5 * 60 * 1000; // 5 minutes timeout
        xhr.send(formData);
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get seller's own gems with caching
   */
  async getMyGems(query: GemListQuery = {}): Promise<ApiResponse<GemListResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const params = this.buildQueryParams(query);
          const cacheKey = `my_gems_${params.toString()}`;

          return await handleServiceResponse(
            () => apiClient.get<GemListResponse>(`${this.config.baseUrl}/mine?${params}`),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.myGemsTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get user gems', error);
          throw ServiceUtils.handleError('get user gems', error);
        }
      },
      'gem_get_my_gems',
      {
        expectedDuration: 3000, // 3 seconds for seller gem lists
        priority: 'high' // Seller operations are important
      }
    );
  }

  /**
   * Get all gems with comprehensive filtering and caching
   */
  async getAllGems(query: GemListQuery = {}): Promise<ApiResponse<GemListResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const params = this.buildQueryParams(query);
          const cacheKey = `all_gems_${params.toString()}`;
          
          return await handleServiceResponse(
            () => apiClient.get<GemListResponse>(`${this.config.baseUrl}?${params}`),
            {
              cacheKey,
              cacheTtl: query.search ? 30000 : this.config.cacheOptions.allGemsTtl,
              useCache: !query.search, // Don't cache search results
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get all gems', error);
          throw ServiceUtils.handleError('get all gems', error);
        }
      },
      'gem_get_all_gems',
      {
        expectedDuration: query.search ? 4000 : 2500, // 4s for search, 2.5s for regular listings
        priority: 'high' // Public gem listings are critical for user experience
      }
    );
  }

  /**
   * Get all available filter options with caching
   */
  async getFilterOptions(): Promise<ApiResponse<{
      gemTypes: string[]
      colors: string[]
      shapes: string[]
      origins: string[]
      clarities: string[]
      treatments: string[]
      investmentGrades: string[]
      fluorescenceTypes: string[]
      polishGrades: string[]
      symmetryGrades: string[]
      priceRange: { min: number; max: number }
      caratRange: { min: number; max: number }
      labNames: string[]
  }>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const response = await handleServiceResponse(
            () => apiClient.get<{
              gemTypes: string[]
              colors: string[]
              shapes: string[]
              origins: string[]
              clarities: string[]
              treatments: string[]
              investmentGrades: string[]
              fluorescenceTypes: string[]
              polishGrades: string[]
              symmetryGrades: string[]
              priceRange: { min: number; max: number }
              caratRange: { min: number; max: number }
              labNames: string[]
            }>(`${this.config.baseUrl}/filters`),
            {
              cacheKey: 'gem_filter_options',
              cacheTtl: this.config.cacheOptions.filterOptionsTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to get filter options', error);
          throw ServiceUtils.handleError('get filter options', error);
        }
      },
      'gem_get_filter_options'
    );
  }

  /**
   * Helper method to build query parameters
   */
  private buildQueryParams(query: GemListQuery): URLSearchParams {
    const params = new URLSearchParams()
    
    // Basic filters
    if (query.status) params.append('status', query.status)
    if (query.gemType) params.append('gemType', query.gemType)
    if (query.color) params.append('color', query.color)
    if (query.shapeCut) params.append('shapeCut', query.shapeCut)
    if (query.clarity) params.append('clarity', query.clarity)
    if (query.origin) params.append('origin', query.origin)
    if (query.treatments) params.append('treatments', query.treatments)
    if (query.investmentGrade) params.append('investmentGrade', query.investmentGrade)
    if (query.fluorescence) params.append('fluorescence', query.fluorescence)
    if (query.polish) params.append('polish', query.polish)
    if (query.symmetry) params.append('symmetry', query.symmetry)
    if (query.listingType) params.append('listingType', query.listingType)
    if (query.rarity) params.append('rarity', query.rarity)
    
    // Array filters (converted to comma-separated strings)
    if (query.gemTypes && query.gemTypes.length > 0) {
      params.append('gemTypes', query.gemTypes.join(','))
    }
    if (query.colors && query.colors.length > 0) {
      params.append('colors', query.colors.join(','))
    }
    if (query.shapes && query.shapes.length > 0) {
      params.append('shapes', query.shapes.join(','))
    }
    if (query.origins && query.origins.length > 0) {
      params.append('origins', query.origins.join(','))
    }
    if (query.rarities && query.rarities.length > 0) {
      params.append('rarities', query.rarities.join(','))
    }
    if (query.investmentGrades && query.investmentGrades.length > 0) {
      params.append('investmentGrades', query.investmentGrades.join(','))
    }
    
    // Range filters
    if (query.minPrice) params.append('minPrice', query.minPrice.toString())
    if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString())
    if (query.minWeight) params.append('minWeight', query.minWeight.toString())
    if (query.maxWeight) params.append('maxWeight', query.maxWeight.toString())
    if (query.minCarat) params.append('minCarat', query.minCarat.toString())
    if (query.maxCarat) params.append('maxCarat', query.maxCarat.toString())
    
    // Boolean filters
    if (query.labCertified !== undefined) params.append('labCertified', query.labCertified.toString())
    if (query.featured !== undefined) params.append('featured', query.featured.toString())
    
    // Text search
    if (query.search) params.append('search', query.search)
    
    // Pagination and sorting
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortOrder) params.append('sortOrder', query.sortOrder)

    return params
  }

  /**
   * Get a specific gem by ID with caching and enhanced validation
   */
  async getGemById(id: string): Promise<ApiResponse<EnhancedGem>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          // Validate gem ID format (MongoDB ObjectId)
          const gemIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!gemIdPattern.test(id)) {
            return {
              success: false,
              message: 'Invalid gem ID format'
            };
          }

          return await handleServiceResponse(
            () => apiClient.get<EnhancedGem>(`${this.config.baseUrl}/${id}`),
            {
              cacheKey: `gem_${id}`,
              cacheTtl: this.config.cacheOptions.gemDetailsTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get gem by ID', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch gem'
          };
        }
      },
      'gem_get_by_id'
    );
  }

  /**
   * Delete a gem with enhanced validation and monitoring
   */
  async deleteGem(id: string): Promise<ApiResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          // Validate gem ID format (MongoDB ObjectId)
          const gemIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!gemIdPattern.test(id)) {
            return {
              success: false,
              message: 'Invalid gem ID format'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.delete(`${this.config.baseUrl}/${id}`),
            {
              retryOptions: {
                maxRetries: 1, // Deletion should have minimal retries
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Clear cache on successful deletion
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to delete gem', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to delete gem'
          };
        }
      },
      'gem_delete'
    );
  }

  /**
   * Update a gem listing with enhanced validation and monitoring
   */
  async updateGem(id: string, gemData: UpdateGemRequest): Promise<ApiResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          // Validate gem ID format (MongoDB ObjectId)
          const gemIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!gemIdPattern.test(id)) {
            return {
              success: false,
              message: 'Invalid gem ID format'
            };
          }

          // Validate update data
          if (!gemData || Object.keys(gemData).length === 0) {
            return {
              success: false,
              message: 'Update data is required'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.put(`${this.config.baseUrl}/${id}`, gemData),
            {
              retryOptions: {
                maxRetries: 1,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Clear cache on successful update
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to update gem', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update gem'
          };
        }
      },
      'gem_update'
    );
  }

  /**
   * Update gem availability with enhanced validation and monitoring
   */
  async updateAvailability(id: string, availability: 'available' | 'sold' | 'reserved'): Promise<ApiResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          // Validate gem ID format (MongoDB ObjectId)
          const gemIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!gemIdPattern.test(id)) {
            return {
              success: false,
              message: 'Invalid gem ID format'
            };
          }

          if (!['available', 'sold', 'reserved'].includes(availability)) {
            return {
              success: false,
              message: 'Valid availability status is required (available, sold, or reserved)'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.put(`${this.config.baseUrl}/${id}/availability`, { availability }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear cache on successful update
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to update gem availability', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update availability'
          };
        }
      },
      'gem_update_availability'
    );
  }

  /**
   * Get pending gems for admin review
   */
  async getPendingGems(query: GemListQuery = {}): Promise<ApiResponse<GemListResponse>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          const params = new URLSearchParams();
          
          if (query.page) params.append('page', query.page.toString());
          if (query.limit) params.append('limit', query.limit.toString());
          if (query.sortBy) params.append('sortBy', query.sortBy);
          if (query.sortOrder) params.append('sortOrder', query.sortOrder);

          const cacheKey = `pending_gems_${params.toString()}`;

          return await handleServiceResponse(
            () => apiClient.get<GemListResponse>(`${this.config.baseUrl}/pending?${params}`),
            {
              cacheKey,
              cacheTtl: this.config.cacheOptions.pendingGemsTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );
        } catch (error) {
          ServiceUtils.logger.error('Failed to get pending gems', error);
          throw ServiceUtils.handleError('get pending gems', error);
        }
      },
      'gem_get_pending_gems',
      {
        expectedDuration: 5000, // 5 seconds - admin operations can take longer
        priority: 'normal' // Admin operations are less critical for user experience
      }
    );
  }

  /**
   * Approve a gem listing (admin only) with enhanced validation and monitoring
   */
  async approveGem(id: string): Promise<ApiResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          // Validate gem ID format (MongoDB ObjectId)
          const gemIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!gemIdPattern.test(id)) {
            return {
              success: false,
              message: 'Invalid gem ID format'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.patch(`${this.config.baseUrl}/${id}/approve`),
            {
              retryOptions: {
                maxRetries: 1,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Clear cache on successful approval
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to approve gem', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to approve gem'
          };
        }
      },
      'gem_approve'
    );
  }

  /**
   * Reject a gem listing (admin only) with enhanced validation and monitoring
   */
  async rejectGem(id: string, reason?: string): Promise<ApiResponse> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          // Validate gem ID format (MongoDB ObjectId)
          const gemIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!gemIdPattern.test(id)) {
            return {
              success: false,
              message: 'Invalid gem ID format'
            };
          }

          // Validate reason if provided
          if (reason && reason.trim().length > 500) {
            return {
              success: false,
              message: 'Rejection reason cannot exceed 500 characters'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.patch(`${this.config.baseUrl}/${id}/reject`, { reason: reason?.trim() }),
            {
              retryOptions: {
                maxRetries: 1,
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          // Clear cache on successful rejection
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to reject gem', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to reject gem'
          };
        }
      },
      'gem_reject'
    );
  }

  /**
   * Toggle gem published status (seller only) with enhanced validation and monitoring
   */
  async togglePublished(id: string, published: boolean): Promise<ApiResponse<{ published: boolean }>> {
    return withPerformanceMonitoring(
      async () => {
        try {
          // Validate gem ID
          if (!id || id.trim().length === 0) {
            return {
              success: false,
              message: 'Gem ID is required'
            };
          }

          // Validate gem ID format (MongoDB ObjectId)
          const gemIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!gemIdPattern.test(id)) {
            return {
              success: false,
              message: 'Invalid gem ID format'
            };
          }

          if (typeof published !== 'boolean') {
            return {
              success: false,
              message: 'Published status must be a boolean value'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.patch<{ published: boolean }>(`${this.config.baseUrl}/${id}/publish`, { published }),
            {
              retryOptions: this.config.retryOptions
            }
          );

          // Clear cache on successful toggle
          if (response.success) {
            ServiceUtils.cache.clear();
          }

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to toggle gem published status', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to toggle published status'
          };
        }
      },
      'gem_toggle_published'
    );
  }

  /**
   * Refresh media URLs for a gem (for expired S3 signed URLs) with enhanced validation
   */
  async refreshGemMediaUrls(gemId: string): Promise<RefreshMediaUrlsResponse> {
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

          // Validate gem ID format (MongoDB ObjectId)
          const gemIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!gemIdPattern.test(gemId)) {
            return {
              success: false,
              message: 'Invalid gem ID format'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.get<RefreshMediaUrlsResponse>(`${this.config.baseUrl}/${gemId}/refresh-media`),
            {
              retryOptions: this.config.retryOptions
            }
          );

          return response.data || {
            success: false,
            message: 'Failed to refresh media URLs'
          };
        } catch (error) {
          ServiceUtils.logger.error('Failed to refresh media URLs', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to refresh media URLs'
          };
        }
      },
      'gem_refresh_media_urls'
    );
  }

  /**
   * Get gem details by ID with enhanced validation and caching
   */
  async getGemDetails(gemId: string): Promise<GemDetailsResponse> {
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

          // Validate gem ID format (MongoDB ObjectId)
          const gemIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!gemIdPattern.test(gemId)) {
            return {
              success: false,
              message: 'Invalid gem ID format'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.get<GemDetailsResponse>(`${this.config.baseUrl}/${gemId}`),
            {
              cacheKey: `gem_details_${gemId}`,
              cacheTtl: this.config.cacheOptions.gemDetailsTtl,
              useCache: true,
              retryOptions: this.config.retryOptions
            }
          );

          return response.data || { success: false, message: 'Failed to get gem details' };
        } catch (error) {
          ServiceUtils.logger.error('Failed to get gem details', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get gem details'
          };
        }
      },
      'gem_get_details'
    );
  }

  /**
   * Track a view for a specific gem (excludes owner views)
   */
  async trackGemView(gemId: string): Promise<ApiResponse<{ views: number; tracked: boolean }>> {
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

          // Validate gem ID format (MongoDB ObjectId)
          const gemIdPattern = /^[a-fA-F0-9]{24}$/;
          if (!gemIdPattern.test(gemId)) {
            return {
              success: false,
              message: 'Invalid gem ID format'
            };
          }

          const response = await handleServiceResponse(
            () => apiClient.post<{ views: number; tracked: boolean }>(`${this.config.baseUrl}/${gemId}/view`),
            {
              retryOptions: {
                maxRetries: 1, // Minimal retries for view tracking
                retryCondition: this.config.retryOptions.retryCondition
              }
            }
          );

          return response;
        } catch (error) {
          ServiceUtils.logger.error('Failed to track gem view', error);
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to track gem view'
          };
        }
      },
      'gem_track_view'
    );
  }

  /**
   * Format gem display name
   */
  formatGemName(gem: { gemType: string; color: string; weight?: { value: number; unit: string } }): string {
    let name = gem.gemType
    
    if (gem.color) {
      name = `${gem.color} ${name}`
    }
    
    if (gem.weight) {
      name += ` - ${gem.weight.value}${gem.weight.unit}`
    }
    
    return name
  }

  /**
   * Get service health status and configuration
   */
  getServiceHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    config: GemServiceConfig;
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
   * Clear service caches with optional pattern matching
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      ServiceUtils.logger.info('Clearing selective gem cache', { pattern });
      // In a real implementation, you'd have pattern-based cache clearing
    } else {
      ServiceUtils.cache.clear();
      ServiceUtils.logger.info('Cleared all gem service caches');
    }
  }

  /**
   * Initialize service with startup checks
   */
  protected initialize(): void {
    this.state.startTime = Date.now();
    ServiceUtils.logger.info('GemService initialized', {
      config: this.config,
      timestamp: new Date().toISOString()
    });
  }

  // Private validation methods
  private validateLabReportFile(file: File): void {
    if (file.size > this.config.validation.maxLabReportSize) {
      throw new Error(`File size must be less than ${this.config.validation.maxLabReportSize / 1024 / 1024}MB`);
    }

    if (!this.config.validation.allowedLabReportTypes.includes(file.type)) {
      throw new Error('Only PDF and image files (JPEG, PNG) are allowed');
    }
  }

  private validateGemData(gemData: CreateGemRequest): void {
    if (!gemData.gemType || gemData.gemType.trim().length === 0) {
      throw new Error('Gem type is required');
    }

    if (!gemData.color || gemData.color.trim().length === 0) {
      throw new Error('Gem color is required');
    }

    if (!gemData.weight || gemData.weight.value <= 0) {
      throw new Error('Valid gem weight is required');
    }

    if (gemData.price && (gemData.price <= 0 || gemData.price > this.config.validation.maxGemPrice)) {
      throw new Error(`Price must be between $1 and $${this.config.validation.maxGemPrice.toLocaleString()} if specified`);
    }
  }

  private validateFileUploadRequest(files: FileUploadRequest[]): void {
    if (!files || files.length === 0) {
      throw new Error('At least one file is required');
    }

    if (files.length > this.config.validation.maxFileUploadCount) {
      throw new Error(`Maximum ${this.config.validation.maxFileUploadCount} files allowed`);
    }

    for (const file of files) {
      if (!file.fileName || file.fileName.trim().length === 0) {
        throw new Error('File name is required');
      }

      if (!file.fileType || file.fileType.trim().length === 0) {
        throw new Error('File type is required');
      }

      if (!file.mediaType || !['image', 'video', 'lab-report'].includes(file.mediaType)) {
        throw new Error('Valid media type is required (image, video, or lab-report)');
      }
    }
  }

}

// Initialize the service with singleton pattern
class GemServiceSingleton extends GemService {
  private static instance: GemServiceSingleton;
  
  private constructor() {
    super();
    this.initialize();
  }
  
  public static getInstance(): GemServiceSingleton {
    if (!GemServiceSingleton.instance) {
      GemServiceSingleton.instance = new GemServiceSingleton();
    }
    return GemServiceSingleton.instance;
  }
  
  /**
   * Graceful shutdown cleanup
   */
  public shutdown(): void {
    ServiceUtils.logger.info('GemService shutting down');
    this.clearCache();
  }
}

// Export singleton instance
export const gemService = GemServiceSingleton.getInstance();

// Cleanup on page unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    gemService.shutdown();
  });
}

export default gemService; 