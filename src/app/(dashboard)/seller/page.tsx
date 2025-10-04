'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Package, TrendingUp, DollarSign, Eye, Store, Star, Gavel, Calendar, Target, Award } from 'lucide-react'
import Link from 'next/link'
import PageTitle from '@/components/dashboard/PageTitle'
import gemService from '@/services/gem.service'
import { EnhancedGem } from '@/types/entities'
import SalesChart from '@/components/charts/SalesChart'
import ViewsChart from '@/components/charts/ViewsChart'
import CategoryChart from '@/components/charts/CategoryChart'
import PriceRangeChart from '@/components/charts/PriceRangeChart'
import { 
  StatsGridSkeleton, 
  AdditionalMetricsSkeleton, 
  ChartsGridSkeleton, 
  SellerHeaderSkeleton,
  QuickActionsSkeleton,
  PerformanceInsightsSkeleton,
  GettingStartedSkeleton
} from '@/components/loading'

interface SellerStats {
  activeListings: number
  totalViews: number
  totalSales: number
  totalRevenue: number
  avgPrice: number
  conversionRate: number
  monthlySales: Array<{
    month: string
    sales: number
    revenue: number
  }>
  topGems: Array<{
    gem: string
    views: number
  }>
  categoryBreakdown: Array<{
    name: string
    value: number
    color: string
  }>
  priceRanges: Array<{
    range: string
    count: number
    avgPrice: number
  }>
}

