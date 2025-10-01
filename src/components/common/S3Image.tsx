'use client'

import { useState, useEffect, useRef } from 'react'
import Image, { ImageProps } from 'next/image'
import { User, Gem } from 'lucide-react'

interface S3ImageProps extends Omit<ImageProps, 'onError' | 'fill'> {
  fallbackSrc?: string
  showFallbackIcon?: boolean
  fallbackText?: string
  onError?: (error: string) => void
  fill?: boolean
  useSignedUrlFallback?: boolean // Enable signed URL fallback for private S3 files
}

export default function S3Image({
  src,
  alt,
  fallbackSrc = '/images/gem-placeholder.svg',
  showFallbackIcon = false,
  fallbackText,
  onError,
  className,
  useSignedUrlFallback = true, // Enable by default for user avatars
  ...props
}: S3ImageProps) {
  const [imageError, setImageError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc)
  const [isLoading, setIsLoading] = useState(true)
  const [triedSignedUrl, setTriedSignedUrl] = useState(false)
  const hasLoadedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to request signed URL
  const requestSignedUrl = async (imageUrl: string): Promise<string | null> => {
    try {
      // Extract S3 key from CloudFront URL or direct S3 URL
      let s3Key: string | null = null;
      
      if (imageUrl.includes('cloudfront.net')) {
        // Extract key from CloudFront URL: https://d22kl0tvt68mhk.cloudfront.net/users/profile/avatar-123.png
        const urlParts = imageUrl.split('.cloudfront.net/');
        s3Key = urlParts[1];
      } else if (imageUrl.includes('s3.') && imageUrl.includes('amazonaws.com')) {
        // Extract key from S3 URL: https://bucket.s3.region.amazonaws.com/key
        const match = imageUrl.match(/amazonaws\.com\/(.+)$/);
        s3Key = match?.[1] || null;
      } else if (!imageUrl.includes('http')) {
        // It's already an S3 key
        s3Key = imageUrl;
      }

      if (!s3Key) return null;

      const response = await fetch('/api/user/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ fileKey: s3Key }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.signedUrl || null;
      }
    } catch (error) {
      console.warn('Failed to request signed URL:', error);
    }
    return null;
  };

  // Reset states when src changes
  useEffect(() => {
    if (!src) return
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setCurrentSrc(src)
    setImageError(false)
    setIsLoading(true)
    setTriedSignedUrl(false)
    hasLoadedRef.current = false

    // Set a timeout for truly stuck loads only
    timeoutRef.current = setTimeout(() => {
      // Only trigger if image hasn't loaded successfully
      if (!hasLoadedRef.current) {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
          setImageError(false)
          setIsLoading(true)
        } else {
          setImageError(true)
          setIsLoading(false)
          onError?.(`Image load timeout: ${src}`)
        }
      }
    }, 15000) // 15 second timeout for truly stuck loads

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [src, fallbackSrc, onError, currentSrc])

  // Early return if no src provided
  if (!src && !fallbackSrc) {
    if (showFallbackIcon) {
      return (
        <div className={`flex items-center justify-center bg-primary/10 text-primary ${className}`}>
          <User className="w-1/2 h-1/2" />
        </div>
      )
    }
    return (
      <div className={`flex items-center justify-center bg-primary/10 text-primary text-sm font-medium ${className}`}>
        {fallbackText || 'No Image'}
      </div>
    )
  }

  const handleError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    
    // Clear timeout since we're handling the error
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Try signed URL fallback for CloudFront/S3 errors before fallback image
    if (useSignedUrlFallback && !triedSignedUrl && src && typeof src === 'string' && (src.includes('cloudfront.net') || src.includes('s3.'))) {
      console.log('🔄 Trying signed URL fallback for:', src);
      setTriedSignedUrl(true);
      
      try {
        const signedUrl = await requestSignedUrl(src);
        if (signedUrl && signedUrl !== currentSrc) {
          setCurrentSrc(signedUrl);
          setImageError(false);
          setIsLoading(true);
          hasLoadedRef.current = false;
          return;
        }
      } catch (error) {
        console.warn('Signed URL fallback failed:', error);
      }
    }
    
    // If we haven't tried the fallback image yet, try it
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setImageError(false)
      setIsLoading(true)
      hasLoadedRef.current = false // Reset for fallback attempt
      return
    }
    
    // If fallback also failed, show error state
    setImageError(true)
    setIsLoading(false)
    hasLoadedRef.current = false
    onError?.(`Failed to load image: ${src}`)
    
    // Hide the image element
    target.style.display = 'none'
  }

  const handleLoad = () => {
    hasLoadedRef.current = true // Mark as successfully loaded
    setIsLoading(false)
    // Clear timeout since image loaded successfully
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  // If we're in error state and should show fallback icon
  if (imageError && showFallbackIcon) {
    return (
      <div className={`flex items-center justify-center bg-primary/10 text-primary ${className}`}>
        <User className="w-1/2 h-1/2" />
      </div>
    )
  }

  // If we're in error state and should show fallback text
  if (imageError && fallbackText) {
    return (
      <div className={`flex items-center justify-center bg-primary/10 text-primary text-sm font-medium ${className}`}>
        {fallbackText}
      </div>
    )
  }

  // Handle fill prop specially to avoid height warnings
  const { fill, width, height, ...imageProps } = props
  
  // Ensure we always pass a non-empty alt to Next/Image
  const resolvedAlt = typeof alt === 'string' && alt.trim() ? alt : (fallbackText || 'Image')
  
  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      <Image
        src={currentSrc}
        alt={resolvedAlt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        priority={true}
        unoptimized={true}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        {...imageProps}
        style={{
          ...(imageProps.style || {}),
          ...(fill ? { objectFit: 'cover' } : {})
        }}
      />
      {/* Show loading state overlay for small images */}
      {isLoading && ((width && Number(width) <= 64) || fill) && (
        <div className={`absolute inset-0 flex items-center justify-center bg-primary/10 text-primary animate-pulse ${className}`}>
          {fallbackText ? (
            <span className="text-sm font-medium">{fallbackText}</span>
          ) : (
            <Gem className="w-1/2 h-1/2" />
          )}
        </div>
      )}
    </div>
  )
} 