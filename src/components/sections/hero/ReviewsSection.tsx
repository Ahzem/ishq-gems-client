'use client'

import { useState, useEffect } from 'react'
import { Star, Quote, Edit3, Users, Award, Heart, Sparkles, Crown, ThumbsUp, MessageSquare, ChevronRight, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReviewModal from './ReviewModal'
import { useAuth } from '@/features/auth/hooks/useAuth'
import reviewService from '@/services/review.service'
import { PlatformReview } from '@/types'
import { useRouter } from 'next/navigation'
import CursorReactive from '@/components/common/CursorReactive'

// Using the PlatformReview interface from types
type Review = PlatformReview

const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md', keyPrefix?: string) => {
  const starSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  const baseKey = keyPrefix || 'star'
  return [...Array(5)].map((_, i) => (
    <Star 
      key={`${baseKey}-star-${i}`} 
      className={cn(
        starSize,
        i < rating ? 'fill-amber-400 text-amber-400' : 'text-border'
      )}
    />
  ))
}

const getReviewGradient = (rating: number) => {
  if (rating >= 5) return 'from-emerald-500 to-teal-500'
  if (rating >= 4) return 'from-blue-500 to-cyan-500'
  if (rating >= 3) return 'from-yellow-500 to-amber-500'
  return 'from-red-500 to-pink-500'
}

