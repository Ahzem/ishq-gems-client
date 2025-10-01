'use client'

import { useState } from 'react'
import { AlertTriangle, Search, Filter, Eye, Flag, User, Calendar, Clock, CheckCircle, XCircle, Package, MessageSquare, Shield, Star, RefreshCw } from 'lucide-react'
import PageTitle from '@/components/dashboard/PageTitle'

interface Report {
  id: string
  type: 'listing' | 'user' | 'transaction'
  reportedItem: string
  reportedBy: string
  reason: string
  description: string
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  submittedDate: string
  category: 'fraud' | 'fake_product' | 'harassment' | 'spam' | 'copyright' | 'other'
}

export default function ReportsPage() {
  const [reports] = useState<Report[]>([
    {
      id: '1',
      type: 'listing',
      reportedItem: 'Ruby Ring - 5ct Natural Ruby',
      reportedBy: 'john.buyer@email.com',
      reason: 'Suspicious listing',
      description: 'This ruby looks fake in the photos, price seems too good to be true',
      status: 'pending',
      priority: 'high',
      submittedDate: '2024-01-20',
      category: 'fake_product'
    },
    {
      id: '2',
      type: 'user',
      reportedItem: 'gemdealer123',
      reportedBy: 'sarah.buyer@email.com',
      reason: 'Fraudulent seller',
      description: 'Seller took payment but never shipped the item, not responding to messages',
      status: 'investigating',
      priority: 'critical',
      submittedDate: '2024-01-18',
      category: 'fraud'
    },
    {
      id: '3',
      type: 'listing',
      reportedItem: 'Emerald Necklace Set',
      reportedBy: 'mike.collector@email.com',
      reason: 'Copyright infringement',
      description: 'Images stolen from my website without permission',
      status: 'resolved',
      priority: 'medium',
      submittedDate: '2024-01-15',
      category: 'copyright'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reportedItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesType = typeFilter === 'all' || report.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'investigating': return <Eye className="h-4 w-4 text-blue-600" />
      case 'dismissed': return <XCircle className="h-4 w-4 text-gray-600" />
      default: return <Flag className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400'
      case 'investigating': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
      case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-400'
      default: return 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listing': return <Package className="h-4 w-4" />
      case 'user': return <User className="h-4 w-4" />
      case 'transaction': return <MessageSquare className="h-4 w-4" />
      default: return <Flag className="h-4 w-4" />
    }
  }

  return (
    <>
      <PageTitle title="Reports & Disputes" />
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  Reports & Disputes
                  <Shield className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">
                  Handle platform reports and disputes for <span className="font-semibold text-primary">Ishq Gems</span> safety
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors"
                title="Refresh reports"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="font-semibold text-foreground">{reports.length}</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Safety Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { label: 'Pending Reports', value: reports.filter(r => r.status === 'pending').length, icon: Clock, color: 'yellow' },
            { label: 'Investigating', value: reports.filter(r => r.status === 'investigating').length, icon: Eye, color: 'blue' },
            { label: 'Critical Priority', value: reports.filter(r => r.priority === 'critical').length, icon: AlertTriangle, color: 'red' },
            { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, icon: CheckCircle, color: 'green' }
          ].map((stat, index) => (
            <div key={index} className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`p-2 sm:p-3 bg-${stat.color}-500/10 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 text-${stat.color}-500`} />
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
                  placeholder="Search reports by item, reporter, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  title="Status Filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              
              <select
                title="Type Filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[120px]"
              >
                <option value="all">All Types</option>
                <option value="listing">Listing</option>
                <option value="user">User</option>
                <option value="transaction">Transaction</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-card border border-border/30 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/20 border-b border-border/30">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Report</th>
                  <th className="text-left p-4 font-medium text-foreground">Type</th>
                  <th className="text-left p-4 font-medium text-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-foreground">Priority</th>
                  <th className="text-left p-4 font-medium text-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-foreground">Submitted</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-border/20 hover:bg-secondary/10">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{report.reportedItem}</p>
                        <p className="text-sm text-muted-foreground">Reported by: {report.reportedBy}</p>
                        <p className="text-sm text-muted-foreground">{report.reason}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(report.type)}
                        <span className="capitalize text-sm font-medium">{report.type}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        <span className="capitalize">{report.status}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm capitalize">{report.category.replace('_', ' ')}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(report.submittedDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors text-blue-600" title="Start Investigation">
                              <Flag className="h-4 w-4" />
                            </button>
                            <button className="p-2 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors text-green-600" title="Resolve">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
} 