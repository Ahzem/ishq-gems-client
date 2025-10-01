'use client'

import { useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import PageTitle from '@/components/dashboard/PageTitle'
import { BarChart3, Star, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading, redirectBasedOnRole } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      redirectBasedOnRole()
    }
  }, [user, isLoading, redirectBasedOnRole])

  if (isLoading) {
    return (
      <>
        <PageTitle title="Dashboard" />
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                    Dashboard
                    <Star className="w-5 h-5 text-amber-500" />
                  </h1>
                  <p className="text-muted-foreground">
                    Accessing your personalized <span className="font-semibold text-primary">Ishq Gems</span> dashboard
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-sm font-medium text-primary">Loading</span>
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Loading Dashboard</h2>
              <p className="text-muted-foreground">Preparing your personalized experience...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Dashboard" />
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  Dashboard
                  <Star className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">
                  Redirecting to your <span className="font-semibold text-primary">Ishq Gems</span> dashboard
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm font-medium text-primary">Redirecting</span>
            </div>
          </div>
        </div>

        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Redirecting...</h1>
            <p className="text-muted-foreground">Taking you to your dashboard...</p>
          </div>
        </div>
      </div>
    </>
  )
} 