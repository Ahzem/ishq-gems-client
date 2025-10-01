import { useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCartStore } from '@/store/cartStore'
import type { UseUserCartReturn } from '@/types'

/**
 * Custom hook that provides user-specific cart functionality
 * Automatically initializes cart with user ID when user changes
 */
export function useUserCart(): UseUserCartReturn {
  const { user, isAuthenticated } = useAuth()
  const cartStore = useCartStore()

  // Initialize cart when user changes
  useEffect(() => {
    const userId = user?.id || null
    cartStore.setUserId(userId)
  }, [user, cartStore])

  // Return cart store methods and state
  return {
    items: cartStore.items,
    totalAmount: cartStore.getTotalPrice(),
    shippingFee: cartStore.getTotalPrice() > 100 ? 0 : 15,
    taxes: cartStore.getTotalPrice() * 0.05,
    clearCart: cartStore.clearCartAfterCheckout,
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    getTotalItems: cartStore.getTotalItems,
    isOpen: cartStore.isOpen,
    setIsOpen: cartStore.setIsOpen,
    isAuthenticated,
    user
  }
}

export default useUserCart 