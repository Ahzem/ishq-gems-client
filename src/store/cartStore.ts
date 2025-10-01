import { create } from 'zustand'
import { validateCartItems } from '@/lib/cartHelpers'
import type { CartItem, CartStore } from '@/types'

// Create the store without persistence first
const GLOBAL_CART_KEY = 'ishq-gems-cart-global'

const createCartStore = () => create<CartStore>()(
  (set, get) => ({
    items: [],
    isOpen: false,
    userId: null,
    
    addItem: (item: Omit<CartItem, 'quantity'>) => {
      const existingItem = get().items.find((cartItem: CartItem) => cartItem.id === item.id)
      
      if (existingItem) {
        // For luxury gems, we don't increase quantity, just show it's already added
        return
      }

      // SECURITY: Prevent sellers from adding their own gems to cart
      const userId = get().userId
      if (userId && item.seller?.id === userId) {
        console.warn('Self-purchase attempt blocked on client side', {
          userId,
          sellerId: item.seller.id,
          gemId: item.id,
          gemName: item.name
        })
        // Throw error to be caught by UI components
        throw new Error('You cannot add your own gems to cart')
      }
      
      set((state: CartStore) => ({
        items: [...state.items, { ...item, quantity: 1 }]
      }))
    },
    
    removeItem: (id: string) => {
      set((state: CartStore) => ({
        items: state.items.filter((item: CartItem) => item.id !== id)
      }))
    },
    
    clearCart: () => {
      // Only clear cart when user manually clicks "Clear Cart" button
      set({ items: [] })
      if (typeof window !== 'undefined') {
        localStorage.removeItem(GLOBAL_CART_KEY)
      }
    },
    
    clearCartAfterCheckout: () => {
      // Clear cart after successful checkout
      set({ items: [] })
      // Also clear from localStorage for current user
      const userId = get().userId
      if (userId && typeof window !== 'undefined') {
        const userCartKey = `ishq-gems-cart-${userId}`
        localStorage.removeItem(userCartKey)
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem(GLOBAL_CART_KEY)
      }
    },
    
    getTotalItems: () => {
      return get().items.reduce((total: number, item: CartItem) => total + item.quantity, 0)
    },
    
    getTotalPrice: () => {
      return get().items.reduce((total: number, item: CartItem) => total + (item.priceNumber * item.quantity), 0)
    },
    
    setIsOpen: (isOpen: boolean) => {
      set({ isOpen })
    },

    setUserId: (userId: string | null) => {
      const currentUserId = get().userId
      
      // If switching users, save current cart and load the new user's cart
      if (currentUserId !== userId) {
        // Save current cart to localStorage if we have a current user
        if (currentUserId && typeof window !== 'undefined') {
          const currentUserCartKey = `ishq-gems-cart-${currentUserId}`
          const currentItems = get().items
          localStorage.setItem(currentUserCartKey, JSON.stringify({
            state: { items: currentItems },
            version: 0
          }))
        }
        
        // Set new user ID
        set({ userId })
        
        // Load the new user's cart from localStorage
        if (userId) {
          const userCartKey = `ishq-gems-cart-${userId}`
          const savedCart = localStorage.getItem(userCartKey)
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart)
              if (parsedCart.state?.items) {
                // Validate cart items to fix any undefined properties
                const validatedItems = validateCartItems(parsedCart.state.items).map(item => ({
                  ...item,
                  quantity: item.quantity || 1 // Ensure quantity is always defined
                }))
                set({ items: validatedItems })
              }
            } catch (error) {
              console.error('Error loading user cart:', error)
              // Keep existing cart if there's an error loading
            }
          }
          // If no saved cart exists for this user, keep the current cart items
          // DO NOT clear the cart - let the user keep their items
        }
        // For logout (userId = null), keep the current cart intact
        // DO NOT clear the cart - preserve items for potential re-login
      }
    },

    initializeCart: (userId: string | null) => {
      const currentUserId = get().userId
      
      // Only initialize if user ID is different
      if (currentUserId !== userId) {
        set({ userId })
        
        // Load user-specific cart from localStorage
        if (userId) {
          const userCartKey = `ishq-gems-cart-${userId}`
          const savedCart = localStorage.getItem(userCartKey)
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart)
              if (parsedCart.state?.items) {
                // Validate cart items to fix any undefined properties
                const validatedItems = validateCartItems(parsedCart.state.items).map(item => ({
                  ...item,
                  quantity: item.quantity || 1 // Ensure quantity is always defined
                }))
                set({ items: validatedItems })
              }
            } catch (error) {
              console.error('Error loading user cart:', error)
              // Keep existing cart if there's an error loading
            }
          }
          // If no saved cart exists for this user, keep the current cart items
          // DO NOT clear the cart - preserve user's shopping session
        }
        // For no user (logout), keep the current cart intact
        // DO NOT clear the cart - preserve items for potential re-login
      }
    },

    // Clean up old cart data from localStorage (optional utility method)
    clearAllCartData: () => {
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('ishq-gems-cart-')) {
            localStorage.removeItem(key)
          }
        })
      }
      set({ items: [], userId: null })
    }
  })
)

// Create the store
export const useCartStore = createCartStore()

// Hydrate cart from global storage on the client (preserve across refresh)
if (typeof window !== 'undefined') {
  try {
    const savedGlobal = localStorage.getItem(GLOBAL_CART_KEY)
    if (savedGlobal) {
      const parsed = JSON.parse(savedGlobal)
      if (parsed?.state?.items) {
        const validatedItems = validateCartItems(parsed.state.items).map((item: CartItem) => ({
          ...item,
          quantity: item.quantity || 1
        }))
        useCartStore.setState({ items: validatedItems })
      }
    }
  } catch (e) {
    console.error('Error hydrating cart from localStorage:', e)
  }
}

// Subscribe to cart changes and save to user-specific and global localStorage
useCartStore.subscribe((state) => {
  if (typeof window !== 'undefined') {
    // Always save global cart (guest or logged-in)
    localStorage.setItem(GLOBAL_CART_KEY, JSON.stringify({
      state: { items: state.items },
      version: 0
    }))

    // Additionally save user-specific cart when logged in
    if (state.userId) {
      const userCartKey = `ishq-gems-cart-${state.userId}`
      localStorage.setItem(userCartKey, JSON.stringify({
        state: { items: state.items },
        version: 0
      }))
    }
  }
})