'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Gem, Star, MapPin, Eye, TrendingUp, Crown, Diamond, ArrowRight, ChevronRight, Gavel } from 'lucide-react'
import gemService from '@/services/gem.service'
import { cn } from '@/lib/utils'
import AuctionTimer from '@/components/bidding/AuctionTimer'
import CursorReactive, { ParallaxBackground } from '@/components/common/CursorReactive'
import { EnhancedGem } from '@/types/entities/gem'
import { FlexibleGemListResponseData } from '@/types'

// Extended type with calculated auction status
type GemDataWithAuctionStatus = EnhancedGem & {
  auctionStatus?: 'not-started' | 'active' | 'ending-soon' | 'ended'
}

type GemData = GemDataWithAuctionStatus

const formatGemName = (gem: GemData) => {
  return `${gem.gemType} ${gem.variety ? `- ${gem.variety}` : ''}`
}

const isNewGem = (createdAt: string) => {
  const gemDate = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - gemDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7
}

const getRarityGradient = (rarity?: string) => {
  switch (rarity) {
    case 'A+': return 'from-red-500 via-pink-500 to-purple-500'
    case 'A': return 'from-purple-500 via-blue-500 to-cyan-500'
    case 'A-': return 'from-blue-500 via-cyan-500 to-teal-500'
    case 'B+': return 'from-emerald-500 via-green-500 to-lime-500'
    case 'B': return 'from-yellow-500 via-amber-500 to-orange-500'
    default: return 'from-primary via-accent to-primary'
  }
}

const getAuctionStatusColor = (status?: string) => {
  switch (status) {
    case 'ending-soon': return 'from-red-500 to-red-600'
    case 'active': return 'from-green-500 to-green-600'
    case 'ended': return 'from-gray-500 to-gray-600'
    default: return 'from-blue-500 to-blue-600'
  }
}

