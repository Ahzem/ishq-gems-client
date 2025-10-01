'use client'

import { useState, useEffect } from 'react'
import { Search, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchBarProps } from '@/types'

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search exceptional gems...", 
  className,
  initialValue = ""
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, onSearch])

  const handleClear = () => {
    setSearchQuery("")
    onSearch("")
  }

  return (
    <div className={cn(
      "relative group",
      className
    )}>
      {/* Luxury Background Glow */}
      <div className={cn(
        "absolute inset-0 rounded-lg opacity-0 transition-all duration-500",
        "bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5",
        isFocused && "opacity-100"
      )} />
      
      {/* Premium Border Gradient */}
      <div className={cn(
        "absolute inset-0 rounded-lg p-[1px] transition-all duration-300",
        "bg-gradient-to-r from-transparent via-border to-transparent",
        isFocused && "from-primary/30 via-accent/30 to-primary/30"
      )}>
        <div className="w-full h-full bg-background rounded-lg" />
      </div>

      {/* Search Icon with Sparkle Effect */}
      <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <div className="relative">
          <Search className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300",
            isFocused ? "text-primary scale-110" : "text-muted-foreground"
          )} />
          {isFocused && (
            <Sparkles className="absolute -top-1 -right-1 w-2 h-2 text-accent animate-pulse" />
          )}
        </div>
      </div>

      {/* Premium Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        suppressHydrationWarning={true}
        className={cn(
          "relative z-10 w-full pl-10 sm:pl-12 pr-10 sm:pr-12 h-12",
          "bg-transparent text-foreground placeholder:text-muted-foreground/70 border border-border/50",
          "focus:outline-none transition-all duration-300",
          "text-sm font-medium",
          "rounded-lg",
          // Luxury typography
          "tracking-wide",
          // Enhanced placeholder styling
          "placeholder:font-normal placeholder:tracking-normal"
        )}
      />

      {/* Elegant Clear Button */}
      {searchQuery && (
        <button
          onClick={handleClear}
          className={cn(
            "absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10",
            "w-6 h-6 sm:w-7 sm:h-7 rounded-full",
            "bg-gradient-to-r from-secondary to-secondary/80",
            "hover:from-primary/10 hover:to-accent/10",
            "text-muted-foreground hover:text-primary",
            "flex items-center justify-center",
            "transition-all duration-300 hover:scale-110 hover:rotate-90",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            "shadow-sm hover:shadow-md",
            "border border-border/50 hover:border-primary/30"
          )}
          aria-label="Clear search"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300" />
        </button>
      )}

      {/* Luxury Progress Indicator */}
      <div className={cn(
        "absolute bottom-0 left-0 h-[2px] rounded-full overflow-hidden",
        "bg-gradient-to-r from-primary via-accent to-primary",
        "transition-all duration-500 ease-out",
        isFocused ? "w-full opacity-100" : "w-0 opacity-0"
      )}>
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>

      {/* Enhanced Search Suggestions */}
      {searchQuery && isFocused && (
        <div className={cn(
          "absolute top-full left-0 right-0 mt-2 z-50",
          "bg-card/95 backdrop-blur-xl border border-border/50",
          "rounded-lg shadow-2xl",
          "animate-in slide-in-from-top-2 duration-200"
        )}>
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-primary/5">
              <Search className="w-3 h-3 text-primary/70" />
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                Searching for <span className="text-foreground font-semibold">&quot;{searchQuery}&quot;</span>
              </span>
              <Sparkles className="w-3 h-3 text-accent/70 ml-auto" />
            </div>
            
            {/* Premium Search Tips */}
            <div className="mt-3 pt-3 border-t border-border/30">
              <div className="text-xs text-muted-foreground/80 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary/50 rounded-full" />
                  <span>Try: &quot;ruby&quot;, &quot;emerald&quot;, or &quot;Ceylon sapphire&quot;</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-accent/50 rounded-full" />
                  <span>Search by origin, color, or certification</span>
                </div> 
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Shimmer Effect */}
      <div className={cn(
        "absolute inset-0 rounded-lg pointer-events-none",
        "bg-gradient-to-r from-transparent via-white/[0.02] to-transparent",
        "opacity-0 transition-opacity duration-1000",
        isFocused && "opacity-100 animate-shimmer-slow"
      )} />
    </div>
  )
} 