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
  RefreshCw,
  X,
  SortAsc,
  SortDesc
} from 'lucide-react'
import orderService from '@/services/order.service'
import { Order, OrderListQuery, OrderStatus, OrderSource } from '@/types/entities/order'
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

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<{
    status: OrderStatus | 'all'
    source: OrderSource | 'all'
    dateFrom: string
    dateTo: string
  }>({
    status: 'all',
    source: 'all',
    dateFrom: '',
    dateTo: ''
  })
  
  // Store all orders from API
  const [allOrders, setAllOrders] = useState<Order[]>([])

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

  // Apply client-side filtering to orders
  const applyFilters = useCallback(() => {
    let filtered = [...allOrders]

    // Search filter
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.buyerDetails?.name?.toLowerCase().includes(searchLower) ||
        order.buyerDetails?.email?.toLowerCase().includes(searchLower) ||
        order.subOrders?.some(subOrder => 
          subOrder.sellerDetails?.name?.toLowerCase().includes(searchLower) ||
          subOrder.items?.some(item => 
            item.gemDetails?.name?.toLowerCase().includes(searchLower) ||
            item.gemDetails?.gemType?.toLowerCase().includes(searchLower) ||
            item.gemDetails?.color?.toLowerCase().includes(searchLower)
          )
        )
      )
    }

    // Status filter
    if (activeFilters.status !== 'all') {
      filtered = filtered.filter(order => order.status === activeFilters.status)
    }

    // Source filter
    if (activeFilters.source !== 'all') {
      filtered = filtered.filter(order => order.source === activeFilters.source)
    }

    // Date range filter
    if (activeFilters.dateFrom || activeFilters.dateTo) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.placedAt)
        
        if (activeFilters.dateFrom) {
          const fromDate = new Date(activeFilters.dateFrom)
          if (orderDate < fromDate) return false
        }
        
        if (activeFilters.dateTo) {
          const toDate = new Date(activeFilters.dateTo)
          toDate.setHours(23, 59, 59, 999)
          if (orderDate > toDate) return false
        }
        
        return true
      })
    }

    setOrders(filtered)
    calculateStats(filtered)
  }, [allOrders, searchTerm, activeFilters, calculateStats])

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
        setAllOrders(response.data.orders)
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

  // Re-apply filters when search term or active filters change
  useEffect(() => {
    if (allOrders.length > 0) {
      applyFilters()
    }
  }, [searchTerm, activeFilters, allOrders, applyFilters])

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showFilters) {
          setShowFilters(false)
        }
      }
    }

    if (showFilters) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [showFilters])

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

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const clearAllFilters = () => {
    setActiveFilters({
      status: 'all',
      source: 'all',
      dateFrom: '',
      dateTo: ''
    })
    setSearchTerm('')
  }

  const hasActiveFilters = searchTerm || 
    activeFilters.status !== 'all' || 
    activeFilters.source !== 'all' || 
    activeFilters.dateFrom || 
    activeFilters.dateTo

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
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Top Row - Title and Back Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleBack}
                  className="p-1.5 sm:p-2 hover:bg-secondary/50 rounded-xl transition-all duration-200 border border-border/30 hover:border-primary/30"
                  title="Go Back"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary transition-colors" />
                </button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="p-1.5 sm:p-2 lg:p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">{stats.totalOrders}</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-serif font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      My Orders
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      Your Personal Purchase History
                    </p>
                  </div>
                </div>
              </div>
              
              {/* View Mode Indicator - Mobile */}
              <div className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-lg sm:hidden">
                <div className={`w-2 h-2 rounded-full ${viewMode === 'cards' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                <span className="text-xs text-muted-foreground font-medium">
                  {viewMode === 'cards' ? 'Cards' : 'Table'}
                </span>
              </div>
            </div>
            
            {/* Search and Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Search Input - Desktop */}
              <div className="relative flex-1 hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search orders, sellers, gems..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-xl transition-all duration-200 border border-border/30 hover:border-primary/30"
                  title="Refresh orders"
                >
                  <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium text-muted-foreground hidden sm:inline lg:hidden xl:inline">Refresh</span>
                </button>
                <button 
                  onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl transition-all duration-200 border cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-secondary/50 hover:bg-secondary border-border/30 hover:border-primary/30 text-muted-foreground hover:text-primary'
                  }`}
                  title={`Switch to ${viewMode === 'cards' ? 'table' : 'cards'} view`}
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline lg:hidden xl:inline">
                    {viewMode === 'cards' ? 'Table' : 'Cards'}
                  </span>
                </button>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl transition-all duration-200 border ${
                    showFilters || hasActiveFilters
                      ? 'bg-primary/20 border-primary/50 text-primary' 
                      : 'bg-secondary/50 hover:bg-secondary border-border/30 hover:border-primary/30 text-muted-foreground hover:text-primary'
                  }`}
                  title="Filter orders"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline lg:hidden xl:inline">Filters</span>
                  {hasActiveFilters && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Modal Popup */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowFilters(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-card rounded-xl sm:rounded-2xl border border-border/50 shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/30 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">Filter Orders</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Customize your order view</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:bg-secondary/50 rounded-lg"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1.5 sm:p-2 hover:bg-secondary/50 rounded-lg transition-colors group"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Status Filter */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Order Status
                  </label>
                  <select
                    value={activeFilters.status}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, status: e.target.value as OrderStatus | 'all' }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>

                {/* Source Filter */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Order Source
                  </label>
                  <select
                    value={activeFilters.source}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, source: e.target.value as OrderSource | 'all' }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Sources</option>
                    <option value="cart">Cart</option>
                    <option value="auction">Auction</option>
                    <option value="direct">Direct</option>
                  </select>
                </div>

                {/* Date From Filter */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={activeFilters.dateFrom}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 text-sm"
                  />
                </div>

                {/* Date To Filter */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={activeFilters.dateTo}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 text-sm"
                  />
                </div>

                {/* Sort By */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as 'createdAt' | 'totalAmount' | 'status' })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 text-sm"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="totalAmount">Total Amount</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Sort Order
                  </label>
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={() => handleFilterChange({ sortOrder: 'asc' })}
                      className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                        filters.sortOrder === 'asc'
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border'
                      }`}
                    >
                      <SortAsc className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Ascending</span>
                      <span className="sm:hidden">Asc</span>
                    </button>
                    <button
                      onClick={() => handleFilterChange({ sortOrder: 'desc' })}
                      className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                        filters.sortOrder === 'desc'
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border'
                      }`}
                    >
                      <SortDesc className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Descending</span>
                      <span className="sm:hidden">Desc</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-6 border-t border-border/30 bg-card/50 backdrop-blur-sm">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {hasActiveFilters ? 'Filters applied' : 'No filters applied'}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-lg shadow-primary/20 text-xs sm:text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Active filters:</span>
            
            {searchTerm && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium">
                <Search className="w-3 h-3" />
                <span>&ldquo;{searchTerm}&rdquo;</span>
                <button
                  onClick={() => handleSearchChange('')}
                  className="ml-1 hover:bg-primary/30 rounded p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {activeFilters.status !== 'all' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-600 rounded-lg text-sm font-medium">
                <span className="capitalize">{activeFilters.status}</span>
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, status: 'all' }))}
                  className="hover:bg-blue-500/30 rounded p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {activeFilters.source !== 'all' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-600 rounded-lg text-sm font-medium">
                <span className="capitalize">{activeFilters.source}</span>
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, source: 'all' }))}
                  className="hover:bg-green-500/30 rounded p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {(activeFilters.dateFrom || activeFilters.dateTo) && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-600 rounded-lg text-sm font-medium">
                <Calendar className="w-3 h-3" />
                <span>
                  {activeFilters.dateFrom && activeFilters.dateTo
                    ? `${activeFilters.dateFrom} - ${activeFilters.dateTo}`
                    : activeFilters.dateFrom
                    ? `From ${activeFilters.dateFrom}`
                    : `Until ${activeFilters.dateTo}`
                  }
                </span>
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }))}
                  className="hover:bg-purple-500/30 rounded p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="ml-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && orders.length > 0 && (
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Total Orders */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
                  <p className="text-base sm:text-lg font-bold text-foreground">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Spent</p>
                  <p className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(stats.totalSpent)}</p>
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Pending</p>
                  <p className="text-base sm:text-lg font-bold text-foreground">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Completed</p>
                  <p className="text-base sm:text-lg font-bold text-foreground">{stats.completedOrders}</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-purple-500/10 rounded-lg">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Last 30 Days</p>
                  <p className="text-base sm:text-lg font-bold text-foreground">{stats.recentOrders}</p>
                </div>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Avg. Value</p>
                  <p className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(stats.averageOrderValue)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 pb-6 sm:pb-8">
        {orders.length === 0 ? (
          // Enhanced Empty State
          <div className="max-w-md mx-auto text-center py-12 sm:py-16">
            <div className="relative mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-xl"></div>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3">
              No orders yet
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Start shopping to see your personal orders here
            </p>
            <button 
              onClick={() => router.push('/')}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium cursor-pointer text-sm sm:text-base"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          // Enhanced Orders View
          <div className="max-w-7xl mx-auto">
            <div className="animate-in fade-in duration-300">
              {viewMode === 'table' ? (
                <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/30 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                  <OrderTable
                    orders={orders}
                    onRefresh={handleRefresh}
                    onFilterChange={handleFilterChange}
                    loading={loading}
                    baseRoute="/account/orders"
                  />
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  {orders.map(order => (
                    <div key={order._id} className="transform transition-all duration-200 hover:scale-[1.01] sm:hover:scale-[1.02]">
                      <BuyerOrderCard order={order} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 