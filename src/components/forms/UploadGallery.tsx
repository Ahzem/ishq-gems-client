'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Eye, Play, Image as ImageIcon, Video, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UPLOAD_LIMITS } from '@/lib/constants'
import Image from 'next/image'
import type { UploadGalleryProps } from '@/types'

export default function UploadGallery({ images, videos, onImagesChange, onVideosChange }: UploadGalleryProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({})
  const [errors, setErrors] = useState<string[]>([])
  
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File, type: 'image' | 'video'): string | null => {
    if (type === 'image') {
      if (!UPLOAD_LIMITS.allowedImageTypes.includes(file.type as 'image/jpeg' | 'image/png' | 'image/webp')) {
        return `${file.name}: Only JPEG, PNG, and WebP images are allowed`
      }
      if (images.length >= 5) {
        return `Maximum 5 images allowed`
      }
      if (file.size > UPLOAD_LIMITS.maxImageSize) {
        return `${file.name}: Image size must be less than 5MB`
      }
    } else if (type === 'video') {
      if (!file.type.startsWith('video/')) {
        return `${file.name}: Only video files are allowed`
      }
      if (videos.length >= 2) {
        return `Maximum 2 videos allowed`
      }
      if (file.size > UPLOAD_LIMITS.maxVideoSize) {
        return `${file.name}: Video size must be less than 50MB`
      }
    }
    
    return null
  }, [images.length, videos.length])

  const createPreviewUrl = useCallback((file: File): string => {
    const existingUrl = previewUrls[file.name]
    if (existingUrl) {
      return existingUrl
    }
    
    const url = URL.createObjectURL(file)
    setPreviewUrls(prev => ({ ...prev, [file.name]: url }))
    return url
  }, [previewUrls])

  const handleFiles = useCallback((fileList: FileList, type: 'image' | 'video') => {
    const newErrors: string[] = []
    const validFiles: File[] = []

    Array.from(fileList).forEach(file => {
      const error = validateFile(file, type)
      if (error) {
        newErrors.push(error)
      } else {
        validFiles.push(file)
        createPreviewUrl(file)
      }
    })

    setErrors(newErrors)

    if (validFiles.length > 0) {
      if (type === 'image') {
        onImagesChange([...images, ...validFiles])
      } else {
        onVideosChange([...videos, ...validFiles])
      }
    }
  }, [images, videos, onImagesChange, onVideosChange, createPreviewUrl, validateFile])

  const removeFile = (fileName: string, type: 'image' | 'video') => {
    if (type === 'image') {
      onImagesChange(images.filter(img => img.name !== fileName))
    } else {
      onVideosChange(videos.filter(vid => vid.name !== fileName))
    }
    
    // Clean up preview URL
    if (previewUrls[fileName]) {
      URL.revokeObjectURL(previewUrls[fileName])
      setPreviewUrls(prev => {
        const newUrls = { ...prev }
        delete newUrls[fileName]
        return newUrls
      })
    }
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      const imageFiles = files.filter(file => file.type.startsWith('image/'))
      const videoFiles = files.filter(file => file.type.startsWith('video/'))
      
      if (imageFiles.length > 0) {
        const fileList = new DataTransfer()
        imageFiles.forEach(file => fileList.items.add(file))
        handleFiles(fileList.files, 'image')
      }
      
      if (videoFiles.length > 0) {
        const fileList = new DataTransfer()
        videoFiles.forEach(file => fileList.items.add(file))
        handleFiles(fileList.files, 'video')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-800">Upload Errors</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
          dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border hover:border-primary/50'
        )}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Video className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div>
            <p className="text-lg font-medium text-foreground mb-1">
              Drag and drop your files here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse your computer
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              Add Images
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Video className="w-4 h-4" />
              Add Videos
            </button>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Images: Up to 5 files, max 5MB each (JPEG, PNG, WebP)</p>
            <p>• Videos: Up to 2 files, max 50MB each (MP4, MOV, AVI)</p>
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        title="Images"
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files, 'image')}
      />
      <input
        title="Videos"
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files, 'video')}
      />

      {/* Images Preview */}
      {images.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Images ({images.length}/5)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image.name} className="relative group">
                <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
                  <Image
                    src={previewUrls[image.name]}
                    alt={`Preview ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    title="View"
                    type="button"
                    onClick={() => {
                      const url = previewUrls[image.name]
                      if (url) {
                        window.open(url, '_blank')
                      }
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  <button
                    title="Remove"
                    type="button"
                    onClick={() => removeFile(image.name, 'image')}
                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                {/* File info */}
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className="truncate">{image.name}</p>
                  <p>{(image.size / (1024 * 1024)).toFixed(1)}MB</p>
                </div>
                
                {/* Primary badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Preview */}
      {videos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-500" />
            Videos ({videos.length}/2)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div key={video.name} className="relative group">
                <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                  <video
                    src={previewUrls[video.name]}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                </div>
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    title="Play"
                    type="button"
                    onClick={() => {
                      const url = previewUrls[video.name]
                      if (url) {
                        window.open(url, '_blank')
                      }
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4 text-white" />
                  </button>
                  <button
                    title="Remove"
                    type="button"
                    onClick={() => removeFile(video.name, 'video')}
                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                {/* File info */}
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className="truncate">{video.name}</p>
                  <p>{(video.size / (1024 * 1024)).toFixed(1)}MB</p>
                </div>
                
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="p-4 bg-white/20 rounded-full">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
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
            <span>Capture multiple angles: overhead, profile, and pavilion views to showcase the gem&apos;s brilliance</span>
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
      </div>
    </div>
  )
} 