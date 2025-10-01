'use client'

import { useState, useEffect } from 'react'
import { Package, Eye, Edit, Trash2, Clock, CheckCircle2, XCircle, AlertCircle, Globe, EyeOff, Lock, Star } from 'lucide-react'

import S3Image from '@/components/common/S3Image'
import Toast from '@/components/alerts/Toast'
import gemService from '@/services/gem.service'

interface GemListingCardProps {
  gem: {
    _id: string
    gemType: string
    color: string
    weight: { value: number; unit: string }
    price?: number
    status: 'pending' | 'verified' | 'rejected' | 'published' | 'sold'
    listingType: 'direct-sale' | 'auction'
    views: number
    submittedAt: string
    published?: boolean
    // Admin/Platform gem fields
    isPlatformGem?: boolean
    sellerType?: 'Ishq' | 'Third-Party'
    adminSubmitted?: boolean
    autoVerified?: boolean
    media?: Array<{
      _id: string
      type: 'image' | 'video' | 'lab-report'
      url: string
      isPrimary: boolean
      order: number
    }>
  }
  onEdit?: (gemId: string) => void
  onDelete?: (gemId: string) => void
  onViewDetails?: (gemId: string) => void
  onRefresh?: () => void
  onTogglePublished?: (gemId: string, published: boolean) => Promise<void>
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending Review',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
  },
  verified: {
    icon: CheckCircle2,
    label: 'Verified',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  },
  published: {
    icon: CheckCircle2,
    label: 'Published',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
  },
  sold: {
    icon: AlertCircle,
    label: 'Sold',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

export default function GemListingCard({ gem, onEdit, onDelete, onViewDetails, onRefresh, onTogglePublished }: GemListingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [published, setPublished] = useState(gem.published ?? false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const primaryImage = gem.media?.find(m => m.type === 'image' && m.isPrimary) || 
                      gem.media?.find(m => m.type === 'image')

  const statusInfo = statusConfig[gem.status]
  const StatusIcon = statusInfo.icon

  // Sync local published state with prop changes
  useEffect(() => {
    setPublished(gem.published ?? false)
  }, [gem.published])

  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(gem._id)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting gem:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePublished = async () => {
    setIsToggling(true)
    try {
      if (onTogglePublished) {
        // Use parent's handler (e.g., for admin gems)
        await onTogglePublished(gem._id, !published)
        setPublished(!published)
        setToast({
          message: !published
            ? 'Gem is now live on the marketplace!' 
            : 'Gem has been hidden from the marketplace',
          type: 'success'
        })
      } else {
        // Use default service call
        const response = await gemService.togglePublished(gem._id, !published)
        if (response.success && response.data) {
          // Update local state with the actual server response
          const updatedPublished = response.data.published
          setPublished(updatedPublished)
          setToast({
            message: updatedPublished 
              ? 'Gem is now live on the marketplace!' 
              : 'Gem has been hidden from the marketplace',
            type: 'success'
          })
          onRefresh?.() // Refresh the parent list if available
        }
      }
    } catch (error) {
      console.error('Error toggling published status:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update published status'
      setToast({
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setIsToggling(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Price not set'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <div className="group bg-card border border-border/30 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
      {/* Image */}
      <div 
        className="aspect-square w-full bg-secondary/20 flex items-center justify-center relative overflow-hidden rounded-t-xl min-h-[200px]"
        style={{ aspectRatio: '1 / 1' }}
      >
        {primaryImage?.url ? (
          <S3Image
            src={primaryImage.url}
            alt={`${gem.gemType} - ${gem.color}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fallbackText={gem.gemType.charAt(0)}
            onError={(error) => console.warn('Gem image load error:', error)}
          />
        ) : (
          // Fallback when no image URL is available
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="text-center">
              <Package className="h-12 w-12 text-primary/60 mx-auto mb-2" />
              <div className="text-xs text-muted-foreground">{gem.gemType}</div>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusInfo.className}`}>
            <StatusIcon className="h-3 w-3" />
            <span>{statusInfo.label}</span>
          </div>
          
          {/* Publication Status Badge */}
          {['verified', 'published'].includes(gem.status) && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
              published 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {published ? (
                <>
                  <Globe className="h-3 w-3" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" />
                  <span>Hidden</span>
                </>
              )}
            </div>
          )}

          {/* Ishq Gems Badge */}
          {gem.isPlatformGem && (
            <div className="px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
              <Star className="h-3 w-3" />
              <span>Ishq Gems</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">
              {gem.gemType} - {gem.color}
            </h3>
            <p className="text-sm text-muted-foreground">
              {gem.weight.value} {gem.weight.unit}
            </p>
            <p className="text-lg font-bold text-primary mt-1">
              {formatPrice(gem.price)}
            </p>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <span className={`px-2 py-1 rounded-full ${
              gem.listingType === 'direct-sale' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
            }`}>
              {gem.listingType === 'direct-sale' ? 'Fixed Price' : 'Auction'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{gem.views} views</span>
          </div>
          <span>•</span>
          <span>Added {formatDate(gem.submittedAt)}</span>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {/* Publish Toggle - Only for verified gems */}
          {['verified', 'published'].includes(gem.status) && (
            <div className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
              <div className="flex items-center space-x-2">
                {published ? (
                  <Globe className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                )}
                <span className="text-sm font-medium">
                  {published ? 'Published on Marketplace' : 'Hidden from Marketplace'}
                </span>
              </div>
              <button
                onClick={handleTogglePublished}
                disabled={isToggling}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  published ? 'bg-green-600' : 'bg-gray-200'
                } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    published ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Only show message for non-verified gems */}
          {!['verified', 'published'].includes(gem.status) && (
            <div className="flex items-center space-x-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <Lock className="h-4 w-4 text-amber-600" />
              <span className="text-xs text-amber-700 dark:text-amber-400">
                Only verified gems can be published
              </span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewDetails?.(gem._id)}
              className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
            
            {gem.status !== 'sold' && (
              <button
                onClick={() => onEdit?.(gem._id)}
                className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-secondary/50 text-foreground rounded-lg hover:bg-secondary transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
                       
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              aria-label="Delete listing"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Delete Listing
            </h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete this {gem.gemType} listing? This action cannot be undone.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-foreground border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => setToast(null)}
            duration={4000}
          />
        </div>
      )}
    </div>
  )
} 