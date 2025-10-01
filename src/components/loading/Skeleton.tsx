'use client'

import { cn } from '@/lib/utils'

export interface SkeletonProps {
  variant?: 'card' | 'list' | 'grid' | 'text' | 'custom'
  count?: number
  className?: string
  children?: React.ReactNode
}

interface SkeletonItemProps {
  className?: string
}

export function SkeletonItem({ className }: SkeletonItemProps) {
  return (
    <div className={cn(
      'bg-muted/40 animate-shimmer relative overflow-hidden rounded',
      'before:absolute before:inset-0',
      'before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
      'before:animate-shimmer-wave',
      className
    )} />
  )
}

export default function Skeleton({
  variant = 'custom',
  count = 1,
  className,
  children
}: SkeletonProps) {
  if (variant === 'custom' && children) {
    return <div className={className}>{children}</div>
  }

  const renderSkeletonCard = () => (
    <div className={cn(
      'bg-card/40 border border-border/50 rounded-xl p-4 space-y-4',
      'backdrop-blur-sm shadow-sm',
      className
    )}>
      {/* Image placeholder */}
      <SkeletonItem className="aspect-square w-full rounded-lg" />
      
      {/* Title */}
      <div className="space-y-2">
        <SkeletonItem className="h-5 w-3/4 rounded" />
        <SkeletonItem className="h-4 w-1/2 rounded" />
      </div>
      
      {/* Specs grid */}
      <div className="grid grid-cols-2 gap-2">
        <SkeletonItem className="h-8 rounded" />
        <SkeletonItem className="h-8 rounded" />
        <SkeletonItem className="h-8 rounded" />
        <SkeletonItem className="h-8 rounded" />
      </div>
      
      {/* Price */}
      <div className="space-y-2">
        <SkeletonItem className="h-6 w-1/3 rounded" />
        <SkeletonItem className="h-4 w-1/4 rounded" />
      </div>
      
      {/* Button */}
      <SkeletonItem className="h-10 w-full rounded-lg" />
    </div>
  )

  const renderSkeletonList = () => (
    <div className={cn(
      'bg-card/40 border border-border/50 rounded-lg p-4',
      'backdrop-blur-sm shadow-sm',
      className
    )}>
      <div className="flex items-center space-x-4">
        {/* Avatar/Image */}
        <SkeletonItem className="w-12 h-12 rounded-full flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-1 space-y-2">
          <SkeletonItem className="h-4 w-3/4 rounded" />
          <SkeletonItem className="h-3 w-1/2 rounded" />
        </div>
        
        {/* Action */}
        <SkeletonItem className="w-20 h-8 rounded flex-shrink-0" />
      </div>
    </div>
  )

  const renderContent = () => {
    switch (variant) {
      case 'card':
        return [...Array(count)].map((_, i) => (
          <div key={i}>{renderSkeletonCard()}</div>
        ))
      case 'list':
        return (
          <div className={cn('space-y-4', className)}>
            {[...Array(count)].map((_, i) => (
              <div key={i}>{renderSkeletonList()}</div>
            ))}
          </div>
        )
      case 'grid':
        return (
          <div className={cn(
            'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8',
            className
          )}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="bg-card/40 border border-border/50 rounded-xl p-4 space-y-3 backdrop-blur-sm">
                <SkeletonItem className="aspect-square w-full rounded-lg" />
                <SkeletonItem className="h-4 w-3/4 rounded" />
                <SkeletonItem className="h-3 w-1/2 rounded" />
                <SkeletonItem className="h-8 w-full rounded" />
              </div>
            ))}
          </div>
        )
      case 'text':
        return (
          <div className={cn('space-y-3', className)}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonItem className="h-4 w-full rounded" />
                <SkeletonItem className="h-4 w-5/6 rounded" />
                <SkeletonItem className="h-4 w-4/6 rounded" />
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return <div className="animate-pulse">{renderContent()}</div>
}

