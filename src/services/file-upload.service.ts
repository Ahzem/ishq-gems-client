import apiClient from '@/lib/api-client'
import { ApiResponse } from '@/types'

export interface FileUploadResponse {
  url: string      // S3 key for storage
  key: string      // S3 key (same as url)
  size: number
  type: string
  fullUrl: string  // Full CloudFront URL for preview
}

class FileUploadService {
  /**
   * Upload a file to S3
   */
  async uploadFile(file: File, folder: string = 'store'): Promise<ApiResponse<FileUploadResponse>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await apiClient.post<FileUploadResponse>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  /**
   * Upload store logo
   */
  async uploadStoreLogo(file: File): Promise<ApiResponse<FileUploadResponse>> {
    return this.uploadFile(file, 'store/logos')
  }

  /**
   * Upload store banner
   */
  async uploadStoreBanner(file: File): Promise<ApiResponse<FileUploadResponse>> {
    return this.uploadFile(file, 'store/banners')
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(url: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await apiClient.delete('/upload', {
        data: { url }
      })

      return response as ApiResponse<{ success: boolean }>
    } catch (error) {
      console.error('File delete error:', error)
      throw error
    }
  }
}

const fileUploadService = new FileUploadService()
export default fileUploadService
