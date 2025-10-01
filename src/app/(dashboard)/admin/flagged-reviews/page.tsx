'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, CheckCircle, XCircle, Clock, Flag, RefreshCw } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import PageTitle from '@/components/dashboard/PageTitle'
import GlobalLoader from '@/components/loading/GlobalLoader'
import FlaggedReviewsManagement from '@/components/admin/FlaggedReviewsManagement'
import adminService from '@/services/admin.service'

export default function FlaggedReviewsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    avgResponseTimeHours: 0.8
  })

  // Fetch review stats
  const fetchStats = async () => {
    try {
      const response = await adminService.getFlaggedReviewsStats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch review stats:', error)
    }
  }

  // Auth protection and data fetching
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/signin?message=Admin access required&redirect=/admin/flagged-reviews')
      return
    }
    if (user && user.role === 'admin') {
      setIsLoading(false)
      fetchStats()
    }
  }, [user, authLoading, router])

  // Loading state
  if (authLoading || isLoading) {
    return (
      <GlobalLoader
        isVisible={true}
        message="Loading Flagged Reviews"
        subMessage="Fetching review moderation data..."
      />
    )
  }

  // Not authenticated
  if (!user || user.role !== 'admin') {
    return (
      <GlobalLoader
        isVisible={true}
        message="Redirecting..."
        subMessage="Verifying admin access..."
      />
    )
  }

  return (
    <>
      <PageTitle title="Flagged Reviews" />
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
                  Flagged Reviews
                  <Flag className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">
                  Review and moderate content flagged by sellers for <span className="font-semibold text-primary">Ishq Gems</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStats}
                className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors"
                title="Refresh stats"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="font-semibold text-foreground">{stats.pending + stats.approved + stats.rejected}</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Content Moderation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { label: 'Pending Review', value: stats.pending, icon: Flag, color: 'yellow' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red' },
            { label: 'Avg. Response Time', value: stats.avgResponseTimeHours < 1 ? '< 1hr' : `${stats.avgResponseTimeHours.toFixed(1)}hr`, icon: Clock, color: 'blue', isString: true }
          ].map((stat, index) => (
            <div key={index} className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {isLoading ? '...' : stat.isString ? stat.value : (stat.value as number).toLocaleString()}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 bg-${stat.color}-500/10 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 text-${stat.color}-500`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Flagged Reviews Management Component */}
        <FlaggedReviewsManagement />
      </div>
    </>
  )
} 