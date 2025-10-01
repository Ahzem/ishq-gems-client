'use client'

import { useState, useEffect } from 'react'
import { X, Star, Send, MapPin, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (review: {
    name: string
    location: string
    rating: number
    text: string
  }) => Promise<void>
}

export default function ReviewModal({ isOpen, onClose, onSubmit }: ReviewModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rating: 0,
    text: ''
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-populate user name when modal opens
  useEffect(() => {
    if (isOpen && user?.fullName) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName
      }))
    }
  }, [isOpen, user?.fullName])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Name validation - should always be valid since it's auto-populated from user account
    if (!formData.name.trim()) {
      newErrors.name = 'Unable to get your name from account. Please refresh and try again.'
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    
    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating'
    }
    
    if (!formData.text.trim()) {
      newErrors.text = 'Review text is required'
    } else if (formData.text.trim().length < 10) {
      newErrors.text = 'Review must be at least 10 characters'
    } else if (formData.text.trim().length > 500) {
      newErrors.text = 'Review must be less than 500 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      await onSubmit({
        name: formData.name.trim(),
        location: formData.location.trim(),
        rating: formData.rating,
        text: formData.text.trim()
      })
      
      // Reset form on success (keep user name)
      setFormData({
        name: user?.fullName || '',
        location: '',
        rating: 0,
        text: ''
      })
      setErrors({})
      onClose()
    } catch (err) {
      // Handle API errors
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review'
      setErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: user?.fullName || '',
        location: '',
        rating: 0,
        text: ''
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-primary/20 rounded-2xl sm:rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
        {/* Luxury Header */}
        <div className="relative bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 px-6 sm:px-8 py-6 border-b border-primary/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_70%)] opacity-20"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                Share Your Experience
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Help others discover exceptional gems
              </p>
            </div>
            
            <button
              title="Close"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary transition-colors duration-200 disabled:opacity-50"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Name Field - Read Only */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="w-4 h-4 text-primary" />
              Your Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                readOnly
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Auto-filled
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Name is automatically filled from your account
            </p>
          </div>

          {/* Location Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Dubai, UAE"
              className={cn(
                "w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200",
                errors.location ? "border-red-500" : "border-border hover:border-primary/30"
              )}
              disabled={isSubmitting}
            />
            {errors.location && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.location}
              </p>
            )}
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Star className="w-4 h-4 text-primary fill-primary" />
              Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  title={`${star} stars`}
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isSubmitting}
                  className="group p-1 transition-transform duration-200 hover:scale-110 disabled:pointer-events-none"
                >
                  <Star 
                    className={cn(
                      "w-8 h-8 transition-colors duration-200",
                      (hoveredRating >= star || formData.rating >= star)
                        ? "text-primary fill-primary" 
                        : "text-border hover:text-primary/50"
                    )}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-muted-foreground">
                {formData.rating > 0 ? `${formData.rating}/5 stars` : 'Select rating'}
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                {errors.rating}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Your Review
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Share your experience with Ishq Gems..."
              rows={4}
              maxLength={500}
              className={cn(
                "w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 resize-none",
                errors.text ? "border-red-500" : "border-border hover:border-primary/30"
              )}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between">
              {errors.text && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  {errors.text}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {formData.text.length}/500 characters
              </p>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Luxury Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
      </div>
    </div>
  )
} 