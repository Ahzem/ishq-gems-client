'use client'

import { useState } from 'react'
import { Edit, Eye, Trash2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfirm, useLoader, useAlert } from '@/components/providers'

interface GemListingActionsProps {
  gemId: string
  gemName: string
  gemType: string
  gemPrice?: number
  gemStatus: string
  onEdit?: (gemId: string) => void
  onView?: (gemId: string) => void
  onDelete?: (gemId: string) => Promise<void>
  isDeleting?: boolean
  showDropdown?: boolean
  className?: string
}

export default function GemListingActions({
  gemId,
  gemName,
  gemType,
  gemPrice,
  gemStatus,
  onEdit,
  onView,
  onDelete,
  isDeleting = false,
  showDropdown = false,
  className
}: GemListingActionsProps) {
  const [showDropdownMenu, setShowDropdownMenu] = useState(false)
  
  const showConfirm = useConfirm()
  const { showLoader, hideLoader } = useLoader()
  const showAlert = useAlert()

  const handleDelete = async () => {
    if (!onDelete) return
    
    const confirmed = await showConfirm({
      title: 'Delete Gem Listing',
      message: `Are you sure you want to delete "${gemName} ${gemType}" (${formatPrice(gemPrice)})? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    })
    
    if (!confirmed) return
    
    showLoader({
      message: 'Deleting gem...',
      subMessage: 'Please wait while we remove your listing'
    })
    
    try {
      await onDelete(gemId)
      hideLoader()
      showAlert({
        type: 'success',
        message: 'Gem listing deleted successfully'
      })
    } catch (_error) {
      hideLoader()
      showAlert({
        type: 'error',
        message: 'Failed to delete gem listing'
      })
      console.error('Error deleting gem:', _error)
    }
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Price not set'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const canEdit = gemStatus !== 'sold'
  const canDelete = ['pending', 'rejected'].includes(gemStatus)

  if (showDropdown) {
    return (
      <>
        <div className={cn("relative", className)}>
          <button
            onClick={() => setShowDropdownMenu(!showDropdownMenu)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showDropdownMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdownMenu(false)}
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                {onView && (
                  <button
                    onClick={() => {
                      onView(gemId)
                      setShowDropdownMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    View Details
                  </button>
                )}
                
                {onEdit && canEdit && (
                  <button
                    onClick={() => {
                      onEdit(gemId)
                      setShowDropdownMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Edit Listing
                  </button>
                )}
                
                {onDelete && canDelete && (
                  <button
                    onClick={() => {
                      handleDelete()
                      setShowDropdownMenu(false)
                    }}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>


      </>
    )
  }

  // Inline buttons layout
  return (
    <>
      <div className={cn("flex items-center space-x-2", className)}>
        {onView && (
          <button
            onClick={() => onView(gemId)}
            className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
            title="View details"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </button>
        )}
        
        {onEdit && canEdit && (
          <button
            onClick={() => onEdit(gemId)}
            className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-secondary/50 text-foreground rounded-lg hover:bg-secondary transition-colors text-sm"
            title="Edit listing"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
                 
        {onDelete && canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-50 text-sm"
            title="Delete listing"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  )
} 