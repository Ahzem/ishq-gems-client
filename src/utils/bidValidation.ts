export interface BidValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface BidValidationContext {
  currentHighestBid: number
  reservePrice?: number
  startingBid: number
  auctionEndTime: string
  auctionStartTime: string
  minimumIncrement?: number
  userBalance?: number
  userBids?: Array<{
    amount: number
    timestamp: string
    status: 'active' | 'outbid' | 'winning'
  }>
  gemId: string
  sellerId: string
  userId: string
  isSellerBidding?: boolean
  maxBidLimit?: number
  auctionStatus: 'not-started' | 'active' | 'ending-soon' | 'ended'
}

export interface BidValidationConfig {
  enableProxyBidding: boolean
  enableAutoBidding: boolean
  maxConsecutiveBids: number
  minimumBidTime: number // seconds between bids
  warningThresholds: {
    largeIncrease: number // percentage
    frequentBidding: number // bids per minute
    highAmount: number // absolute amount
  }
}

const DEFAULT_CONFIG: BidValidationConfig = {
  enableProxyBidding: true,
  enableAutoBidding: false,
  maxConsecutiveBids: 5,
  minimumBidTime: 30,
  warningThresholds: {
    largeIncrease: 50, // 50% increase warning
    frequentBidding: 3, // 3 bids per minute
    highAmount: 10000 // $10,000 warning
  }
}

export class BidValidator {
  private config: BidValidationConfig

  constructor(config: Partial<BidValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  validateBid(
    bidAmount: number,
    context: BidValidationContext
  ): BidValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []
    let severity: BidValidationResult['severity'] = 'low'

    // Basic validation
    const basicValidation = this.validateBasicRules(bidAmount, context)
    errors.push(...basicValidation.errors)
    warnings.push(...basicValidation.warnings)
    if (basicValidation.severity === 'critical') severity = 'critical'

    // Timing validation
    const timingValidation = this.validateTiming(bidAmount, context)
    errors.push(...timingValidation.errors)
    warnings.push(...timingValidation.warnings)
    if (timingValidation.severity === 'high' && severity !== 'critical') severity = 'high'

    // Amount validation
    const amountValidation = this.validateAmount(bidAmount, context)
    errors.push(...amountValidation.errors)
    warnings.push(...amountValidation.warnings)
    suggestions.push(...amountValidation.suggestions)
    if (amountValidation.severity === 'high' && severity === 'low') severity = 'high'

    // Behavior validation
    const behaviorValidation = this.validateBehavior(bidAmount, context)
    warnings.push(...behaviorValidation.warnings)
    suggestions.push(...behaviorValidation.suggestions)
    if (behaviorValidation.severity === 'medium' && severity === 'low') severity = 'medium'

    // Financial validation
    const financialValidation = this.validateFinancials(bidAmount, context)
    errors.push(...financialValidation.errors)
    warnings.push(...financialValidation.warnings)
    suggestions.push(...financialValidation.suggestions)

    return {
      isValid: errors.length === 0,
      errors: [...new Set(errors)], // Remove duplicates
      warnings: [...new Set(warnings)],
      suggestions: [...new Set(suggestions)],
      severity
    }
  }

  private validateBasicRules(
    bidAmount: number,
    context: BidValidationContext
  ): Pick<BidValidationResult, 'errors' | 'warnings' | 'severity'> {
    const errors: string[] = []
    const warnings: string[] = []
    let severity: BidValidationResult['severity'] = 'low'

    // Check if bid amount is valid number
    if (!bidAmount || bidAmount <= 0 || !Number.isFinite(bidAmount)) {
      errors.push('Please enter a valid bid amount')
      severity = 'critical'
    }

    // Check if auction is still active
    const now = new Date()
    const endTime = new Date(context.auctionEndTime)
    const startTime = new Date(context.auctionStartTime)

    if (now > endTime) {
      errors.push('This auction has already ended')
      severity = 'critical'
    }

    if (now < startTime) {
      errors.push('This auction has not started yet')
      severity = 'critical'
    }

    // Check if user is trying to bid on their own item
    if (context.isSellerBidding) {
      errors.push('You cannot bid on your own auction')
      severity = 'critical'
    }

    // Check auction status
    if (context.auctionStatus === 'ended') {
      errors.push('This auction has ended')
      severity = 'critical'
    }

    if (context.auctionStatus === 'not-started') {
      errors.push('This auction has not started yet')
      severity = 'critical'
    }

    return { errors, warnings, severity }
  }

