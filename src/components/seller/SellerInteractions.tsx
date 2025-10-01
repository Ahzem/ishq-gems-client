'use client'

import { useState } from 'react'
import { MessageCircle, Heart, Flag, X, Send, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SellerInteractionsProps {
  sellerId: string
  sellerName: string
  onClose?: () => void
}

type InteractionType = 'message' | 'favorite' | 'report'

export default function SellerInteractions({ 
  sellerId, 
  sellerName, 
  onClose 
}: SellerInteractionsProps) {
  const [activeInteraction, setActiveInteraction] = useState<InteractionType | null>(null)
  const [messageText, setMessageText] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [reportType, setReportType] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const reportTypes = [
    'Fraudulent listing',
    'Inappropriate content',
    'Counterfeit products',
    'Poor communication',
    'Unprofessional behavior',
    'Other'
  ]

  const clearMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      setError('Please enter a message before sending.')
      return
    }

    if (messageText.length > 500) {
      setError('Message must be 500 characters or less.')
      return
    }

    clearMessages()
    setIsSubmitting(true)
    try {
      // TODO: Implement actual messaging API call
      console.log('Sending message to seller:', sellerId, messageText)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessageText('')
      setSuccessMessage('Message sent successfully!')
      setTimeout(() => {
        setActiveInteraction(null)
        setSuccessMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddToFavorites = async () => {
    clearMessages()
    setIsSubmitting(true)
    try {
      // TODO: Implement actual favorites API call
      console.log('Adding seller to favorites:', sellerId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSuccessMessage('Added to favorites!')
      setTimeout(() => {
        setActiveInteraction(null)
        setSuccessMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Error adding to favorites:', error)
      setError('Failed to add to favorites. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReportSeller = async () => {
    if (!reportType) {
      setError('Please select a reason for reporting.')
      return
    }

    if (!reportReason.trim()) {
      setError('Please provide additional details about the issue.')
      return
    }

    if (reportReason.length < 10) {
      setError('Please provide more detailed information (at least 10 characters).')
      return
    }

    clearMessages()
    setIsSubmitting(true)
    try {
      // TODO: Implement actual report API call
      console.log('Reporting seller:', sellerId, { type: reportType, reason: reportReason })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setReportType('')
      setReportReason('')
      setSuccessMessage('Report submitted successfully. Our team will review this within 24 hours.')
      setTimeout(() => {
        setActiveInteraction(null)
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error reporting seller:', error)
      setError('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderErrorMessage = () => {
    if (!error) return null
    
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    )
  }

  const renderSuccessMessage = () => {
    if (!successMessage) return null
    
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="w-4 h-4 bg-green-600 dark:bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
          <div className="w-2 h-1 bg-white rotate-45 transform origin-left"></div>
          <div className="w-1 h-2 bg-white transform -translate-x-0.5"></div>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
      </div>
    )
  }

  const renderMessageDialog = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Message {sellerName}
        </h3>
        <button
          onClick={() => setActiveInteraction(null)}
          className="p-1 hover:bg-secondary rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {renderErrorMessage()}
      {renderSuccessMessage()}
      
      <div className="space-y-3">
        <textarea
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value)
            clearMessages()
          }}
          placeholder="Type your message here..."
          rows={4}
          className={cn(
            "w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 resize-none transition-colors",
            error && messageText.length === 0 
              ? "border-red-300 dark:border-red-700 focus:ring-red-500/50" 
              : messageText.length > 500 
                ? "border-red-300 dark:border-red-700 focus:ring-red-500/50"
                : "border-border focus:ring-primary/50"
          )}
        />
        
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-xs transition-colors",
            messageText.length > 500 
              ? "text-red-600 dark:text-red-400" 
              : messageText.length > 400 
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-muted-foreground"
          )}>
            {messageText.length}/500 characters
            {messageText.length > 500 && (
              <span className="ml-2 inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Too long
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveInteraction(null)}
              className="px-3 py-1 text-sm border border-border rounded hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || messageText.length > 500 || isSubmitting}
              className={cn(
                "px-3 py-1 text-sm rounded transition-colors flex items-center gap-2",
                !messageText.trim() || messageText.length > 500 || isSubmitting
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isSubmitting ? (
                <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderFavoriteDialog = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Add to Favorites
        </h3>
        <button
          onClick={() => setActiveInteraction(null)}
          className="p-1 hover:bg-secondary rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {renderErrorMessage()}
      {renderSuccessMessage()}
      
      <p className="text-muted-foreground">
        Add {sellerName} to your favorites to easily find them later and get notified about their new listings.
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={() => setActiveInteraction(null)}
          className="px-3 py-1 text-sm border border-border rounded hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleAddToFavorites}
          disabled={isSubmitting}
          className={cn(
            "px-3 py-1 text-sm rounded transition-colors flex items-center gap-2",
            isSubmitting
              ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isSubmitting ? (
            <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Heart className="w-3 h-3" />
          )}
          Add to Favorites
        </button>
      </div>
    </div>
  )

  const renderReportDialog = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Report {sellerName}
        </h3>
        <button
          onClick={() => setActiveInteraction(null)}
          className="p-1 hover:bg-secondary rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {renderErrorMessage()}
      {renderSuccessMessage()}
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            What&apos;s the issue?
          </label>
          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value)
              clearMessages()
            }}
            className={cn(
              "w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 transition-colors",
              error && !reportType 
                ? "border-red-300 dark:border-red-700 focus:ring-red-500/50" 
                : "border-border focus:ring-primary/50"
            )}
          >
            <option value="">Select a reason</option>
            {reportTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Additional details
          </label>
          <textarea
            value={reportReason}
            onChange={(e) => {
              setReportReason(e.target.value)
              clearMessages()
            }}
            placeholder="Please provide more details about the issue..."
            rows={3}
            className={cn(
              "w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 resize-none transition-colors",
              error && (!reportReason.trim() || reportReason.length < 10)
                ? "border-red-300 dark:border-red-700 focus:ring-red-500/50" 
                : "border-border focus:ring-primary/50"
            )}
          />
          {reportReason.length > 0 && reportReason.length < 10 && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Please provide more details ({reportReason.length}/10 minimum characters)
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Reports are reviewed by our team within 24 hours
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveInteraction(null)}
              className="px-3 py-1 text-sm border border-border rounded hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReportSeller}
              disabled={!reportType || !reportReason.trim() || reportReason.length < 10 || isSubmitting}
              className={cn(
                "px-3 py-1 text-sm rounded transition-colors flex items-center gap-2",
                !reportType || !reportReason.trim() || reportReason.length < 10 || isSubmitting
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              )}
            >
              {isSubmitting ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Flag className="w-3 h-3" />
              )}
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (!activeInteraction) {
    return (
      <div className="relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-1 bg-background border border-border rounded-full hover:bg-secondary transition-colors z-10 shadow-sm"
            title="Close interactions"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveInteraction('message')
              clearMessages()
            }}
            className={cn(
              "flex-1 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200",
              "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
          
          <button
            onClick={() => {
              setActiveInteraction('favorite')
              clearMessages()
            }}
            className={cn(
              "p-2 border border-border rounded-lg transition-all duration-200",
              "text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-primary/50"
            )}
            title="Add to favorites"
          >
            <Heart className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setActiveInteraction('report')
              clearMessages()
            }}
            className={cn(
              "p-2 border border-border rounded-lg transition-all duration-200",
              "text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700"
            )}
            title="Report seller"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-1 bg-background border border-border rounded-full hover:bg-secondary transition-colors z-10 shadow-sm"
          title="Close interactions"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      
      <div className={cn(
        "bg-card border rounded-lg p-4 transition-all duration-300",
        activeInteraction === 'report' 
          ? "border-red-200 dark:border-red-800" 
          : "border-border"
      )}>
        {activeInteraction === 'message' && renderMessageDialog()}
        {activeInteraction === 'favorite' && renderFavoriteDialog()}
        {activeInteraction === 'report' && renderReportDialog()}
      </div>
    </div>
  )
} 