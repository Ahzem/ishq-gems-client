'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Package, TrendingUp, Calendar, ShoppingBag, ToggleLeft, ToggleRight } from 'lucide-react'
import orderService from '@/services/order.service'
import { Order, OrderListQuery, OrderStatus } from '@/types/entities/order'
import SellerOrderTable from '@/components/orders/SellerOrderTable'
import OrdersPageLayout from '@/components/dashboard/OrdersPageLayout'

export default function SellerOrdersPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [statsCache, setStatsCache] = useState<{
    activeCount: number
    totalCount: number
    pendingCount: number
    processingCount: number
    completedCount: number
    lastUpdated: number
  }>({
    activeCount: 0,
    totalCount: 0,
    pendingCount: 0,
    processingCount: 0,
    completedCount: 0,
    lastUpdated: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllOrders, setShowAllOrders] = useState(false) // Toggle between active and all orders
  const [filters, setFilters] = useState<OrderListQuery>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
    // Status filter will be applied dynamically based on showAllOrders toggle
  })

  // Alert state
  const [alert, setAlert] = useState<{
    isVisible: boolean
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
  }>({
    isVisible: false,
    type: 'info',
    message: ''
  })

  // Helper function for showing alerts
  const showAlert = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setAlert({ isVisible: false, type: 'info', message: '' })
    
    setTimeout(() => {
      setAlert({ isVisible: true, type, message })
    }, 100)
  }

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isVisible: false }))
  }

  // Update stats cache based on fetched orders
  const updateStatsFromOrders = useCallback((fetchedOrders: Order[], isShowingAll: boolean) => {
    if (!fetchedOrders || fetchedOrders.length === 0) return
    
    const pendingCount = fetchedOrders.filter(o => o.status === 'pending').length
    const processingCount = fetchedOrders.filter(o => ['processing', 'shipped'].includes(o.status)).length
    const completedCount = fetchedOrders.filter(o => ['delivered', 'cancelled', 'refunded', 'returned'].includes(o.status)).length
    const activeCount = fetchedOrders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length
    
    setStatsCache(prev => {
      // Update our cache intelligently based on what we fetched
      if (isShowingAll) {
        // If showing all orders, we have complete data
        return {
          activeCount,
          totalCount: fetchedOrders.length,
          pendingCount,
          processingCount,
          completedCount,
          lastUpdated: Date.now()
        }
      } else {
        // If showing active orders only, update active stats but preserve completed count if we have it
        return {
          activeCount,
          totalCount: Math.max(prev.totalCount, activeCount + prev.completedCount),
          pendingCount,
          processingCount,
          completedCount: prev.completedCount || 0, // Keep previous completed count
          lastUpdated: Date.now()
        }
      }
    })
  }, [])

  // Fetch seller orders
  const fetchOrders = useCallback(async (newFilters?: Partial<OrderListQuery>) => {
    try {
      setLoading(true)
      setError(null)
      
      const finalFilters = {
        ...filters,
        ...newFilters
      }

      // Apply or remove status filter based on showAllOrders toggle
      if (!showAllOrders) {
        // If showing active orders only, apply default status filter unless user has specifically selected statuses
        if (!newFilters?.status && !finalFilters.status) {
          finalFilters.status = ['pending', 'processing', 'shipped'] as OrderStatus[]
        }
      } else {
        // If showing all orders, remove status filter unless user has specifically selected statuses via the filter interface
        if (!newFilters?.status && !newFilters?.hasOwnProperty('status')) {
          delete finalFilters.status
        }
      }
      
      const response = await orderService.getSellerOrders(finalFilters)
      
      if (response.success) {
        setOrders(response.data.orders)
        updateStatsFromOrders(response.data.orders, showAllOrders)
      } else {
        throw new Error(response.message || 'Failed to fetch orders')
      }
    } catch (err) {
      console.error('Error fetching seller orders:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching orders'
      setError(errorMessage)
      showAlert('error', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters, showAllOrders, updateStatsFromOrders])



  const handleFilterChange = (newFilters: Partial<OrderListQuery>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    fetchOrders(newFilters)
  }

  const handleToggleView = () => {
    setShowAllOrders(prev => {
      const newValue = !prev
      // Reset filters when toggling
      const baseFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const
      }
      
      // Clear the current filters state
      setFilters(baseFilters)
      
      // Fetch with appropriate status filter based on toggle
      if (newValue) {
        // Show all orders - no status filter
        fetchOrders(baseFilters)
      } else {
        // Show active orders - with status filter
        const activeFilters: OrderListQuery = {
          ...baseFilters,
          status: ['pending', 'processing', 'shipped'] as OrderStatus[]
        }
        setFilters(activeFilters)
        fetchOrders(activeFilters)
      }
      
      return newValue
    })
  }

  const handleRefresh = async () => {
    await fetchOrders()
    if (!error) {
      showAlert('success', 'Orders refreshed successfully')
    }
  }

  // Load orders on component mount
  useEffect(() => {
    if (isAuthenticated && !isLoading && (user?.role === 'seller' || user?.role === 'admin')) {
      fetchOrders()
    }
  }, [isAuthenticated, isLoading, user?.role, fetchOrders])

  // Redirect if not authenticated or not seller/admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin'))) {
      router.push('/signin?message=Access denied')
    }
  }, [isAuthenticated, isLoading, user?.role, router])

  // Don't render if not authenticated or wrong role
  if (!isAuthenticated || !user || (user.role !== 'seller' && user.role !== 'admin')) {
    return null
  }

  const statsData = [
    { 
      label: showAllOrders ? 'Total Orders' : 'Active Orders', 
      value: showAllOrders ? statsCache.totalCount : statsCache.activeCount, 
      icon: ShoppingBag, 
      color: 'primary' as const 
    },
    { 
      label: 'Pending', 
      value: statsCache.pendingCount, 
      icon: Calendar, 
      color: 'yellow' as const 
    },
    { 
      label: 'Processing', 
      value: statsCache.processingCount, 
      icon: Package, 
      color: 'blue' as const 
    },
    { 
      label: 'Completed', 
      value: statsCache.completedCount, 
      icon: TrendingUp, 
      color: 'green' as const 
    }
  ]

  return (
    <OrdersPageLayout
      title="Manage Orders"
      description={`Manage orders containing your gems on`}
      role={user.role as 'admin' | 'seller'}
      stats={statsData}
      loading={loading}
      error={error}
      alert={alert}
      onRefresh={handleRefresh}
      onAlertClose={hideAlert}
    >
      {/* View Toggle */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleView}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                !showAllOrders 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {!showAllOrders ? (
                <ToggleRight className="w-4 h-4" />
              ) : (
                <ToggleLeft className="w-4 h-4" />
              )}
              Active Orders
            </button>
            <button
              onClick={handleToggleView}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showAllOrders 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {showAllOrders ? (
                <ToggleRight className="w-4 h-4" />
              ) : (
                <ToggleLeft className="w-4 h-4" />
              )}
              All Orders
            </button>
          </div>
          <div className="text-sm text-muted-foreground">
            {!showAllOrders 
              ? 'Showing undelivered orders (pending, processing, shipped)' 
              : 'Showing all orders including completed and cancelled'
            }
          </div>
        </div>
      </div>

      {/* Main Content */}
      {orders.length === 0 && !loading ? (
        <div className="bg-card rounded-xl border border-border/50 p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground mb-2">
            {showAllOrders ? 'No Orders Found' : 'No Active Orders'}
          </h2>
          <p className="text-muted-foreground">
            {showAllOrders 
              ? 'No orders containing your gems have been placed yet.'
              : 'No active orders found. Toggle to "All Orders" to see completed orders.'
            }
          </p>
        </div>
      ) : (
        <SellerOrderTable
          orders={orders}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          loading={loading}
          baseRoute="/dashboard/seller-orders"
        />
      )}
    </OrdersPageLayout>
  )
}