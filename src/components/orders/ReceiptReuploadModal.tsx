'use client'

import { useState } from 'react'
import { X, Upload, AlertCircle, CheckCircle2, FileText, Camera, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ReceiptReuploadModalProps {
  isOpen: boolean
  onClose: () => void
  orderNumber: string
  requestNotes?: string
  onSuccess: () => void
}

export default function ReceiptReuploadModal({
  isOpen,
  onClose,
  orderNumber,
  requestNotes,
  onSuccess
}: ReceiptReuploadModalProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image (JPG, PNG, WebP) or PDF file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setUploadError(null)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('receipt', selectedFile)
      formData.append('orderNumber', orderNumber)

      const response = await fetch('/api/orders/upload-receipt', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      setUploadSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)

    } catch {
      setUploadError('Failed to upload receipt. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setUploadError(null)
    setUploadSuccess(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upload New Payment Receipt
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Order #{orderNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Request Notes */}
          {requestNotes && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Reason for Re-upload Request:
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {requestNotes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Guidelines */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              📋 Upload Guidelines
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Ensure the receipt is clear and readable</li>
              <li>• All transaction details should be visible</li>
              <li>• Amount and date should match your order</li>
              <li>• Supported formats: JPG, PNG, WebP, PDF</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </div>

          {/* Upload Area */}
          {!selectedFile && !uploadSuccess && (
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Drop your receipt here, or click to browse
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    JPG, PNG, WebP, or PDF up to 10MB
                  </p>
                </div>

                {/* Quick Photo Tips */}
                <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400 mt-4">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Take a photo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>From mobile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Upload file</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected File Preview */}
          {selectedFile && !uploadSuccess && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetUpload}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Image Preview */}
              {selectedFile.type.startsWith('image/') && (
                <div className="mb-4">
                  <Image
                    width={800}
                    height={600}
                    src={URL.createObjectURL(selectedFile)}
                    alt="Receipt preview"
                    className="max-w-full h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </div>
          )}

          {/* Upload Success */}
          {uploadSuccess && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Receipt Uploaded Successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your payment receipt has been submitted for verification. We&apos;ll notify you once it&apos;s reviewed.
              </p>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {selectedFile && !uploadSuccess && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={cn(
                  "flex-1 px-4 py-3 rounded-lg font-medium transition-colors",
                  uploading
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90"
                )}
              >
                {uploading ? 'Uploading...' : 'Upload Receipt'}
              </button>
              <button
                onClick={resetUpload}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
