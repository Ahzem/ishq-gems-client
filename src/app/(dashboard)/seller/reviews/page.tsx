'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useRouter } from 'next/navigation'
import PageTitle from '@/components/dashboard/PageTitle'
import SellerReviewManagement from '@/components/seller/SellerReviewManagement'
import Spinner from '@/components/loading/Spinner'
import { Star, MessageSquare, AlertTriangle, RefreshCw, Info, Clock, CheckCircle, Flag } from 'lucide-react'

export default function SellerReviewsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(false)
  const [stats, setStats] = useState({
    totalReviews: 0,
    needsReply: 0,
    replied: 0,
    flagged: 0
  })
  
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    // The refresh will be handled by the child component
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [])
  
  const handleStatsUpdate = useCallback((newStats: typeof stats) => {
    setStats(newStats)
  }, [])
  
  // Close guidelines on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showGuidelines && !target.closest('.guidelines-container')) {
        setShowGuidelines(false)
      }
    }
    
    if (showGuidelines) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showGuidelines])
  
  // Auth protection
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'seller')) {
      router.push('/signin?message=Please login as a seller to access this page&redirect=/seller/reviews')
      return
    }
    
    if (user && user.role === 'seller') {
      setIsLoading(false)
    }
  }, [user, authLoading, router])

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading reviews...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or not a seller
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
      <PageTitle title="Manage Reviews" />
      <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                    Manage Reviews
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                  </h1>
                  <div className="flex items-center gap-3">
                    <p className="text-muted-foreground">
                      Reply to customer reviews and manage feedback for your <span className="font-semibold text-primary">Ishq Gems</span> listings
                    </p>
                    <div className="relative guidelines-container">
                      <button
                        onClick={() => setShowGuidelines(!showGuidelines)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                        title="View guidelines"
                      >
                        <Info className="w-3 h-3" />
                        Guidelines
                      </button>
                      
                      {/* Guidelines Tooltip */}
                      {showGuidelines && (
                        <div className="absolute top-8 left-0 sm:left-0 right-0 sm:right-auto z-50 w-full sm:w-80 bg-white dark:bg-gray-800 border border-border rounded-xl shadow-2xl p-4 animate-in fade-in-0 zoom-in-95 duration-200">
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                <h4 className="font-semibold text-foreground text-sm">Review Management Guidelines</h4>
                              </div>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Reply professionally to customer reviews to build trust</li>
                                <li>• Use the flag feature to report inappropriate or fake reviews</li>
                                <li>• Flagged reviews are hidden from public view until admin review</li>
                                <li>• You cannot edit or delete reviews - only reply and flag</li>
                              </ul>
                            </div>
                            
                            <div className="border-t border-border pt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <h4 className="font-semibold text-foreground text-sm">Flagging Policy</h4>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Only flag reviews that violate our community guidelines (inappropriate language, fake reviews, spam, etc.). 
                                Misuse of the flagging system may result in restrictions on your account.
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setShowGuidelines(false)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/20 hover:bg-secondary/30 border border-border/30 rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50"
                  title="Refresh reviews"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Review Management</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          {!isLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Reviews</p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{isLoading ? '...' : stats.totalReviews}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                    <Star className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Needs Reply</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-600">{isLoading ? '...' : stats.needsReply}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-amber-500/10 rounded-lg">
                    <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-amber-500" />
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Replied</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{isLoading ? '...' : stats.replied}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-500" />
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border/30 rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Flagged</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600">{isLoading ? '...' : stats.flagged}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-red-500/10 rounded-lg">
                    <Flag className="h-4 w-4 sm:h-6 sm:w-6 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Management Component */}
          <div className="space-y-6">
            {user?.id ? (
              <SellerReviewManagement sellerId={user.id} onRefresh={handleRefresh} onStatsUpdate={handleStatsUpdate} />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="text-muted-foreground mt-4">Loading user data...</p>
                </div>
              </div>
            )}
          </div>
      </div>

    </>
  )
} 