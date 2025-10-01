import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';
import { apiConfig, environment } from '@/config/environment';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    // Ensure we have a proper base URL for all environments
    const baseURL = this.getBaseURL();
    
    this.instance = axios.create({
      baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Get the appropriate base URL for the current environment
   */
  private getBaseURL(): string {
    // During build time (server-side), we need to ensure we have a valid URL
    // Check if we're in a server environment without proper base URL
    if (typeof window === 'undefined' && !apiConfig.baseUrl.startsWith('http')) {
      // We're on server-side and don't have a full URL, use a placeholder
      // This prevents the "Invalid URL" error during build
      return environment.isProduction ? 'http://34.229.40.129:5000/api' : 'http://localhost:5000/api';
    }
    
    // Use environment config which has proper fallbacks
    return apiConfig.baseUrl;
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          if (typeof window !== 'undefined') {
            // Check if we're on a public page that doesn't require authentication
            const publicPages = ['/', '/explore', '/about', '/contact', '/signin', '/signup', '/forgot-password', '/reset-password', '/sell', '/help', '/shipping', '/returns', '/sizing', '/privacy', '/terms', '/cookies', '/security'];
            const currentPath = window.location.pathname;
            const isPublicPage = publicPages.some(page => currentPath === page || currentPath.startsWith('/gem/') || currentPath.startsWith('/static/'));
            
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            
            // Only redirect to signin if we're not on a public page
            if (!isPublicPage) {
              window.location.href = '/signin';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig & { retry?: boolean }): Promise<ApiResponse<T>> {
    try {
      // Special handling for message endpoints - longer timeout
      const isMessageEndpoint = url.includes('/messages');
      const requestConfig = isMessageEndpoint ? {
        ...config,
        timeout: 45000, // 45 seconds for message endpoints
      } : config;

      const response: AxiosResponse<ApiResponse<T>> = await this.instance.get(url, requestConfig);
      return response.data;
    } catch (error: unknown) {
      // Retry logic for message endpoints on timeout
      const axiosError = error as { code?: string; message?: string };
      if (url.includes('/messages') && axiosError?.code === 'ECONNABORTED' && !config?.retry) {
        console.warn('Message request timed out, retrying...');
        return this.get<T>(url, { ...config, retry: true });
      }
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.instance.post(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.instance.put(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.instance.patch(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.instance.delete(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.instance.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config?.headers,
        },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async downloadBlob(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await this.instance.get(url, {
        ...config,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Blob download error:', error);
      throw error;
    }
  }

  private handleError<T>(error: unknown): ApiResponse<T> {
    console.error('API Error:', error);
    
    // Type guard for axios error
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
      };
      request?: unknown;
      message?: string;
    };
    
    if (axiosError.response) {
      // Server responded with error status
      const responseData = axiosError.response.data;
      return responseData && typeof responseData === 'object' && 'success' in responseData
        ? responseData as ApiResponse<T>
        : {
            success: false,
            message: responseData?.message || 'Server error occurred',
            error: responseData?.error || 'SERVER_ERROR'
          };
    } else if (axiosError.request) {
      // Request was made but no response received
      return {
        success: false,
        message: 'Network error occurred. Please check your connection.',
        error: 'NETWORK_ERROR'
      };
    } else {
      // Something else happened
      return {
        success: false,
        message: axiosError.message || 'An unexpected error occurred',
        error: 'UNKNOWN_ERROR'
      };
    }
  }
}

const apiClient = new ApiClient();
export default apiClient;
