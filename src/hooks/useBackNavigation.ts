'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { UseBackNavigationOptions, UseBackNavigationReturn } from '@/types'

export function useBackNavigation(options: UseBackNavigationOptions = {}): UseBackNavigationReturn {
  const router = useRouter()
  const previousRouteRef = useRef<string>('')
  const { fallbackRoute = '/', excludeRoutes = [] } = options

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Store the current route as the previous route when component mounts
    const currentPath = window.location.pathname
    
    // Get the previous route from sessionStorage if available
    const storedPreviousRoute = sessionStorage.getItem('previousRoute')
    if (storedPreviousRoute && storedPreviousRoute !== currentPath) {
      previousRouteRef.current = storedPreviousRoute
    }

    // Store current route for future back navigation
    sessionStorage.setItem('previousRoute', currentPath)

    return () => {
      // Update previous route when component unmounts
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('previousRoute', currentPath)
      }
    }
  }, [])

  const goBack = () => {
    if (typeof window === 'undefined') return
    
    const routeHistory = JSON.parse(sessionStorage.getItem('routeHistory') || '[]')
    const currentPath = window.location.pathname
    
    // Find the most recent route that's not the current one
    let targetRoute = null
    for (let i = routeHistory.length - 1; i >= 0; i--) {
      const route = routeHistory[i]
      if (route !== currentPath && !excludeRoutes.includes(route)) {
        targetRoute = route
        break
      }
    }
    
    if (targetRoute) {
      router.push(targetRoute)
    } else if (window.history.length > 1) {
      // Try browser back if available
      router.back()
    } else {
      // Fallback to default route
      router.push(fallbackRoute)
    }
  }

  const goBackWithFallback = (specificFallback: string) => {
    if (typeof window === 'undefined') return
    
    const routeHistory = JSON.parse(sessionStorage.getItem('routeHistory') || '[]')
    const currentPath = window.location.pathname
    
    // Find the most recent route that's not the current one
    let targetRoute = null
    for (let i = routeHistory.length - 1; i >= 0; i--) {
      const route = routeHistory[i]
      if (route !== currentPath && !excludeRoutes.includes(route)) {
        targetRoute = route
        break
      }
    }
    
    if (targetRoute) {
      router.push(targetRoute)
    } else {
      router.push(specificFallback)
    }
  }

  return {
    goBack,
    goBackWithFallback,
    previousRoute: previousRouteRef.current || (typeof window !== 'undefined' ? sessionStorage.getItem('previousRoute') : null)
  }
}
