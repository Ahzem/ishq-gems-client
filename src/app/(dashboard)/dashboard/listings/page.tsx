'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import PageTitle from '@/components/dashboard/PageTitle'
import GemListingCard from '@/components/cards/GemListingCard'
import GemDetailModal from '@/components/modals/GemDetailModal'
import { Spinner, GemGridSkeleton } from '@/components/loading'
import { useToast } from '@/components/alerts/Toast'
import { useUI } from '@/components/providers/UIProvider'
import { 
  Package, 
  Plus, 
  Search, 
  Grid, 
  List, 
  Shield, 
  Star,
  Eye,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import gemService from '@/services/gem.service'
import adminGemService from '@/services/admin-gem.service'
import { FlexibleGemListResponseData, AdminGemResponse } from '@/types'

interface Gem {
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
  media?: Array<{
    _id: string
    type: 'image' | 'video' | 'lab-report'
    url: string
    isPrimary: boolean
    order: number
  }>
}

type AdminGem = AdminGemResponse
type ViewMode = 'grid' | 'list'
type StatusFilter = 'all' | 'pending' | 'verified' | 'published' | 'sold'

// Add gem type filter options
type GemTypeFilter = 'all' | 'Sapphire' | 'Ruby' | 'Emerald' | 'Diamond' | 'Spinel' | 'Tourmaline' | 'Garnet' | 'Peridot' | 'Amethyst' | 'Citrine'

export default function ListingsPage() {
  const { user, isLoading: authLoading, hasRole } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const { showAlert, showConfirm } = useUI()
  
  // Common states
  const [listings, setListings] = useState<Gem[] | AdminGem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [gemTypeFilter, setGemTypeFilter] = useState<GemTypeFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal states (for seller)
  const [selectedGemId, setSelectedGemId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Note: Using UIProvider for notifications and confirmations

  // Auth protection - only sellers and admins can access
  useEffect(() => {
    if (!authLoading && (!user || (!hasRole('seller') && !hasRole('admin')))) {
      router.push('/signin?message=Seller or admin access required&redirect=/dashboard/listings')
      return
    }
  }, [user, authLoading, hasRole, router])

  // Get role-specific configuration
  const getRoleConfig = () => {
    if (hasRole('admin')) {
      return {
        title: 'My Listings - Admin',
        pageTitle: 'My Listings - Admin',
        subtitle: 'Manage gems listed as Ishq Gems',
        icon: Package,
        badge: 'Admin Listings',
        badgeIcon: Shield,
        headerGradient: 'from-primary/10 to-accent/10',
        isAdmin: true,
        service: adminGemService,
        fetchMethod: 'getAdminGems' as const
      }
    } else {
      return {
        title: 'My Listings',
        pageTitle: 'My Listings',
        subtitle: 'Manage your gem listings and track their performance on Ishq Gems',
        icon: Package,
        badge: 'Seller Listings',
        badgeIcon: Star,
        headerGradient: 'from-primary/10 to-accent/10',
        isAdmin: false,
        service: gemService,
        fetchMethod: 'getMyGems' as const
      }
    }
  }

  const roleConfig = getRoleConfig()

  // Helper functions for unified notifications
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    if (hasRole('admin')) {
      showAlert({ type, message, placement: 'top', duration: 5000 })
    } else {
      showToast(message, type === 'error' ? 'error' : 'success')
    }
  }

  const showConfirmDialog = async (title: string, message: string, onConfirm: () => void) => {
    if (hasRole('admin')) {
      const confirmed = await showConfirm({
        title,
        message,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      })
      if (confirmed) {
        onConfirm()
      }
    } else {
      // For sellers, show immediate confirmation or use browser confirm
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm()
      }
    }
  }


  // Fetch listings based on role
  const fetchListings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Check authentication
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/signin?message=Please sign in to view your listings')
        return
      }

      if (hasRole('admin')) {
        // Admin listings
        const response = await adminGemService.getAdminGems(
          currentPage,
          12,
          statusFilter === 'all' ? undefined : statusFilter,
          searchTerm || undefined
        )

        if (response.success) {
          if (!response.data) {
            setListings([])
            setTotal(0)
            setTotalPages(1)
            return
          }
          
          let gemsData: AdminGem[] = []
          let totalData = 0
          let totalPagesData = 1
          
          if (response.data.gems && Array.isArray(response.data.gems)) {
            gemsData = response.data.gems
            totalData = response.data.total || 0
            totalPagesData = response.data.totalPages || 1
          } else if (Array.isArray(response.data)) {
            gemsData = response.data
            totalData = response.data.length
            totalPagesData = 1
          }
          
          setListings(gemsData)
          setTotal(totalData)
          setTotalPages(totalPagesData)
        } else {
          throw new Error(response.message || 'Failed to fetch admin gems')
        }
      } else {
        // Seller listings
        const response = await gemService.getMyGems({
          status: statusFilter === 'all' ? undefined : statusFilter,
          gemType: gemTypeFilter === 'all' ? undefined : gemTypeFilter,
          page: currentPage,
          limit: 12,
          sortBy: 'submittedAt',
          sortOrder: 'desc'
        })
        
        if (response.success && response.data) {
          const responseData = response.data as FlexibleGemListResponseData

          if ('gems' in responseData && Array.isArray(responseData.gems)) {
            setListings(responseData.gems as Gem[])
            setTotal(responseData.total || 0)
            setTotalPages(responseData.totalPages || 1)
          } else if ('data' in responseData && responseData.data?.gems) {
            setListings(responseData.data.gems as Gem[])
            setTotal(responseData.data.pagination?.total || 0)
            setTotalPages(responseData.data.pagination?.pages || responseData.data.pagination?.totalPages || 1)
          } else {
            setListings([])
            setTotal(0)
            setTotalPages(1)
          }
        } else {
          setListings([])
          setTotal(0)
          setTotalPages(1)
          const errorMessage = response.message || 'No listings found'
          setError(errorMessage)
        }
      }
    } catch (err) {
      console.error('Error fetching listings:', err)
      
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          router.push('/signin?message=Your session has expired. Please sign in again.')
          return
        }
        setError(err.message)
      } else {
        setError('Failed to fetch listings')
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, statusFilter, gemTypeFilter, searchTerm, hasRole, router])

  // Load listings when filters or page changes
  useEffect(() => {
    if (user && (hasRole('seller') || hasRole('admin'))) {
      fetchListings()
    }
  }, [user, hasRole, fetchListings])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchListings()
    setIsRefreshing(false)
  }

  const handleEdit = (gemId: string) => {
    router.push(`/dashboard/edit-gem/${gemId}`)
  }

  const handleDelete = async (gemId: string) => {
    const title = 'Delete Gem'
    const message = hasRole('admin') 
      ? 'Are you sure you want to delete this admin gem? This action cannot be undone.'
      : 'Are you sure you want to delete this gem listing? This action cannot be undone.'

    await showConfirmDialog(
      title,
      message,
      async () => {
        try {
          const response = hasRole('admin') 
            ? await adminGemService.deleteAdminGem(gemId)
            : await gemService.deleteGem(gemId)
          
          if (response.success) {
            setListings(prev => prev.filter(gem => gem._id !== gemId))
            setTotal(prev => prev - 1)
            
            showNotification('success', 'Gem deleted successfully')
            await fetchListings()
          } else {
            throw new Error(response.message || 'Failed to delete gem')
          }
        } catch (err) {
          console.error('Error deleting gem:', err)
          
          if (err instanceof Error && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
            router.push('/signin?message=Your session has expired. Please sign in again.')
            return
          }
          
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete gem listing'
          showNotification('error', errorMessage)
          await fetchListings()
        }
      }
    )
  }

  const handleViewDetails = (gemId: string) => {
    if (hasRole('admin')) {
      router.push(`/gem/${gemId}`)
    } else {
      setSelectedGemId(gemId)
      setShowDetailModal(true)
    }
  }

  const handleTogglePublished = async (gemId: string, published: boolean) => {
    if (!hasRole('admin')) return

    try {
      const response = await adminGemService.togglePublishAdminGem(gemId, published)
      
      if (response.success && response.data) {
        setListings(prev => prev.map(gem => 
          gem._id === gemId 
            ? { ...gem, published: response.data!.published }
            : gem
        ))
        
        showNotification('success', `Gem ${published ? 'published' : 'unpublished'} successfully`)
      } else {
        throw new Error(response.message || 'Failed to toggle published status')
      }
    } catch (err) {
      console.error('Error toggling published status:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update published status'
      showNotification('error', errorMessage)
    }
  }

  // Modal handlers for sellers
  const handleModalEdit = (gemId: string) => {
    setShowDetailModal(false)
    handleEdit(gemId)
  }

  const handleModalDelete = async (gemId: string) => {
    setShowDetailModal(false)
    await handleDelete(gemId)
  }

  const handleCloseModal = () => {
    setShowDetailModal(false)
    setSelectedGemId(null)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleGemTypeFilterChange = (gemType: GemTypeFilter) => {
    setGemTypeFilter(gemType)
    setCurrentPage(1)
  }


  const clearFilters = () => {
    setStatusFilter('all')
    setGemTypeFilter('all')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const hasActiveFilters = statusFilter !== 'all' || gemTypeFilter !== 'all' || searchTerm.trim() !== ''

  // Client-side filtering for search functionality
  const getFilteredListings = () => {
    let filtered = [...listings]

    // Apply search filter on client side for better UX
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(listing => {
        const gemType = listing.gemType?.toLowerCase() || ''
        const color = listing.color?.toLowerCase() || ''
        const status = listing.status?.toLowerCase() || ''
        
        return gemType.includes(searchLower) || 
               color.includes(searchLower) || 
               status.includes(searchLower)
      })
    }

    return filtered
  }

  // Get filtered listings for display
  const filteredListings = getFilteredListings()

  // Calculate stats based on all listings (not filtered)
  const stats = {
    total: total,
    published: hasRole('admin') 
      ? (listings as AdminGem[]).filter(g => g.published).length
      : (listings as Gem[]).filter(l => l.status === 'published').length,
    pending: hasRole('admin') 
      ? (listings as AdminGem[]).filter(g => !g.published).length
      : (listings as Gem[]).filter(l => l.status === 'pending').length,
    totalViews: listings.reduce((sum, l) => sum + (l.views || 0), 0),
    averagePrice: hasRole('admin') && listings.length > 0 
      ? (listings as AdminGem[]).reduce((sum, g) => sum + (g.price || 0), 0) / listings.length 
      : 0
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading your listings...</p>
        </div>
      </div>
    )
  }

  if (!user || (!hasRole('seller') && !hasRole('admin'))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle title={roleConfig.pageTitle} />
      
      {/* Note: Notifications and confirmations are handled by UIProvider */}

      <div className="space-y-6">
        {/* Dynamic Header */}
        <div className={`bg-gradient-to-r ${roleConfig.headerGradient} border border-primary/20 rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <roleConfig.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  {roleConfig.title}
                  <roleConfig.badgeIcon className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">
                  {roleConfig.subtitle.replace('Ishq Gems', '')}
                  <span className="font-semibold text-primary">Ishq Gems</span>
                  {roleConfig.subtitle.includes('track') ? ' marketplace' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50"
                title="Refresh listings"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="font-semibold text-foreground">{stats.total}</span>
              </div>
              
              <Link
                href="/dashboard/add-gem"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Add New Gem</span>
                <span className="text-sm font-medium sm:hidden">Add</span>
              </Link>
              
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <roleConfig.badgeIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{roleConfig.badge}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Listings</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{isLoading ? '...' : stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                  <Package className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {hasRole('admin') ? 'Published' : 'Published'}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{isLoading ? '...' : stats.published}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg">
                  <Eye className="h-4 w-4 sm:h-6 sm:w-6 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {hasRole('admin') ? 'Unpublished' : 'Pending Review'}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{isLoading ? '...' : stats.pending}</p>
                </div>
                <div className="p-2 sm:p-3 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {hasRole('admin') ? 'Avg. Price' : 'Total Views'}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {isLoading ? '...' : hasRole('admin') 
                      ? `$${stats.averagePrice.toLocaleString()}` 
                      : stats.totalViews
                    }
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg">
                  {hasRole('admin') ? (
                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by type, color, or status..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as StatusFilter)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="published">Published</option>
              <option value="sold">Sold</option>
            </select>
            
            {/* Gem Type filter */}
            <select
              value={gemTypeFilter}
              onChange={(e) => handleGemTypeFilterChange(e.target.value as GemTypeFilter)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">All Types</option>
              <option value="Sapphire">Sapphire</option>
              <option value="Ruby">Ruby</option>
              <option value="Emerald">Emerald</option>
              <option value="Diamond">Diamond</option>
              <option value="Spinel">Spinel</option>
              <option value="Tourmaline">Tourmaline</option>
              <option value="Garnet">Garnet</option>
              <option value="Peridot">Peridot</option>
              <option value="Amethyst">Amethyst</option>
              <option value="Citrine">Citrine</option>
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex items-center border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'grid' ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                )}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'list' ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                )}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                title="Clear all filters"
              >
                Clear All
              </button>
            )}
            
            {/* Results Count */}
            <div className="px-3 py-2 border border-border rounded-lg bg-secondary/10 text-foreground text-sm">
              {filteredListings.length} of {total}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="h-6 bg-secondary/20 rounded w-48 animate-pulse" />
            <GemGridSkeleton count={8} />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-card border border-red-200 dark:border-red-800 rounded-xl p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">Error loading listings</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={fetchListings}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Try Again</span>
                </button>
                <Link
                  href="/dashboard/help"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <span>Get Help</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredListings.length === 0 && (
          <div className="bg-card border border-border/30 rounded-xl p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                {searchTerm || statusFilter !== 'all' || gemTypeFilter !== 'all' ? 'No matching gems found' : 'No listings yet'}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' || gemTypeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria' 
                  : hasRole('admin')
                    ? 'Start adding premium gems to the marketplace'
                    : 'Start building your gem collection by adding your first listing. Your gems will appear here once submitted.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard/add-gem"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  <span>{hasRole('admin') ? 'Add New Gem' : 'Add Your First Gem'}</span>
                </Link>
                <Link
                  href="/dashboard/help"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <span>{hasRole('admin') ? 'Get Help' : 'Learn How to List'}</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && !error && filteredListings.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-semibold text-foreground">
                {hasRole('admin') ? 'Admin Gem Listings' : 'Your Gem Listings'}
              </h3>
              <div className="text-sm text-muted-foreground">
                {filteredListings.length} gem{filteredListings.length !== 1 ? 's' : ''} displayed
              </div>
            </div>
            
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
            )}>
              {filteredListings.map((listing) => (
                <GemListingCard
                  key={listing._id}
                  gem={listing}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                  onRefresh={fetchListings}
                  onTogglePublished={hasRole('admin') ? handleTogglePublished : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="bg-card border border-border/30 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({total} total gems)
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
                        className={cn(
                          "px-3 py-2 rounded-lg transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "hover:bg-secondary/50 text-muted-foreground"
                        )}
                      >
                        {page}
                      </button>
                    )
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 text-muted-foreground">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-2 rounded-lg hover:bg-secondary/50 text-muted-foreground transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
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

        {/* Results Summary */}
        {!isLoading && !error && filteredListings.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredListings.length} of {total} listings
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
            {gemTypeFilter !== 'all' && ` of type "${gemTypeFilter}"`}
          </div>
        )}
      </div>

      {/* Seller Gem Detail Modal */}
      {!hasRole('admin') && selectedGemId && (
        <GemDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseModal}
          gemId={selectedGemId}
          onEdit={handleModalEdit}
          onDelete={handleModalDelete}
        />
      )}
    </>
  )
}