export default function SellerDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<SellerStats>({
    activeListings: 0,
    totalViews: 0,
    totalSales: 0,
    totalRevenue: 0,
    avgPrice: 0,
    conversionRate: 0,
    monthlySales: [],
    topGems: [],
    categoryBreakdown: [],
    priceRanges: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch seller statistics
  useEffect(() => {
    const fetchSellerStats = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        setError(null)

        // Fetch seller's gems to calculate stats
        // Note: We need to fetch multiple times to get all statuses (active + sold)
        // First, get active listings
        const activeResponse = await gemService.getMyGems({
          limit: 100,
          sortBy: 'submittedAt',
          sortOrder: 'desc'
        })
        
        // Then, get sold gems for revenue calculation
        const soldResponse = await gemService.getMyGems({
          status: 'sold',
          limit: 100,
          sortBy: 'submittedAt', // Use valid sortBy field (soldAt is not in validation schema)
          sortOrder: 'desc'
        })
        
        // Combine both responses
        const allGems = [
          ...(activeResponse.data?.data?.gems || []),
          ...(soldResponse.data?.data?.gems || [])
        ]
        
        const response = {
          ...activeResponse,
          data: activeResponse.data ? {
            ...activeResponse.data,
            data: {
              gems: allGems,
              pagination: {
                total: allGems.length,
                pages: 1,
                page: 1,
                limit: allGems.length
              }
            }
          } : undefined
        }

        if (response.success && response.data && response.data.data) {
          const gems: EnhancedGem[] = response.data.data.gems || []
          
          // Calculate basic statistics
          const activeListings = gems.filter((gem: EnhancedGem) => 
            gem.status === 'published' || gem.status === 'verified'
          ).length
          
          const totalViews = gems.reduce((sum: number, gem: EnhancedGem) => sum + (gem.views || 0), 0)
          
          const soldGems = gems.filter((gem: EnhancedGem) => gem.status === 'sold')
          const totalSales = soldGems.length
          
          const totalRevenue = soldGems.reduce((sum: number, gem: EnhancedGem) => {
            return sum + (gem.soldPrice || gem.price || 0)
          }, 0)

          // Calculate additional metrics
          const avgPrice = gems.length > 0 ? gems.reduce((sum, gem) => sum + (gem.price || 0), 0) / gems.length : 0
          const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0

          // Generate monthly sales data (last 6 months)
          const monthlySales = generateMonthlySalesData(soldGems)
          
          // Top performing gems by views
          const topGems = gems
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5)
            .map(gem => ({
              gem: gem.gemType || 'Unnamed Gem',
              views: gem.views || 0
            }))

          // Category breakdown
          const categoryBreakdown = generateCategoryBreakdown(gems)
          
          // Price ranges
          const priceRanges = generatePriceRanges(gems)

          setStats({
            activeListings,
            totalViews,
            totalSales,
            totalRevenue,
            avgPrice,
            conversionRate,
            monthlySales,
            topGems,
            categoryBreakdown,
            priceRanges
          })
        } else {
          setError(response.message || 'Failed to fetch seller statistics')
        }
      } catch (err) {
        console.error('Error fetching seller stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchSellerStats()
  }, [user?.id])

  // Helper functions for data generation
  const generateMonthlySalesData = (soldGems: EnhancedGem[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentDate = new Date()
    const monthlyData = []
    
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = months[targetDate.getMonth()]
      
      const monthlySales = soldGems.filter(gem => {
        if (!gem.soldAt) return false
        const soldDate = new Date(gem.soldAt)
        return soldDate.getMonth() === targetDate.getMonth() && 
               soldDate.getFullYear() === targetDate.getFullYear()
      })
      
      const monthlyRevenue = monthlySales.reduce((sum, gem) => 
        sum + (gem.soldPrice || gem.price || 0), 0
      )
      
      monthlyData.push({
        month: monthKey,
        sales: monthlySales.length,
        revenue: monthlyRevenue
      })
    }
    
    return monthlyData
  }

  const generateCategoryBreakdown = (gems: EnhancedGem[]) => {
    const categoryMap = new Map<string, number>()
    
    gems.forEach(gem => {
      const category = gem.gemType || 'Other'
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })
    
    const colors = ['#d4af37', '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16']
    
    return Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }))
  }

  const generatePriceRanges = (gems: EnhancedGem[]) => {
    const ranges = [
      { min: 0, max: 100, label: '$0-100' },
      { min: 100, max: 500, label: '$100-500' },
      { min: 500, max: 1000, label: '$500-1K' },
      { min: 1000, max: 5000, label: '$1K-5K' },
      { min: 5000, max: 10000, label: '$5K-10K' },
      { min: 10000, max: Infinity, label: '$10K+' }
    ]
    
    return ranges.map(range => {
      const gemsInRange = gems.filter(gem => {
        const price = gem.price || 0
        return price >= range.min && price < range.max
      })
      
      const avgPrice = gemsInRange.length > 0 
        ? gemsInRange.reduce((sum, gem) => sum + (gem.price || 0), 0) / gemsInRange.length
        : 0
      
      return {
        range: range.label,
        count: gemsInRange.length,
        avgPrice: Math.round(avgPrice)
      }
    })
  }

  return (
    <>
      <PageTitle title="Seller Dashboard" />
      <div className="space-y-6">
        {/* Seller Header */}
        {loading ? (
          <SellerHeaderSkeleton />
        ) : (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                    Seller Dashboard
                    <Star className="w-5 h-5 text-amber-500" />
                  </h1>
                  <p className="text-muted-foreground">
                    Welcome back, {user?.fullName?.split(' ')[0] || 'Seller'}! Manage your <span className="font-semibold text-primary">Ishq Gems</span> listings
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Store className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Verified Seller</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">
              Failed to load statistics: {error}
            </p>
          </div>
        ) : loading ? (
          <StatsGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeListings.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalSales.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        {!error && loading ? (
          <AdditionalMetricsSkeleton />
        ) : !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-border/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Price</p>
                  <p className="text-2xl font-bold text-foreground">${stats.avgPrice.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold text-foreground">{stats.conversionRate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeListings + stats.totalSales}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {!error && loading ? (
          <ChartsGridSkeleton />
        ) : !error && (
          <div className="space-y-6">
            {/* Sales Performance Chart */}
            <SalesChart data={stats.monthlySales} loading={loading} />
            
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ViewsChart data={stats.topGems} loading={loading} />
              <CategoryChart data={stats.categoryBreakdown} loading={loading} />
            </div>
            
            {/* Price Distribution Chart */}
            <PriceRangeChart data={stats.priceRanges} loading={loading} />
          </div>
        )}

        {/* Quick Actions */}
        {loading ? (
          <QuickActionsSkeleton />
        ) : (
          <div className="bg-card border border-border/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/dashboard/add-gem"
                className="p-4 border border-border/30 rounded-lg hover:bg-secondary/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Add New Gem</h3>
                    <p className="text-sm text-muted-foreground">List a new gemstone</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/listings"
                className="p-4 border border-border/30 rounded-lg hover:bg-secondary/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Manage Listings</h3>
                    <p className="text-sm text-muted-foreground">View and edit your gems</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/seller/bids"
                className="p-4 border border-border/30 rounded-lg hover:bg-secondary/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <Gavel className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Manage Auctions</h3>
                    <p className="text-sm text-muted-foreground">Monitor and finalize bids</p>
                  </div>
                </div>
              </Link>

              <div className="p-4 border border-border/30 rounded-lg opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted-foreground/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Sales Reports</h3>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Insights */}
        {!error && loading ? (
          <PerformanceInsightsSkeleton />
        ) : !error && (
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Performance Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Top Insights</h3>
                <div className="space-y-2">
                  {stats.topGems.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-foreground">
                        &ldquo;{stats.topGems[0].gem}&rdquo; is your most viewed gem ({stats.topGems[0].views} views)
                      </span>
                    </div>
                  )}
                  {stats.categoryBreakdown.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-foreground">
                        {stats.categoryBreakdown[0].name} is your top category ({stats.categoryBreakdown[0].value} gems)
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-foreground">
                      Your conversion rate is {stats.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Quick Tips</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Add high-quality photos to increase views</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Update listings regularly to stay active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Respond to inquiries quickly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started */}
        {loading ? (
          <GettingStartedSkeleton />
        ) : (
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Getting Started</h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-foreground">Complete your seller profile</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
                <span className="text-muted-foreground">Add your first gemstone listing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
                <span className="text-muted-foreground">Configure payment and shipping preferences</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}