'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { Filter, Grid, List, ArrowUpDown, X, AlertCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GemCard from '@/components/cards/GemCard'
import SearchBar from '@/features/gems/components/GemSearch'
import ExploreFilters from '@/features/gems/components/GemFilters'
import ShapeFilterChips from '@/components/filters/ShapeFilterChips'
import CartButton from '@/features/cart/components/CartButton'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import { useGemFilters } from '@/hooks/useGemFilters'
import { useAlert, useToast } from '@/components/providers/UIProvider'
import { GemGridSkeleton, GemListSkeleton } from '@/components/loading/Skeleton'
import gemService from '@/services/gem.service'
import { cn } from '@/lib/utils'
import type { 
  EnhancedGem, 
  GemListQuery,
  FlexibleGemListResponseData
} from '@/types'

const GEMS_PER_PAGE = 12

const sortOptions = [
  { value: 'submittedAt-desc', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'weight.value-desc', label: 'Carat: High to Low' },
  { value: 'weight.value-asc', label: 'Carat: Low to High' },
  { value: 'views-desc', label: 'Most Popular' },
]

function ExploreContent() {
  const {
    filters,
    updateFilters,
    clearAllFilters,
    isFiltersOpen,
    toggleFilters,
    getApiQuery
  } = useGemFilters()

  // UI Provider hooks
  const showAlert = useAlert()
  const showToast = useToast()

  const [gems, setGems] = useState<EnhancedGem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalGems, setTotalGems] = useState(0)
  const [sortBy, setSortBy] = useState('submittedAt-desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const fetchGems = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset || page === 1) {
      setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      const [field, order] = sortBy.split('-')
      const query: GemListQuery = {
        ...getApiQuery,
        search: searchQuery || undefined,
        page,
        limit: GEMS_PER_PAGE,
        sortBy: field,
        sortOrder: order as 'asc' | 'desc',
        status: 'published' // Only show published gems in marketplace
      }

      const response = await gemService.getAllGems(query)

      if (response.success && response.data) {
        // Handle the actual API response structure using type-safe approach
        const responseData = response.data as FlexibleGemListResponseData;
        let gemsArray: EnhancedGem[] = [];
        
        // Check if it's the direct structure
        if ('gems' in responseData && Array.isArray(responseData.gems)) {
          gemsArray = responseData.gems;
        } else if ('data' in responseData && responseData.data?.gems) {
          // Nested structure: { data: { gems: [...], pagination: {...} } }
          gemsArray = responseData.data.gems;
        }
        
        const fetchedGems: EnhancedGem[] = gemsArray.map((gem: EnhancedGem) => ({
          ...gem,
          media: gem.media || []
        }))

        if (reset || page === 1) {
          setGems(fetchedGems)
          // if (fetchedGems.length > 0) {
          //   showToast({
          //     message: `Found ${response.data.total} exceptional gems`,
          //     type: 'success',
          //     duration: 3000
          //   })
          // }
        } else {
          setGems(prev => [...prev, ...fetchedGems])
        }

        // Set pagination data based on response structure using type-safe checks
        if ('page' in responseData) {
          // Direct structure
          setCurrentPage(responseData.page)
          setTotalPages(responseData.totalPages || 1)
          setTotalGems(responseData.total || 0)
        } else {
          // Fallback: use the gems array length as total if no pagination info
          setCurrentPage(page)
          setTotalPages(1)
          setTotalGems(gemsArray.length)
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch gems'
        setError(errorMessage)
        showAlert({
          type: 'error',
          title: 'Failed to Load Gems',
          message: errorMessage,
          duration: 5000
        })
      }
    } catch (err) {
      console.error('Error fetching gems:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch gems'
      setError(errorMessage)
      showAlert({
        type: 'error',
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        duration: 5000
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [getApiQuery, searchQuery, sortBy, showAlert])

  // Fetch gems when filters or search change
  useEffect(() => {
    fetchGems(1, true) // Reset to page 1 when filters change
  }, [fetchGems])

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading && !loadingMore) {
      fetchGems(currentPage + 1, false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Transform backend gem data to match GemCard props
  const transformGemForCard = (gem: EnhancedGem) => {
    const primaryImage = gem.media?.find(m => m.isPrimary && m.type === 'image') || 
                        gem.media?.find(m => m.type === 'image')

    // Calculate auction status
    const getAuctionStatus = (): 'not-started' | 'active' | 'ending-soon' | 'ended' | undefined => {
      if (gem.listingType !== 'auction') return undefined
      
      const now = new Date()
      const startTime = gem.auctionStartTime ? new Date(gem.auctionStartTime) : null
      const endTime = gem.auctionEndTime ? new Date(gem.auctionEndTime) : null
      
      if (!startTime || !endTime) return 'not-started'
      
      if (now < startTime) return 'not-started'
      if (now > endTime) return 'ended'
      
      // Check if ending soon (within 1 hour)
      const timeLeft = endTime.getTime() - now.getTime()
      if (timeLeft <= 60 * 60 * 1000) return 'ending-soon'
      
      return 'active'
    }

    return {
      id: gem._id,
      name: `${gem.gemType} - ${gem.color}`,
      price: gem.price ? `$${gem.price.toLocaleString()}` : 
             gem.startingBid ? `$${gem.startingBid.toLocaleString()}` : 'Price on request',
      priceNumber: gem.price || gem.startingBid || 0,
      location: gem.origin,
      image: primaryImage?.url || '/images/gem-placeholder.svg',
      carat: `${gem.weight.value}${gem.weight.unit}`,
      rarity: gem.investmentGrade || 'Premium',
      color: gem.color,
      clarity: gem.clarity,
      cut: gem.shapeCut,
      treatment: gem.treatments,
      seller: {
        id: gem.sellerId._id,
        verified: gem.sellerId.verified || true,
        rating: gem.sellerId.rating || 0,
        totalReviews: gem.sellerId.totalReviews || 0,
        location: gem.origin,
        // Include store settings from the API response (required for display)
        storeSettings: gem.sellerId.storeSettings || {
          storeName: 'Unnamed Store',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          logoUrl: null,
          bannerUrl: null
        }
      },
      labCertified: true,
      popularity: Math.min(gem.views * 2 + gem.likes * 5, 100),
      // View count
      views: gem.views,
      // Auction-specific properties
      listingType: gem.listingType,
      auctionStartTime: gem.auctionStartTime,
      auctionEndTime: gem.auctionEndTime,
      currentHighestBid: gem.currentHighestBid || 0,
      reservePrice: gem.reservePrice || 0,
      totalBids: gem.totalBids || 0,
      auctionStatus: getAuctionStatus()
    }
  }

  const hasActiveFilters = 
    filters.gemTypes.length > 0 ||
    filters.colors.length > 0 ||
    filters.shapes.length > 0 ||
    filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ||
    filters.caratRange[0] > 0 || filters.caratRange[1] < 10 ||
    filters.origins.length > 0 ||
    filters.labCertified !== null ||
    filters.sellerTypes.length > 0 ||
    filters.availability.length > 0 ||
    filters.rarity.length > 0 ||
    filters.treatments.length > 0 ||
    (filters.clarities && filters.clarities.length > 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Floating Cart Button */}
      <CartButton />
      
      {/* Mobile-Optimized Hero Section */}
      <section className="relative pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 bg-gradient-to-b from-background via-background to-secondary/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_50%)] opacity-10"></div>
        
        <div className="container mx-auto px-3 sm:px-4 relative">
          <ScrollAnimation animation="fadeIn" duration={0.8}>
            <div className="text-center max-w-4xl mx-auto luxury-fade-in">
              <div className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-full mb-4 sm:mb-6">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-primary">
                  {loading ? 'Loading...' : `${totalGems} Exceptional Gems`}
                </span>
              </div>
              
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                <span className="text-foreground">Discover</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Luxury Gemstones
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
                Browse our curated collection of the world&apos;s most exceptional natural gemstones, 
                each piece carefully selected for its extraordinary beauty and investment potential.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <main className="container mx-auto px-3 sm:px-4 pb-16 sm:pb-20">
        {/* Shape Filter Chips Section */}
        <section className="mb-6 sm:mb-8">
          <ScrollAnimation animation="slideUp" delay={0.1} duration={0.8}>
            <ShapeFilterChips
              filters={filters}
              onFiltersChange={updateFilters}
            />
          </ScrollAnimation>
        </section>

        {/* Search and Filter Controls */}
        <section className="mb-2 sm:mb-4  lg:mb-4 luxury-slide-up">
          <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
             {/* Single Line Layout */}
             <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-6 sm:mb-8">
               {/* Left Side: Search Bar */}
               <div className="w-full">
                <SearchBar 
                  onSearch={setSearchQuery}
                   placeholder="Search gems..."
                  initialValue={searchQuery}
                />
               </div>
               
               {/* Right Side: Controls */}
               <div className="flex items-center gap-2 lg:gap-3 shrink-0">

                 {/* Sort Dropdown */}
                 <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                     <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                   </div>
                   <select 
                     title="Sort by"
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     className="h-12 pl-10 pr-3 bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 text-sm font-medium min-w-[140px] appearance-none cursor-pointer hover:border-primary/30"
                   >
                     {sortOptions.map(option => (
                       <option key={option.value} value={option.value}>
                         {option.label}
                       </option>
                     ))}
                   </select>
                 </div>

                 {/* View Mode Toggle */}
                 <div className="hidden lg:flex items-center bg-secondary/50 border border-border/30 rounded-lg p-1 h-12">
                   <button
                     onClick={() => setViewMode('grid')}
                     className={cn(
                       "p-2.5 rounded transition-all duration-300",
                       viewMode === 'grid' 
                         ? "bg-background shadow-sm border border-border/50 text-primary" 
                         : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
                     )}
                     title="Grid view"
                   >
                     <Grid className="w-4 h-4" />
                   </button>
                   <button
                     onClick={() => setViewMode('list')}
                     className={cn(
                       "p-2.5 rounded transition-all duration-300",
                       viewMode === 'list' 
                         ? "bg-background shadow-sm border border-border/50 text-primary" 
                         : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
                     )}
                     title="List view"
                   >
                     <List className="w-4 h-4" />
                   </button>
              </div>
              
              {/* Filter Toggle Button */}
              <button
                onClick={toggleFilters}
                   className="relative flex items-center justify-center gap-2 px-4 w-full sm:w-auto sm:ml-auto h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm"
              >
                {isFiltersOpen ? (
                  <>
                       <X className="w-4 h-4" />
                       <span className="hidden sm:inline">Close</span>
                  </>
                ) : (
                  <>
                       <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </>
                )}
                {hasActiveFilters && (
                     <span className="bg-primary-foreground text-primary text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center font-bold shadow-sm">
                    {filters.gemTypes.length + filters.colors.length + filters.shapes.length + filters.origins.length + filters.sellerTypes.length + filters.availability.length + filters.rarity.length + filters.treatments.length + (filters.clarities?.length || 0)}
                  </span>
                )}
                   
                   {/* Subtle glow effect */}
                   <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </button>
            </div>
             </div>

             {/* Results Summary */}
             <div className="mt-6 space-y-4">
               {/* Results Info */}
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  
                  {hasActiveFilters && (
                    <button
                       onClick={() => {
                         clearAllFilters()
                         showToast({
                           message: 'All filters cleared',
                           type: 'info',
                           duration: 2000
                         })
                       }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 underline text-left sm:text-center"
                    >
                       Clear all filters
                    </button>
                  )}
                </div>
                
                 {/* Page Info - Show current page info */}
                 {totalPages > 1 && !loading && (
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </div>
              
               {/* Mobile-Friendly Pagination Controls */}
               {totalPages > 1 && !loading && (
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  {/* Previous/Next Navigation */}
                  <div className="flex items-center gap-2">
                     <button
                       onClick={() => {
                         if (currentPage > 1) {
                           setCurrentPage(currentPage - 1)
                           fetchGems(currentPage - 1, true)
                           scrollToTop()
                         }
                       }}
                       disabled={currentPage <= 1}
                       className="flex items-center gap-2 px-4 py-3 h-12 rounded-xl border border-border/50 bg-background hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium"
                       title="Previous page"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                       </svg>
                       <span className="hidden sm:inline">Previous</span>
                     </button>
                     
                     <button
                       onClick={() => {
                         if (currentPage < totalPages) {
                           setCurrentPage(currentPage + 1)
                           fetchGems(currentPage + 1, true)
                           scrollToTop()
                         }
                       }}
                       disabled={currentPage >= totalPages}
                       className="flex items-center gap-2 px-4 py-3 h-12 rounded-xl border border-border/50 bg-background hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium"
                       title="Next page"
                     >
                       <span className="hidden sm:inline">Next</span>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                       </svg>
                     </button>
                  </div>
                     
                  {/* Page Numbers - Responsive */}
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum)
                            fetchGems(pageNum, true)
                            scrollToTop()
                          }}
                          className={cn(
                            "flex-shrink-0 h-12 w-12 rounded-xl font-semibold transition-all duration-300 text-sm",
                            pageNum === currentPage
                              ? "bg-primary text-primary-foreground shadow-lg border border-primary/20 scale-105"
                              : "bg-background border border-border/50 text-foreground hover:bg-secondary/50 hover:border-primary/30 hover:scale-105"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
               )}
            </div>
          </ScrollAnimation>
        </section>

        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Filters Sidebar - Hidden by default */}
          <aside className={cn(
            "hidden lg:block w-80 shrink-0 transition-all duration-300 ease-in-out",
            isFiltersOpen 
              ? "opacity-100 translate-x-0 pointer-events-auto z-10" 
              : "opacity-0 -translate-x-full absolute pointer-events-none -z-10"
          )}>
            <ExploreFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClearAll={clearAllFilters}
              isOpen={isFiltersOpen}
              onToggle={toggleFilters}
              resultCount={totalGems}
            />
          </aside>

          {/* Mobile Filters */}
          <ExploreFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onClearAll={clearAllFilters}
            isOpen={isFiltersOpen}
            onToggle={toggleFilters}
            resultCount={totalGems}
            className="lg:hidden"
          />

          {/* Gems Grid */}
          <div className="flex-1 min-w-0" data-results-section>
            {/* Initial Loading State with Skeleton */}
            {loading && gems.length === 0 && (
              <div className="space-y-6">
                {viewMode === 'grid' ? (
                  <GemGridSkeleton 
                    count={GEMS_PER_PAGE} 
                    isFiltersOpen={isFiltersOpen}
                    className="mb-12 sm:mb-16"
                  />
                ) : (
                  <GemListSkeleton 
                    count={GEMS_PER_PAGE}
                    className="mb-12 sm:mb-16"
                  />
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16 sm:py-20">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Gems</h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">{error}</p>
                <button
                  onClick={() => fetchGems(1, true)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Gems Grid */}
            {!loading && !error && gems.length > 0 && (
              <>
                <div className={cn(
                  "mb-12 sm:mb-16 transition-all duration-300",
                  viewMode === 'grid' 
                    ? cn(
                        "grid gap-4 sm:gap-6 lg:gap-8",
                        isFiltersOpen
                          ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3" // Reduced by one column when filters open
                          : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5" // Normal grid when filters closed
                      )
                    : "flex flex-col gap-3 sm:gap-4 lg:gap-5"
                )}>
                  {gems.map((gem, index) => (
                    <ScrollAnimation
                      key={gem._id}
                      animation="slideUp"
                      delay={index * 0.05}
                      duration={0.6}
                    >
                      <div className="luxury-fade-in h-full">
                        <GemCard
                          {...transformGemForCard(gem)}
                          layout={viewMode}
                          priority={index < 4} // Add priority for first 4 gems above the fold
                          className={cn(
                            viewMode === 'list' && "w-full max-w-none",
                            "h-full"
                          )}
                        />
                      </div>
                    </ScrollAnimation>
                  ))}
                </div>

                {/* Loading More Skeletons */}
                {loadingMore && (
                  <div className="mb-6 sm:mb-8">
                    {viewMode === 'grid' ? (
                      <GemGridSkeleton 
                        count={Math.min(GEMS_PER_PAGE, 6)} 
                        isFiltersOpen={isFiltersOpen}
                      />
                    ) : (
                      <GemListSkeleton 
                        count={Math.min(GEMS_PER_PAGE, 4)}
                      />
                    )}
                  </div>
                )}
                      
                 {/* Load More Section */}
                 {totalPages > 1 && currentPage < totalPages && (
                   <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
                     <div className="flex flex-col items-center gap-4 py-6">
                     <button 
                          onClick={handleLoadMore}
                         disabled={loading || loadingMore}
                         className="w-full sm:w-auto min-w-[200px] px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-base disabled:opacity-50 disabled:transform-none"
                       >
                         {loadingMore ? (
                           <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                             <span>Loading More...</span>
                           </div>
                         ) : (
                           <span>Load More Gems</span>
                         )}
                        </button>
                      
                        <p className="text-sm text-muted-foreground text-center">
                        Showing <span className="font-medium text-foreground">{gems.length}</span> of <span className="font-medium text-foreground">{totalGems}</span> gems
                      </p>
                    </div>
                  </ScrollAnimation>
                )}
              </>
            )}

            {/* No Results */}
            {!loading && !error && gems.length === 0 && (
              <ScrollAnimation animation="fadeIn" duration={0.8}>
                <div className="text-center py-12 sm:py-16 lg:py-20 px-4">
                  <div className="text-5xl sm:text-6xl lg:text-8xl mb-6 opacity-60">💎</div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3">No gems found</h3>
                  <p className="text-muted-foreground mb-8 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
                    Try adjusting your search criteria or filters to discover more exceptional gemstones in our collection.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
                    <button
                      onClick={() => {
                        clearAllFilters()
                        showToast({
                          message: 'All filters cleared - showing all gems',
                          type: 'info',
                          duration: 3000
                        })
                      }}
                      className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors duration-200 font-semibold text-base"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="w-full sm:w-auto px-8 py-4 bg-secondary text-foreground border border-border/50 rounded-xl hover:bg-secondary/80 transition-colors duration-200 font-medium text-base"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              </ScrollAnimation>
            )}
          </div>
        </div>

        {/* Newsletter Section */}
        <section className="mt-12 sm:mt-16 lg:mt-20 luxury-fade-in">
          <ScrollAnimation animation="slideUp" delay={0.1} duration={0.8}>
            <div className="relative bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 xl:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_70%)] opacity-10"></div>
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6">
                  Never Miss a Rare Find
                </h3>
                <p className="text-muted-foreground mb-6 sm:mb-8 lg:mb-10 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                  Be the first to know when exceptional gemstones are added to our curated collection. Join thousands of gem enthusiasts worldwide.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 sm:px-5 py-4 sm:py-3.5 bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground text-base transition-all duration-300"
                  />
                  <button className="w-full sm:w-auto px-8 py-4 sm:py-3.5 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 text-base whitespace-nowrap">
                    Subscribe Now
                  </button>
                </div>
                
                <p className="mt-4 text-xs sm:text-sm text-muted-foreground/80">
                  No spam, unsubscribe anytime. Privacy policy protected.
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20">
          {/* Hero Section Skeleton */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary/10 border border-primary/20 rounded-full mb-4 sm:mb-6">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">Loading Marketplace</span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="h-8 sm:h-10 lg:h-12 bg-muted/40 rounded-xl animate-pulse mx-auto max-w-xs sm:max-w-md lg:max-w-lg"></div>
              <div className="h-4 sm:h-5 lg:h-6 bg-muted/40 rounded-lg animate-pulse mx-auto max-w-sm sm:max-w-lg lg:max-w-xl"></div>
            </div>
          </div>
          
          {/* Search and Filter Skeleton */}
          <div className="mb-6 sm:mb-8 lg:mb-12 space-y-4">
            <div className="h-12 bg-muted/40 rounded-xl animate-pulse"></div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex gap-2 sm:gap-3">
                <div className="h-12 bg-muted/40 rounded-xl animate-pulse flex-1 sm:w-40"></div>
                <div className="h-12 w-24 bg-muted/40 rounded-xl animate-pulse"></div>
              </div>
              <div className="h-12 bg-muted/40 rounded-xl animate-pulse sm:flex-1"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-muted/40 rounded animate-pulse w-32 sm:w-40"></div>
              <div className="h-4 bg-muted/40 rounded animate-pulse w-24"></div>
            </div>
          </div>
          
          {/* Gems Grid Skeleton */}
          <GemGridSkeleton count={12} isFiltersOpen={false} />
        </div>
        <Footer />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  )
} 