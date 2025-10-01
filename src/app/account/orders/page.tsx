'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { 
  FileText, 
  Search, 
  Filter, 
  ArrowLeft, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw
} from 'lucide-react'
import orderService from '@/services/order.service'
import { Order, OrderListQuery } from '@/types/entities/order'
import BuyerOrderCard from '@/components/orders/BuyerOrderCard'
import OrderTable from '@/components/orders/OrderTable'

export default function OrdersPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [filters, setFilters] = useState<OrderListQuery>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Stats state
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: 0, // Last 30 days
    averageOrderValue: 0
  })

  // Calculate stats from orders
  const calculateStats = useCallback((ordersList: Order[]) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const totalOrders = ordersList.length
    const totalSpent = ordersList.reduce((sum, order) => sum + order.totalAmount, 0)
    const pendingOrders = ordersList.filter(order => 
      ['pending', 'processing', 'shipped'].includes(order.status)
    ).length
    const completedOrders = ordersList.filter(order => 
      ['delivered'].includes(order.status)
    ).length
    const recentOrders = ordersList.filter(order => 
      new Date(order.createdAt) >= thirtyDaysAgo
    ).length
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

    setStats({
      totalOrders,
      totalSpent,
      pendingOrders,
      completedOrders,
      recentOrders,
      averageOrderValue
    })
  }, [])

  // Fetch orders based on user role - always fetch as buyer for personal orders
  const fetchOrders = useCallback(async (newFilters?: Partial<OrderListQuery>, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      // Always fetch as 'buyer' since this page is for personal orders (what they bought)
      const response = await orderService.getMyOrders({
        ...filters,
        ...newFilters
      }, 'buyer')
      
      if (response.success && response.data) {
        setOrders(response.data.orders)
        calculateStats(response.data.orders)
      } else {
        setError(response.message || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('An error occurred while fetching orders')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters, calculateStats])

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchOrders()
    }
  }, [isAuthenticated, isLoading, fetchOrders])

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin?message=Please sign in to view your orders')
    }
  }, [isAuthenticated, isLoading, router])

  const handleFilterChange = (newFilters: Partial<OrderListQuery>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    fetchOrders(newFilters)
  }

  const handleRefresh = () => {
    fetchOrders({}, true)
  }

  const handleBack = () => {
    router.back()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading your orders...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-destructive mb-4 text-2xl">⚠️</div>
          <p className="text-muted-foreground text-sm sm:text-base">{error}</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Enhanced Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-secondary/50 rounded-xl transition-all duration-200 border border-border/30 hover:border-primary/30"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary transition-colors" />
              </button>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                    <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">{stats.totalOrders}</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    My Orders
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Your Personal Purchase History
                  </p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Action buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-xl transition-all duration-200 border border-border/30 hover:border-primary/30"
              >
                <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Refresh</span>
              </button>
              <button 
                onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                className="flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-xl transition-all duration-200 border border-border/30 hover:border-primary/30 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                  {viewMode === 'cards' ? 'Table' : 'Cards'}
                </span>
              </button>
              <button className="p-2 hover:bg-secondary/50 rounded-xl transition-all duration-200 border border-border/30 hover:border-primary/30">
                <Search className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
              </button>
              <button className="p-2 hover:bg-secondary/50 rounded-xl transition-all duration-200 border border-border/30 hover:border-primary/30">
                <Filter className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && orders.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Total Orders */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShoppingBag className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
                  <p className="text-lg font-bold text-foreground">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Spent</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(stats.totalSpent)}</p>
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Pending</p>
                  <p className="text-lg font-bold text-foreground">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Completed</p>
                  <p className="text-lg font-bold text-foreground">{stats.completedOrders}</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Last 30 Days</p>
                  <p className="text-lg font-bold text-foreground">{stats.recentOrders}</p>
                </div>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Avg. Value</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(stats.averageOrderValue)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {orders.length === 0 ? (
          // Enhanced Empty State
          <div className="max-w-md mx-auto text-center py-16">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-xl"></div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
              No orders yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your personal orders here
            </p>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          // Enhanced Orders View
          <div className="max-w-7xl mx-auto">
            {viewMode === 'table' && user.role === 'admin' ? (
              <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/30 overflow-hidden">
                <OrderTable
                  orders={orders}
                  onRefresh={handleRefresh}
                  onFilterChange={handleFilterChange}
                  loading={loading}
                  baseRoute="/account/orders"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order._id} className="transform transition-all duration-200">
                    <BuyerOrderCard order={order} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 