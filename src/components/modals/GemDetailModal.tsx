'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, FileText, MapPin, Weight, Calendar, DollarSign, Package, Shield, ExternalLink } from 'lucide-react'
import S3Image from '@/components/common/S3Image'
import { cn } from '@/lib/utils'
import type { EnhancedGem } from '@/types'

interface GemDetailModalProps {
  isOpen: boolean
  onClose: () => void
  gemId: string
  onEdit?: (gemId: string) => void
  onDelete?: (gemId: string) => void
}

export default function GemDetailModal({
  isOpen,
  onClose,
  gemId,
  onEdit,
  onDelete
}: GemDetailModalProps) {
  const [gem, setGem] = useState<EnhancedGem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Memoize fetchGemDetails to fix useEffect dependency warning
  const fetchGemDetails = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Import gem service dynamically to avoid SSR issues
      const { default: gemService } = await import('@/services/gem.service')
      const response = await gemService.getGemById(gemId)
      
      if (response.success && response.data) {
        setGem(response.data)
      } else {
        setError(response.message || 'Failed to fetch gem details')
      }
    } catch (err) {
      console.error('Error fetching gem details:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch gem details')
    } finally {
      setLoading(false)
    }
  }, [gemId])

  // Fetch gem details when modal opens
  useEffect(() => {
    if (isOpen && gemId) {
      fetchGemDetails()
    }
  }, [isOpen, gemId, fetchGemDetails])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setGem(null)
      setError(null)
      setCurrentImageIndex(0)
    }
  }, [isOpen])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Not set'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'verified': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      case 'sold': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="text-xl font-semibold text-foreground">Gem Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading gem details...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 mb-2">Error loading gem details</div>
              <div className="text-sm text-muted-foreground mb-4">{error}</div>
              <button
                onClick={fetchGemDetails}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : gem ? (
            <div className="p-6 space-y-6">
              {/* Gem Header */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Image Gallery */}
                <div className="lg:w-1/2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-secondary/20 mb-4">
                    {gem.media && gem.media.length > 0 ? (
                      <S3Image
                        src={gem.media[currentImageIndex]?.url || gem.media[0].url}
                        alt={`${gem.gemType} - ${gem.color}`}
                        fill
                        className="object-cover"
                        fallbackText={gem.gemType.charAt(0)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Image thumbnails */}
                  {gem.media && gem.media.filter(m => m.type === 'image').length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {gem.media.filter(m => m.type === 'image').map((media, index) => (
                        <button
                          key={media._id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                            index === currentImageIndex ? 'border-primary' : 'border-border'
                          )}
                        >
                          <S3Image
                            src={media.url}
                            alt={`${gem.gemType} thumbnail ${index + 1}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            fallbackText={(index + 1).toString()}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gem Information */}
                <div className="lg:w-1/2 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {gem.gemType} - {gem.color}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium capitalize',
                        getStatusColor(gem.status)
                      )}>
                        {gem.status}
                      </span>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        gem.listingType === 'direct-sale' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                      )}>
                        {gem.listingType === 'direct-sale' ? 'Fixed Price' : 'Auction'}
                      </span>
                    </div>
                  </div>

                  {/* Price Information */}
                  <div className="bg-secondary/20 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground">Price</div>
                          <div className="font-medium">{formatPrice(gem.price)}</div>
                        </div>
                      </div>
                      {gem.listingType === 'auction' && (
                        <>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-muted-foreground">Starting Bid</div>
                              <div className="font-medium">{formatPrice(gem.startingBid)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-muted-foreground">Reserve Price</div>
                              <div className="font-medium">{formatPrice(gem.reservePrice)}</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-3">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(gem._id)}
                        className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                      >
                        Edit Listing
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(gem._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Physical Properties */}
                <div className="bg-secondary/10 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Physical Properties
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Weight className="w-3 h-3" />
                        Weight:
                      </span>
                      <span className="font-medium">{gem.weight.value} {gem.weight.unit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Origin:
                      </span>
                      <span className="font-medium">{gem.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clarity:</span>
                      <span className="font-medium">{gem.clarity}</span>
                    </div>
                    {gem.treatments && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Treatments:</span>
                        <span className="font-medium">{gem.treatments}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lab Information */}
                <div className="bg-secondary/10 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Certification
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lab:</span>
                      <span className="font-medium">{gem.labName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Report #:
                      </span>
                      <span className="font-medium">{gem.reportNumber}</span>
                    </div>
                    {gem.media?.find(m => m.type === 'lab-report') && (
                      <div className="pt-2">
                        <a
                          href={gem.media.find(m => m.type === 'lab-report')?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Report
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Listing Information */}
                <div className="bg-secondary/10 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3">Listing Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Submitted:
                      </span>
                      <span className="font-medium">{formatDate(gem.submittedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span className="font-medium capitalize">{gem.shippingMethod.replace(/-/g, ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Comments */}
              {gem.additionalComments && (
                <div className="bg-secondary/10 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3">Additional Comments</h4>
                  <p className="text-sm text-muted-foreground">{gem.additionalComments}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
} 