'use client'

import { useRouter } from 'next/navigation'
import { ShoppingCart, Users, Gem, CreditCard, Shield, Truck, ArrowRight, Building2, Coins, CheckCircle2 } from 'lucide-react'
import { GroupedCartItems, formatPrice, getTotalSellers, getGrandTotal, getGrandTotalWithShipping } from '@/lib/cartHelpers'
import { cn } from '@/lib/utils'
import { CartItem } from '@/types/entities/cart'

interface CartSummaryProps {
  items: CartItem[]
  groupedItems: GroupedCartItems
  hideMobileCheckout?: boolean
}

export default function CartSummary({ items, groupedItems, hideMobileCheckout = false }: CartSummaryProps) {
  const router = useRouter()
  
  const totalSellers = getTotalSellers(groupedItems)
  const grandTotal = getGrandTotal(items)
  const grandTotalWithShipping = getGrandTotalWithShipping(groupedItems)
  const totalShipping = grandTotalWithShipping - grandTotal
  const totalItems = items.length

  const handleCheckout = () => {
    // Navigate to checkout with grouped cart data
    // In a real app, you might store this in session storage or pass as route params
    router.push('/account/checkout')
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Summary Card */}
      <div className="bg-card rounded-xl sm:rounded-2xl card-enhanced overflow-hidden">
        {/* Header */}
        <div className="bg-seller-header p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg">
              <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-foreground">Order Summary</h3>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-secondary/20 rounded-lg sm:rounded-xl">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Gem className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{totalItems}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {totalItems === 1 ? 'Gemstone' : 'Gemstones'}
              </div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-secondary/20 rounded-lg sm:rounded-xl">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Users className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{totalSellers}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {totalSellers === 1 ? 'Seller' : 'Sellers'}
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 border-t border-border/30">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
              <span className="font-medium text-foreground">{formatPrice(grandTotal)}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-foreground">
                {totalShipping === 0 ? 'Free' : formatPrice(totalShipping)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Calculated at checkout</span>
            </div>

            <div className="pt-2.5 sm:pt-3 border-t border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold text-foreground">Total</span>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formatPrice(grandTotalWithShipping)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Button - Desktop Only or Always Visible */}
        <div className={cn(
          "p-4 sm:p-6 pt-0",
          hideMobileCheckout && "hidden lg:block"
        )}>
          <button
            onClick={handleCheckout}
            className={cn(
              "w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg sm:rounded-xl",
              "shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
              "flex items-center justify-center gap-2 text-sm sm:text-base"
            )}
          >
            <CreditCard className="w-4 sm:w-5 h-4 sm:h-5" />
            Proceed to Checkout
            <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
          
          <p className="text-xs text-muted-foreground text-center mt-2 sm:mt-3">
            You&apos;ll be able to review everything before placing your order
          </p>
        </div>
      </div>

      {/* Security & Trust */}
      <div className="bg-card rounded-xl sm:rounded-2xl card-enhanced p-4 sm:p-6">
        <h4 className="font-serif font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
          <span className="text-sm sm:text-base">Secure Checkout</span>
        </h4>
        
        <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 flex-shrink-0" />
            <span className="text-muted-foreground">SSL encrypted secure payment</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 flex-shrink-0" />
            <span className="text-muted-foreground">Expert authentication & verification</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 flex-shrink-0" />
            <span className="text-muted-foreground">Insured worldwide shipping</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 flex-shrink-0" />
            <span className="text-muted-foreground">30-day return guarantee</span>
          </div>
        </div>
      </div>

      {/* Multiple Sellers Note */}
      {totalSellers > 1 && (
        <div className="info-box-amber rounded-xl sm:rounded-2xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <Users className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200">
              Multiple Sellers
            </span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            Your order will be split into {totalSellers} separate shipments from different sellers. 
            Each seller will handle their items independently.
          </p>
        </div>
      )}

      {/* Shipping Info */}
      <div className="info-box-blue rounded-xl sm:rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
          <Truck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
            Shipping Information
          </span>
        </div>
        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1 leading-relaxed">
          <p>• Free insured shipping on orders over $2,000</p>
          <p>• Express delivery available at checkout</p>
          <p>• International shipping to 50+ countries</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-card rounded-xl sm:rounded-2xl card-enhanced p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-serif font-medium text-foreground mb-2 sm:mb-3">We Accept</h4>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-secondary/50 rounded-md sm:rounded-lg text-xs text-muted-foreground border border-border/30 hover:border-primary/30 transition-colors">
            <CreditCard className="w-3 h-3 flex-shrink-0" />
            <span>Credit Card</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-secondary/50 rounded-md sm:rounded-lg text-xs text-muted-foreground border border-border/30 hover:border-primary/30 transition-colors">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            <span>Bank Transfer</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-secondary/50 rounded-md sm:rounded-lg text-xs text-muted-foreground border border-border/30 hover:border-primary/30 transition-colors">
            <Coins className="w-3 h-3 flex-shrink-0" />
            <span>Crypto</span>
          </div>
        </div>
      </div>
    </div>
  )
} 