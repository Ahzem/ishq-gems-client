'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SellerForm from '@/components/forms/SellerForm'
import VerificationProcess from '@/components/sections/VerificationProcess'
import { UserPlus, Award, Globe, Shield, Clock, CheckCircle, XCircle, FileText, Calendar, User } from 'lucide-react'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import sellerService from '@/services/seller.service'
import Spinner from '@/components/loading/Spinner'
import Link from 'next/link'

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

export default function SellPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [applicationStatus, setApplicationStatus] = useState<SellerApplication | null>(null)
  const [checkingApplication, setCheckingApplication] = useState(false)
  const [applicationError, setApplicationError] = useState<string | null>(null)

  // Check for existing application when user is signed in
  const checkApplicationStatus = async (email: string) => {
    try {
      setCheckingApplication(true)
      setApplicationError(null)
      
      const response = await sellerService.getApplicationStatus(email)
      
      if (response.success && response.data) {
        setApplicationStatus(response.data)
      } else {
        // Check if this is a "not found" case (which is expected for new users)
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

  // Check application status when user is authenticated
  useEffect(() => {
    if (!authLoading && user && user.email) {
      checkApplicationStatus(user.email)
    }
  }, [user, authLoading])

  // Helper functions for application status display
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
      case 'pending': return <Clock className="w-6 h-6 text-yellow-500" />
      case 'verified': return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'rejected': return <XCircle className="w-6 h-6 text-red-500" />
      default: return <FileText className="w-6 h-6 text-gray-500" />
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

  const benefits = [
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Access international buyers and collectors worldwide'
    },
    {
      icon: Award,
      title: 'Premium Audience',
      description: 'Connect with serious buyers seeking authentic luxury gems'
    },
    {
      icon: Shield,
      title: 'Compliance First',
      description: 'NGJA-compliant platform ensuring legal and ethical trading'
    }
  ]

  // Loading state
  if (authLoading || checkingApplication) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background pt-24">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-muted-foreground mt-4">
              {authLoading ? 'Loading...' : 'Checking application status...'}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Show application status if user has applied
  if (applicationStatus) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 pt-24 pb-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-8 badge-enhanced">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Application Status</span>
              </div>
              
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 text-enhanced">
                Your Seller Application
              </h1>
              
              <p className="text-muted-enhanced text-lg max-w-2xl mx-auto">
                Here is the current status of your seller application.
              </p>
            </div>

            {/* Application Status Card */}
            <div className="max-w-2xl mx-auto mb-8">
               <div className="border border-border/50 rounded-3xl p-8">
                {/* Status Header */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(applicationStatus.status)}
                    <span className={`text-xl font-semibold ${getStatusColor(applicationStatus.status)} text-enhanced`}>
                      {applicationStatus.status.charAt(0).toUpperCase() + applicationStatus.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Status Message */}
                <div className="text-center mb-8">
                  <p className="text-muted-enhanced leading-relaxed">
                    {getStatusMessage(applicationStatus)}
                  </p>
                </div>

                {/* Application Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-enhanced">Applicant Name</p>
                        <p className="font-medium text-enhanced">{applicationStatus.fullName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-enhanced">Application Date</p>
                        <p className="font-medium text-enhanced">
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
                          <p className="text-sm text-muted-enhanced">Reviewed Date</p>
                          <p className="font-medium text-enhanced">
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
                          <p className="text-sm text-muted-enhanced">Video Verification</p>
                          <p className="font-medium text-enhanced">
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
                      className="cursor-glow px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-medium badge-enhanced"
                    >
                      Login as Seller
                    </Link>
                  )}
                  
                  <Link
                    href="/"
                    className="px-6 py-3 border border-border/50 text-muted-foreground rounded-xl hover:bg-secondary/50 transition-colors cursor-glow"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Show application form (default case - no application exists)
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 md:pt-32">
        
        {/* Hero Section */}
        <section className="py-16 md:py-3 relative overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-l from-accent/3 to-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Header */}
            <ScrollAnimation animation="fadeIn" duration={0.8}>
            <div className="text-center mb-16 luxury-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-8 badge-enhanced">
                <UserPlus className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Join Our Network</span>
              </div>
              
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-enhanced">
                Become a Verified Seller on{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Ishq Gems
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-enhanced max-w-4xl mx-auto leading-relaxed mb-8">
                We only accept trusted sellers who meet our quality and ethical sourcing standards.
                Submit your details below — our team will personally review and contact you for verification.
              </p>

              {/* Why Sell With Us */}
               <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
                <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-4 text-enhanced">
                  Why Sell with Ishq Gems?
                </h2>
                <p className="text-muted-enhanced leading-relaxed mb-6">
                  Join a luxury gem marketplace trusted by global buyers. Reach new markets, build your reputation, 
                  and sell with confidence. Every seller goes through our strict onboarding and compliance process.
                </p>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 text-enhanced">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-enhanced">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </ScrollAnimation>

            {/* Error State */}
            {applicationError && (
              <div className="max-w-2xl mx-auto mb-8">
                 <div className="bg-red-500/10 border border-border/50 rounded-xl p-4">
                  <p className="text-red-600 text-center">{applicationError}</p>
                </div>
              </div>
            )}

            {/* Application Form */}
            <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
              <div className="max-w-4xl mx-auto mb-16 luxury-fade-in luxury-selection">
                <SellerForm 
                  mode={user ? "buyer-upgrade" : "new"}
                  existingEmail={user?.email || ''}
                  existingFullName={user?.fullName || ''}
                />
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Verification Process Section */}
        <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
          <VerificationProcess />
        </ScrollAnimation>
        
      </main>
      <Footer />
    </div>
  )
} 