'use client'

import { useState } from 'react'
import { CheckCircle, Package, Clock, ArrowRight, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/buttons/Button'
import { useUI } from '@/components/providers/UIProvider'

interface CheckoutSuccessProps {
  orderNumber: string
  paymentMethod?: string
}

export default function CheckoutSuccess({ orderNumber, paymentMethod = 'bank-transfer' }: CheckoutSuccessProps) {
  const [copied, setCopied] = useState(false)
  const { showToast } = useUI()

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      showToast({ message: 'Order number copied to clipboard', type: 'success' })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy order number:', error)
      showToast({ message: 'Failed to copy order number', type: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4 sm:mb-6">
            <CheckCircle className="w-10 sm:w-12 h-10 sm:h-12 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-2">
            Thank you for your purchase. We have received your order and will process it shortly.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-card rounded-lg sm:rounded-xl border border-border/30 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Order Details</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Order #</span>
              <code className="px-2 sm:px-3 py-1 bg-secondary rounded-lg font-mono text-xs sm:text-sm break-all">
                {orderNumber}
              </code>
              <button
                onClick={copyOrderNumber}
                className="p-1.5 sm:p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
                title="Copy order number"
              >
                {copied ? (
                  <Check className="w-3 sm:w-4 h-3 sm:h-4 text-green-500" />
                ) : (
                  <Copy className="w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {paymentMethod === 'bank-transfer' ? (
              <>
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800/30">
                  <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                    <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 text-sm sm:text-base">Payment Receipt Received</h3>
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-1">
                      We&apos;ve received your payment receipt and will verify it within 2-4 hours during business hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg sm:rounded-xl border border-amber-200 dark:border-amber-800/30">
                  <div className="p-1.5 sm:p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
                    <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm sm:text-base">Escrow Protection</h3>
                    <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Your payment is held securely in escrow until you receive and confirm the product.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-secondary/30 rounded-lg sm:rounded-xl">
                <div className="p-1.5 sm:p-2 bg-accent/20 rounded-lg flex-shrink-0">
                  <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Payment Processing</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Your payment is being processed and will be confirmed shortly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-card rounded-lg sm:rounded-xl border border-border/30 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center space-x-2">
            <Package className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
            <span>What Happens Next?</span>
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {paymentMethod === 'bank-transfer' ? (
              <>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Payment Verification</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      We will verify your bank transfer receipt within 2-4 hours during business hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Escrow Release</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Your payment is held in escrow and will be released to the seller only after you confirm receipt.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Order Processing & Shipping</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Once payment is verified, your order will be processed and shipped within 1-2 business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold text-primary">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Delivery Confirmation</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      After receiving your gems, confirm delivery to release payment to the seller.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Payment Processing</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Your payment is being processed automatically and will be confirmed shortly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Order Processing</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Once payment is confirmed, we will prepare your gems for shipping.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Shipping & Delivery</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Your order will be shipped within 1-2 business days with tracking information.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link href={`/account/orders/${orderNumber}`} className="flex-1">
            <Button className="w-full h-10 sm:h-12 text-sm sm:text-base">
              Track Your Order
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
            </Button>
          </Link>
          
          <Link href="/explore" className="flex-1">
            <Button variant="outline" className="w-full h-10 sm:h-12 text-sm sm:text-base">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Support Information */}
        <div className="text-center mt-6 sm:mt-8 p-3 sm:p-4 bg-secondary/30 rounded-lg sm:rounded-xl">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@ishqgems.com" className="text-primary hover:text-primary/80 break-all">
              support@ishqgems.com
            </a>{' '}
            or call{' '}
            <a href="tel:+94112345678" className="text-primary hover:text-primary/80 whitespace-nowrap">
              +94 11 234 5678
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
