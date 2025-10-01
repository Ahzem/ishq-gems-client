'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Gavel, AlertCircle, Lock, ArrowRight, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Toast from '@/components/alerts/Toast'
import { BidData } from '@/types/entities/bid'

export interface PlaceBidFormProps {
  gemId: string
  currentHighestBid: number
  minimumBid: number
  reservePrice?: number
  auctionEndTime: string
  sellerId: string
  totalBids: number
  className?: string
  onBidPlaced?: (newBid: BidData) => void
  onBidUpdate?: () => void
}

interface BidFormData {
  amount: string
  proxyMaxBid?: string
  useProxyBidding: boolean
}

export default function PlaceBidForm({
  gemId,
  currentHighestBid,
  minimumBid,
  reservePrice,
  auctionEndTime,
  sellerId,
  totalBids,
  className,
  onBidPlaced,
  onBidUpdate
}: PlaceBidFormProps) {
  const { user, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState<BidFormData>({
    amount: '',
    proxyMaxBid: '',
    useProxyBidding: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [isAuctionEnded, setIsAuctionEnded] = useState(false)

  // Check if auction has ended
  useEffect(() => {
    const checkAuctionStatus = () => {
      const endTime = new Date(auctionEndTime).getTime()
      const now = Date.now()
      setIsAuctionEnded(now > endTime)
    }

    checkAuctionStatus()
    const interval = setInterval(checkAuctionStatus, 1000)
    return () => clearInterval(interval)
  }, [auctionEndTime])

  // Check if user can bid
  const canBid = () => {
    if (!user) return { canBid: false, reason: 'Please sign in to place a bid' }
    if (isAuctionEnded) return { canBid: false, reason: 'Auction has ended' }
    
    // Check if user is the seller of this item
    if (user.id === sellerId) return { canBid: false, reason: 'You cannot bid on your own auction' }
    
    // Allow buyers, sellers (on others' items), and admins to bid
    if (user.role === 'buyer' || user.role === 'seller' || user.role === 'admin') {
      return { canBid: true }
    }
    
    return { canBid: false, reason: 'Only verified users can place bids' }
  }

  const bidCheck = canBid()

  const validateBid = (amount: string): string | null => {
    const bidAmount = parseFloat(amount)
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return 'Please enter a valid bid amount'
    }
    if (bidAmount < minimumBid) {
      return `Bid must be at least $${minimumBid.toLocaleString()}`
    }
    if (bidAmount <= currentHighestBid) {
      return `Bid must be higher than current bid of $${currentHighestBid.toLocaleString()}`
    }
    return null
  }

  const handleInputChange = (field: keyof BidFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear errors when user starts typing
    if (field === 'amount' && typeof value === 'string') {
      const error = validateBid(value)
      setErrors(prev => ({ ...prev, amount: error || '' }))
    }
  }

  const handleQuickBid = (type: 'minimum' | 'increment' | 'reserve') => {
    let amount: number
    switch (type) {
      case 'minimum':
        amount = minimumBid
        break
      case 'increment':
        amount = currentHighestBid + Math.max(100, Math.floor(currentHighestBid * 0.05)) // 5% or $100 minimum
        break
      case 'reserve':
        amount = reservePrice || minimumBid
        break
      default:
        return
    }
    
    setFormData(prev => ({ ...prev, amount: amount.toString() }))
    setErrors(prev => ({ ...prev, amount: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bidCheck.canBid) {
      setToast({ message: bidCheck.reason || 'You cannot bid on your own auction', type: 'error' })
      return
    }

    const amountError = validateBid(formData.amount)
    if (amountError) {
      setErrors({ amount: amountError })
      return
    }

    setShowConfirmation(true)
  }

  const confirmBid = async () => {
    setIsSubmitting(true)
    try {
      // Import bid service dynamically to avoid SSR issues
      const { default: bidService } = await import('@/services/bid.service')
      
      const bidData = {
        gemId,
        amount: parseFloat(formData.amount),
        ...(formData.useProxyBidding && formData.proxyMaxBid && {
          proxyMaxBid: parseFloat(formData.proxyMaxBid)
        })
      }

      const response = await bidService.placeBid(bidData)
      
      if (response.success) {
        setToast({ 
          message: `Bid placed successfully for $${parseFloat(formData.amount).toLocaleString()}!`, 
          type: 'success' 
        })
        setFormData({ amount: '', proxyMaxBid: '', useProxyBidding: false })
        setShowConfirmation(false)
        if (response.data) {
          onBidPlaced?.(response.data)
        }
        onBidUpdate?.()
      } else {
        setToast({ message: response.message || 'Failed to place bid', type: 'error' })
      }
    } catch (error) {
      console.error('Error placing bid:', error)
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to place bid', 
        type: 'error' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (!bidCheck.canBid) {
    return (
      <div className={cn(
        'bg-card border border-border rounded-xl p-6',
        className
      )}>
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Lock className="w-5 h-5" />
          <span className="text-sm font-medium">{bidCheck.reason}</span>
        </div>
        {!isAuthenticated && (
          <div className="mt-4 text-center">
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign In to Bid
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={cn(
        'bg-card border border-border rounded-xl overflow-hidden',
        className
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Place Your Bid</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>{totalBids} bid{totalBids !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Current Bid Info */}
        <div className="p-4 bg-secondary/10">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Highest</span>
              <div className="text-xl font-bold text-primary">
                {formatCurrency(currentHighestBid)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Minimum Bid</span>
              <div className="text-lg font-semibold text-foreground">
                {formatCurrency(minimumBid)}
              </div>
            </div>
          </div>
          
          {reservePrice && currentHighestBid < reservePrice && (
            <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Reserve price not yet met</span>
              </div>
            </div>
          )}
        </div>

        {/* Bid Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Bid Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickBid('minimum')}
              className="px-3 py-2 text-xs bg-secondary/50 text-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              Min: {formatCurrency(minimumBid)}
            </button>
            <button
              type="button"
              onClick={() => handleQuickBid('increment')}
              className="px-3 py-2 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              +5% Increment
            </button>
            {reservePrice && (
              <button
                type="button"
                onClick={() => handleQuickBid('reserve')}
                className="px-3 py-2 text-xs bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
              >
                Reserve: {formatCurrency(reservePrice)}
              </button>
            )}
          </div>

          {/* Bid Amount Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Bid Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground',
                  'focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all',
                  errors.amount ? 'border-red-500' : 'border-border'
                )}
                placeholder="Enter bid amount"
                min={minimumBid}
                step="100"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Proxy Bidding */}
          <div className="border-t border-border/30 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.useProxyBidding}
                onChange={(e) => handleInputChange('useProxyBidding', e.target.checked)}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm font-medium text-foreground">Enable Proxy Bidding</span>
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically bid up to your maximum amount when outbid
            </p>
            
            {formData.useProxyBidding && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum Bid Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    value={formData.proxyMaxBid}
                    onChange={(e) => handleInputChange('proxyMaxBid', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Enter maximum bid"
                    min={parseFloat(formData.amount) || minimumBid}
                    step="100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!formData.amount || !!errors.amount || isSubmitting}
            className={cn(
              'w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200',
              'flex items-center justify-center gap-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'bg-gradient-to-r from-primary to-accent text-primary-foreground',
              'hover:shadow-lg hover:scale-101 active:scale-100'
            )}
          >
            <Gavel className="w-5 h-5" />
            {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmation(false)} />
          
          <div className="relative max-w-md w-full bg-card border border-border rounded-xl p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Confirm Your Bid
              </h3>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <p>You are about to place a bid of:</p>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(parseFloat(formData.amount))}
                </div>
                {formData.useProxyBidding && formData.proxyMaxBid && (
                  <p className="text-xs">
                    With proxy bidding up to {formatCurrency(parseFloat(formData.proxyMaxBid))}
                  </p>
                )}
                <p className="text-xs">This action cannot be undone.</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBid}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Bid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => setToast(null)}
            duration={5000}
          />
        </div>
      )}
    </>
  )
} 