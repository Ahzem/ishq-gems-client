'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, X, Trash2, Eye, ShoppingCart, LogIn } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserCart } from '@/hooks/useUserCart'
import { cn } from '@/lib/utils'
import Button from '@/components/buttons/Button'

export default function CartButton() {
  const { items, getTotalItems, removeItem, clearCart, isOpen, setIsOpen, isAuthenticated } = useUserCart()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const totalItems = getTotalItems()
  const totalPrice = items.reduce((sum, item) => sum + item.priceNumber, 0)

  // Use the same cart page for all users
  const getCartPage = () => {
    return '/account/cart'
  }

  // Show cart button when items are added
  useEffect(() => {
    if (totalItems > 0 && !isVisible) {
      setIsVisible(true)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 500)
    } else if (totalItems === 0 && isVisible) {
      setTimeout(() => setIsVisible(false), 300)
    }
  }, [totalItems, isVisible])

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest('.cart-modal') && !target.closest('.cart-button')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setIsOpen])

  if (!isVisible) return null

  return (
    <>
      {/* Floating Cart Button */}
      <div className={cn(
        "fixed top-4 right-4 z-40 cart-button transition-all duration-500",
        isAnimating && "animate-bounce"
      )}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-r from-primary to-accent text-primary-foreground p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group touch-manipulation"
          title={`View cart (${totalItems} items)`}
        >
          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
          
          {/* Item Count Badge */}
          {totalItems > 0 && (
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center animate-pulse">
              {totalItems > 99 ? '99+' : totalItems}
            </div>
          )}
          
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Cart Modal/Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-45 lg:hidden" />
          
          {/* Cart Modal */}
          <div className={cn(
            "fixed top-16 sm:top-20 right-4 w-[calc(100vw-2rem)] max-w-md bg-card border border-border rounded-2xl shadow-2xl z-50 cart-modal transition-all duration-300",
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                Your Collection ({totalItems})
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-secondary rounded-full transition-colors duration-200"
                title="Close cart"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">🛍️</div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h4>
                  <p className="text-sm text-muted-foreground">Add some luxury gems to get started</p>
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary/30 rounded-xl border border-border/50 group hover:border-primary/30 transition-all duration-300">
                      {/* Gem Image */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 64px, 80px"
                        />
                        {item.rarity && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs font-bold px-1 py-0.5 rounded">
                            {item.rarity.slice(0, 3)}
                          </div>
                        )}
                      </div>

                      {/* Gem Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm sm:text-base truncate group-hover:text-primary transition-colors duration-300">
                          {item.name}
                        </h4>
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-1">
                          <span className="truncate">{item.location}</span>
                          {item.carat && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{item.carat}</span>
                            </>
                          )}
                        </div>
                        <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-2">
                          {item.price}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <Link 
                          href={`/gem/${item.id}`}
                          className="p-1.5 sm:p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors duration-200"
                          title="View details"
                          onClick={() => setIsOpen(false)}
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-border">
                {/* Total */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-foreground">Total Value:</span>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {isAuthenticated ? (
                    <Button
                      onClick={() => {
                        setIsOpen(false)
                        router.push(getCartPage())
                      }}
                      variant="primary"
                      leftIcon={<ShoppingCart />}
                      className="flex-1 text-sm sm:text-base"
                    >
                      View Cart Details
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsOpen(false)
                        router.push('/signin')
                      }}
                      variant="primary"
                      leftIcon={<LogIn />}
                      className="flex-1 text-sm sm:text-base"
                    >
                      Sign In to Continue
                    </Button>
                  )}
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="text-sm sm:text-base"
                  >
                    Clear All
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Secure checkout • Expert verification • Worldwide shipping
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
} 