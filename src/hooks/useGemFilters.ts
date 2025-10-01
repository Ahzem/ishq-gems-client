import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useDebounce from './useDebounce'
import type { GemFiltersState, UseGemFiltersReturn } from '@/types'

// Default filter state
const defaultFilters: GemFiltersState = {
  gemTypes: [],
  colors: [],
  shapes: [],
  priceRange: [0, 10000],
  caratRange: [0, 10],
  origins: [],
  labCertified: null,
  sellerTypes: [],
  availability: [],
  rarity: [],
  treatments: [],
  clarities: [],
  certifyingLabs: [],
  investmentGrades: [],
  supplierTypes: [],
  pricePerCaratRange: [0, 1000],
  listingType: [],
  auctionStatus: [],
  timeRemaining: [],
  bidActivity: [],
  reserveMet: null
}

export function useGemFilters(): UseGemFiltersReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize filters from URL parameters
  const initializeFiltersFromUrl = useCallback((): GemFiltersState => {
    const filters: GemFiltersState = { ...defaultFilters }
    
    // Parse array parameters
    const gemTypes = searchParams.get('gemTypes')
    if (gemTypes) filters.gemTypes = gemTypes.split(',').map(s => s.trim())
    
    const colors = searchParams.get('colors')
    if (colors) filters.colors = colors.split(',').map(s => s.trim())
    
    const shapes = searchParams.get('shapes')
    if (shapes) filters.shapes = shapes.split(',').map(s => s.trim())
    
    const origins = searchParams.get('origins')
    if (origins) filters.origins = origins.split(',').map(s => s.trim())
    
    const rarity = searchParams.get('rarity')
    if (rarity) filters.rarity = rarity.split(',').map(s => s.trim())
    
    const treatments = searchParams.get('treatments')
    if (treatments) filters.treatments = treatments.split(',').map(s => s.trim())
    
    const clarities = searchParams.get('clarities')
    if (clarities) filters.clarities = clarities.split(',').map(s => s.trim())
    
    const investmentGrades = searchParams.get('investmentGrades')
    if (investmentGrades) filters.investmentGrades = investmentGrades.split(',').map(s => s.trim())
    
    const sellerTypes = searchParams.get('sellerTypes')
    if (sellerTypes) filters.sellerTypes = sellerTypes.split(',').map(s => s.trim())
    
    const listingType = searchParams.get('listingType')
    if (listingType) filters.listingType = listingType.split(',').map(s => s.trim())
    
    const availability = searchParams.get('availability')
    if (availability) filters.availability = availability.split(',').map(s => s.trim())
    
    // Parse range parameters
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      filters.priceRange = [
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 10000
      ]
    }
    
    const minCarat = searchParams.get('minCarat')
    const maxCarat = searchParams.get('maxCarat')
    if (minCarat || maxCarat) {
      filters.caratRange = [
        minCarat ? parseFloat(minCarat) : 0,
        maxCarat ? parseFloat(maxCarat) : 10
      ]
    }
    
    // Parse boolean parameters
    const labCertified = searchParams.get('labCertified')
    if (labCertified) {
      filters.labCertified = labCertified === 'true'
    }
    
    return filters
  }, [searchParams])
  
  // State for filters
  const [filters, setFilters] = useState<GemFiltersState>(initializeFiltersFromUrl)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Debounced filters for API calls
  const debouncedFilters = useDebounce(filters, 300)
  
  // Update filters and URL
  const updateFilters = useCallback((newFilters: GemFiltersState) => {
    setFilters(newFilters)
    
    // Update URL parameters
    const params = new URLSearchParams()
    
    // Add array parameters
    if (newFilters.gemTypes.length > 0) {
      params.set('gemTypes', newFilters.gemTypes.join(','))
    }
    if (newFilters.colors.length > 0) {
      params.set('colors', newFilters.colors.join(','))
    }
    if (newFilters.shapes.length > 0) {
      params.set('shapes', newFilters.shapes.join(','))
    }
    if (newFilters.origins.length > 0) {
      params.set('origins', newFilters.origins.join(','))
    }
    if (newFilters.rarity.length > 0) {
      params.set('rarity', newFilters.rarity.join(','))
    }
    if (newFilters.treatments.length > 0) {
      params.set('treatments', newFilters.treatments.join(','))
    }
    if (newFilters.clarities && newFilters.clarities.length > 0) {
      params.set('clarities', newFilters.clarities.join(','))
    }
    if (newFilters.investmentGrades.length > 0) {
      params.set('investmentGrades', newFilters.investmentGrades.join(','))
    }
    if (newFilters.sellerTypes.length > 0) {
      params.set('sellerTypes', newFilters.sellerTypes.join(','))
    }
    if (newFilters.listingType.length > 0) {
      params.set('listingType', newFilters.listingType.join(','))
    }
    if (newFilters.availability.length > 0) {
      params.set('availability', newFilters.availability.join(','))
    }
    
    // Add range parameters
    if (newFilters.priceRange[0] > 0 || newFilters.priceRange[1] < 10000) {
      params.set('minPrice', newFilters.priceRange[0].toString())
      params.set('maxPrice', newFilters.priceRange[1].toString())
    }
    if (newFilters.caratRange[0] > 0 || newFilters.caratRange[1] < 10) {
      params.set('minCarat', newFilters.caratRange[0].toString())
      params.set('maxCarat', newFilters.caratRange[1].toString())
    }
    
    // Add boolean parameters
    if (newFilters.labCertified !== null) {
      params.set('labCertified', newFilters.labCertified.toString())
    }
    
    // Update URL without causing page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`
    router.push(newUrl, { scroll: false })
  }, [router])
  
  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters(defaultFilters)
    router.push(window.location.pathname, { scroll: false })
  }, [router])
  
  // Toggle filters sidebar
  const toggleFilters = useCallback(() => {
    setIsFiltersOpen(!isFiltersOpen)
  }, [isFiltersOpen])
  
  // Convert filters to API query format
  const getApiQuery = useMemo(() => {
    const query: Record<string, string | string[] | number | boolean> = {}
    
    // Multi-value filters (send as arrays - gem service will convert to comma-separated strings)
    if (debouncedFilters.gemTypes.length > 0) {
      query.gemTypes = debouncedFilters.gemTypes
    }
    if (debouncedFilters.colors.length > 0) {
      query.colors = debouncedFilters.colors
    }
    if (debouncedFilters.shapes.length > 0) {
      query.shapes = debouncedFilters.shapes
    }
    if (debouncedFilters.origins.length > 0) {
      query.origins = debouncedFilters.origins
    }
    if (debouncedFilters.rarity.length > 0) {
      query.rarities = debouncedFilters.rarity
    }
    if (debouncedFilters.investmentGrades.length > 0) {
      query.investmentGrades = debouncedFilters.investmentGrades
    }
    
    // Range filters
    if (debouncedFilters.priceRange[0] > 0) {
      query.minPrice = debouncedFilters.priceRange[0]
    }
    if (debouncedFilters.priceRange[1] < 10000) {
      query.maxPrice = debouncedFilters.priceRange[1]
    }
    if (debouncedFilters.caratRange[0] > 0) {
      query.minCarat = debouncedFilters.caratRange[0]
    }
    if (debouncedFilters.caratRange[1] < 10) {
      query.maxCarat = debouncedFilters.caratRange[1]
    }
    
    // Single value filters
    if (debouncedFilters.treatments.length > 0) {
      // Backend expects single treatment string, use first selection
      query.treatments = debouncedFilters.treatments[0]
    }
    if (debouncedFilters.sellerTypes.length > 0) {
      query.sellerType = debouncedFilters.sellerTypes[0]
    }
    if (debouncedFilters.listingType.length > 0) {
      query.listingType = debouncedFilters.listingType[0].toLowerCase().replace(' ', '-')
    }
    
    // Map availability to status field
    if (debouncedFilters.availability.length > 0) {
      const availability = debouncedFilters.availability[0]
      if (availability === 'In Stock') {
        query.status = 'published'
      } else if (availability === 'Sold') {
        query.status = 'sold'
      }
    }
    
    // Boolean filters
    if (debouncedFilters.labCertified !== null) {
      query.labCertified = debouncedFilters.labCertified
    }
    
    return query
  }, [debouncedFilters])
  
  // Update filters when URL changes
  useEffect(() => {
    setFilters(initializeFiltersFromUrl())
  }, [initializeFiltersFromUrl])
  
  return {
    filters,
    debouncedFilters,
    updateFilters,
    clearAllFilters,
    isFiltersOpen,
    toggleFilters,
    getApiQuery,
  }
} 