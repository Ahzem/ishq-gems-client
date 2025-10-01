'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, Search, Filter, User, Mail, Calendar, CheckCircle, Clock, XCircle, Trash2, RefreshCw, Shield, Star, Store } from 'lucide-react'
import Spinner from '@/components/loading/Spinner'
import { AlertBox, ConfirmDialog } from '@/components/alerts'
import { useAuth } from '@/features/auth/hooks/useAuth'
import PageTitle from '@/components/dashboard/PageTitle'
import adminService from '@/services/admin.service'
import type { AdminSellerApplication } from '@/types'



const statusConfig = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
  },
  verified: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  }
}

export default function AdminSellersPage() {
  const [applications, setApplications] = useState<AdminSellerApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<AdminSellerApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Alert and confirmation states
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning'>('info')
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter])

  useEffect(() => {
    filterApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications, searchTerm, statusFilter])

  const fetchApplications = async () => {
    if (!isAuthenticated) {
      setAlertType('error')
      setAlertMessage('Authentication required. Please login.')
      setShowAlert(true)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      const response = await adminService.getSellerApplications(
        currentPage,
        itemsPerPage,
        statusFilter
      )

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch applications')
      }

      // Now the admin service handles the API response structure correctly
      const applicationsData = response.data?.applications || []
      const paginationData = response.data?.pagination || { total: 0, page: 1, limit: 10, pages: 0 }
      
      // Map id to _id if needed for compatibility
      const mappedApplications = applicationsData.map((app: AdminSellerApplication & { id?: string }) => ({
        ...app,
        _id: app._id || app.id || '' // Ensure _id is always a string
      })) as AdminSellerApplication[]
      
      setApplications(mappedApplications)
      setTotalItems(paginationData.total || 0)
      
      // Show success message on successful fetch
      if (mappedApplications && mappedApplications.length > 0) {
        setAlertType('success')
        setAlertMessage(`Successfully loaded ${mappedApplications.length} applications.`)
        setShowAlert(true)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError(error instanceof Error ? error.message : 'Failed to load applications')
      setAlertType('error')
      setAlertMessage(error instanceof Error ? error.message : 'Failed to load applications')
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshClick = () => {
    if (searchTerm || statusFilter !== 'all') {
      setShowRefreshConfirm(true)
    } else {
      confirmRefresh()
    }
  }

  const confirmRefresh = async () => {
    setShowRefreshConfirm(false)
    setSearchTerm('')
    setStatusFilter('all')
    setCurrentPage(1)
    await fetchApplications()
    setAlertType('info')
    setAlertMessage('Applications list has been refreshed.')
    setShowAlert(true)
  }

  const cancelRefresh = () => {
    setShowRefreshConfirm(false)
  }

  const handleBulkDelete = () => {
    const rejectedApps = applications.filter(app => 
      app.status === 'rejected' && selectedApplications.includes(app._id)
    )
    
    if (rejectedApps.length === 0) {
      setAlertType('warning')
      setAlertMessage('No rejected applications selected. Only rejected applications can be deleted.')
      setShowAlert(true)
      return
    }
    
    setShowBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    try {
      setShowBulkDeleteConfirm(false)
      
      // Simulate API call for bulk delete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove deleted applications from state
      setApplications(prev => 
        prev.filter(app => !selectedApplications.includes(app._id))
      )
      
      setAlertType('success')
      setAlertMessage(`Successfully deleted ${selectedApplications.length} rejected applications.`)
      setShowAlert(true)
      setSelectedApplications([])
    } catch {
      setAlertType('error')
      setAlertMessage('Failed to delete applications. Please try again.')
      setShowAlert(true)
    }
  }

  const cancelBulkDelete = () => {
    setShowBulkDeleteConfirm(false)
  }

  const toggleSelectApplication = (id: string) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    )
  }

  const selectAllRejected = () => {
    const rejectedIds = applications
      .filter(app => app.status === 'rejected')
      .map(app => app._id)
    
    setSelectedApplications(rejectedIds)
  }

  const clearSelection = () => {
    setSelectedApplications([])
  }

  const filterApplications = () => {
    let filtered = applications

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm) ||
        app.nicNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredApplications(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const StatusBadge = ({ status }: { status: AdminSellerApplication['status'] }) => {
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const rejectedCount = applications.filter(app => app.status === 'rejected').length

  return (
    <>
      <PageTitle title="Verification Requests" />
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

        {/* Admin Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  Verification Requests
                  <Shield className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">
                  Review seller applications and manage the <span className="font-semibold text-primary">Ishq Gems</span> seller network
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshClick}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50"
                title="Refresh applications"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              {rejectedCount > 0 && (
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 transition-colors"
                  title="Delete rejected applications"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clean Up ({rejectedCount})</span>
                </button>
              )}
              
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="font-semibold text-foreground">{totalItems}</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Verification Center</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { label: 'Total Applications', value: totalItems, icon: Store, color: 'blue' },
            { label: 'Pending Review', value: applications.filter(app => app.status === 'pending').length, icon: Clock, color: 'yellow' },
            { label: 'Approved', value: applications.filter(app => app.status === 'verified').length, icon: CheckCircle, color: 'green' },
            { label: 'Rejected', value: applications.filter(app => app.status === 'rejected').length, icon: XCircle, color: 'red' }
          ].map((stat, index) => (
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


        {/* Bulk Actions */}
        {selectedApplications.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  {selectedApplications.length} applications selected
                </span>
                <button
                  onClick={selectAllRejected}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Select all rejected
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border/30 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or NIC..."
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
                className="pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
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

        {/* Applications Table */}
        <div className="bg-card border border-border/30 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Spinner size="md" text="Loading applications..." />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No seller applications have been submitted yet'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/30 border-b border-border/30">
                    <tr>
                      <th className="text-left p-4 font-semibold text-foreground w-12">
                        <input
                          type="checkbox"
                          checked={selectedApplications.length === applications.filter(app => app.status === 'rejected').length && applications.filter(app => app.status === 'rejected').length > 0}
                          onChange={selectedApplications.length > 0 ? clearSelection : selectAllRejected}
                          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                          title="Select all rejected applications"
                        />
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">Applicant</th>
                      <th className="text-left p-4 font-semibold text-foreground">Contact</th>
                      <th className="text-left p-4 font-semibold text-foreground">Experience</th>
                      <th className="text-left p-4 font-semibold text-foreground">Status</th>
                      <th className="text-left p-4 font-semibold text-foreground">Submitted</th>
                      <th className="text-left p-4 font-semibold text-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr key={application._id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                        <td className="p-4">
                          {application.status === 'rejected' && (
                            <input
                              type="checkbox"
                              checked={selectedApplications.includes(application._id)}
                              onChange={() => toggleSelectApplication(application._id)}
                              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                              title="Select for deletion"
                            />
                          )}
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{application.fullName}</div>
                            <div className="text-xs text-muted-foreground">NIC: {application.nicNumber}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span className="text-foreground">{application.email}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">{application.phone}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="text-sm text-foreground font-medium">{application.yearsOfExperience}</div>
                            <div className="text-xs text-muted-foreground">
                              {application.gemstoneTypes.slice(0, 2).join(', ')}
                              {application.gemstoneTypes.length > 2 && ` +${application.gemstoneTypes.length - 2} more`}
                            </div>
                            {application.hasNGJALicense && (
                              <div className="text-xs text-green-600 dark:text-green-400 font-medium">NGJA Licensed</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={application.status} />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(application.applicationDate)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/admin/verifications/${application._id}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border/20">
                {filteredApplications.map((application) => (
                  <div key={application._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {application.status === 'rejected' && (
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(application._id)}
                            onChange={() => toggleSelectApplication(application._id)}
                            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 mt-1"
                            title="Select for deletion"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-foreground">{application.fullName}</h3>
                        </div>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{application.email}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Experience: {application.yearsOfExperience}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(application.applicationDate)}</span>
                      </div>
                    </div>
                    
                    <Link
                      href={`/admin/verifications/${application._id}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                  </div>
                ))}
              </div>

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
            </>
          )}
        </div>

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          isOpen={showRefreshConfirm}
          title="Refresh Applications"
          message="This will clear your current search filters and reload all applications. Are you sure you want to continue?"
          confirmText="Yes, Refresh"
          cancelText="Cancel"
          type="info"
          onConfirm={confirmRefresh}
          onCancel={cancelRefresh}
        />

        <ConfirmDialog
          isOpen={showBulkDeleteConfirm}
          title="Delete Applications"
          message={`Are you sure you want to permanently delete ${selectedApplications.length} rejected application(s)? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={confirmBulkDelete}
          onCancel={cancelBulkDelete}
        />
      </div>
    </>
  )
}