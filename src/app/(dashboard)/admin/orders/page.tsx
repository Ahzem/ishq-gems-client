'use client'

import { useState, useEffect, useCallback } from 'react'
import { Package, FileText, TrendingUp, Calendar } from 'lucide-react'
import orderService from '@/services/order.service'
import { Order, OrderListQuery } from '@/types/entities/order'
import OrderTable from '@/components/orders/OrderTable'
import OrdersPageLayout from '@/components/dashboard/OrdersPageLayout'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<OrderListQuery>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
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

  // Fetch orders
  const fetchOrders = useCallback(async (newFilters?: Partial<OrderListQuery>) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await orderService.getMyOrders({
        ...filters,
        ...newFilters
      }, 'admin')
      
      if (response.success) {
        setOrders(response.data.orders)
      } else {
        throw new Error(response.message || 'Failed to fetch orders')
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching orders'
      setError(errorMessage)
      showAlert('error', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleFilterChange = (newFilters: Partial<OrderListQuery>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    fetchOrders(newFilters)
  }

  const handleRefresh = async () => {
    await fetchOrders()
    if (!error) {
      showAlert('success', 'Orders refreshed successfully')
    }
  }

  // Load orders on component mount
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const statsData = [
    { label: 'Total Orders', value: orders.length, icon: Package, color: 'primary' as const },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'pending').length, icon: Calendar, color: 'yellow' as const },
    { label: 'Processing', value: orders.filter(o => o.status === 'processing').length, icon: Package, color: 'blue' as const },
    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: TrendingUp, color: 'green' as const }
  ]

  return (
    <OrdersPageLayout
      title="Orders Management"
      description="Manage all orders on"
      role="admin"
      stats={statsData}
      loading={loading}
      error={error}
      alert={alert}
      onRefresh={handleRefresh}
      onAlertClose={hideAlert}
    >
      {/* Main Content */}
      {orders.length === 0 && !loading ? (
        <div className="bg-card rounded-xl border border-border/50 p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground mb-2">
            No Orders Yet
          </h2>
          <p className="text-muted-foreground">
            Orders will appear here once customers start making purchases.
          </p>
        </div>
      ) : (
        <OrderTable
          orders={orders}
          onRefresh={async () => {
            await fetchOrders()
            if (!error) {
              showAlert('success', 'Orders refreshed successfully')
            }
          }}
          onFilterChange={handleFilterChange}
          loading={loading}
          baseRoute="/admin/orders"
        />
      )}
    </OrdersPageLayout>
  )
} 