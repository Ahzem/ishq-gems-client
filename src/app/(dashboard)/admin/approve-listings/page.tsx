'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, RefreshCw, CheckCircle, XCircle, Clock, Package, Eye, Shield, Star } from 'lucide-react'
import PageTitle from '@/components/dashboard/PageTitle'
import ListingReviewCard from '@/components/admin/ListingReviewCard'
import gemService from '@/services/gem.service'
import { FlexibleGemListResponseData, DirectGemListResponse } from '@/types'

interface PendingGem {
  _id: string
  gemType: string
  color: string
  weight: { value: number; unit: string }
  price?: number
  listingType: 'direct-sale' | 'auction'
  startingBid?: number
  reservePrice?: number
  submittedAt: string
  reportNumber: string
  labName: string
  origin: string
  clarity: string
  sellerId: {
    _id: string
    email: string
    licenseNumber?: string
    storeSettings?: {
      storeName: string
      storeSlogan?: string
      storeDescription?: string
      primaryColor?: string
      secondaryColor?: string
      logoUrl?: string | null
      bannerUrl?: string | null
    }
  }
  media?: Array<{
    _id: string
    type: 'image' | 'video' | 'lab-report'
    url: string
    isPrimary: boolean
    order: number
  }>
  labReportId?: {
    _id: string
    url: string
    filename: string
  }
}

