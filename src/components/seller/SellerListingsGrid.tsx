'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Grid, 
  List, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Package,
  ArrowUpDown,
  Eye,
  MapPin,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SellerGem } from '@/types'
import sellerService from '@/services/seller.service'
import Spinner from '@/components/loading/Spinner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface MediaItem {
  type: 'image' | 'video' | 'document'
  url: string
  isPrimary?: boolean
  alt?: string
}

interface SellerListingsGridProps {
  sellerId: string
  className?: string
}

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' }
]

export default function SellerListingsGrid({ sellerId, className }: SellerListingsGridProps) {
  const [gems, setGems] = useState<SellerGem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalGems, setTotalGems] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const gemsPerPage = 12

  const fetchGems = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await sellerService.getSellerGems(
        sellerId,
        currentPage,
        gemsPerPage,
        sortBy
      )

      if (response.success && response.data) {
        setGems(response.data.gems)
        setTotalPages(response.data.pagination.pages)
        setTotalGems(response.data.pagination.total)
      } else {
        setError(response.message || 'Failed to fetch gems')
      }
    } catch (error) {
      console.error('Error fetching gems:', error)
      setError('Failed to fetch gems')
    } finally {
      setIsLoading(false)
    }
  }, [sellerId, currentPage, sortBy])

  useEffect(() => {
    fetchGems()
  }, [fetchGems])

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const filteredGems = gems.filter(gem => {
    // If status is available, only show gems with allowed statuses
    if (gem.status) {
      const allowedStatuses = ['active', 'verified', 'published', 'sold']
      if (!allowedStatuses.includes(gem.status)) return false
    }
    
    // Apply search filter
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      gem.gemType.toLowerCase().includes(searchLower) ||
      gem.color.toLowerCase().includes(searchLower) ||
      gem.origin.toLowerCase().includes(searchLower)
    )
  })

  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for price'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const router = useRouter()

  const handleViewGem = (gemId: string) => {
    router.push(`/gem/${gemId}`)
  }

  const renderGemCard = (gem: SellerGem) => {
    const mediaItems = gem.media as MediaItem[] | undefined
    const primaryImage = mediaItems?.find((m: MediaItem) => m.type === 'image' && m.isPrimary) || 
                        mediaItems?.find((m: MediaItem) => m.type === 'image')
    const isSold = gem.status === 'sold'

    return (
      <div 
        key={gem._id} 
        className={cn(
          "group relative bg-card border border-border rounded-xl shadow-lg transition-all duration-500 overflow-hidden",
          "transform luxury-fade-in touch-manipulation",
          isSold 
            ? "opacity-70 cursor-not-allowed" 
            : "hover:shadow-2xl hover:border-primary/30 cursor-pointer"
        )}
        onClick={isSold ? undefined : () => handleViewGem(gem._id)}
      >
        {/* Enhanced Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary/20 group/image">
          <Image
            src={primaryImage?.url || '/images/gem-placeholder.svg'}
            alt={`${gem.gemType} - ${gem.color}`}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Enhanced Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          {/* Sold Overlay */}
          {isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                SOLD OUT
              </div>
            </div>
          )}
          
          {/* Enhanced Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {isSold ? (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                SOLD
              </div>
            ) : (
              <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                LISTED
              </div>
            )}
          </div>

          {/* Carat Weight */}
          <div className="absolute top-2 left-2">
            <div className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2 py-1 rounded-full border border-border">
              {gem.weight.value}{gem.weight.unit}
            </div>
          </div>

          {/* Quick Actions on Hover */}
          {!isSold && (
            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewGem(gem._id)
                }}
                title="View details"
                className="w-8 h-8 bg-primary text-primary-foreground backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary/90 transition-all duration-300 border border-primary/50">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Investment Grade Badge */}
          {!isSold && (
            <div className="absolute inset-x-2 bottom-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 border border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Investment Grade</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 4 ? 'bg-primary' : 'bg-border'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Content Section */}
        <div className="p-3 space-y-3">
          {/* Title and Location */}
          <div>
            <h3 className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight line-clamp-2">
              {gem.gemType}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3 text-primary/60 flex-shrink-0" />
              <span className="truncate">{gem.origin}</span>
              <span className="text-border">•</span>
              <span className="font-medium text-blue-600">{gem.color}</span>
            </div>
          </div>

          {/* Date Listed */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Listed {formatDate(gem.submittedAt || new Date())}</span>
          </div>

          {/* Price and Action Section */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {formatPrice(gem.price)}
              </div>
              <div className="text-xs text-muted-foreground">
                Investment Value
              </div>
            </div>
            
            {/* Views indicator */}
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">Views</div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{gem.views}</span>
              </div>
            </div>
          </div>

          {/* Compact Action Button */}
          <button
            onClick={isSold ? undefined : (e) => {
              e.stopPropagation()
              handleViewGem(gem._id)
            }}
            disabled={isSold}
            className={cn(
              "w-full py-2 px-3 rounded-lg font-medium transition-all duration-300 relative overflow-hidden",
              "text-sm touch-manipulation group/action",
              isSold 
                ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60" 
                : "shadow-md hover:shadow-lg transform hover:translate-y-[-1px] active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 focus:ring-offset-background bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-accent hover:to-primary"
            )}
          >
            {!isSold && (
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <Eye className={cn("w-3 h-3 transition-transform duration-300", !isSold && "group-hover/action:scale-110")} />
              {isSold ? 'Sold Out' : 'View Details'}
            </span>
          </button>
        </div>

        {/* Luxury Accent Line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-60"></div>
        
        {/* Subtle Glow Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    )
  }

  const renderListView = (gem: SellerGem) => {
    const mediaItems = gem.media as MediaItem[] | undefined
    const primaryImage = mediaItems?.find((m: MediaItem) => m.type === 'image' && m.isPrimary) || 
                        mediaItems?.find((m: MediaItem) => m.type === 'image')
    const isSold = gem.status === 'sold'

    return (
      <div 
        key={gem._id} 
        className={cn(
          "group bg-card border border-border rounded-xl shadow-lg transition-all duration-300 overflow-hidden",
          "p-4 luxury-fade-in touch-manipulation",
          isSold 
            ? "opacity-70 cursor-not-allowed" 
            : "hover:shadow-xl hover:border-primary/30 cursor-pointer"
        )}
        onClick={isSold ? undefined : () => handleViewGem(gem._id)}
      >
        <div className="flex gap-4">
          {/* Enhanced Image */}
          <div className="relative w-24 h-24 overflow-hidden rounded-lg bg-secondary/20 flex-shrink-0 group/image">
            <Image
              src={primaryImage?.url || '/images/gem-placeholder.svg'}
              alt={`${gem.gemType} - ${gem.color}`}
              fill
              className="object-cover transition-all duration-300 group-hover:scale-110"
              sizes="96px"
            />
            
            {/* Weight Badge and Sold Overlay on Image */}
            <div className="absolute bottom-1 left-1">
              <div className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full border border-border">
                {gem.weight.value}{gem.weight.unit}
              </div>
            </div>
            {isSold && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  SOLD
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {gem.gemType}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{gem.color}</p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4 text-primary/60 flex-shrink-0" />
                  <span>{gem.origin}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{gem.views} views</span>
                  </div>
                </div>

                {/* Date Listed in List View */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Calendar className="w-3 h-3" />
                  <span>Listed {formatDate(gem.submittedAt || new Date())}</span>
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formatPrice(gem.price)}
                </div>
                <div className="text-xs text-muted-foreground mb-2">Investment Value</div>
                
                <button
                  onClick={isSold ? undefined : (e) => {
                    e.stopPropagation()
                    handleViewGem(gem._id)
                  }}
                  disabled={isSold}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all duration-300 font-medium text-sm flex items-center gap-2",
                    isSold 
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:translate-y-[-1px] active:scale-95"
                  )}
                >
                  <Eye className="w-3 h-3" />
                  {isSold ? 'Sold' : 'View'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Luxury Accent Line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-60"></div>
      </div>
    )
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const visiblePages = []
    const maxVisible = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i)
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={cn(
              "px-3 py-2 rounded-lg transition-colors",
              currentPage === page
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-secondary"
            )}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-foreground">
          Listings ({totalGems})
        </h2>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'grid' ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'list' ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search gems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enhanced Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchGems}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredGems.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchTerm ? 'No matching gems found' : 'No gems available'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'This seller hasn\'t listed any gems yet'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Gems Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGems.map(renderGemCard)}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGems.map(renderListView)}
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  )
} 