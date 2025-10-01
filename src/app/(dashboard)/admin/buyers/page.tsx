'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Search, 
  Filter, 
  Eye, 
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Heart,
  User,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Star,
  RefreshCw
} from 'lucide-react'
import Image from 'next/image'
import PageTitle from '@/components/dashboard/PageTitle'
import adminService from '@/services/admin.service'
import type { AdminBuyerUser } from '@/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import AlertBox from '@/components/alerts/AlertBox'

export default function BuyersManagement() {
  const { isAuthenticated, user } = useAuth()
  const [buyers, setBuyers] = useState<AdminBuyerUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBuyer, setSelectedBuyer] = useState<AdminBuyerUser | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [stats, setStats] = useState({
    totalBuyers: 0,
    activeBuyers: 0,
    suspendedBuyers: 0,
    bannedBuyers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    newBuyersThisMonth: 0
  })

  // Fetch buyers from API
  const fetchBuyers = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'admin') return
    
    try {
      setLoading(true)
      setError('')
      
      const response = await adminService.getBuyers(
        pagination.page,
        pagination.limit,
        statusFilter,
        searchTerm.trim() || undefined
      )
      
      if (response.success && response.data) {
        setBuyers(response.data.buyers)
        setPagination(response.data.pagination)
      } else {
        setError(response.message || 'Failed to fetch buyers')
      }
    } catch (err) {
      console.error('Error fetching buyers:', err)
      setError('Failed to fetch buyers. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.role, pagination.page, pagination.limit, statusFilter, searchTerm])

  // Fetch buyer statistics
  const fetchBuyerStats = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'admin') return
    
    try {
      const response = await adminService.getBuyerStats()
      
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Error fetching buyer stats:', err)
    }
  }, [isAuthenticated, user?.role])

  // Load data on mount and when dependencies change
  useEffect(() => {
    fetchBuyers()
  }, [fetchBuyers])

  useEffect(() => {
    fetchBuyerStats()
  }, [fetchBuyerStats])

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on search
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Reset page when status filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [statusFilter])

  const filteredBuyers = buyers // No client-side filtering since we're doing it server-side

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'banned':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400'
      case 'banned':
        return 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-400'
    }
  }

  const handleStatusChange = async (buyerId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    try {
      const response = await adminService.updateBuyerStatus(buyerId, {
        status: newStatus,
        reason: `Status changed to ${newStatus} by admin`,
        notifyUser: true
      })
      
      if (response.success) {
        // Update local state
        setBuyers(prev => prev.map(buyer => 
          buyer._id === buyerId 
            ? { ...buyer, status: newStatus }
            : buyer
        ))
        
        // Refresh stats
        fetchBuyerStats()
      } else {
        setError(response.message || 'Failed to update buyer status')
      }
    } catch (err) {
      console.error('Error updating buyer status:', err)
      setError('Failed to update buyer status. Please try again.')
    }
  }

  return (
    <>
      <PageTitle title="Manage Buyers" />
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  Manage Buyers
                  <Shield className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">
                  Monitor and manage buyer accounts on <span className="font-semibold text-primary">Ishq Gems</span> platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchBuyers}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50"
                title="Refresh buyers"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="font-semibold text-foreground">{pagination.total}</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">User Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <AlertBox
            type="error"
            message={error}
            onClose={() => setError('')}
            autoDismiss={false}
            placement="inline"
          />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { label: 'Total Buyers', value: stats.totalBuyers, icon: User, color: 'blue' },
            { label: 'Active Buyers', value: stats.activeBuyers, icon: CheckCircle, color: 'green' },
            { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'purple' },
            { label: 'Total Revenue', value: stats.totalRevenue, icon: Heart, color: 'primary', prefix: '$' }
          ].map((stat, index) => (
            <div key={index} className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {loading ? '...' : `${stat.prefix || ''}${stat.value.toLocaleString()}`}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/10 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 text-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Filters */}
        <div className="bg-card border border-border/30 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search buyers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                title="Status Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none min-w-[120px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buyers List - Desktop Table View */}
        <div className="hidden xl:block bg-card border border-border/30 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/20 border-b border-border/30">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Buyer</th>
                  <th className="text-left p-4 font-medium text-foreground">Contact</th>
                  <th className="text-left p-4 font-medium text-foreground">Status</th>
                  {/* <th className="text-left p-4 font-medium text-foreground">Orders</th> */}
                  <th className="text-left p-4 font-medium text-foreground">Total Spent</th>
                  {/* <th className="text-left p-4 font-medium text-foreground">Wishlist</th> */}
                  <th className="text-left p-4 font-medium text-foreground">Last Order</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuyers.map((buyer) => (
                  <tr key={buyer._id} className="border-b border-border/20 hover:bg-secondary/10">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {buyer.avatar ? (
                          <Image
                            src={buyer.avatar}
                            alt={buyer.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {buyer.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{buyer.fullName}</p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Joined {new Date(buyer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-sm text-foreground flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {buyer.email}
                          {buyer.isEmailVerified && (
                            <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
                          )}
                        </p>
                        {buyer.phone && (
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {buyer.phone}
                          </p>
                        )}
                        {buyer.address && (
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {buyer.address}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(buyer.status)}`}>
                        {getStatusIcon(buyer.status)}
                        <span className="capitalize">{buyer.status}</span>
                      </span>
                    </td>
                    {/* <td className="p-4">
                      <p className="font-medium text-foreground">{buyer.totalOrders}</p>
                    </td> */}
                    <td className="p-4">
                      <p className="font-medium text-foreground">${buyer.totalSpent.toLocaleString()}</p>
                    </td>
                    {/* <td className="p-4">
                      <p className="text-foreground flex items-center">
                        <Heart className="h-4 w-4 mr-1 text-red-500" />
                        {buyer.wishlistItems}
                      </p>
                    </td> */}
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground">
                        {buyer.lastOrderDate 
                          ? new Date(buyer.lastOrderDate).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBuyer(buyer)
                            setShowDetailsModal(true)
                          }}
                          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {buyer.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(buyer._id, 'suspended')}
                            className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 rounded-lg transition-colors text-yellow-600"
                            title="Suspend"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        )}
                        {buyer.status === 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(buyer._id, 'active')}
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors text-green-600"
                            title="Activate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {buyer.status !== 'banned' && (
                          <button
                            onClick={() => handleStatusChange(buyer._id, 'banned')}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors text-red-600"
                            title="Ban"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        <button title="More" className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buyers List - Tablet/Laptop Compact Table View */}
        <div className="hidden lg:block xl:hidden bg-card border border-border/30 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/20 border-b border-border/30">
                <tr>
                  <th className="text-left p-3 font-medium text-foreground text-sm">Buyer</th>
                  <th className="text-left p-3 font-medium text-foreground text-sm">Status</th>
                  <th className="text-left p-3 font-medium text-foreground text-sm">Activity</th>
                  <th className="text-left p-3 font-medium text-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuyers.map((buyer) => (
                  <tr key={buyer._id} className="border-b border-border/20 hover:bg-secondary/10">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        {buyer.avatar ? (
                          <Image
                            src={buyer.avatar}
                            alt={buyer.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                            {buyer.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">{buyer.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate flex items-center">
                            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                            {buyer.email}
                            {buyer.isEmailVerified && (
                              <CheckCircle className="h-3 w-3 ml-1 text-green-600 flex-shrink-0" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(buyer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(buyer.status)}`}>
                        {getStatusIcon(buyer.status)}
                        <span className="capitalize">{buyer.status}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Orders:</span>
                          <span className="font-medium">{buyer.totalOrders}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Spent:</span>
                          <span className="font-medium">${buyer.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Wishlist:</span>
                          <span className="font-medium flex items-center">
                            <Heart className="h-3 w-3 mr-1 text-red-500" />
                            {buyer.wishlistItems}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setSelectedBuyer(buyer)
                            setShowDetailsModal(true)
                          }}
                          className="p-1.5 hover:bg-secondary/50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {buyer.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(buyer._id, 'suspended')}
                            className="p-1.5 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 rounded-lg transition-colors text-yellow-600"
                            title="Suspend"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        )}
                        {buyer.status === 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(buyer._id, 'active')}
                            className="p-1.5 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors text-green-600"
                            title="Activate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {buyer.status !== 'banned' && (
                          <button
                            onClick={() => handleStatusChange(buyer._id, 'banned')}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors text-red-600"
                            title="Ban"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buyers List - Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredBuyers.map((buyer) => (
            <div key={buyer._id} className="bg-card border border-border/30 rounded-xl p-4 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {buyer.avatar ? (
                    <Image
                      src={buyer.avatar}
                      alt={buyer.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {buyer.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{buyer.fullName}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      Joined {new Date(buyer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(buyer.status)}`}>
                  {getStatusIcon(buyer.status)}
                  <span className="capitalize">{buyer.status}</span>
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <p className="text-sm text-foreground flex items-center">
                  <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="truncate">{buyer.email}</span>
                  {buyer.isEmailVerified && (
                    <CheckCircle className="h-3 w-3 ml-1 text-green-600 flex-shrink-0" />
                  )}
                </p>
                {buyer.phone && (
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                    {buyer.phone}
                  </p>
                )}
                {buyer.address && (
                  <p className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{buyer.address}</span>
                  </p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/20">
                <div>
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="font-medium text-foreground">{buyer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="font-medium text-foreground">${buyer.totalSpent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wishlist</p>
                  <p className="font-medium text-foreground flex items-center">
                    <Heart className="h-3 w-3 mr-1 text-red-500" />
                    {buyer.wishlistItems}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Order</p>
                  <p className="text-sm text-foreground">
                    {buyer.lastOrderDate 
                      ? new Date(buyer.lastOrderDate).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-3 border-t border-border/20">
                <button
                  onClick={() => {
                    setSelectedBuyer(buyer)
                    setShowDetailsModal(true)
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-secondary/50 text-foreground rounded-lg hover:bg-secondary/70 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                {buyer.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(buyer._id, 'suspended')}
                    className="px-3 py-2 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-950/40 transition-colors"
                    title="Suspend"
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </button>
                )}
                {buyer.status === 'suspended' && (
                  <button
                    onClick={() => handleStatusChange(buyer._id, 'active')}
                    className="px-3 py-2 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors"
                    title="Activate"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                {buyer.status !== 'banned' && (
                  <button
                    onClick={() => handleStatusChange(buyer._id, 'banned')}
                    className="px-3 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                    title="Ban"
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                )}
                <button title="More" className="px-3 py-2 bg-secondary/50 text-foreground rounded-lg hover:bg-secondary/70 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading buyers...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBuyers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'No buyers found matching your criteria' 
                : 'No buyers found'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredBuyers.length > 0 && pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} buyers
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-2 border border-border rounded-lg hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-2 border border-border rounded-lg hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Buyer Details Modal */}
        {showDetailsModal && selectedBuyer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border/30">
                <h2 className="text-xl font-semibold text-foreground">Buyer Details</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Buyer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-3">Personal Information</h3>
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">Name:</span> {selectedBuyer.fullName}</p>
                      <p><span className="text-muted-foreground">Email:</span> {selectedBuyer.email}</p>
                      <p><span className="text-muted-foreground">Phone:</span> {selectedBuyer.phone || 'Not provided'}</p>
                      <p><span className="text-muted-foreground">Address:</span> {selectedBuyer.address || 'Not provided'}</p>
                      <p><span className="text-muted-foreground">Email Verified:</span> 
                        <span className={selectedBuyer.isEmailVerified ? 'text-green-600' : 'text-red-600'}>
                          {selectedBuyer.isEmailVerified ? ' Yes' : ' No'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-3">Account Information</h3>
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">Status:</span> 
                        <span className="capitalize ml-1">{selectedBuyer.status}</span>
                      </p>
                      <p><span className="text-muted-foreground">Joined:</span> {new Date(selectedBuyer.createdAt).toLocaleDateString()}</p>
                      <p><span className="text-muted-foreground">Last Order:</span> 
                        {selectedBuyer.lastOrderDate 
                          ? new Date(selectedBuyer.lastOrderDate).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Purchase Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{selectedBuyer.totalOrders}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">${selectedBuyer.totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{selectedBuyer.wishlistItems}</div>
                    <div className="text-sm text-muted-foreground">Wishlist Items</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {selectedBuyer.status === 'active' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBuyer._id, 'suspended')
                        setShowDetailsModal(false)
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Suspend Account
                    </button>
                  )}
                  {selectedBuyer.status === 'suspended' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBuyer._id, 'active')
                        setShowDetailsModal(false)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Reactivate Account
                    </button>
                  )}
                  {selectedBuyer.status !== 'banned' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBuyer._id, 'banned')
                        setShowDetailsModal(false)
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Ban Account
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-border/30 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
} 