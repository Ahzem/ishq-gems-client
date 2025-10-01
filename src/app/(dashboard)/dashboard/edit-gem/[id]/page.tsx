'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, AlertCircle, Shield, Star, Edit3, Store } from 'lucide-react'
import PageTitle from '@/components/dashboard/PageTitle'
import AddGemForm from '@/components/forms/AddGemForm'
import gemService from '@/services/gem.service'
import { EnhancedGem } from '@/types/entities/gem'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Spinner from '@/components/loading/Spinner'

export default function EditGemPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading, hasRole } = useAuth()
  const gemId = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gemData, setGemData] = useState<EnhancedGem | null>(null)
  const [canGoBack, setCanGoBack] = useState(false)

  // Auth protection - only sellers and admins can access
  useEffect(() => {
    if (!authLoading && (!user || (!hasRole('seller') && !hasRole('admin')))) {
      router.push('/signin?message=Seller or admin access required&redirect=/dashboard/edit-gem/' + gemId)
      return
    }
  }, [user, authLoading, hasRole, router, gemId])

  // Check if we can go back in history
  useEffect(() => {
    setCanGoBack(window.history.length > 1)
  }, [])

  // Get role-specific configuration
  const getRoleConfig = () => {
    if (hasRole('admin')) {
      return {
        title: 'Edit Gem Listing',
        pageTitle: 'Edit Gem Listing (Admin)',
        subtitle: 'Edit gem listing with Ishq Gems admin privileges',
        icon: Edit3,
        badge: 'Admin Edit',
        badgeIcon: Star,
        headerGradient: 'from-primary/10 to-accent/10',
        isAdmin: true,
        fallbackRoute: '/dashboard/listings'
      }
    } else {
      return {
        title: 'Edit Gem Listing',
        pageTitle: 'Edit Gem Listing',
        subtitle: 'Update your gemstone listing details and information',
        icon: Edit3,
        badge: 'Edit Listing',
        badgeIcon: Store,
        headerGradient: 'from-primary/10 to-accent/10',
        isAdmin: false,
        fallbackRoute: '/dashboard/listings'
      }
    }
  }

  const roleConfig = getRoleConfig()

  // Handle dynamic back navigation
  const handleGoBack = () => {
    if (canGoBack && window.history.length > 1) {
      router.back()
    } else {
      // Fallback based on role
      router.push(roleConfig.fallbackRoute)
    }
  }

  // Handle successful edit
  const handleEditSuccess = () => {
    handleGoBack()
  }

  useEffect(() => {
    const fetchGemData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await gemService.getGemById(gemId)
        
        if (response.success && response.data) {
          setGemData(response.data)
        } else {
          setError(response.message || 'Failed to load gem details')
        }
      } catch (err) {
        console.error('Error fetching gem for edit:', err)
        setError(err instanceof Error ? err.message : 'Failed to load gem details')
      } finally {
        setLoading(false)
      }
    }

    if (gemId && user && (hasRole('seller') || hasRole('admin'))) {
      fetchGemData()
    }
  }, [gemId, user, hasRole])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm">
          <Spinner size="lg" />
          <h1 className="text-xl font-bold text-foreground mb-2 mt-4">Loading Gem Details</h1>
          <p className="text-muted-foreground">Please wait while we fetch the gemstone information...</p>
        </div>
      </div>
    )
  }

  if (!user || (!hasRole('seller') && !hasRole('admin'))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Redirecting...</p>
        </div>
      </div>
    )
  }

  if (error || !gemData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Error Loading Gem</h1>
          <p className="text-muted-foreground mb-6">{error || "The gemstone you&apos;re trying to edit doesn&apos;t exist."}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-primary/10 text-foreground hover:text-primary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
          
          <PageTitle title={roleConfig.pageTitle} />
          
          {/* Dynamic Header */}
          <div className={`bg-gradient-to-r ${roleConfig.headerGradient} border border-primary/20 rounded-xl p-6 mt-4`}>
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
                    {roleConfig.subtitle.includes('privileges') ? ' admin privileges' : ''}
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
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4 mt-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">Admin Edit Mode</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    You&apos;re editing this gem with administrator privileges. Changes will be applied immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasRole('seller') && !hasRole('admin') && (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-4 mt-4">
              <div className="flex items-start gap-3">
                <Store className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300">Update Your Listing</h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Keep your gem listing up to date with accurate information and high-quality images for better visibility.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="max-w-4xl mx-auto">
          <AddGemForm 
            isAdmin={roleConfig.isAdmin}
            isEditMode={true}
            editGemId={gemId}
            initialData={gemData}
            onEditSuccess={handleEditSuccess}
          />
        </div>
      </div>
    </div>
  )
}