export default function NewArrivals() {
  const [gems, setGems] = useState<GemData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGem, setSelectedGem] = useState<GemData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchFeaturedGems = async () => {
      try {
        setLoading(true)
        const response = await gemService.getAllGems({
          featured: true,
          status: 'published',
          limit: 4,
          sortBy: 'submittedAt',
          sortOrder: 'desc'
        })
        
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
          
          const processedGems: GemDataWithAuctionStatus[] = gemsArray.map((gem: EnhancedGem) => ({
            ...gem,
            auctionStatus: gem.listingType === 'auction' ? calculateAuctionStatus(gem.auctionStartTime, gem.auctionEndTime) : 'not-started'
          }))
          setGems(processedGems)
          setSelectedGem(processedGems[0] || null)
        }
      } catch (error) {
        console.error('Error fetching featured gems:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedGems()
  }, [])

  const calculateAuctionStatus = (startTime?: string, endTime?: string): 'not-started' | 'active' | 'ending-soon' | 'ended' => {
    if (!startTime || !endTime) return 'not-started'
    
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    if (now < start) return 'not-started'
    if (now > end) return 'ended'
    
    const timeLeft = end.getTime() - now.getTime()
    if (timeLeft <= 60 * 60 * 1000) return 'ending-soon'
    
    return 'active'
  }

  const handleGemClick = (gem: GemData) => {
    router.push(`/gem/${gem._id}`)
  }

  const handleViewAll = () => {
    router.push('/explore')
  }

  if (loading) {
    return (
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_50%)] opacity-5"></div>
        <div className="container mx-auto px-4">
            <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-secondary rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-secondary rounded-lg w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (gems.length === 0) {
    return (
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_50%)] opacity-5"></div>
        <div className="container mx-auto px-4">
            <div className="text-center">
            <Gem className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">No New Arrivals</h2>
            <p className="text-muted-foreground">Check back soon for our latest exceptional gems.</p>
          </div>
        </div>
      </section>
    )
  }

  const featuredGem = selectedGem || gems[0]
  const secondaryGems = gems.slice(1, 7)

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <ParallaxBackground strength={0.5}>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-float-slow"></div>
        </ParallaxBackground>
        <ParallaxBackground strength={-0.3}>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-float-delayed"></div>
        </ParallaxBackground>
        <ParallaxBackground strength={0.2}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-2xl animate-pulse-slow"></div>
        </ParallaxBackground>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Elegant Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16 xl:mb-20 px-2">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
            <div className="relative">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
          </div>
          
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-primary via-accent via-primary to-accent bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-flow">
              New Arrivals
            </span>
          </h2>
          
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg xl:text-xl max-w-3xl mx-auto leading-relaxed px-4">
            Discover our latest collection of the world&rsquo;s most exceptional natural gemstones, 
            each one a masterpiece of nature&rsquo;s artistry.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 mb-10 sm:mb-14 lg:mb-16 px-2">
          {/* Featured Gem - Large Showcase */}
          <div className="xl:col-span-7">
            <CursorReactive
              className="group relative"
              enableTilt={true}
              maxRotation={8}
              enableScale={false}
            >
              {/* Main Featured Card */}
              <div className="relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-[0_0_60px_rgba(var(--primary),0.3)] hover:border-primary/30">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={featuredGem.media?.find(m => m.isPrimary)?.url || featuredGem.media?.[0]?.url || '/images/gem-placeholder.svg'}
                    alt={formatGemName(featuredGem)}
                    fill
                    className="object-cover transition-all duration-700"
                    priority
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Premium Badges */}
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                    {featuredGem.featured && (
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span className="font-bold text-sm">FEATURED</span>
                      </div>
                    )}
                    
                    {featuredGem.listingType === 'auction' && (
                      <div className={cn(
                        "text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2",
                        `bg-gradient-to-r ${getAuctionStatusColor(featuredGem.auctionStatus)}`,
                        featuredGem.auctionStatus === 'ending-soon' && "animate-pulse"
                      )}>
                        <Gavel className="w-4 h-4" />
                        <span className="font-bold text-sm">
                          {featuredGem.auctionStatus === 'ending-soon' ? 'ENDING SOON' : 'LIVE AUCTION'}
                        </span>
                      </div>
                    )}
                    
                    {featuredGem.investmentGrade && (
                      <div className={cn(
                        "text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2",
                        `bg-gradient-to-r ${getRarityGradient(featuredGem.investmentGrade)}`
                      )}>
                        <Diamond className="w-4 h-4" />
                        <span className="font-bold text-sm">GRADE {featuredGem.investmentGrade}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Weight Badge */}
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                    <div className="bg-background/90 backdrop-blur-sm text-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border/50 shadow-lg">
                      <span className="font-bold text-sm sm:text-base lg:text-lg">{featuredGem.weight.value}{featuredGem.weight.unit}</span>
                    </div>
        </div>

                  {/* Interactive Elements on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <button 
                      onClick={() => handleGemClick(featuredGem)}
                      className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-300 flex items-center gap-2 sm:gap-3 transform"
            >
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <div className="flex-1">
                      <h3 className="font-serif text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {formatGemName(featuredGem)}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-muted-foreground mb-3 sm:mb-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-primary/70" />
                          <span className="text-xs sm:text-sm lg:text-base">{featuredGem.origin}</span>
                        </div>
                        <span className="text-border text-xs sm:text-sm">•</span>
                        <span className="text-xs sm:text-sm lg:text-base">{featuredGem.clarity}</span>
                      </div>
            
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                          <span className="text-xs sm:text-sm text-muted-foreground">{featuredGem.views || 0} views</span>
                        </div>
              <div className="flex items-center gap-1 sm:gap-2">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                          <span className="text-xs sm:text-sm text-green-500">{featuredGem.marketTrend || 'Stable'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 sm:mb-2">
                        {featuredGem.price ? `$${featuredGem.price.toLocaleString()}` : 
                         featuredGem.currentHighestBid ? `$${featuredGem.currentHighestBid.toLocaleString()}` :
                         featuredGem.startingBid ? `$${featuredGem.startingBid.toLocaleString()}` : 'Price on request'}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {featuredGem.listingType === 'auction' ? 'Current Bid' : 'Investment Value'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Auction Timer */}
                  {featuredGem.listingType === 'auction' && featuredGem.auctionEndTime && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                      <AuctionTimer
                        auctionStartTime={featuredGem.auctionStartTime || ''}
                        auctionEndTime={featuredGem.auctionEndTime}
                        currentHighestBid={featuredGem.currentHighestBid}
                        reservePrice={featuredGem.reservePrice}
                        compact={true}
                        showLabels={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CursorReactive>
          </div>
          
          {/* Secondary Gems - Asymmetric Layout */}
          <div className="xl:col-span-5">
            <div className="space-y-6">
              {/* Gem Selection Pills */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {gems.slice(0, 4).map((gem) => (
                  <button
                    key={gem._id}
                    onClick={() => setSelectedGem(gem)}
                    className={cn(
                      "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border",
                      selectedGem?._id === gem._id
                        ? "bg-primary text-primary-foreground border-primary shadow-lg"
                        : "bg-secondary/50 text-secondary-foreground border-border/50 hover:border-primary/50 hover:bg-primary/10"
                    )}
                  >
                    {gem.gemType}
                  </button>
                ))}
              </div>
              
              {/* Secondary Gems Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {secondaryGems.map((gem, index) => (
                  <CursorReactive
                    key={gem._id}
                    className={cn(
                      "group relative cursor-pointer",
                      index === 0 && "sm:col-span-2", // First item spans full width
                      index === 1 && "sm:row-span-2" // Second item is taller
                    )}
                    enableTilt={true}
                    maxRotation={6}
                    enableScale={true}
                    scaleAmount={1.02}
                  >
                    <div 
                      className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:border-primary/30 transition-all duration-500"
                      onClick={() => handleGemClick(gem)}
                    >
                      {/* Image */}
                      <div className={cn(
                        "relative overflow-hidden",
                        index === 0 ? "aspect-[2/1]" : "aspect-square"
                      )}>
                        <Image
                          src={gem.media?.find(m => m.isPrimary)?.url || gem.media?.[0]?.url || '/images/gem-placeholder.svg'}
                          alt={formatGemName(gem)}
                          fill
                          className="object-cover transition-all duration-700"
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Quick Info on Hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="text-white text-center">
                            <div className="font-bold text-lg mb-1">{gem.weight.value}{gem.weight.unit}</div>
                            <div className="text-sm opacity-90">{gem.clarity}</div>
                          </div>
                        </div>
                        
                        {/* Floating Badges */}
                        <div className="absolute top-3 right-3 flex flex-col gap-1">
                          {gem.listingType === 'auction' && (
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                              AUCTION
                            </div>
                          )}
                          {isNewGem(gem.createdAt) && (
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                              NEW
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-3 sm:p-4">
                        <h4 className="font-serif text-sm sm:text-base lg:text-lg font-bold text-foreground mb-1.5 sm:mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                          {formatGemName(gem)}
                        </h4>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{gem.origin}</span>
                          </div>
                          
                          <div className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {gem.price ? `$${gem.price.toLocaleString()}` : 
                             gem.currentHighestBid ? `$${gem.currentHighestBid.toLocaleString()}` :
                             gem.startingBid ? `$${gem.startingBid.toLocaleString()}` : 'POA'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CursorReactive>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Action Section */}
        <div className="relative px-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl sm:rounded-2xl border border-primary/20 backdrop-blur-sm">
            <div className="text-center sm:text-left">
              <h3 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                Discover More Exceptional Gems
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
                Explore our complete collection of {gems.length}+ premium gemstones
              </p>
            </div>
            
            <button 
              onClick={handleViewAll}
              className="group bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center"
            >
              <span>View All Collection</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse-slow opacity-60"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse-slow opacity-60" style={{ animationDelay: '1s' }}></div>
    </section>
  )
} 