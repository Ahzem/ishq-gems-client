import { useCartStore } from './cartStore'
import type { UseCartReturn } from '@/types'

export const useCart = (): UseCartReturn => {
  const store = useCartStore()
  
  return {
    items: store.items,
    totalAmount: store.getTotalPrice(),
    shippingFee: store.getTotalPrice() > 100 ? 0 : 15, // Free shipping over $100
    taxes: store.getTotalPrice() * 0.05, // 5% tax
    clearCart: store.clearCartAfterCheckout,
    addItem: store.addItem,
    removeItem: store.removeItem,
    getTotalItems: store.getTotalItems,
    isOpen: store.isOpen,
    setIsOpen: store.setIsOpen
  }
}
