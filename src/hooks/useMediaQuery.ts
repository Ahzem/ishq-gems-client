'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(query)
      setMatches(mediaQuery.matches)

      const handleChange = (event: MediaQueryListEvent) => {
        setMatches(event.matches)
      }

      // For newer browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else {
        // For older browsers
        mediaQuery.addListener(handleChange)
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange)
        } else {
          mediaQuery.removeListener(handleChange)
        }
      }
    }
  }, [query])

  // Return false during SSR to avoid hydration mismatches
  if (!mounted) {
    return false
  }

  return matches
}
