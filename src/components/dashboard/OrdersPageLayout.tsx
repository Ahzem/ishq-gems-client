import React from 'react'
import { RefreshCw, ShoppingBag, Star, Package } from 'lucide-react'
import { AlertBox } from '@/components/alerts'
import PageTitle from '@/components/dashboard/PageTitle'

interface StatItem {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: 'primary' | 'yellow' | 'blue' | 'green' | 'red'
}

interface AlertState {
  isVisible: boolean
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

interface OrdersPageLayoutProps {
  // Page configuration
  title: string
  description: string
  role: 'admin' | 'seller'
  
  // Data and state
  stats: StatItem[]
  loading: boolean
  error: string | null
  alert: AlertState
  
  // Actions
  onRefresh: () => Promise<void>
  onAlertClose: () => void
  
  // Content
  children: React.ReactNode
  
  // Optional role-specific actions
  headerActions?: React.ReactNode
}

export default function OrdersPageLayout({
  title,
  description,
  role,
  stats,
  loading,
  alert,
  onRefresh,
  onAlertClose,
  children,
  headerActions
}: OrdersPageLayoutProps) {
  const isAdmin = role === 'admin'
  
  return (
    <>
      <PageTitle title={title} />
      
      {/* Alert System */}
      {alert.isVisible && (
        <div className="mb-6">
          <AlertBox
            type={alert.type}
            message={alert.message}
            onClose={onAlertClose}
            placement="inline"
          />
        </div>
      )}
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  {title}
                  <Star className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-muted-foreground">
                  {description} <span className="font-semibold text-primary">Ishq Gems</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  await onRefresh()
                }}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50"
                title="Refresh orders"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="font-semibold text-foreground">{stats[0]?.value || 0}</span>
              </div>
              
              {headerActions}
              
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {isAdmin ? 'Admin' : 'Seller'} Management
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {loading ? '...' : stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/10 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 text-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        {children}
      </div>
    </>
  )
} 