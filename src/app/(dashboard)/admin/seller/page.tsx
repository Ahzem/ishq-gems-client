'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Star,
  RefreshCw,
  Ban,
  Mail,
  AlertTriangle,
  TrendingUp,
  Shield,
  MoreVertical,
  Package,
  DollarSign,
  Activity
} from 'lucide-react'
import PageTitle from '@/components/dashboard/PageTitle'
import { AlertBox, ConfirmDialog } from '@/components/alerts'
import Spinner from '@/components/loading/Spinner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import adminService from '@/services/admin.service'
import type { AdminSellerUser, ContactSellerRequest, BlockSellerRequest } from '@/types'
import Image from 'next/image'

export default function SellerManagementPage() {
  const [sellers, setSellers] = useState<AdminSellerUser[]>([])
  const [filteredSellers, setFilteredSellers] = useState<AdminSellerUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSeller, setSelectedSeller] = useState<AdminSellerUser | null>(null)
  
  // Alert and confirmation states
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning'>('success')
  
  // Modal states
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showBlockReasonModal, setShowBlockReasonModal] = useState(false)
  
  // Form data
  const [blockReason, setBlockReason] = useState('')
  const [blockDuration, setBlockDuration] = useState<number | undefined>(undefined)
  const [contactData, setContactData] = useState<ContactSellerRequest>({
    subject: '',
    message: '',
    priority: 'medium',
    type: 'general'
  })
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [totalItems, setTotalItems] = useState(0)

  const { token } = useAuth()

  useEffect(() => {
    fetchSellers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter])

  useEffect(() => {
    filterSellers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellers, searchTerm, statusFilter])

  const fetchSellers = async () => {
    if (!token) {
      setAlertType('error')
      setAlertMessage('Authentication required. Please login.')
      setShowAlert(true)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      const result = await adminService.getSellers(currentPage, itemsPerPage, statusFilter, searchTerm)
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch sellers')
      }

      // Ensure we always set an array
      const sellersData = result.data?.sellers
      if (Array.isArray(sellersData)) {
        setSellers(sellersData)
      } else {
        setSellers([])
      }
      setTotalItems(result.data?.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching sellers:', error)
      setError(error instanceof Error ? error.message : 'Failed to load sellers')
      setAlertType('error')
      setAlertMessage(error instanceof Error ? error.message : 'Failed to load sellers')
      setShowAlert(true)
      // Ensure sellers is set to empty array on error
      setSellers([])
      setTotalItems(0)
    } finally {
      setIsLoading(false)
    }
  }

  const filterSellers = () => {
    // Ensure sellers is always an array
    if (!Array.isArray(sellers)) {
      setFilteredSellers([])
      return
    }

    let filtered = sellers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(seller => 
        seller.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSellers(filtered)
  }

  const handleBlockClick = (seller: AdminSellerUser) => {
    setSelectedSeller(seller)
    setShowBlockReasonModal(true)
  }

  const handleUnblockClick = (seller: AdminSellerUser) => {
    setSelectedSeller(seller)
    setShowUnblockConfirm(true)
  }

  const handleContactClick = (seller: AdminSellerUser) => {
    setSelectedSeller(seller)
    setContactData({
      subject: '',
      message: '',
      priority: 'medium',
      type: 'general'
    })
    setShowContactModal(true)
  }

  const confirmBlock = async () => {
    if (!selectedSeller || !blockReason.trim()) return

    try {
      const blockData: BlockSellerRequest = {
        reason: blockReason.trim(),
        duration: blockDuration,
        notifyUser: true
      }

      const result = await adminService.blockSeller(selectedSeller._id, blockData)
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to block seller')
      }
      
      await fetchSellers()
      setAlertType('success')
      setAlertMessage(`Successfully blocked ${selectedSeller.fullName}`)
      setShowAlert(true)
    } catch (error) {
      setAlertType('error')
      setAlertMessage(error instanceof Error ? error.message : 'Failed to block seller')
      setShowAlert(true)
    } finally {
      setShowBlockConfirm(false)
      setShowBlockReasonModal(false)
      setBlockReason('')
      setBlockDuration(undefined)
      setSelectedSeller(null)
    }
  }

  const confirmUnblock = async () => {
    if (!selectedSeller) return

    try {
      const result = await adminService.unblockSeller(selectedSeller._id)
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to unblock seller')
      }
      
      await fetchSellers()
      setAlertType('success')
      setAlertMessage(`Successfully unblocked ${selectedSeller.fullName}`)
      setShowAlert(true)
    } catch (error) {
      setAlertType('error')
      setAlertMessage(error instanceof Error ? error.message : 'Failed to unblock seller')
      setShowAlert(true)
    } finally {
      setShowUnblockConfirm(false)
      setSelectedSeller(null)
    }
  }

  const confirmContact = async () => {
    if (!selectedSeller || !contactData.subject.trim() || !contactData.message.trim()) return

    try {
      const result = await adminService.contactSeller(selectedSeller._id, contactData)
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to contact seller')
      }
      
      setAlertType('success')
      setAlertMessage(`Message sent to ${selectedSeller.fullName}`)
      setShowAlert(true)
    } catch (error) {
      setAlertType('error')
      setAlertMessage(error instanceof Error ? error.message : 'Failed to send message')
      setShowAlert(true)
    } finally {
      setShowContactModal(false)
      setSelectedSeller(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (seller: AdminSellerUser) => {
    if (seller.isBlocked) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          <Ban className="w-3 h-3" />
          Blocked
        </span>
      )
    }
    
    if (!seller.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
          <Clock className="w-3 h-3" />
          Inactive
        </span>
      )
    }
    
    if (seller.hasActiveViolations) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
          <AlertTriangle className="w-3 h-3" />
          Warning
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    )
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <>
      <PageTitle title="Manage Sellers" />
      <div className="space-y-6">
        {/* Alert notification */}
        {showAlert && (
          <AlertBox
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
            placement="top"
          />
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  Manage Sellers
                  <Shield className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">
                  Manage active sellers, view performance, and handle seller operations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchSellers}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50"
                title="Refresh sellers"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="font-semibold text-foreground">{totalItems}</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Seller Operations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {(() => {
            const safeSellers = Array.isArray(sellers) ? sellers : []
            return [
              { label: 'Total Sellers', value: safeSellers.length, icon: Users, color: 'blue' },
              { label: 'Active Sellers', value: safeSellers.filter(s => s.isActive && !s.isBlocked).length, icon: CheckCircle, color: 'green' },
              { label: 'Blocked Sellers', value: safeSellers.filter(s => s.isBlocked).length, icon: Ban, color: 'red' },
              { label: 'With Violations', value: safeSellers.filter(s => s.hasActiveViolations).length, icon: AlertTriangle, color: 'yellow' }
            ]
          })().map((stat, index) => (
            <div key={index} className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {isLoading ? '...' : stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 bg-${stat.color}-500/10 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 text-${stat.color}-600`} />
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
                  placeholder="Search sellers by name, email, or business..."
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
                className="pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="inactive">Inactive</option>
                <option value="violations">With Violations</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/verifications"
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-sm font-medium text-primary transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">View Applications</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <AlertBox
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {/* Sellers Grid */}
        <div className="bg-card border border-border/30 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Spinner size="md" text="Loading sellers..." />
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Sellers Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No sellers are currently registered'
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredSellers.map((seller) => (
                <div key={seller._id} className="bg-secondary/10 border border-border/20 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                  {/* Seller Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {seller.avatar ? (
                        <Image
                          src={seller.avatar}
                          alt={seller.fullName}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {seller.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                      )}
                        <div>
                        <h3 className="font-semibold text-foreground">{seller.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{seller.email}</p>
                      </div>
                    </div>
                    <div className="relative group">
                      <button className="p-1 hover:bg-secondary rounded">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Status & Business */}
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(seller)}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
                        <Package className="w-3 h-3" />
                        {seller.totalListings}
                      </div>
                      <p className="text-xs text-muted-foreground">Listings</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
                        <DollarSign className="w-3 h-3" />
                        {seller.totalSales}
                      </div>
                      <p className="text-xs text-muted-foreground">Sales</p>
                        </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
                        <Star className="w-3 h-3" />
                        {seller.averageRating.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
                        <TrendingUp className="w-3 h-3" />
                        ${seller.totalRevenue.toFixed(0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>Joined {formatDate(seller.createdAt)}</span>
                    {seller.hasActiveViolations && (
                      <span className="text-yellow-600 font-medium">{seller.violationCount} violations</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/seller/${seller._id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Link>
                    
                    <button
                      onClick={() => handleContactClick(seller)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      Contact
                        </button>
                    
                    {seller.isBlocked ? (
                            <button 
                        onClick={() => handleUnblockClick(seller)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm font-medium transition-colors"
                            >
                        <CheckCircle className="w-3 h-3" />
                        Unblock
                            </button>
                    ) : (
                            <button 
                        onClick={() => handleBlockClick(seller)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium transition-colors"
                            >
                        <Ban className="w-3 h-3" />
                        Block
                            </button>
                        )}
                      </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border/30 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Block Reason Modal */}
        {showBlockReasonModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-serif font-bold mb-4 text-red-600">Block Seller</h3>
              <p className="text-muted-foreground mb-4">
                Please provide a reason for blocking {selectedSeller?.fullName}:
              </p>
              <div className="space-y-4">
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none h-24"
                  placeholder="Enter reason for blocking..."
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Block Duration (optional)
                  </label>
                  <select
                    value={blockDuration || ''}
                    onChange={(e) => setBlockDuration(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="">Permanent</option>
                    <option value="1">1 Day</option>
                    <option value="7">1 Week</option>
                    <option value="30">1 Month</option>
                    <option value="90">3 Months</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowBlockReasonModal(false)
                    setBlockReason('')
                    setBlockDuration(undefined)
                    setSelectedSeller(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowBlockReasonModal(false)
                    setShowBlockConfirm(true)
                  }}
                  disabled={!blockReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Block Seller
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-serif font-bold mb-4">Contact {selectedSeller?.fullName}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message Type</label>
                  <select
                    value={contactData.type}
                    onChange={(e) => setContactData((prev: typeof contactData) => ({ ...prev, type: e.target.value as 'general' | 'support' | 'warning' | 'violation' }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="general">General</option>
                    <option value="support">Support</option>
                    <option value="warning">Warning</option>
                    <option value="violation">Violation Notice</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                  <select
                    value={contactData.priority}
                    onChange={(e) => setContactData((prev: typeof contactData) => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <input
                    type="text"
                    value={contactData.subject}
                    onChange={(e) => setContactData((prev: typeof contactData) => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="Enter message subject..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <textarea
                    value={contactData.message}
                    onChange={(e) => setContactData((prev: typeof contactData) => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none h-32"
                    placeholder="Enter your message..."
                  />
          </div>
        </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowContactModal(false)
                    setSelectedSeller(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmContact}
                  disabled={!contactData.subject.trim() || !contactData.message.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          isOpen={showBlockConfirm}
          title="Block Seller"
          message={`Are you sure you want to block ${selectedSeller?.fullName}? This will prevent them from accessing their seller account${blockDuration ? ` for ${blockDuration} days` : ' permanently'}.`}
          confirmText="Yes, Block"
          cancelText="Cancel"
          type="danger"
          onConfirm={confirmBlock}
          onCancel={() => {
            setShowBlockConfirm(false)
            setBlockReason('')
            setBlockDuration(undefined)
            setSelectedSeller(null)
          }}
        />

        <ConfirmDialog
          isOpen={showUnblockConfirm}
          title="Unblock Seller"
          message={`Are you sure you want to unblock ${selectedSeller?.fullName}? They will regain access to their seller account.`}
          confirmText="Yes, Unblock"
          cancelText="Cancel"
          type="info"
          onConfirm={confirmUnblock}
          onCancel={() => {
            setShowUnblockConfirm(false)
            setSelectedSeller(null)
          }}
        />
      </div>
    </>
  )
} 