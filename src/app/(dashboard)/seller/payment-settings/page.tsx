'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Spinner from '@/components/loading/Spinner'
import PageTitle from '@/components/dashboard/PageTitle'
import PaymentDetails from '@/components/payment/PaymentDetails'

export default function PaymentSettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Auth protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin?message=Please login to access payment settings&redirect=/seller/payment-settings')
      return
    }

    if (!authLoading && user && user.role !== 'seller') {
      router.push('/')
      return
    }
  }, [user, authLoading, router])

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading payment settings...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or wrong role
  if (!user || user.role !== 'seller') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle title="Payment Settings" />
      <main className="bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PaymentDetails />
        </div>
      </main>
    </>
  )
}
