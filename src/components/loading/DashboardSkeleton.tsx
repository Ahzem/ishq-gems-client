'use client'

import { SkeletonItem } from './Skeleton'
import { cn } from '@/lib/utils'

interface DashboardSkeletonProps {
  className?: string
}

export function StatsCardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border/30 rounded-xl p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonItem className="h-4 w-24 rounded" />
          <SkeletonItem className="h-8 w-16 rounded" />
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <SkeletonItem className="w-6 h-6 rounded" />
        </div>
      </div>
    </div>
  )
}

export function StatsGridSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={`stats-skeleton-${i}`} />
      ))}
    </div>
  )
}

export function AdditionalMetricsSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {[...Array(3)].map((_, i) => (
        <StatsCardSkeleton key={`metrics-skeleton-${i}`} />
      ))}
    </div>
  )
}

export function QuickActionsSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border/30 rounded-xl p-6', className)}>
      <div className="space-y-4">
        <SkeletonItem className="h-6 w-32 rounded" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={`action-skeleton-${i}`} className="p-4 border border-border/30 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <SkeletonItem className="w-10 h-10 rounded-lg" />
                <div className="space-y-1">
                  <SkeletonItem className="h-4 w-24 rounded" />
                  <SkeletonItem className="h-3 w-20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PerformanceInsightsSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6', className)}>
      <div className="space-y-4">
        <SkeletonItem className="h-6 w-40 rounded" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <SkeletonItem className="h-5 w-24 rounded" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={`insight-skeleton-${i}`} className="flex items-center gap-3">
                  <SkeletonItem className="w-2 h-2 rounded-full" />
                  <SkeletonItem className="h-4 w-48 rounded" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <SkeletonItem className="h-5 w-20 rounded" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={`tip-skeleton-${i}`} className="flex items-center gap-3">
                  <SkeletonItem className="w-2 h-2 rounded-full" />
                  <SkeletonItem className="h-4 w-40 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function GettingStartedSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6', className)}>
      <div className="space-y-4">
        <SkeletonItem className="h-6 w-32 rounded" />
        
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={`step-skeleton-${i}`} className="flex items-center gap-3">
              <SkeletonItem className="w-2 h-2 rounded-full" />
              <SkeletonItem className="h-4 w-48 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SellerHeaderSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkeletonItem className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <SkeletonItem className="h-7 w-48 rounded" />
            <SkeletonItem className="h-4 w-64 rounded" />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
          <SkeletonItem className="w-4 h-4 rounded" />
          <SkeletonItem className="h-4 w-24 rounded" />
        </div>
      </div>
    </div>
  )
}

export function ChartsGridSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Sales Performance Chart */}
      <div className="bg-card border border-border/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <SkeletonItem className="h-6 w-40 rounded" />
            <SkeletonItem className="h-4 w-48 rounded" />
          </div>
          <SkeletonItem className="w-10 h-10 rounded-lg" />
        </div>
        <SkeletonItem className="h-80 w-full rounded-lg" />
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={`chart-skeleton-${i}`} className="bg-card border border-border/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <SkeletonItem className="h-6 w-32 rounded" />
                <SkeletonItem className="h-4 w-24 rounded" />
              </div>
              <SkeletonItem className="w-10 h-10 rounded-lg" />
            </div>
            <SkeletonItem className="h-80 w-full rounded-lg" />
          </div>
        ))}
      </div>
      
      {/* Price Distribution Chart */}
      <div className="bg-card border border-border/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <SkeletonItem className="h-6 w-36 rounded" />
            <SkeletonItem className="h-4 w-32 rounded" />
          </div>
          <SkeletonItem className="w-10 h-10 rounded-lg" />
        </div>
        <SkeletonItem className="h-80 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function SellerDashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-6 animate-pulse', className)}>
      {/* Seller Header */}
      <SellerHeaderSkeleton />
      
      {/* Quick Stats */}
      <StatsGridSkeleton />
      
      {/* Additional Metrics */}
      <AdditionalMetricsSkeleton />
      
      {/* Charts Section */}
      <ChartsGridSkeleton />
      
      {/* Quick Actions */}
      <QuickActionsSkeleton />
      
      {/* Performance Insights */}
      <PerformanceInsightsSkeleton />
      
      {/* Getting Started */}
      <GettingStartedSkeleton />
    </div>
  )
}
