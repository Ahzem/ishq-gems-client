'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { ToastProvider } from '@/components/alerts/Toast'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  
  // Check if current route is a messages route
  const isMessagesRoute = pathname?.includes('/messages')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role === 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <DashboardSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
          {/* Header */}
          <DashboardHeader />
          
          {/* Conditional Main Content Area */}
          {isMessagesRoute ? (
            /* Full Space Layout for Messages */
            <main className="flex-1 mt-16 overflow-hidden bg-muted/10">
              {children}
            </main>
          ) : (
            /* Constrained Layout for Other Pages */
            <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-16">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          )}
        </div>
      </div>
    </ToastProvider>
  )
}