'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Gem, ShoppingBag, Sparkles, CreditCard, ArrowRight, Shield } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useUserCart } from '@/hooks/useUserCart'
import { groupCartItemsBySeller, getGrandTotal, getGrandTotalWithShipping, formatPrice } from '@/lib/cartHelpers'
import GroupedSellerCart from '@/components/cart/GroupedSellerCart'
import CartSummary from '@/components/cart/CartSummary'
import { useBackNavigation } from '@/hooks/useBackNavigation'
import { cn } from '@/lib/utils'

export default function CartPage() {
  const { isLoading } = useAuth()
  const router = useRouter()
  const { items, getTotalItems, isAuthenticated } = useUserCart()
  const { goBackWithFallback } = useBackNavigation()
  const totalItems = getTotalItems()
  const groupedItems = groupCartItemsBySeller(items)
  const grandTotal = getGrandTotal(items)
  const grandTotalWithShipping = getGrandTotalWithShipping(groupedItems)

  const handleCheckout = () => {
    router.push('/account/checkout')
  }

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin?message=Please sign in to view your cart')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/30">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => goBackWithFallback('/explore')}
                className="p-1.5 sm:p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                title="Continue Shopping"
              >
                <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <ShoppingBag className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-serif font-bold text-foreground truncate">
                    Your Cart
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'} • {Object.keys(groupedItems).length} {Object.keys(groupedItems).length === 1 ? 'seller' : 'sellers'}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-primary flex-shrink-0">
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">Luxury Collection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Notice */}
      {items.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border-y border-blue-200 dark:border-blue-800/30">
          <div className="container mx-auto px-4 py-2.5 sm:py-3">
            <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-center leading-relaxed">
                Shipping fees are based on the selected delivery method per seller
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8 pb-24 lg:pb-8">
        {items.length === 0 ? (
          // Empty Cart State
          <div className="max-w-md mx-auto text-center py-12 sm:py-16">
            <div className="mb-6 sm:mb-8">
              <div className="w-20 sm:w-24 h-20 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ShoppingBag className="w-10 sm:w-12 h-10 sm:h-12 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
                Discover exquisite gemstones and add them to your collection
              </p>
              <button
                onClick={() => router.push('/explore')}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base cursor-pointer"
              >
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                Explore Gemstones
              </button>
            </div>
          </div>
        ) : (
          // Cart with Items
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Cart Items - Grouped by Seller */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-20 mb-30">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-primary to-accent rounded-full flex-shrink-0"></div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-foreground">
                    Items by Seller
                  </h2>
                </div>
                
                {Object.entries(groupedItems).map(([sellerId, sellerData], index) => (
                  <div key={sellerId} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <GroupedSellerCart
                      seller={sellerData.seller}
                      items={sellerData.items}
                    />
                    {index < Object.keys(groupedItems).length - 1 && (
                      <div className="flex items-center justify-center my-6 sm:my-8">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 sm:w-12 h-px bg-border"></div>
                          <div className="seller-separator">
                            <Gem className="w-5 sm:w-6 h-5 sm:h-6" />
                          </div>
                          <div className="w-8 sm:w-12 h-px bg-border"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1 order-first lg:order-last">
                <div className="lg:sticky lg:top-8">
                  <CartSummary 
                    items={items}
                    groupedItems={groupedItems}
                    hideMobileCheckout={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar - Mobile Only */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border/30 p-4 safe-area-pb z-50">
          <div className="container mx-auto">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items):</span>
                  <span className="text-foreground">{formatPrice(grandTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total with shipping:</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatPrice(grandTotalWithShipping)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3 flex-shrink-0" />
                <span>Secure checkout with SSL encryption</span>
              </div>
              
              <button
                onClick={handleCheckout}
                className={cn(
                  "w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg",
                  "shadow-lg hover:shadow-xl transition-all duration-300 transform cursor-pointer",
                  "flex items-center justify-center gap-2 text-base"
                )}
              >
                <CreditCard className="w-4 h-4" />
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                You&apos;ll be able to review everything before placing your order
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 