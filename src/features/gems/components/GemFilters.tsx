'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  RotateCcw,
  Check,
  Shield,
  Palette,
  Shapes,
  Gavel,
  Clock,
  TrendingUp,
  Target,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fixedFilterOptions } from '@/constants/filters'
import type { GemFiltersState } from '@/types'
import { environment } from '@/config/environment'

interface ExploreFiltersProps {
  filters: GemFiltersState
  onFiltersChange: (filters: GemFiltersState) => void
  onClearAll: () => void
  isOpen: boolean
  onToggle: () => void
  resultCount?: number
  className?: string
}

export default function ExploreFilters({
  filters,
  onFiltersChange,
  onClearAll,
  isOpen,
  onToggle,
  resultCount,
  className
}: ExploreFiltersProps) {
  // Ensure all filter arrays have safe defaults
  const safeFilters = useMemo(() => ({
    gemTypes: filters.gemTypes || [],
    colors: filters.colors || [],
    shapes: filters.shapes || [],
    priceRange: filters.priceRange || [0, 10000] as [number, number],
    caratRange: filters.caratRange || [0, 10] as [number, number],
    origins: filters.origins || [],
    labCertified: filters.labCertified ?? null,
    sellerTypes: filters.sellerTypes || [],
    availability: filters.availability || [],
    rarity: filters.rarity || [],
    treatments: filters.treatments || [],
    clarities: filters.clarities || [],
    certifyingLabs: filters.certifyingLabs || [],
    investmentGrades: filters.investmentGrades || [],
    supplierTypes: filters.supplierTypes || [],
    pricePerCaratRange: filters.pricePerCaratRange || [0, 1000] as [number, number],
    listingType: filters.listingType || [],
    auctionStatus: filters.auctionStatus || [],
    timeRemaining: filters.timeRemaining || [],
    bidActivity: filters.bidActivity || [],
    reserveMet: filters.reserveMet ?? null
  }), [filters])

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    gemTypes: true,
    colors: true,
    shapes: true,
    price: true,
    carat: false,
    country: false,
    certification: true,
    seller: false,
    availability: false,
    rarity: false,
    auction: true // Show auction filters by default
  })

  // State for loading and filter options
  const [filterOptions, setFilterOptions] = useState<typeof fixedFilterOptions>(fixedFilterOptions)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  // Initialize filter options and handle dynamic updates
  useEffect(() => {
    const initializeFilterOptions = async () => {
      setIsLoadingOptions(true)
      
      try {
        // Simulate loading time for dynamic filter options
        await new Promise(resolve => setTimeout(resolve, 300))
        
                          // In a real app, this would fetch from an API
         // For now, we'll use the fixed options but could be enhanced with dynamic data
         setFilterOptions(fixedFilterOptions)
      } catch (error) {
        console.error('Error loading filter options:', error)
        // Fallback to fixed options
        setFilterOptions(fixedFilterOptions)
      } finally {
        setIsLoadingOptions(false)
      }
    }

    initializeFilterOptions()
  }, [])

  // Track filter changes for analytics or debugging
  useEffect(() => {
    if (environment.isDevelopment) {
      console.log('Filter state changed:', safeFilters)
    }
  }, [safeFilters])

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

  const updateFilters = useCallback((updates: Partial<GemFiltersState>) => {
    onFiltersChange({ ...safeFilters, ...updates })
  }, [safeFilters, onFiltersChange])

  // Helper function to get color hex code
  const getColorHex = useCallback((colorName: string): string => {
    const colorMap: Record<string, string> = {
      'red': '#DC2626',
      'blue': '#2563EB',
      'green': '#16A34A',
      'yellow': '#EAB308',
      'purple': '#9333EA',
      'pink': '#EC4899',
      'orange': '#EA580C',
      'brown': '#A3A3A3',
      'white': '#F9FAFB',
      'black': '#111827',
      'gray': '#6B7280',
      'clear': '#F9FAFB',
      'colorless': '#F9FAFB',
    }
    
    const lowerColor = colorName.toLowerCase()
    
    // Try exact match first
    if (colorMap[lowerColor]) {
      return colorMap[lowerColor]
    }
    
    // Try partial matches
    for (const [key, hex] of Object.entries(colorMap)) {
      if (lowerColor.includes(key) || key.includes(lowerColor)) {
        return hex
      }
    }
    
    // Default to a neutral color
    return '#9CA3AF'
  }, [])

  // Helper function to get shape icon
  const getShapeIcon = useCallback((shapeName: string): string => {
    const shapeMap: Record<string, string> = {
      'round': '○',
      'oval': '⬭',
      'cushion': '◆',
      'emerald': '⬟',
      'princess': '◇',
      'asscher': '◈',
      'radiant': '◊',
      'pear': '◐',
      'marquise': '◊',
      'heart': '♥',
      'baguette': '▭',
      'trillion': '△',
      'square': '◻',
      'rectangular': '▭',
    }
    
    const lowerShape = shapeName.toLowerCase()
    
    // Try exact match first
    if (shapeMap[lowerShape]) {
      return shapeMap[lowerShape]
    }
    
    // Try partial matches
    for (const [key, icon] of Object.entries(shapeMap)) {
      if (lowerShape.includes(key) || key.includes(lowerShape)) {
        return icon
      }
    }
    
    // Default to a generic shape icon
    return '◇'
  }, [])

  const handleGemTypeChange = useCallback((type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...safeFilters.gemTypes, type]
      : safeFilters.gemTypes.filter(t => t !== type)
    updateFilters({ gemTypes: newTypes })
  }, [safeFilters.gemTypes, updateFilters])

  const handleColorChange = useCallback((color: string, checked: boolean) => {
    const newColors = checked 
      ? [...safeFilters.colors, color]
      : safeFilters.colors.filter(c => c !== color)
    updateFilters({ colors: newColors })
  }, [safeFilters.colors, updateFilters])

  const handleShapeChange = useCallback((shape: string, checked: boolean) => {
    const newShapes = checked 
      ? [...safeFilters.shapes, shape]
      : safeFilters.shapes.filter(s => s !== shape)
    updateFilters({ shapes: newShapes })
  }, [safeFilters.shapes, updateFilters])

  const handleCountryChange = useCallback((country: string, checked: boolean) => {
    const newCountries = checked 
      ? [...safeFilters.origins, country]
      : safeFilters.origins.filter(c => c !== country)
    updateFilters({ origins: newCountries })
  }, [safeFilters.origins, updateFilters])

  const handleSellerTypeChange = useCallback((type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...safeFilters.sellerTypes, type]
      : safeFilters.sellerTypes.filter(t => t !== type)
    updateFilters({ sellerTypes: newTypes })
  }, [safeFilters.sellerTypes, updateFilters])

  const handleAvailabilityChange = useCallback((status: string, checked: boolean) => {
    const newStatuses = checked 
      ? [...safeFilters.availability, status]
      : safeFilters.availability.filter(s => s !== status)
    updateFilters({ availability: newStatuses })
  }, [safeFilters.availability, updateFilters])

  const handleRarityChange = useCallback((rarity: string, checked: boolean) => {
    const newRarities = checked 
      ? [...safeFilters.rarity, rarity]
      : safeFilters.rarity.filter(r => r !== rarity)
    updateFilters({ rarity: newRarities })
  }, [safeFilters.rarity, updateFilters])

  const handleListingTypeChange = useCallback((type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...safeFilters.listingType, type]
      : safeFilters.listingType.filter(t => t !== type)
    updateFilters({ listingType: newTypes })
  }, [safeFilters.listingType, updateFilters])

  const handleAuctionStatusChange = useCallback((status: string, checked: boolean) => {
    const newStatuses = checked 
      ? [...safeFilters.auctionStatus, status]
      : safeFilters.auctionStatus.filter(s => s !== status)
    updateFilters({ auctionStatus: newStatuses })
  }, [safeFilters.auctionStatus, updateFilters])

  const handleTimeRemainingChange = useCallback((time: string, checked: boolean) => {
    const newTimes = checked 
      ? [...safeFilters.timeRemaining, time]
      : safeFilters.timeRemaining.filter(t => t !== time)
    updateFilters({ timeRemaining: newTimes })
  }, [safeFilters.timeRemaining, updateFilters])

  const handleBidActivityChange = useCallback((activity: string, checked: boolean) => {
    const newActivities = checked 
      ? [...safeFilters.bidActivity, activity]
      : safeFilters.bidActivity.filter(a => a !== activity)
    updateFilters({ bidActivity: newActivities })
  }, [safeFilters.bidActivity, updateFilters])

  const FilterSection = ({ 
    title, 
    section, 
    children, 
    count,
    icon
  }: { 
    title: string
    section: string
    children: React.ReactNode
    count?: number
    icon?: React.ComponentType<{ className?: string }>
  }) => (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 text-left hover:bg-secondary/30 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          {icon && React.createElement(icon, { className: "w-4 h-4 text-primary" })}
          <span className="font-semibold text-foreground text-sm sm:text-base">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
          {isLoadingOptions && (
            <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
          )}
        </div>
        {expandedSections[section] ? 
          <ChevronUp className="w-4 h-4 text-muted-foreground" /> : 
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        }
      </button>
      
      {expandedSections[section] && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {isLoadingOptions ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading options...</span>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  )

  const Slider = ({ 
    min, 
    max, 
    value, 
    onChange, 
    step = 1, 
    prefix = "",
    suffix = ""
  }: {
    min: number
    max: number
    value: [number, number]
    onChange: (value: [number, number]) => void
    step?: number
    prefix?: string
    suffix?: string
  }) => (
    <div className="space-y-4 px-1">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span className="font-medium">{prefix}{value[0].toLocaleString()}{suffix}</span>
        <span className="font-medium">{prefix}{value[1].toLocaleString()}{suffix}</span>
      </div>
      
      <div className="relative px-2 py-2">
        {/* Track Background */}
        <div className="w-full h-2 bg-secondary/30 rounded-full shadow-inner">
          {/* Active Track */}
          <div 
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-accent rounded-full shadow-sm transition-all duration-200"
            style={{
              marginLeft: `${Math.max(0, Math.min(100, ((value[0] - min) / (max - min)) * 100))}%`,
              width: `${Math.max(0, Math.min(100, ((value[1] - value[0]) / (max - min)) * 100))}%`
            }}
          />
        </div>
        
        {/* Min Handle Thumb */}
        <div 
          className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 top-1/2 transition-all duration-200 hover:scale-110 cursor-pointer z-10"
          style={{
            left: `${Math.max(2.5, Math.min(97.5, ((value[0] - min) / (max - min)) * 100))}%`
          }}
        />
        
        {/* Max Handle Thumb */}
        <div 
          className="absolute w-5 h-5 bg-white border-2 border-accent rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 top-1/2 transition-all duration-200 hover:scale-110 cursor-pointer z-10"
          style={{
            left: `${Math.max(2.5, Math.min(97.5, ((value[1] - min) / (max - min)) * 100))}%`
          }}
        />
        
        {/* Min Handle Input */}
        <input
          title="Min Value"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onChange([Number(e.target.value), value[1]])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          style={{ pointerEvents: 'auto' }}
        />
        
        {/* Max Handle Input */}
        <input
          title="Max Value"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => onChange([value[0], Number(e.target.value)])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          style={{ pointerEvents: 'auto' }}
        />
      </div>
      
      {/* Range Labels */}
      <div className="flex justify-between text-xs text-muted-foreground/70 px-2">
        <span>{prefix}{min.toLocaleString()}{suffix}</span>
        <span>{prefix}{max.toLocaleString()}{suffix}</span>
      </div>
    </div>
  )

  const hasActiveFilters = 
    safeFilters.gemTypes.length > 0 ||
    safeFilters.colors.length > 0 ||
    safeFilters.shapes.length > 0 ||
    safeFilters.priceRange[0] > 0 || safeFilters.priceRange[1] < 10000 ||
    safeFilters.caratRange[0] > 0 || safeFilters.caratRange[1] < 10 ||
    safeFilters.origins.length > 0 ||
    safeFilters.labCertified !== null ||
    safeFilters.sellerTypes.length > 0 ||
    safeFilters.availability.length > 0 ||
    safeFilters.rarity.length > 0 ||
    safeFilters.treatments.length > 0 ||
    safeFilters.clarities.length > 0 ||
    safeFilters.listingType.length > 0 ||
    safeFilters.auctionStatus.length > 0 ||
    safeFilters.timeRemaining.length > 0 ||
    safeFilters.bidActivity.length > 0 ||
    safeFilters.reserveMet !== null

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Filter Sidebar */}
      <div className={cn(
        "fixed lg:sticky lg:top-6 top-0 left-0 h-full lg:h-fit lg:max-h-[calc(100vh-3rem)] w-80 sm:w-96 lg:w-full",
        "bg-card border-r border-border lg:border-r-0 lg:border lg:rounded-2xl",
        "z-50 lg:z-auto overflow-y-auto",
        "transform transition-transform duration-300 ease-in-out lg:transform-none",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border/50 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">Filters</h3>
              {resultCount !== undefined && (
                <span className="text-sm text-muted-foreground">
                  ({resultCount} gems)
                </span>
              )}
              {isLoadingOptions && (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={onClearAll}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                  title="Clear all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
              
              <button
                onClick={onToggle}
                className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors duration-200"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Sections */}
        <div className="divide-y divide-border/50">
          {/* Gem Types */}
          <FilterSection 
            title="Gem Type" 
            section="gemTypes"
            count={safeFilters.gemTypes.length || undefined}
            icon={Filter}
          >
            <div className="space-y-2">
              {filterOptions.gemTypes.map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={safeFilters.gemTypes.includes(type)}
                      onChange={(e) => handleGemTypeChange(type, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 border-2 rounded transition-all duration-200",
                      safeFilters.gemTypes.includes(type)
                        ? "bg-primary border-primary"
                        : "border-border group-hover:border-primary/50"
                    )}>
                      {safeFilters.gemTypes.includes(type) && (
                        <Check className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Colors */}
          <FilterSection 
            title="Color" 
            section="colors"
            count={safeFilters.colors.length || undefined}
            icon={Palette}
          >
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.colors.map(color => (
                <label key={color} className="cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={safeFilters.colors.includes(color)}
                    onChange={(e) => handleColorChange(color, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border-2 transition-all duration-200",
                    safeFilters.colors.includes(color)
                      ? "border-primary bg-primary/5"
                      : "border-border group-hover:border-primary/50"
                  )}>
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-border/30 shadow-inner"
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                    <span className="text-xs text-foreground group-hover:text-primary transition-colors duration-200">
                      {color}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Shapes */}
          <FilterSection 
            title="Shape" 
            section="shapes"
            count={safeFilters.shapes.length || undefined}
            icon={Shapes}
          >
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.shapes.map(shape => (
                <label key={shape} className="cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={safeFilters.shapes.includes(shape)}
                    onChange={(e) => handleShapeChange(shape, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200",
                    safeFilters.shapes.includes(shape)
                      ? "border-primary bg-primary/5"
                      : "border-border group-hover:border-primary/50"
                  )}>
                    <span className="text-lg text-primary">{getShapeIcon(shape)}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                        {shape}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Price Range" section="price">
            <Slider
              min={0}
              max={10000}
              step={100}
              prefix="$"
              value={safeFilters.priceRange}
              onChange={(value) => updateFilters({ priceRange: value })}
            />
          </FilterSection>

          {/* Carat Weight */}
          <FilterSection title="Carat Weight" section="carat">
            <Slider
              min={0}
              max={10}
              step={0.1}
              suffix="ct"
              value={safeFilters.caratRange}
              onChange={(value) => updateFilters({ caratRange: value })}
            />
          </FilterSection>

          {/* Lab Certification */}
          <FilterSection title="Lab Certification" section="certification" icon={Shield}>
            <div className="space-y-3">
              {[
                { value: null, label: 'All Gems', icon: null },
                { value: true, label: 'Certified Only', icon: Shield },
                { value: false, label: 'Non-Certified', icon: null }
              ].map((option) => (
                <label key={String(option.value)} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="certification"
                      checked={safeFilters.labCertified === option.value}
                      onChange={() => updateFilters({ labCertified: option.value })}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 border-2 rounded-full transition-all duration-200",
                      safeFilters.labCertified === option.value
                        ? "bg-primary border-primary"
                        : "border-border group-hover:border-primary/50"
                    )}>
                      {safeFilters.labCertified === option.value && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full absolute top-0.5 left-0.5" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {option.icon && <option.icon className="w-3 h-3 text-primary" />}
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                      {option.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Country of Origin */}
          <FilterSection 
            title="Country" 
            section="country"
            count={safeFilters.origins.length || undefined}
          >
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.origins.map(country => (
                <label key={country} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={safeFilters.origins.includes(country)}
                      onChange={(e) => handleCountryChange(country, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 border-2 rounded transition-all duration-200",
                      safeFilters.origins.includes(country)
                        ? "bg-primary border-primary"
                        : "border-border group-hover:border-primary/50"
                    )}>
                      {safeFilters.origins.includes(country) && (
                        <Check className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                    {country}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Seller Type */}
          <FilterSection 
            title="Seller Type" 
            section="seller"
            count={safeFilters.sellerTypes.length || undefined}
          >
            <div className="space-y-2">
              {['Ishq', 'Third-Party'].map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={safeFilters.sellerTypes.includes(type)}
                      onChange={(e) => handleSellerTypeChange(type, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 border-2 rounded transition-all duration-200",
                      safeFilters.sellerTypes.includes(type)
                        ? "bg-primary border-primary"
                        : "border-border group-hover:border-primary/50"
                    )}>
                      {safeFilters.sellerTypes.includes(type) && (
                        <Check className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Availability */}
          <FilterSection 
            title="Availability" 
            section="availability"
            count={safeFilters.availability.length || undefined}
          >
            <div className="space-y-2">
              {['In Stock', 'Sold'].map(status => (
                <label key={status} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={safeFilters.availability.includes(status)}
                      onChange={(e) => handleAvailabilityChange(status, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 border-2 rounded transition-all duration-200",
                      safeFilters.availability.includes(status)
                        ? "bg-primary border-primary"
                        : "border-border group-hover:border-primary/50"
                    )}>
                      {safeFilters.availability.includes(status) && (
                        <Check className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      status === 'In Stock' ? "bg-green-500" : "bg-red-500"
                    )} />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                      {status}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Rarity */}
          <FilterSection 
            title="Rarity" 
            section="rarity"
            count={safeFilters.rarity.length || undefined}
          >
            <div className="space-y-2">
              {['Rare', 'Uncommon', 'Common'].map(rarity => (
                <label key={rarity} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={safeFilters.rarity.includes(rarity)}
                      onChange={(e) => handleRarityChange(rarity, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 border-2 rounded transition-all duration-200",
                      safeFilters.rarity.includes(rarity)
                        ? "bg-primary border-primary"
                        : "border-border group-hover:border-primary/50"
                    )}>
                      {safeFilters.rarity.includes(rarity) && (
                        <Check className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                    {rarity}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Treatments */}
          <FilterSection 
            title="Treatment" 
            section="treatments"
            count={safeFilters.treatments.length || undefined}
          >
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.treatments.slice(0, 15).map(treatment => (
                <label key={treatment} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={safeFilters.treatments.includes(treatment)}
                      onChange={(e) => {
                        const newTreatments = e.target.checked 
                          ? [...safeFilters.treatments, treatment]
                          : safeFilters.treatments.filter(t => t !== treatment)
                        updateFilters({ treatments: newTreatments })
                      }}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 border-2 rounded transition-all duration-200",
                      safeFilters.treatments.includes(treatment)
                        ? "bg-primary border-primary"
                        : "border-border group-hover:border-primary/50"
                    )}>
                      {safeFilters.treatments.includes(treatment) && (
                        <Check className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                    {treatment}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Clarity */}
          <FilterSection 
            title="Clarity" 
            section="clarity"
            count={safeFilters.clarities?.length || undefined}
          >
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.clarities.slice(0, 15).map(clarity => (
                <label key={clarity} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={safeFilters.clarities?.includes(clarity) || false}
                      onChange={(e) => {
                        const currentClarities = safeFilters.clarities || []
                        const newClarities = e.target.checked 
                          ? [...currentClarities, clarity]
                          : currentClarities.filter(c => c !== clarity)
                        updateFilters({ clarities: newClarities })
                      }}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 border-2 rounded transition-all duration-200",
                      safeFilters.clarities?.includes(clarity)
                        ? "bg-primary border-primary"
                        : "border-border group-hover:border-primary/50"
                    )}>
                      {safeFilters.clarities?.includes(clarity) && (
                        <Check className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                    {clarity}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Auction Filters */}
          <FilterSection 
            title="Auction & Sales" 
            section="auction"
            count={(safeFilters.listingType.length + safeFilters.auctionStatus.length + safeFilters.timeRemaining.length + safeFilters.bidActivity.length) || undefined}
            icon={Gavel}
          >
            <div className="space-y-4">
              {/* Listing Type */}
              <div>
                <h5 className="text-xs font-medium text-foreground mb-2">Listing Type</h5>
                <div className="space-y-2">
                  {['Direct Sale', 'Auction'].map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={safeFilters.listingType.includes(type)}
                          onChange={(e) => handleListingTypeChange(type, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 border-2 rounded transition-all duration-200",
                          safeFilters.listingType.includes(type)
                            ? "bg-primary border-primary"
                            : "border-border group-hover:border-primary/50"
                        )}>
                          {safeFilters.listingType.includes(type) && (
                            <Check className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {type === 'Auction' ? <Gavel className="w-3 h-3 text-purple-500" /> : <Target className="w-3 h-3 text-blue-500" />}
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                          {type}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Auction Status */}
              <div>
                <h5 className="text-xs font-medium text-foreground mb-2">Auction Status</h5>
                <div className="space-y-2">
                  {['Live Auction', 'Ending Soon', 'Starting Soon', 'Ended'].map(status => (
                    <label key={status} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={safeFilters.auctionStatus.includes(status)}
                          onChange={(e) => handleAuctionStatusChange(status, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 border-2 rounded transition-all duration-200",
                          safeFilters.auctionStatus.includes(status)
                            ? "bg-primary border-primary"
                            : "border-border group-hover:border-primary/50"
                        )}>
                          {safeFilters.auctionStatus.includes(status) && (
                            <Check className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          status === 'Live Auction' ? "bg-green-500" :
                          status === 'Ending Soon' ? "bg-red-500 animate-pulse" :
                          status === 'Starting Soon' ? "bg-yellow-500" :
                          "bg-gray-500"
                        )} />
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                          {status}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Remaining */}
              <div>
                <h5 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-500" />
                  Time Remaining
                </h5>
                <div className="space-y-2">
                  {['< 1 hour', '< 6 hours', '< 24 hours', '< 3 days', '> 3 days'].map(time => (
                    <label key={time} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={safeFilters.timeRemaining.includes(time)}
                          onChange={(e) => handleTimeRemainingChange(time, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 border-2 rounded transition-all duration-200",
                          safeFilters.timeRemaining.includes(time)
                            ? "bg-primary border-primary"
                            : "border-border group-hover:border-primary/50"
                        )}>
                          {safeFilters.timeRemaining.includes(time) && (
                            <Check className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                        {time}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bid Activity */}
              <div>
                <h5 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  Bid Activity
                </h5>
                <div className="space-y-2">
                  {['High Activity (10+ bids)', 'Medium Activity (5-10 bids)', 'Low Activity (1-5 bids)', 'No Bids'].map(activity => (
                    <label key={activity} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={safeFilters.bidActivity.includes(activity)}
                          onChange={(e) => handleBidActivityChange(activity, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 border-2 rounded transition-all duration-200",
                          safeFilters.bidActivity.includes(activity)
                            ? "bg-primary border-primary"
                            : "border-border group-hover:border-primary/50"
                        )}>
                          {safeFilters.bidActivity.includes(activity) && (
                            <Check className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                        {activity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reserve Price Status */}
              <div>
                <h5 className="text-xs font-medium text-foreground mb-2">Reserve Price</h5>
                <div className="space-y-2">
                  {[
                    { value: null, label: 'All Auctions', icon: null },
                    { value: true, label: 'Reserve Met', icon: Target },
                    { value: false, label: 'Reserve Not Met', icon: null }
                  ].map((option) => (
                    <label key={String(option.value)} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="reserveMet"
                          checked={safeFilters.reserveMet === option.value}
                          onChange={() => updateFilters({ reserveMet: option.value })}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 border-2 rounded-full transition-all duration-200",
                          safeFilters.reserveMet === option.value
                            ? "bg-primary border-primary"
                            : "border-border group-hover:border-primary/50"
                        )}>
                          {safeFilters.reserveMet === option.value && (
                            <div className="w-2 h-2 bg-primary-foreground rounded-full absolute top-0.5 left-0.5" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {option.icon && <option.icon className="w-3 h-3 text-green-500" />}
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                          {option.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </FilterSection>
        </div>
      </div>
    </>
  )
} 