'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCart } from '@/store/useCart'
import CheckoutPage from '@/components/checkout/CheckoutPage'
import { GlobalLoader } from '@/components/loading'

export default function Checkout() {
  const { user, isLoading: authLoading } = useAuth()
  const { items } = useCart()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading) {
      if (!user) {
        router.push('/signin?redirect=/checkout')
        return
      }
      
      // Check if cart has items
      if (items.length === 0) {
        router.push('/account/cart')
        return
      }
      
      setIsLoading(false)
    }
  }, [user, authLoading, items, router])

  if (authLoading || isLoading) {
    return <GlobalLoader isVisible={true} />
  }

  if (!user || items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <CheckoutPage />
    </div>
  )
}