  private validateTiming(
    bidAmount: number,
    context: BidValidationContext
  ): Pick<BidValidationResult, 'errors' | 'warnings' | 'severity'> {
    const errors: string[] = []
    const warnings: string[] = []
    let severity: BidValidationResult['severity'] = 'low'

    const now = new Date()
    const endTime = new Date(context.auctionEndTime)
    const timeLeft = endTime.getTime() - now.getTime()
    const minutesLeft = timeLeft / (1000 * 60)

    // Check if auction is ending soon
    if (minutesLeft < 5) {
      warnings.push('Auction ending in less than 5 minutes - bid quickly!')
      severity = 'high'
    } else if (minutesLeft < 15) {
      warnings.push('Auction ending soon - consider your final bid')
      severity = 'medium'
    }

    // Check for rapid bidding
    if (context.userBids && context.userBids.length > 0) {
      const recentBids = context.userBids.filter(bid => {
        const bidTime = new Date(bid.timestamp)
        const timeSinceBid = (now.getTime() - bidTime.getTime()) / 1000
        return timeSinceBid < this.config.minimumBidTime
      })

      if (recentBids.length > 0) {
        warnings.push(`Please wait ${this.config.minimumBidTime} seconds between bids`)
        severity = 'medium'
      }
    }

    return { errors, warnings, severity }
  }

  private validateAmount(
    bidAmount: number,
    context: BidValidationContext
  ): Pick<BidValidationResult, 'errors' | 'warnings' | 'suggestions' | 'severity'> {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []
    let severity: BidValidationResult['severity'] = 'low'

    // Check minimum bid requirements
    const minIncrement = context.minimumIncrement || this.calculateMinimumIncrement(context.currentHighestBid)
    const minimumBid = context.currentHighestBid + minIncrement

    if (bidAmount < minimumBid) {
      errors.push(`Minimum bid is $${minimumBid.toLocaleString()} (current high bid + $${minIncrement.toLocaleString()} increment)`)
      severity = 'high'
      
      // Suggest a good bid amount
      const suggestedBid = Math.ceil(minimumBid / 100) * 100 // Round up to nearest $100
      suggestions.push(`Try bidding $${suggestedBid.toLocaleString()} for a competitive edge`)
    }

    // Check if bid is significantly higher than current bid
    const increasePercentage = ((bidAmount - context.currentHighestBid) / context.currentHighestBid) * 100
    if (increasePercentage > this.config.warningThresholds.largeIncrease) {
      warnings.push(`Your bid is ${increasePercentage.toFixed(0)}% higher than the current bid. Are you sure?`)
      severity = 'medium'
      suggestions.push(`Consider a smaller increment like $${(context.currentHighestBid + minIncrement * 2).toLocaleString()}`)
    }

    // Check against reserve price
    if (context.reservePrice && bidAmount >= context.reservePrice) {
      warnings.push('🎯 Your bid meets the reserve price! You\'re in a strong position.')
    } else if (context.reservePrice && bidAmount < context.reservePrice) {
      const difference = context.reservePrice - bidAmount
      suggestions.push(`Bid $${difference.toLocaleString()} more to meet the reserve price`)
    }

    // High amount warning
    if (bidAmount > this.config.warningThresholds.highAmount) {
      warnings.push('This is a significant bid amount. Please confirm you want to proceed.')
      severity = 'medium'
    }

    // Maximum bid limit check
    if (context.maxBidLimit && bidAmount > context.maxBidLimit) {
      errors.push(`Bid amount exceeds your maximum limit of $${context.maxBidLimit.toLocaleString()}`)
      severity = 'high'
    }

    return { errors, warnings, suggestions, severity }
  }