// Gem-specific skeleton variants
export function GemCardSkeleton({ 
  className, 
  layout = 'grid' 
}: { 
  className?: string
  layout?: 'grid' | 'list'
}) {
  if (layout === 'list') {
    return (
      <div className={cn(
        'bg-card/40 border border-border/50 rounded-xl backdrop-blur-sm shadow-sm animate-pulse overflow-hidden',
        className
      )}>
        <div className="flex">
          {/* Image placeholder */}
          <div className="w-48 h-32 sm:w-64 sm:h-40 lg:w-72 lg:h-48 flex-shrink-0">
            <SkeletonItem className="w-full h-full rounded-none" />
          </div>
          
          {/* Content placeholder */}
          <div className="flex-1 p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
            {/* Title and location */}
            <div className="space-y-2">
              <SkeletonItem className="h-6 sm:h-7 lg:h-8 w-3/4 rounded" />
              <SkeletonItem className="h-4 w-1/2 rounded" />
            </div>
            
            {/* Specifications grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <SkeletonItem className="h-12 sm:h-14 rounded-lg" />
              <SkeletonItem className="h-12 sm:h-14 rounded-lg" />
              <SkeletonItem className="h-12 sm:h-14 rounded-lg" />
              <SkeletonItem className="h-12 sm:h-14 rounded-lg" />
            </div>
            
            {/* Seller info */}
            <SkeletonItem className="h-10 w-full rounded-lg" />
            
            {/* Price and actions - Single row */}
            <div className="flex items-center justify-between gap-4 mt-4">
              <div className="space-y-1">
                <SkeletonItem className="h-7 w-28 rounded" />
                <SkeletonItem className="h-4 w-20 rounded" />
              </div>
              
              <div className="flex items-center gap-2">
                <SkeletonItem className="h-10 w-10 rounded-lg" />
                <SkeletonItem className="h-10 w-20 rounded-lg" />
                <SkeletonItem className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Grid layout (default) - Enhanced to match actual GemCard
  return (
    <div className={cn(
      'bg-card/40 border border-border/50 rounded-lg sm:rounded-xl backdrop-blur-sm shadow-sm animate-pulse overflow-hidden h-full flex flex-col',
      className
    )}>
      {/* Image placeholder */}
      <div className="relative aspect-square overflow-hidden bg-secondary/20">
        <SkeletonItem className="w-full h-full rounded-none" />
      </div>
      
      {/* Content placeholder */}
      <div className="flex-1 p-2.5 sm:p-3 space-y-2 sm:space-y-3 flex flex-col">
        {/* Title and location */}
        <div className="flex-shrink-0 space-y-1">
          <SkeletonItem className="h-4 sm:h-5 w-4/5 rounded" />
          <SkeletonItem className="h-3 sm:h-4 w-3/5 rounded" />
        </div>
        
        {/* Seller info */}
        <div className="flex-shrink-0">
          <SkeletonItem className="h-6 w-full rounded-lg" />
        </div>
        
        {/* Price */}
        <div className="flex-shrink-0 space-y-1">
          <SkeletonItem className="h-5 sm:h-6 w-2/3 rounded" />
          <SkeletonItem className="h-3 w-1/2 rounded" />
        </div>
        
        {/* Action buttons - Single row layout */}
        <div className="mt-auto pt-2">
          <div className="flex items-center gap-2">
            <SkeletonItem className="h-10 w-10 rounded-lg" />
            <SkeletonItem className="h-10 flex-1 rounded-lg" />
            <SkeletonItem className="h-10 w-10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function GemListSkeleton({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 sm:gap-4 lg:gap-5 animate-pulse', className)}>
      {[...Array(count)].map((_, i) => (
        <GemCardSkeleton key={`gem-list-skeleton-${i}`} layout="list" />
      ))}
    </div>
  )
}

export function GemGridSkeleton({ 
  count = 12, 
  className,
  isFiltersOpen = false 
}: { 
  count?: number; 
  className?: string;
  isFiltersOpen?: boolean;
}) {
  return (
    <div className={cn(
      'grid gap-4 sm:gap-6 lg:gap-8 animate-pulse',
      isFiltersOpen
        ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3' // Filters open: max 3 per row on desktop
        : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5', // Filters closed: up to 5 per row
      className
    )}>
      {[...Array(count)].map((_, i) => (
        <GemCardSkeleton key={`gem-skeleton-${i}`} layout="grid" />
      ))}
    </div>
  )
} 