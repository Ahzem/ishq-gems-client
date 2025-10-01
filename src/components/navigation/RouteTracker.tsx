'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * RouteTracker component that tracks navigation history
 * Place this in your root layout to track all route changes
 */
export default function RouteTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Skip tracking for auth pages and API routes
    if (pathname.includes('/signin') || 
        pathname.includes('/signup') || 
        pathname.includes('/api/') ||
        pathname.includes('/_next/')) {
      return
    }

    // Get current route history
    const routeHistory = JSON.parse(sessionStorage.getItem('routeHistory') || '[]')
    
    // Don't add the same route consecutively
    if (routeHistory[routeHistory.length - 1] !== pathname) {
      // Keep only the last 5 routes to prevent memory issues
      const updatedHistory = [...routeHistory, pathname].slice(-5)
      sessionStorage.setItem('routeHistory', JSON.stringify(updatedHistory))
    }
  }, [pathname])

  return null // This component doesn't render anything
}