const getReviewAccent = (rating: number) => {
  if (rating >= 5) return 'text-emerald-500'
  if (rating >= 4) return 'text-blue-500'
  if (rating >= 3) return 'text-yellow-500'
  return 'text-red-500'
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [featuredReview, setFeaturedReview] = useState<Review | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredReview, setHoveredReview] = useState<string | null>(null)
  const [animationIndex, setAnimationIndex] = useState(0)
  const [playingReview, setPlayingReview] = useState<string | null>(null)
  const [hasUserReviewed, setHasUserReviewed] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await reviewService.getPlatformReviews({
          limit: 12,
          sort: 'newest'
        })


        if (response.success) {
          const reviewsArray = response.data?.reviews || []
          
          const sortedReviews = reviewsArray.sort((a: PlatformReview, b: PlatformReview) => b.rating - a.rating)
          setReviews(sortedReviews)
          setFeaturedReview(sortedReviews[0] || null)
          
        } else {
          setError(response.message || 'Failed to load reviews')
        }
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Animate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationIndex(prev => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const addReview = async (newReview: {
    name: string
    location: string
    rating: number
    text: string
  }) => {
    try {
      const response = await reviewService.createPlatformReview(newReview)
      
      if (response.success) {
        const review: Review = {
          _id: response.data?.reviewId || Date.now().toString(),
          userId: user?.id || '',
          name: newReview.name,
          location: newReview.location,
          rating: newReview.rating,
          text: newReview.text,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isVerified: false,
          helpfulVotes: 0,
          status: 'pending',
          submittedAt: new Date(),

        }
        setReviews(prev => [review, ...prev])
        if (!featuredReview || newReview.rating >= featuredReview.rating) {
          setFeaturedReview(review)
        }
        // Mark that user has now reviewed
        setHasUserReviewed(true)
      } else {
        throw new Error(response.message || 'Failed to create review')
      }
    } catch (err) {
      console.error('Error creating review:', err)
      throw err
    }
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  // Text-to-Speech functionality
  const handlePlayReview = (reviewId: string, text: string) => {
    // Stop any currently playing speech
    window.speechSynthesis.cancel()
    
    if (playingReview === reviewId) {
      setPlayingReview(null)
      return
    }

    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onstart = () => setPlayingReview(reviewId)
      utterance.onend = () => setPlayingReview(null)
      utterance.onerror = () => setPlayingReview(null)
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // Get the currently hovered review data
  const currentHoveredReview = hoveredReview ? reviews.find(r => r._id === hoveredReview) : null

  if (loading) {
    return (
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_50%)] opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-secondary rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-secondary rounded-lg w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_50%)] opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Quote className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Unable to Load Reviews</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Don't show anything for non-authenticated users when no reviews exist
  if (reviews.length === 0 && !isAuthenticated) {
    return null
  }

  // Show creation CTA for authenticated users when no reviews exist and they haven't reviewed yet
  if (reviews.length === 0 && isAuthenticated && !hasUserReviewed) {
    return (
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Elegant Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
              <div className="relative">
                <MessageSquare className="w-8 h-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
            </div>
            
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-primary via-accent via-primary to-accent bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-flow">
                Share Your Experience
              </span>
            </h2>
            
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg xl:text-xl max-w-3xl mx-auto leading-relaxed px-4">
              Be the first to share your experience with Ishq Gems and help others discover exceptional gemstones.
            </p>
          </div>

          {/* Creation CTA */}
          <div className="max-w-4xl mx-auto text-center px-2">
            <div className="relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl">
              <Quote className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary/60 mx-auto mb-4 sm:mb-6" />
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                Your Voice Matters
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Share your experience with our gemstone collection and help fellow enthusiasts make informed decisions. 
                Your review will be the first step in building our community of satisfied clients.
              </p>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 sm:gap-3 mx-auto hover:scale-105"
              >
                <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                Write the First Review
              </button>
            </div>
          </div>
        </div>

        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={addReview}
        />
      </section>
    )
  }

  // Show message for authenticated users who have already reviewed when no reviews exist
  if (reviews.length === 0 && isAuthenticated && hasUserReviewed) {
    return (
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
              <Star className="w-8 h-8 text-green-500 fill-current" />
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                Thank You for Your Review!
              </span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Your review has been submitted and will help other customers discover exceptional gemstones. 
              Reviews are processed and will appear shortly.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const averageRating = calculateAverageRating()
  const ratingDistribution = getRatingDistribution()
  const topReviews = reviews.slice(0, 6)
  const floatingTestimonials = reviews.slice(6, 9)

  return (
    <section className={cn(
      "py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden transition-all duration-700",
      currentHoveredReview && `bg-gradient-to-br ${getReviewGradient(currentHoveredReview.rating)}/5 from-background via-secondary/10 to-background`
    )}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-2xl animate-pulse-slow"></div>
        
        {/* Enhanced background effects when hovering over reviews */}
        {currentHoveredReview && (
          <div className={cn(
            "absolute top-1/3 right-1/3 w-48 h-48 rounded-full blur-3xl transition-all duration-1000 animate-pulse-slow",
            `bg-gradient-to-br ${getReviewGradient(currentHoveredReview.rating)}/20`
          )}></div>
        )}
        
        {/* Floating Quote Bubbles */}
        {floatingTestimonials.map((testimonial, index) => (
          <div
            key={`floating-${testimonial._id}-${index}`}
            className={cn(
              "absolute hidden lg:block transition-all duration-1000",
              index === 0 && "top-20 right-20 animate-float-slow",
              index === 1 && "bottom-32 left-16 animate-float-delayed",
              index === 2 && "top-1/2 right-1/3 animate-float-reverse",
              animationIndex === index && "scale-110 opacity-100",
              animationIndex !== index && "scale-90 opacity-60",
              currentHoveredReview && currentHoveredReview._id === testimonial._id && "scale-125 opacity-100 z-20"
            )}
          >
            <div className={cn(
              "bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-lg max-w-xs transition-all duration-500",
              currentHoveredReview && currentHoveredReview._id === testimonial._id && "border-primary/50 shadow-2xl"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(testimonial.rating, 'sm', `floating-${testimonial._id}-${index}`)}
              </div>
              <p className="text-sm text-foreground line-clamp-2 mb-2">
                &quot;{testimonial.text}&quot;
              </p>
              <div className="text-xs text-muted-foreground">
                — {testimonial.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
                  {/* Elegant Header */}
          <div className="text-center mb-10 sm:mb-14 lg:mb-16 xl:mb-20 px-2">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
              <div className="relative">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
            </div>
            
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-primary via-accent via-primary to-accent bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-flow">
                Client Testimonials
              </span>
            </h2>
            
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg xl:text-xl max-w-3xl mx-auto leading-relaxed px-4">
              Discover why collectors and enthusiasts worldwide trust Ishq Gems for their most precious acquisitions.
              {currentHoveredReview && (
                <span className="block mt-2 text-primary font-medium animate-fade-in text-xs sm:text-sm">
                  Currently viewing: {currentHoveredReview.name}&apos;s {currentHoveredReview.rating}-star experience
                </span>
              )}
            </p>
          </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-10 sm:mb-14 lg:mb-16 px-2">
          <CursorReactive enableTilt={true} maxRotation={5} enableScale={true} scaleAmount={1.0} transitionDuration="0.3s">
            <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 sm:mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Average Rating</div>
            </div>
          </CursorReactive>

          <CursorReactive enableTilt={true} maxRotation={5} enableScale={true} scaleAmount={1.0} transitionDuration="0.3s">
            <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-1 sm:mb-2">
              {reviews.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Happy Clients</div>
            </div>
          </CursorReactive>

          <CursorReactive enableTilt={true} maxRotation={5} enableScale={true} scaleAmount={1.0} transitionDuration="0.3s">
            <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-1 sm:mb-2">
              {ratingDistribution[5]}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">5-Star Reviews</div>
            </div>
          </CursorReactive>

          <CursorReactive enableTilt={true} maxRotation={5} enableScale={true} scaleAmount={1.0} transitionDuration="0.3s">
            <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-pink-500" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-1 sm:mb-2">
              {reviews.reduce((sum, review) => sum + review.helpfulVotes, 0)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Helpful Votes</div>
            </div>
          </CursorReactive>
        </div>

        {/* Featured Review Spotlight */}
        {featuredReview && (
          <div className="mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-primary">Featured Review</span>
              </div>
            </div>
            
            <div className="relative max-w-4xl mx-auto">
              <CursorReactive
                enableTilt={true}
                maxRotation={6}
                enableScale={true}
                scaleAmount={1.02}
                transitionDuration="0.5s"
              >
                <div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-border/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 xl:p-12 shadow-2xl hover:shadow-[0_0_60px_rgba(var(--primary),0.3)] transition-all duration-700">
                {/* Large Quote */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 lg:top-6 lg:left-6">
                  <Quote className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-primary/20" />
                </div>
                
                {/* Audio Play Button */}
                <div className="absolute top-3 left-16 sm:top-4 sm:left-20 lg:top-6 lg:left-24">
                  <button
                    onClick={() => handlePlayReview(featuredReview._id, featuredReview.text)}
                    className={cn(
                      "p-2 sm:p-2.5 lg:p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg",
                      playingReview === featuredReview._id 
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse" 
                        : "bg-gradient-to-r from-primary/20 to-accent/20 text-primary hover:from-primary/30 hover:to-accent/30"
                    )}
                    title={playingReview === featuredReview._id ? "Stop reading" : "Listen to review"}
                  >
                    <Play className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300",
                      playingReview === featuredReview._id && "scale-110"
                    )} />
                  </button>
                </div>
                
                <div className="relative z-10">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {renderStars(featuredReview.rating, 'md', `featured-${featuredReview._id}`)}
                    </div>
                    <blockquote className="text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-medium text-foreground leading-relaxed mb-4 sm:mb-6 px-2">
                      &quot;{featuredReview.text}&quot;
                    </blockquote>
                    
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="font-bold text-sm sm:text-base lg:text-lg text-foreground">{featuredReview.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{featuredReview.location}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Rating Badge */}
                <div className={cn(
                  "absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-xs sm:text-sm",
                  `bg-gradient-to-r ${getReviewGradient(featuredReview.rating)}`
                )}>
                  {featuredReview.rating}/5
                </div>
                </div>
              </CursorReactive>
            </div>
          </div>
        )}

        {/* Reviews Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-10 sm:mb-14 lg:mb-16 px-2">
          {topReviews.map((review, index) => (
            <CursorReactive
              key={`review-grid-${review._id}-${index}`}
              className={cn(
                "group relative cursor-pointer transition-all duration-500",
                index === 0 && "md:col-span-2 lg:col-span-1",
                index === 1 && "lg:row-span-2",
                hoveredReview === review._id && "z-20"
              )}
              enableTilt={true}
              maxRotation={8}
              enableScale={true}
              scaleAmount={1.0}
              transitionDuration="0.5s"
              onHoverChange={(isHovered) => setHoveredReview(isHovered ? review._id : null)}
            >
              <div className={cn(
                "relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg transition-all duration-500 h-full",
                hoveredReview === review._id 
                  ? "shadow-2xl border-primary/50 bg-gradient-to-br from-card to-card/80" 
                  : "group-hover:shadow-2xl group-hover:border-primary/30"
              )}>
                {/* Quote Icon */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <Quote className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary/30" />
                </div>
                
                {/* Audio Play Button */}
                <div className="absolute top-3 right-8 sm:top-4 sm:right-10 lg:right-12">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayReview(review._id, review.text)
                    }}
                    className={cn(
                      "p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-sm opacity-0 group-hover:opacity-100",
                      playingReview === review._id 
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse opacity-100" 
                        : "bg-gradient-to-r from-primary/20 to-accent/20 text-primary hover:from-primary/30 hover:to-accent/30"
                    )}
                    title={playingReview === review._id ? "Stop reading" : "Listen to review"}
                  >
                    <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {renderStars(review.rating, 'sm', `review-grid-${review._id}-${index}`)}
                  <span className={cn(
                    "text-xs sm:text-sm font-medium",
                    getReviewAccent(review.rating)
                  )}>
                    {review.rating}/5
                  </span>
                </div>
                
                {/* Review Text */}
                <blockquote className="text-foreground leading-relaxed mb-3 sm:mb-4 line-clamp-4 text-xs sm:text-sm">
                  &quot;{review.text}&quot;
                </blockquote>
                
                {/* Author Info */}
                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/30">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground text-xs sm:text-sm truncate">{review.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{review.location}</div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2 ml-2">
                    <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm text-muted-foreground">{review.helpfulVotes}</span>
                  </div>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                {/* Gradient Border */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
              </div>
            </CursorReactive>
          ))}
        </div>

        {/* Bottom Action Section */}
        <div className="relative">
          <div className={cn(
            "flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border backdrop-blur-sm transition-all duration-700",
            currentHoveredReview 
              ? `bg-gradient-to-r ${getReviewGradient(currentHoveredReview.rating)}/10 border-primary/30`
              : "bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20"
          )}>
            <div className="text-center sm:text-left">
              <h3 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                {currentHoveredReview 
                  ? `Inspired by ${currentHoveredReview.name}?`
                  : "Share Your Experience"
                }
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
                {currentHoveredReview 
                  ? `Join ${currentHoveredReview.name} and others in sharing your gemstone journey`
                  : "Help others discover exceptional gemstones with your review"
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {isAuthenticated && !hasUserReviewed ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 sm:gap-3 hover:scale-105 w-full sm:w-auto justify-center"
                >
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Write Review</span>
                  <span className="sm:hidden">Review</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              ) : isAuthenticated && hasUserReviewed ? (
                <div className="group bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-700 dark:text-green-300 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span className="hidden sm:inline">Review Submitted</span>
                  <span className="sm:hidden">Reviewed</span>
                </div>
              ) : (
                <button
                  onClick={() => router.push('/signin')}
                  className="group bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 sm:gap-3 hover:scale-105 w-full sm:w-auto justify-center"
                >
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Sign In to Review</span>
                  <span className="sm:hidden">Sign In</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse-slow opacity-60"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse-slow opacity-60" style={{ animationDelay: '1s' }}></div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addReview}
      />
    </section>
  )
} 