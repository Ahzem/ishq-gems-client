'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadLabReportProps } from '@/types'

export default function UploadLabReport({ 
  labReport, 
  onLabReportChange, 
  isLoadingStoredReport = false,
  storedReportInfo = null,
  onNewFileSelected
}: UploadLabReportProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, JPEG, PNG, and WebP files are allowed'
    }
    if (file.size > maxSize) {
      return 'File size must be less than 10MB'
    }
    return null
  }

  const handleFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    
    setError(null)
    
    // Call the deletion handler if provided (for replacing existing files)
    if (onNewFileSelected) {
      try {
        await onNewFileSelected()
      } catch (error) {
        console.warn('Failed to handle previous file deletion:', error)
        // Continue with upload even if deletion fails
      }
    }
    
    onLabReportChange(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      await handleFile(file)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      await handleFile(file)
    }
  }

  const removeFile = () => {
    onLabReportChange(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Lab Certificate Upload</h3>
        <span className="text-sm text-muted-foreground">(Optional)</span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State for Stored Report */}
      {isLoadingStoredReport && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Loading previous lab report...
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Restoring your previously uploaded certificate and extracting data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!labReport ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200',
            dragActive 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-border hover:border-primary/50'
          )}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-foreground mb-1">
                Upload Lab Certificate
              </p>
              <p className="text-sm text-muted-foreground">
                Drag and drop your certificate here, or click to browse
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Choose File
            </button>
            
            <div className="text-xs text-muted-foreground">
              <p>Supported formats: PDF, JPEG, PNG, WebP</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        </div>
      ) : (
        // File Preview
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">{labReport.name}</p>
                <p className="text-sm text-muted-foreground">
                  {storedReportInfo ? 
                    `${(storedReportInfo.fileSize / (1024 * 1024)).toFixed(1)}MB` : 
                    `${(labReport.size / (1024 * 1024)).toFixed(1)}MB`
                  }
                </p>
                {storedReportInfo && (
                  <p className="text-xs text-blue-600 mt-1">
                    📁 Restored from previous session
                  </p>
                )}
              </div>
            </div>
            <button
              title="Remove"
              type="button"
              onClick={removeFile}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        title="Lab Report"
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Guidelines */}
      {/* <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <h4 className="font-semibold text-foreground">Professional Photography Guidelines</h4>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">•</span>
            <span>Use natural daylight or professional gem photography lighting for optimal color representation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">•</span>
            <span>Capture multiple angles: overhead, profile, and pavilion views to showcase the gem's brilliance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">•</span>
            <span>Photograph against both neutral and contrasting backgrounds to highlight color and fire</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">•</span>
            <span>Include detailed close-ups showing clarity characteristics and any inclusions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">•</span>
            <span>The first image will serve as your primary listing photo and appears in search results</span>
          </li>
        </ul>
        <div className="mt-4 pt-3 border-t border-primary/10">
          <p className="text-xs text-muted-foreground italic">
            High-quality images significantly increase buyer engagement and sale conversion rates.
          </p>
        </div>
      </div> */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <h4 className="font-semibold text-foreground">Certificate Guidelines</h4>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">•</span>
            <span>Upload the official lab certificate from recognized institutions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">•</span>
            <span>Ensure the certificate is clear and readable</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">•</span>
            <span>Accepted labs: GIA, SSEF, Gübelin, AIGS, GRS, etc.</span>
          </li>
        </ul>
        <div className="mt-4 pt-3 border-t border-primary/10">
          <p className="text-xs text-muted-foreground italic">
            Certificate should match the gemstone details provided
          </p>
        </div>
      </div>
    </div>
  )
} 