export default function ApproveListings() {
  const [listings, setListings] = useState<PendingGem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingGems, setProcessingGems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'submittedAt' | 'gemType' | 'sellerId'>('submittedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const router = useRouter()

  // Helper function to safely extract gem data from flexible response structure
  const extractGemData = (responseData: FlexibleGemListResponseData): {
    gems: PendingGem[]
    total: number
    totalPages: number
  } => {
    // Check if it's the direct structure
    if ('gems' in responseData && Array.isArray(responseData.gems)) {
      const directResponse = responseData as DirectGemListResponse
      return {
        gems: directResponse.gems as PendingGem[],
        total: directResponse.total || 0,
        totalPages: directResponse.totalPages || 1
      }
    }
    
    // Check if it's the nested structure
    if ('data' in responseData && responseData.data?.gems) {
      return {
        gems: responseData.data.gems as PendingGem[],
        total: responseData.data.pagination?.total || 0,
        totalPages: responseData.data.pagination?.pages || responseData.data.pagination?.totalPages || 1
      }
    }
    
    // Fallback for empty/invalid response
    return {
      gems: [],
      total: 0,
      totalPages: 1
    }
  }

  // Fetch pending listings
  const fetchPendingListings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/signin?message=Please sign in to access admin features')
        return
      }
      
      const response = await gemService.getPendingGems({
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder
      })
      
      if (response.success && response.data) {
        // Use type-safe helper to extract gem data from flexible response structure
        const { gems, total: responseTotal, totalPages: responseTotalPages } = extractGemData(response.data as FlexibleGemListResponseData)
        setListings(gems)
        setTotal(responseTotal)
        setTotalPages(responseTotalPages)
      } else {
        // Handle empty or error response
        setListings([])
        setTotal(0)
        setTotalPages(1)
        const errorMessage = response.message || 'No pending listings found'
        setError(errorMessage)
      }
    } catch (err) {
      console.error('Error fetching pending listings:', err)
      
      // Check if it's an authentication error
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          router.push('/signin?message=Your session has expired. Please sign in again.')
          return
        }
        setError(err.message)
      } else {
        setError('Failed to fetch pending listings')
      }
    } finally {
      setLoading(false)
    }
  }, [currentPage, sortBy, sortOrder, router])

  // Load listings on component mount and when filters change
  useEffect(() => {
    fetchPendingListings()
  }, [fetchPendingListings])

  // Handle gem approval
  const handleApprove = async (gemId: string) => {
    setProcessingGems(prev => new Set(prev).add(gemId))
    try {
      await gemService.approveGem(gemId)
      // Remove from pending list
      setListings(prev => prev.filter(gem => gem._id !== gemId))
      setTotal(prev => prev - 1)
      // Show success message (could add toast here)
    } catch (err) {
      console.error('Error approving gem:', err)
      // Handle error (could show toast)
    } finally {
      setProcessingGems(prev => {
        const newSet = new Set(prev)
        newSet.delete(gemId)
        return newSet
      })
    }
  }

  // Handle gem rejection
  const handleReject = async (gemId: string, reason?: string) => {
    setProcessingGems(prev => new Set(prev).add(gemId))
    try {
      await gemService.rejectGem(gemId, reason)
      // Remove from pending list
      setListings(prev => prev.filter(gem => gem._id !== gemId))
      setTotal(prev => prev - 1)
      // Show success message (could add toast here)
    } catch (err) {
      console.error('Error rejecting gem:', err)
      // Handle error (could show toast)
    } finally {
      setProcessingGems(prev => {
        const newSet = new Set(prev)
        newSet.delete(gemId)
        return newSet
      })
    }
  }

  // Handle view details
  const handleViewDetails = (gemId: string) => {
    router.push(`/gem/${gemId}`)
  }

  // Handle edit gem
  const handleEdit = (gemId: string) => {
    router.push(`/dashboard/edit-gem/${gemId}`)
  }

  // Filter listings based on search query
  const filteredListings = listings.filter(listing => {
    const query = searchQuery.toLowerCase()
    return (
      listing.gemType.toLowerCase().includes(query) ||
      listing.color.toLowerCase().includes(query) ||
      listing.sellerId.storeSettings?.storeName.toLowerCase().includes(query) ||
      listing.sellerId.email.toLowerCase().includes(query) ||
      listing.labName.toLowerCase().includes(query) ||
      listing.reportNumber.toLowerCase().includes(query)
    )
  })

  return (
    <>
      <PageTitle title="Approve Listings" />
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  Approve Listings
                  <Shield className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">
                  Review and approve gem listings for <span className="font-semibold text-primary">Ishq Gems</span> marketplace
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchPendingListings}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50"
                title="Refresh listings"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="font-semibold text-foreground">{total}</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Admin Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { label: 'Pending Review', value: total, icon: Clock, color: 'yellow' },
            { label: 'Average per Day', value: total > 0 ? Math.round(total / 7) : 0, icon: Package, color: 'blue' },
            { label: 'Currently Viewing', value: filteredListings.length, icon: Eye, color: 'primary' },
            { label: 'Total Pages', value: totalPages, icon: CheckCircle, color: 'green' }
          ].map((stat, index) => (
            <div key={index} className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {loading ? '...' : stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/10 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 text-${stat.color === 'primary' ? 'primary' : stat.color + '-600'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border/30 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by gem type, color, seller name, or lab report..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'submittedAt' | 'gemType' | 'sellerId')}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="submittedAt">Sort by Date</option>
                <option value="gemType">Sort by Gem Type</option>
                <option value="sellerId">Sort by Seller</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <div className="h-6 bg-secondary/20 rounded w-48 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-card border border-border/30 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-secondary/20 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-secondary/20 rounded w-32 mb-2" />
                      <div className="h-3 bg-secondary/20 rounded w-24" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-20 bg-secondary/20 rounded" />
                    <div className="h-16 bg-secondary/20 rounded" />
                    <div className="h-12 bg-secondary/20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-card border border-red-200 dark:border-red-800 rounded-xl p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Error loading pending listings</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
              <button
                onClick={fetchPendingListings}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && !error && filteredListings.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Pending Listings
              </h3>
              <div className="text-sm text-muted-foreground">
                {filteredListings.length} of {total} listings
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredListings.map((listing) => (
                <ListingReviewCard
                  key={listing._id}
                  gem={listing}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  isProcessing={processingGems.has(listing._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredListings.length === 0 && listings.length === 0 && (
          <div className="bg-card border border-border/30 rounded-xl p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No pending listings</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Great job! All submitted listings have been reviewed. New listings will appear here when sellers submit them.
              </p>
              <button
                onClick={fetchPendingListings}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                Check for New Listings
              </button>
            </div>
          </div>
        )}

        {/* No Search Results */}
        {!loading && !error && filteredListings.length === 0 && listings.length > 0 && (
          <div className="bg-card border border-border/30 rounded-xl p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No matching listings</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                No listings match your search criteria. Try adjusting your search terms or filters.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="bg-card border border-border/30 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({total} total listings)
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                    let page = index + 1
                    
                    // Show first few pages, current page area, and last few pages
                    if (totalPages > 5) {
                      if (currentPage <= 3) {
                        page = index + 1
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + index
                      } else {
                        page = currentPage - 2 + index
                      }
                    }
                    
                    const isActive = page === currentPage
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'hover:bg-secondary/50 text-muted-foreground'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
} 