'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Package, TrendingUp, DollarSign, Eye, Store, Star, Gavel, Loader2 } from 'lucide-react'
import Link from 'next/link'
import PageTitle from '@/components/dashboard/PageTitle'
import gemService from '@/services/gem.service'
import { EnhancedGem } from '@/types/entities'

interface SellerStats {
  activeListings: number
  totalViews: number
  totalSales: number
  totalRevenue: number
}

export default function SellerDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<SellerStats>({
    activeListings: 0,
    totalViews: 0,
    totalSales: 0,
    totalRevenue: 0
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
        const response = await gemService.getMyGems({
          limit: 100, // Get all gems to calculate accurate stats
          sortBy: 'submittedAt',
          sortOrder: 'desc'
        })

        if (response.success && response.data && response.data.data) {
          const gems: EnhancedGem[] = response.data.data.gems || []
          
          // Calculate statistics
          const activeListings = gems.filter((gem: EnhancedGem) => 
            gem.status === 'published' || gem.status === 'verified'
          ).length
          
          const totalViews = gems.reduce((sum: number, gem: EnhancedGem) => sum + (gem.views || 0), 0)
          
          const soldGems = gems.filter((gem: EnhancedGem) => gem.status === 'sold')
          const totalSales = soldGems.length
          
          const totalRevenue = soldGems.reduce((sum: number, gem: EnhancedGem) => {
            return sum + (gem.soldPrice || gem.price || 0)
          }, 0)

          setStats({
            activeListings,
            totalViews,
            totalSales,
            totalRevenue
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

  return (
    <>
      <PageTitle title="Seller Dashboard" />
      <div className="space-y-6">
        {/* Seller Header */}
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

        {/* Seller Notice */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Store className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-300">Professional Seller Portal</h3>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Access your seller tools to manage listings, track performance, and grow your gemstone business on our platform.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">
              Failed to load statistics: {error}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stats.activeListings.toLocaleString()}</p>
                  )}
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
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
                  )}
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
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stats.totalSales.toLocaleString()}</p>
                  )}
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
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
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

        {/* Getting Started */}
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
      </div>
    </>
  )
}