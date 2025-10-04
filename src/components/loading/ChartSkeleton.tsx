'use client'

import { SkeletonItem } from './Skeleton'
import { cn } from '@/lib/utils'

interface ChartSkeletonProps {
  className?: string
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  height?: string
}

export function SalesChartSkeleton({ 
  className = '', 
  title = 'Sales Performance',
  subtitle = 'Monthly sales and revenue trends',
  height = 'h-80'
}: ChartSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border/30 rounded-xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
          <SkeletonItem className="w-5 h-5 rounded" />
        </div>
      </div>
      
      <div className={height}>
        {/* Chart area skeleton */}
        <div className="h-full flex flex-col justify-end space-y-2">
          {/* Chart bars/areas */}
          <div className="flex items-end justify-between h-3/4 px-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-1">
                <SkeletonItem 
                  className={cn(
                    'w-8 rounded-t',
                    i % 2 === 0 ? 'h-16' : 'h-12'
                  )} 
                />
                <SkeletonItem className="h-3 w-6 rounded" />
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <SkeletonItem className="w-3 h-3 rounded-full" />
              <SkeletonItem className="h-4 w-20 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonItem className="w-3 h-3 rounded-full" />
              <SkeletonItem className="h-4 w-20 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ViewsChartSkeleton({ 
  className = '', 
  title = 'Top Performing Gems',
  subtitle = 'Views by gemstone',
  height = 'h-80'
}: ChartSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border/30 rounded-xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
          <SkeletonItem className="w-5 h-5 rounded" />
        </div>
      </div>
      
      <div className={height}>
        {/* Chart area skeleton */}
        <div className="h-full flex flex-col justify-end space-y-2">
          {/* Chart bars */}
          <div className="flex items-end justify-between h-3/4 px-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-1">
                <SkeletonItem 
                  className={cn(
                    'w-6 rounded-t',
                    i === 0 ? 'h-20' : i === 1 ? 'h-16' : i === 2 ? 'h-12' : i === 3 ? 'h-8' : 'h-6'
                  )} 
                />
                <SkeletonItem className="h-3 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CategoryChartSkeleton({ 
  className = '', 
  title = 'Gem Categories',
  subtitle = 'Distribution by type',
  height = 'h-80'
}: ChartSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border/30 rounded-xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <SkeletonItem className="w-5 h-5 rounded" />
        </div>
      </div>
      
      <div className={height}>
        {/* Pie chart skeleton */}
        <div className="h-full flex items-center justify-center">
          <div className="relative">
            {/* Main circle */}
            <SkeletonItem className="w-40 h-40 rounded-full" />
            
            {/* Legend items */}
            <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <SkeletonItem className="w-3 h-3 rounded-full" />
                  <SkeletonItem className="h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PriceRangeChartSkeleton({ 
  className = '', 
  title = 'Price Distribution',
  subtitle = 'Gems by price range',
  height = 'h-80'
}: ChartSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border/30 rounded-xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
          <SkeletonItem className="w-5 h-5 rounded" />
        </div>
      </div>
      
      <div className={height}>
        {/* Chart area skeleton */}
        <div className="h-full flex flex-col justify-end space-y-2">
          {/* Chart bars */}
          <div className="flex items-end justify-between h-3/4 px-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-1">
                <SkeletonItem 
                  className={cn(
                    'w-8 rounded-t',
                    i === 0 ? 'h-8' : i === 1 ? 'h-12' : i === 2 ? 'h-16' : i === 3 ? 'h-20' : i === 4 ? 'h-12' : 'h-6'
                  )} 
                />
                <SkeletonItem className="h-3 w-10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Generic chart skeleton for any chart type
export function ChartSkeleton({ 
  className = '', 
  title = 'Chart',
  subtitle = 'Loading chart data...',
  height = 'h-80'
}: ChartSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border/30 rounded-xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <SkeletonItem className="w-5 h-5 rounded" />
        </div>
      </div>
      
      <div className={height}>
        {/* Generic chart area skeleton */}
        <div className="h-full flex items-center justify-center">
          <div className="space-y-4">
            <SkeletonItem className="h-32 w-64 rounded-lg" />
            <div className="flex justify-center gap-4">
              <SkeletonItem className="h-4 w-16 rounded" />
              <SkeletonItem className="h-4 w-16 rounded" />
              <SkeletonItem className="h-4 w-16 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