  private validateBehavior(
    bidAmount: number,
    context: BidValidationContext
  ): Pick<BidValidationResult, 'warnings' | 'suggestions' | 'severity'> {
    const warnings: string[] = []
    const suggestions: string[] = []
    let severity: BidValidationResult['severity'] = 'low'

    if (!context.userBids || context.userBids.length === 0) {
      return { warnings, suggestions, severity }
    }

    // Check for consecutive bidding
    const recentBids = context.userBids
      .filter(bid => {
        const bidTime = new Date(bid.timestamp)
        const hoursAgo = (new Date().getTime() - bidTime.getTime()) / (1000 * 60 * 60)
        return hoursAgo < 1
      })
      .length

    if (recentBids >= this.config.maxConsecutiveBids) {
      warnings.push('You\'ve placed several bids recently. Consider setting a maximum bid instead.')
      suggestions.push('Use proxy bidding to automatically bid up to your maximum amount')
      severity = 'medium'
    }

    // Check bidding frequency
    const bidsInLastMinute = context.userBids.filter(bid => {
      const bidTime = new Date(bid.timestamp)
      const minutesAgo = (new Date().getTime() - bidTime.getTime()) / (1000 * 60)
      return minutesAgo < 1
    }).length

    if (bidsInLastMinute >= this.config.warningThresholds.frequentBidding) {
      warnings.push('You\'re bidding very frequently. Take a moment to consider your strategy.')
      severity = 'medium'
    }

    // Strategy suggestions
    const currentWinningBid = context.userBids.find(bid => bid.status === 'winning')
    if (currentWinningBid && bidAmount > currentWinningBid.amount * 1.2) {
      suggestions.push('You\'re already winning. Consider waiting to see if others bid before increasing.')
    }

    return { warnings, suggestions, severity }
  }

  private validateFinancials(
    bidAmount: number,
    context: BidValidationContext
  ): Pick<BidValidationResult, 'errors' | 'warnings' | 'suggestions'> {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Check user balance if available
    if (context.userBalance !== undefined) {
      if (bidAmount > context.userBalance) {
        errors.push('Insufficient funds. Please add funds to your account or lower your bid.')
        suggestions.push('Consider setting up automatic payments or adding a payment method')
      } else if (bidAmount > context.userBalance * 0.8) {
        warnings.push('This bid will use most of your available balance.')
        suggestions.push('Consider adding more funds for future bidding opportunities')
      }
    }

    return { errors, warnings, suggestions }
  }

  private calculateMinimumIncrement(currentBid: number): number {
    // Dynamic increment calculation based on bid amount
    if (currentBid < 100) return 10
    if (currentBid < 500) return 25
    if (currentBid < 1000) return 50
    if (currentBid < 5000) return 100
    if (currentBid < 10000) return 250
    if (currentBid < 25000) return 500
    return 1000 // For high-value items
  }

  // Utility methods for UI components
  static formatBidValidationMessage(result: BidValidationResult): string {
    if (result.errors.length > 0) {
      return result.errors[0] // Show first error
    }
    if (result.warnings.length > 0) {
      return result.warnings[0] // Show first warning
    }
    return 'Bid amount is valid'
  }

  static getBidValidationIcon(severity: BidValidationResult['severity']): string {
    switch (severity) {
      case 'critical': return '🚫'
      case 'high': return '⚠️'
      case 'medium': return '💡'
      case 'low': return '✅'
      default: return 'ℹ️'
    }
  }

  static getSuggestedBidAmount(
    currentHighestBid: number,
    minimumIncrement?: number
  ): number {
    const increment = minimumIncrement || new BidValidator().calculateMinimumIncrement(currentHighestBid)
    return currentHighestBid + increment
  }
}

// Export convenience functions
export const validateBid = (
  bidAmount: number,
  context: BidValidationContext,
  config?: Partial<BidValidationConfig>
): BidValidationResult => {
  const validator = new BidValidator(config)
  return validator.validateBid(bidAmount, context)
}

export const getSuggestedBidAmount = BidValidator.getSuggestedBidAmount
export const formatValidationMessage = BidValidator.formatBidValidationMessage
export const getValidationIcon = BidValidator.getBidValidationIcon 