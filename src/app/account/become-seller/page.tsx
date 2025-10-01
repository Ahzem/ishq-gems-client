'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Shield, Star, Gem, CheckCircle, Clock, XCircle, FileText, Calendar, User } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Spinner from '@/components/loading/Spinner'
import SellerForm from '@/components/forms/SellerForm'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import sellerService from '@/services/seller.service'

// Types for application status
interface SellerApplication {
  id: string
  fullName: string
  email: string
  status: 'pending' | 'verified' | 'rejected'
  applicationDate: string
  applicationMode?: 'new' | 'buyer-upgrade'
  reviewedAt?: string
  rejectionReason?: string
  videoCallCompleted?: boolean
  accountCreated?: boolean
}

export default function BecomeSellerPage() {
  const { user, isLoading, hasRole } = useAuth()
  const router = useRouter()
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [hasAcknowledged, setHasAcknowledged] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<SellerApplication | null>(null)
  const [checkingApplication, setCheckingApplication] = useState(true)
  const [applicationError, setApplicationError] = useState<string | null>(null)

  // Check for existing application
  const checkApplicationStatus = async (email: string) => {
    try {
      setCheckingApplication(true)
      
      const response = await sellerService.getApplicationStatus(email)
      
      if (response.success && response.data) {
        setApplicationStatus(response.data)
      } else {
        // Check if this is a "not found" case (404) which shouldn't be shown as an error
        const isNotFound = 
          response.message?.includes('No application found') ||
          response.message?.includes('Application not found') ||
          ('error' in response && response.error === 'NOT_FOUND');
        
        if (!isNotFound) {
          // Only treat non-404 errors as actual errors
          setApplicationError(response.message || 'Failed to check application status')
        }
      }
    } catch (error) {
      console.error('Error checking application status:', error)
      
      // Check if this is an AxiosError with 404 status
      const isAxios404 = error && 
        typeof error === 'object' && 
        'response' in error && 
        error.response && 
        typeof error.response === 'object' && 
        'status' in error.response && 
        error.response.status === 404;
      
      // Check for various "not found" patterns
      const isNotFound = isAxios404 ||
        (error instanceof Error && (
          error.message.includes('404') ||
          error.message.includes('not found') ||
          error.message.includes('Not found') ||
          error.message.includes('No application found')
        ));
      
      if (!isNotFound) {
        setApplicationError('Failed to check application status')
      }
    } finally {
      setCheckingApplication(false)
    }
  }

  // Auth protection - only buyers can access this page
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin?message=Please login to access this page&redirect=/account/become-seller')
      return
    }

    if (!isLoading && user && !hasRole('buyer')) {
      // Redirect non-buyers based on their role
      if (hasRole('seller')) {
        router.push('/seller?message=You are already a seller')
      } else if (hasRole('admin')) {
        router.push('/admin?message=Admin accounts cannot apply to become sellers')
      } else {
        router.push('/?message=Access denied')
      }
      return
    }

    // Check for existing application
    if (!isLoading && user && hasRole('buyer')) {
      checkApplicationStatus(user.email)
    }
  }, [user, isLoading, hasRole, router])

  // Show warning modal for first-time visitors (only if no existing application)
  useEffect(() => {
    if (!isLoading && user && hasRole('buyer') && !hasAcknowledged && !checkingApplication && !applicationStatus) {
      setShowWarningModal(true)
    }
  }, [user, isLoading, hasRole, hasAcknowledged, checkingApplication, applicationStatus])

  const handleProceedToApplication = () => {
    setShowWarningModal(false)
    setHasAcknowledged(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600'
      case 'verified': return 'text-green-600'
      case 'rejected': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusMessage = (application: SellerApplication) => {
    switch (application.status) {
      case 'pending':
        return 'Your application is being reviewed by our team. We\'ll contact you within 2-3 business days.'
      case 'verified':
        return application.accountCreated 
          ? 'Your application has been approved and your seller account is ready! You can now login as a seller.'
          : 'Your application has been approved! Please check your email for account setup instructions.'
      case 'rejected':
        return application.rejectionReason 
          ? `Your application was not approved. Reason: ${application.rejectionReason}`
          : 'Your application was not approved. Please contact support for more information.'
      default:
        return 'Unknown application status.'
    }
  }

  // Loading state
  if (isLoading || checkingApplication) {
    return (
      <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">
            {isLoading ? 'Loading...' : 'Checking application status...'}
          </p>
        </div>
      </div>
      <Footer />
      </>
    )
  }

  // Not authenticated or wrong role
  if (!user || !hasRole('buyer')) {
    return (
      <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-muted-foreground mt-4">Redirecting...</p>
        </div>
      </div>
      <Footer />
      </>
    )
  }

  // Show application status if exists
  if (applicationStatus) {
    return (
      <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                <Gem className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                Your Seller Application
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Here is the current status of your seller application.
              </p>
            </div>
          </div>

          {/* Application Status Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-lg">
              {/* Status Header */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-3">
                  {getStatusIcon(applicationStatus.status)}
                  <span className={`text-xl font-semibold ${getStatusColor(applicationStatus.status)}`}>
                    {applicationStatus.status.charAt(0).toUpperCase() + applicationStatus.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div className="text-center mb-8">
                <p className="text-muted-foreground leading-relaxed">
                  {getStatusMessage(applicationStatus)}
                </p>
              </div>

              {/* Application Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Applicant Name</p>
                      <p className="font-medium">{applicationStatus.fullName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Application Date</p>
                      <p className="font-medium">
                        {new Date(applicationStatus.applicationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {applicationStatus.reviewedAt && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Reviewed Date</p>
                        <p className="font-medium">
                          {new Date(applicationStatus.reviewedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {applicationStatus.videoCallCompleted !== undefined && (
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Video Verification</p>
                        <p className="font-medium">
                          {applicationStatus.videoCallCompleted ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                {applicationStatus.status === 'verified' && applicationStatus.accountCreated && (
                  <Link
                    href="/signin"
                    className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-medium"
                  >
                    Login as Seller
                  </Link>
                )}
                
                <Link
                  href="/"
                  className="px-6 py-3 border border-border/50 text-muted-foreground rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      </>
    )
  }

  return (
    <>
    <Header />
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
              <Gem className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Become a Verified Seller
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join our exclusive network of trusted gemstone sellers and reach thousands of buyers worldwide.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Verified Status</h3>
              <p className="text-sm text-muted-foreground">Build trust with buyers through our rigorous verification process</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Premium Exposure</h3>
              <p className="text-sm text-muted-foreground">Your listings get priority placement and enhanced visibility</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                <Gem className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Continue Buying</h3>
              <p className="text-sm text-muted-foreground">Keep all your buyer privileges while selling your gems</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {applicationError && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-600 text-center">{applicationError}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!hasAcknowledged ? (
          <div className="text-center py-12">
            <Spinner size="lg" />
            <p className="text-muted-foreground mt-4">Preparing application...</p>
          </div>
        ) : (
          <SellerForm 
            mode="buyer-upgrade"
            existingEmail={user.email}
            existingFullName={user.fullName}
          />
        )}
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-3xl p-8 max-w-lg w-full mx-auto shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                Important Notice
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-r from-orange-500/5 to-red-500/5 border border-orange-500/20 rounded-xl p-6">
                <p className="text-foreground font-medium mb-3">
                  ⚠️ Account Conversion Process
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Your buyer account will be upgraded to a seller account after approval</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>All your existing purchase history and profile data will be retained</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>You can continue buying gems with full seller privileges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>You will be redirected to the seller dashboard after approval</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-border/50 text-muted-foreground rounded-xl hover:bg-secondary/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToApplication}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-medium"
              >
                I Understand, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  )
} 