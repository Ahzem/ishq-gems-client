'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import PageTitle from '@/components/dashboard/PageTitle'
import AddGemForm from '@/components/forms/AddGemForm'
import { Shield, Gem, Star, Plus, Store } from 'lucide-react'
import Spinner from '@/components/loading/Spinner'

export default function AddGemPage() {
  const { user, isLoading, hasRole } = useAuth()
  const router = useRouter()

  // Auth protection - only sellers and admins can access
  useEffect(() => {
    if (!isLoading && (!user || (!hasRole('seller') && !hasRole('admin')))) {
      router.push('/signin?message=Seller or admin access required&redirect=/dashboard/add-gem')
      return
    }
  }, [user, isLoading, hasRole, router])

  // Get role-specific configuration
  const getRoleConfig = () => {
    if (hasRole('admin')) {
      return {
        title: 'Add New Gem - Admin',
        pageTitle: 'Add Gem - Admin',
        subtitle: 'Add a premium gem to the marketplace as Ishq Gems',
        icon: Gem,
        badge: 'Platform Gem',
        badgeIcon: Star,
        headerGradient: 'from-primary/10 to-accent/10',
        isAdmin: true
      }
    } else {
      return {
        title: 'Add New Gem',
        pageTitle: 'Add New Gem',
        subtitle: 'Create a professional listing for your gemstone on Ishq Gems',
        icon: Plus,
        badge: 'New Listing',
        badgeIcon: Gem,
        headerGradient: 'from-primary/10 to-accent/10',
        isAdmin: false
      }
    }
  }

  const roleConfig = getRoleConfig()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || (!hasRole('seller') && !hasRole('admin'))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle title={roleConfig.pageTitle} />
      <div className="space-y-6">
        {/* Dynamic Header */}
        <div className={`bg-gradient-to-r ${roleConfig.headerGradient} border border-primary/20 rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <roleConfig.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  {roleConfig.title}
                  {hasRole('admin') ? (
                    <Shield className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Star className="w-5 h-5 text-amber-500" />
                  )}
                </h1>
                <p className="text-muted-foreground">
                  {roleConfig.subtitle.replace('Ishq Gems', '')}
                  <span className="font-semibold text-primary">Ishq Gems</span>
                  {roleConfig.subtitle.includes('marketplace') ? '' : roleConfig.subtitle.includes('as') ? '' : ''}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
              <roleConfig.badgeIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{roleConfig.badge}</span>
            </div>
          </div>
        </div>

        {/* Role-specific Notice */}
        {hasRole('admin') && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">Admin Privileges</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  You&apos;re adding a gem with administrator privileges. This gem will be listed as a platform gem.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasRole('seller') && !hasRole('admin') && (
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Store className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">Professional Listing</h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Create a detailed and professional listing to attract potential buyers. High-quality images and accurate descriptions are key to successful sales.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Unified Form */}
        <AddGemForm isAdmin={roleConfig.isAdmin} />
      </div>
    </>
  )
}
