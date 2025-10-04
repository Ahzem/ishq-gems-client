'use client'

import { SkeletonItem } from './Skeleton'
import { cn } from '@/lib/utils'

interface AdminSkeletonProps {
  className?: string
}

export function AdminHeaderSkeleton({ className }: AdminSkeletonProps) {
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
        <div className="flex items-center gap-2">
          <SkeletonItem className="w-8 h-8 rounded-lg" />
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
            <SkeletonItem className="w-4 h-4 rounded" />
            <SkeletonItem className="h-4 w-24 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminStatsGridSkeleton({ className }: AdminSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6', className)}>
      {[...Array(4)].map((_, i) => (
        <div key={`admin-stats-skeleton-${i}`} className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <SkeletonItem className="h-4 w-20 rounded" />
              <SkeletonItem className="h-6 w-16 rounded" />
              <SkeletonItem className="h-3 w-24 rounded" />
            </div>
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <SkeletonItem className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function UserBreakdownSkeleton({ className }: AdminSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border/30 rounded-xl p-4 sm:p-6', className)}>
      <div className="space-y-4">
        <SkeletonItem className="h-6 w-32 rounded" />
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={`breakdown-skeleton-${i}`} className="text-center p-3 sm:p-4 bg-secondary/20 rounded-lg">
              <SkeletonItem className="h-8 w-16 mx-auto rounded" />
              <SkeletonItem className="h-4 w-12 mx-auto mt-2 rounded" />
              <SkeletonItem className="h-3 w-20 mx-auto mt-1 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function QuickActionsSkeleton({ className }: AdminSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border/30 rounded-xl p-4 sm:p-6', className)}>
      <div className="space-y-4">
        <SkeletonItem className="h-6 w-32 rounded" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={`action-skeleton-${i}`} className="relative flex flex-col items-center space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg border border-border/30">
              {/* Badge skeleton */}
              {i % 3 === 0 && (
                <SkeletonItem className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full" />
              )}
              
              <SkeletonItem className="p-2 sm:p-3 rounded-lg w-10 h-10 sm:w-12 sm:h-12" />
              
              <div className="text-center space-y-1">
                <SkeletonItem className="h-4 w-16 rounded" />
                <SkeletonItem className="h-3 w-20 rounded hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SystemNotificationsSkeleton({ className }: AdminSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border/30 rounded-xl p-4 sm:p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonItem className="h-6 w-40 rounded" />
          <div className="flex items-center gap-2">
            <SkeletonItem className="h-6 w-12 rounded-full" />
          </div>
        </div>

        {/* Activity stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={`activity-skeleton-${i}`} className="text-center p-4 bg-secondary/20 rounded-lg">
              <SkeletonItem className="h-8 w-12 mx-auto rounded" />
              <SkeletonItem className="h-4 w-24 mx-auto mt-2 rounded" />
            </div>
          ))}
        </div>

        {/* Notification items */}
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={`notification-skeleton-${i}`} className="flex items-center justify-between p-3 bg-secondary/20 border border-border/20 rounded-lg">
              <div className="flex items-center gap-3">
                <SkeletonItem className="w-5 h-5 rounded" />
                <div className="space-y-1">
                  <SkeletonItem className="h-4 w-32 rounded" />
                  <SkeletonItem className="h-3 w-48 rounded" />
                </div>
              </div>
              <SkeletonItem className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function RecentActivitySkeleton({ className }: AdminSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border/30 rounded-xl p-4 sm:p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonItem className="h-6 w-32 rounded" />
          <SkeletonItem className="h-4 w-16 rounded" />
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={`activity-item-skeleton-${i}`} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg bg-secondary/20 border border-border/20">
              <SkeletonItem className="p-2 bg-secondary/50 rounded-lg w-8 h-8" />
              <div className="flex-1 space-y-1">
                <SkeletonItem className="h-4 w-full rounded" />
                <SkeletonItem className="h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminDashboardSkeleton({ className }: AdminSkeletonProps) {
  return (
    <div className={cn('space-y-6 animate-pulse', className)}>
      {/* Admin Header */}
      <AdminHeaderSkeleton />
      
      {/* Stats Grid */}
      <AdminStatsGridSkeleton />
      
      {/* User Breakdown */}
      <UserBreakdownSkeleton />
      
      {/* Quick Actions */}
      <QuickActionsSkeleton />
      
      {/* System Notifications */}
      <SystemNotificationsSkeleton />
      
      {/* Recent Activity */}
      <RecentActivitySkeleton />
    </div>
  )
}
