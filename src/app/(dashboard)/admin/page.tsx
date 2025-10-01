'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  ShoppingBag,
  DollarSign, 
  AlertTriangle, 
  Shield,
  UserCheck,
  UserX,
  Store,
  Plus,
  Package,
  Star,
  Gavel,
  Loader2,
  RefreshCw,
  CheckCircle,
  Receipt
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import PageTitle from '@/components/dashboard/PageTitle'
import adminService from '@/services/admin.service'

// Icon mapping for activities
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCheck,
  Shield,
  AlertTriangle,
  UserX,
  Package: Package,
  ShoppingBag
}

interface DashboardStats {
  overview: {
    totalUsers: number
    totalSellers: number
    totalBuyers: number
    activeUsers: number
    pendingVerifications: number
    totalListings: number
    activeListings: number
    publishedListings: number
    pendingListings?: number
    totalOrders: number
    monthlyOrders: number
    platformRevenue: number
    monthlyRevenue: number
    reportedListings: number
    pendingPaymentReceipts: number
    orderGrowthRate: number
  }
  recentActivity: {
    newUsersThisWeek: number
    newApplicationsThisWeek: number
    newListingsThisWeek: number
    ordersThisWeek: number
  }
  trends: {
    userGrowth: number
    sellerGrowth: number
    listingGrowth: number
    orderGrowth: number
  }
}

interface Activity {
  id: string
  type: string
  message: string
  time: string
  icon: string
  color: string
  metadata?: Record<string, unknown>
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true)
      
      const [statsResponse, activityResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivity(8)
      ])

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      } else {
        setError(statsResponse.message || 'Failed to fetch dashboard statistics')
      }

      if (activityResponse.success && activityResponse.data) {
        setActivities(activityResponse.data)
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const quickActions = [
    {
      title: 'Add Gem',
      description: 'Add premium gems as Ishq Gems',
      href: '/dashboard/add-gem',
      icon: Plus,
      color: 'bg-emerald-500'
    },
    {
      title: 'Approve Listings',
      description: 'Review seller submitted gems',
      href: '/admin/approve-listings',
      icon: CheckCircle,
      color: 'bg-green-600',
      badge: stats?.overview.pendingListings,
      priority: true
    },
    {
      title: 'My Listings',
      description: 'Manage Ishq Gems listings',
      href: '/dashboard/listings',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Bids',
      description: 'Monitor and manage auction bids',
      href: '/admin/bids',
      icon: Gavel,
      color: 'bg-purple-500'
    },
    {
      title: 'Verify Sellers',
      description: 'Review pending seller verifications',
      href: '/admin/verifications',
      icon: Shield,
      color: 'bg-amber-500',
      badge: stats?.overview.pendingVerifications
    },
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      href: '/admin/sellers',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Review Reports',
      description: 'Handle reported listings',
      href: '/admin/reports',
      icon: AlertTriangle,
      color: 'bg-red-500',
      badge: stats?.overview.reportedListings
    },
    {
      title: 'Verify Receipts',
      description: 'Review payment receipts',
      href: '/admin/orders',
      icon: Receipt,
      color: 'bg-purple-500',
      badge: stats?.overview.pendingPaymentReceipts,
      priority: true
    }
  ]

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return time.toLocaleDateString()
  }

  const getActivityIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Package
    return IconComponent
  }

  if (isLoading) {
    return (
      <>
        <PageTitle title="Admin Dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !stats) {
    return (
      <>
        <PageTitle title="Admin Dashboard" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Error Loading Dashboard</h3>
              <p className="text-muted-foreground">{error || 'Failed to load dashboard data'}</p>
            </div>
            <button
              onClick={() => fetchDashboardData()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Admin Dashboard" />
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  Admin Dashboard
                  <Shield className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.fullName.split(' ')[0]}! Manage the <span className="font-semibold text-primary">Ishq Gems</span> platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                title="Refresh dashboard"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.overview.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.overview.activeUsers} active
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Sellers</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.overview.totalSellers}</p>
                {stats.overview.pendingVerifications > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {stats.overview.pendingVerifications} pending verification
                  </p>
                )}
              </div>
              <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Platform Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">${stats.overview.platformRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  +${stats.overview.monthlyRevenue.toLocaleString()} this month
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Orders</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.overview.totalOrders.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">
                  +{stats.overview.monthlyOrders} this month
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* User Breakdown */}
        <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">User Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 sm:p-4 bg-secondary/20 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.overview.totalBuyers.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Buyers</div>
              <div className="text-xs text-green-600 mt-1">
                {((stats.overview.totalBuyers / stats.overview.totalUsers) * 100).toFixed(1)}% of users
              </div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-secondary/20 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.overview.totalSellers}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Sellers</div>
              <div className="text-xs text-blue-600 mt-1">
                {((stats.overview.totalSellers / stats.overview.totalUsers) * 100).toFixed(1)}% of users
              </div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-secondary/20 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.overview.activeListings.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active Listings</div>
              <div className="text-xs text-purple-600 mt-1">
                {stats.overview.totalListings - stats.overview.activeListings} inactive
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="relative flex flex-col items-center space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg border border-border/30 hover:border-primary/50 transition-all duration-200 hover:shadow-md group"
              >
                {action.badge !== undefined && action.badge !== null && action.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
                    {action.badge}
                  </span>
                )}
                <div className={`p-2 sm:p-3 ${action.color} rounded-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm sm:text-base">
                    {action.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Real-time Notifications Panel */}
        <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">System Notifications</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </span>
            </div>
          </div>

          {/* New Users, Applications, and Listings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-secondary/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {stats?.recentActivity.newUsersThisWeek || 0}
              </div>
              <div className="text-sm text-muted-foreground">New Users This Week</div>
            </div>
            <div className="text-center p-4 bg-secondary/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {stats?.recentActivity.newApplicationsThisWeek || 0}
              </div>
              <div className="text-sm text-muted-foreground">New Applications</div>
            </div>
            <div className="text-center p-4 bg-secondary/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {stats?.recentActivity.newListingsThisWeek || 0}
              </div>
              <div className="text-sm text-muted-foreground">New Listings</div>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="space-y-3">
            {(stats?.overview.pendingVerifications || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Seller Verification Pending</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{stats.overview.pendingVerifications} applications require review</p>
                  </div>
                </div>
                <Link href="/admin/verifications" className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                  Review
                </Link>
              </div>
            )}

            {(stats?.overview.reportedListings || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">Reported Content</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{stats.overview.reportedListings} reported listings</p>
                  </div>
                </div>
                <Link href="/admin/reports" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                  Review
                </Link>
              </div>
            )}

            {(stats?.overview.pendingListings || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Listings Awaiting Approval</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{stats.overview.pendingListings} seller gems need review</p>
                  </div>
                </div>
                <Link href="/admin/approve-listings" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Review
                </Link>
              </div>
            )}

            {(stats?.overview.pendingPaymentReceipts || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-200">Payment Receipt Verification</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">{stats.overview.pendingPaymentReceipts} bank transfer receipts need verification</p>
                  </div>
                </div>
                <Link href="/admin/orders" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                  Review
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">High-Value Transactions</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Monitor transactions over $10,000</p>
                </div>
              </div>
              <Link href="/admin/orders" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                View
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Recent Activity</h2>
            <Link
              href="/admin/activity"
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => {
                const IconComponent = getActivityIcon(activity.icon)
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg bg-secondary/20 border border-border/20"
                  >
                    <div className={`p-2 bg-secondary/50 rounded-lg ${activity.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.time)}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 