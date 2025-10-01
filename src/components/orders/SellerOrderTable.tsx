import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ChevronDown, 
  ChevronUp,
  FileText, 
  Search,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react'
import { Order, OrderListQuery, OrderSource, OrderStatus } from '@/types'
import S3Image from '@/components/common/S3Image'
import { InvoiceActionsDropdown } from './InvoiceButtons'

interface SellerOrderTableProps {
  orders: Order[]
  onRefresh: () => void
  onFilterChange: (filters: Partial<OrderListQuery>) => void
  loading?: boolean
  baseRoute?: string // Base route for order details links
}

export default function SellerOrderTable({ orders, onRefresh, onFilterChange, loading = false, baseRoute = '/dashboard/seller-orders' }: SellerOrderTableProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedSource, setSelectedSource] = useState<string>('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const handleSearch = () => {
    onFilterChange({ search: searchTerm })
  }

  const handleDateRangeChange = () => {
    onFilterChange({
      dateFrom: dateRange.from,
      dateTo: dateRange.to
    })
  }

  const handleStatusChange = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status]
    setSelectedStatuses(newStatuses)
    onFilterChange({ status: newStatuses as OrderStatus[] })
  }

  const handleSourceChange = (source: string) => {
    const newSource = selectedSource === source ? '' : source
    setSelectedSource(newSource)
    onFilterChange({ source: newSource as OrderSource })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    }
    return statusColors[status as keyof typeof statusColors] || statusColors.pending
  }


  const hasActiveFilters = selectedStatuses.length > 0 || selectedSource || dateRange.from || dateRange.to || searchTerm

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Filters Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-medium">Filters & Search</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {[selectedStatuses.length, selectedSource ? 1 : 0, dateRange.from ? 1 : 0, searchTerm ? 1 : 0]
                  .filter(Boolean).reduce((a, b) => a + b, 0)} active
              </span>
            )}
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Show All Filters'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="pl-10 pr-3 py-2 rounded-lg border border-border bg-background"
                placeholder="From date"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <div className="relative">
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="pl-10 pr-3 py-2 rounded-lg border border-border bg-background"
                placeholder="To date"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
            <button
              onClick={handleDateRangeChange}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Apply Dates
            </button>
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Tags */}
        {showAdvancedFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>Status:</span>
            </div>
            {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  selectedStatuses.includes(status) ? getStatusColor(status) : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                {status}
              </button>
            ))}
            <div className="w-full"></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>Source:</span>
            </div>
            {['cart', 'auction', 'direct'].map((source) => (
              <button
                key={source}
                onClick={() => handleSourceChange(source)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  selectedSource === source 
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Buyer</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Items</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order._id}>
                <tr className="border-b border-border/30 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="p-1 hover:bg-secondary rounded transition-colors"
                      >
                        {expandedOrders.has(order._id) ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <span className="font-medium">#{order.orderNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(order.placedAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <S3Image
                        src={order.buyerDetails.avatar || ''}
                        alt={order.buyerDetails.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover"
                        showFallbackIcon={true}
                        fallbackText={order.buyerDetails.name.charAt(0)}
                      />
                      <span className="text-sm">{order.buyerDetails.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{order.totalItems}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-primary">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`${baseRoute}/${order._id}`}
                        className="p-1 hover:bg-secondary rounded transition-colors"
                        title="View Order Details"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </Link>
                      <InvoiceActionsDropdown
                        invoiceData={{
                          orderNumber: order.orderNumber,
                          orderDate: order.placedAt,
                          customer: {
                            name: order.buyerDetails?.name || 'N/A',
                            email: order.buyerDetails?.email || 'N/A',
                            phone: undefined,
                            address: order.shippingDetails?.address ? {
                              street: order.shippingDetails.address.street || '',
                              city: order.shippingDetails.address.city || '',
                              state: order.shippingDetails.address.state || '',
                              country: order.shippingDetails.address.country || '',
                              zipCode: order.shippingDetails.address.zipCode || ''
                            } : undefined
                          },
                          items: order.subOrders.flatMap(subOrder => 
                            subOrder.items.map(item => ({
                              name: item.gemDetails?.name || 'N/A',
                              gemType: item.gemDetails?.gemType || 'N/A',
                              color: item.gemDetails?.color || 'N/A',
                              weight: item.gemDetails?.weight?.value || 0,
                              reportNumber: item.gemDetails?.reportNumber,
                              sellerName: subOrder.sellerDetails?.storeSettings?.storeName || subOrder.sellerDetails?.name || 'N/A',
                              quantity: item.quantity || 1,
                              unitPrice: item.unitPrice || 0,
                              totalPrice: item.totalPrice || 0
                            }))
                          ),
                          payment: {
                            method: order.paymentDetails?.method || 'N/A',
                            status: (order.paymentDetails?.status === 'refunded' ? 'failed' : order.paymentDetails?.status) || 'pending',
                            transactionId: order.paymentDetails?.transactionId || 'N/A',
                            hasReceipt: false,
                            paidAt: order.paymentDetails?.paidAt
                          },
                          totals: {
                            subtotal: order.subtotal || 0,
                            shipping: order.totalShipping || 0,
                            taxes: 0,
                            total: order.totalAmount || 0
                          },
                          status: (order.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled') || 'draft'
                        }}
                        className="p-1 hover:bg-secondary rounded transition-colors"
                      />
                    </div>
                  </td>
                </tr>
                {expandedOrders.has(order._id) && (
                  <tr>
                    <td colSpan={7} className="bg-secondary/30 px-4 py-4">
                      <div className="space-y-4">
                        {order.subOrders.map((subOrder) => (
                          <div key={subOrder._id} className="bg-card rounded-lg p-4">
                            {/* Order Items Header (No Seller Info) */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div>
                                  <h4 className="font-medium">Order Items</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {subOrder.items.length} items • ${subOrder.totalAmount.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subOrder.status)}`}>
                                  {subOrder.status}
                                </span>
                                <Link
                                  href={`${baseRoute}/${order._id}`}
                                  className="p-1 hover:bg-secondary rounded transition-colors"
                                  title="View Sub-order Details"
                                >
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                </Link>
                              </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-3">
                              {subOrder.items.map((item) => (
                                <div key={item._id} className="flex items-center gap-3">
                                  <S3Image
                                    src={item.gemDetails.image || ''}
                                    alt={item.gemDetails.name}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-lg object-cover"
                                    fallbackSrc="/images/gem-placeholder.svg"
                                    showFallbackIcon={true}
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm">{item.gemDetails.name}</h5>
                                    <p className="text-xs text-muted-foreground">
                                      {item.gemDetails.gemType} • {item.gemDetails.color} • 
                                      {item.gemDetails.weight?.value || 0}{item.gemDetails.weight?.unit || 'ct'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">
                                      ${item.totalPrice.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
} 
