'use client'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageTitle from '@/components/dashboard/PageTitle'
import AdminBidManagement from '@/components/dashboards/AdminBidManagement'
import { BarChart3, Star, Shield, RefreshCw } from 'lucide-react'

export default function AdminBidsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
  }, [user, isAuthenticated, router])

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle title="Bid Management" />
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  Bid Management
                  <Star className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">
                  Monitor and manage all auction bids across the platform on <span className="font-semibold text-primary">Ishq Gems</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors"
                title="Refresh bids"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="font-semibold text-foreground">-</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <Shield className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-500">Admin Access</span>
              </div>
            </div>
          </div>
        </div>
        
        <AdminBidManagement />
      </div>
    </>
  )
} 