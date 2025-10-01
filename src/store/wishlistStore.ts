import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WishlistItem, WishlistStore } from '@/types'
import wishlistService from '@/services/wishlist.service'

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      // Fetch wishlist from API
      fetchWishlist: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await wishlistService.getUserWishlist()
          
          if (response.success && response.data) {
            set({ 
              items: response.data.items,
              isLoading: false,
              error: null 
            })
          } else {
            set({ 
              error: response.message || 'Failed to fetch wishlist',
              isLoading: false 
            })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch wishlist',
            isLoading: false 
          })
        }
      },

      // Add item by gem ID (preferred method for API integration)
      addItemByGemId: async (gemId: string): Promise<boolean> => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await wishlistService.addToWishlist(gemId)
          
          if (response.success && response.data) {
            const items = get().items
            const newItem = response.data.item
            
            // Check if item already exists
            const existingItem = items.find((i) => i.id === newItem.id)
            
            if (!existingItem) {
              set({
                items: [...items, newItem],
                isLoading: false,
                error: null
              })
            } else {
              set({ isLoading: false })
            }
            
            return true
          } else {
            set({ 
              error: response.message || 'Failed to add to wishlist',
              isLoading: false 
            })
            return false
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add to wishlist',
            isLoading: false 
          })
          return false
        }
      },
      
      // Legacy method for backward compatibility
      addItem: async (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.id === item.id)
        
        if (!existingItem) {
          const newItem = {
            ...item,
            dateAdded: new Date().toISOString()
          }
          
          set({
            items: [...items, newItem]
          })

          // Try to sync with API if possible
          try {
            await wishlistService.addToWishlist(item.id)
          } catch (error) {
            console.warn('Failed to sync wishlist item with API:', error)
          }
        }
      },
      
      removeItem: async (id) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await wishlistService.removeFromWishlist(id)
          
          if (response.success) {
            set((state) => ({
              items: state.items.filter((item) => item.id !== id),
              isLoading: false,
              error: null
            }))
          } else {
            // Remove locally even if API fails
            set((state) => ({
              items: state.items.filter((item) => item.id !== id),
              error: response.message || 'Failed to remove from wishlist (removed locally)',
              isLoading: false
            }))
          }
        } catch (error) {
          // Remove locally even if API fails
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
            error: error instanceof Error ? error.message : 'Failed to remove from wishlist (removed locally)',
            isLoading: false
          }))
        }
      },
      
      // Toggle item in wishlist (preferred method)
      toggleItem: async (gemId: string): Promise<{ action: 'added' | 'removed'; success: boolean }> => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await wishlistService.toggleWishlistItem(gemId)
          
          if (response.success && response.data) {
            const { action, item: apiItem } = response.data
            
            if (action === 'added' && apiItem) {
              // Transform API item to WishlistItem format
              const gem = apiItem.gem || {};
              const seller = gem.seller || {};
              
              const gemName = [
                gem.variety || gem.gemType,
                gem.color,
                gem.weight?.value ? `${gem.weight.value}${gem.weight.unit || 'ct'}` : null
              ].filter(Boolean).join(' ') || gem.title || 'Untitled Gem';
              
              const transformedItem: WishlistItem = {
                id: apiItem.id,
                gemId: apiItem.gemId,
                name: gemName,
                type: gem.variety || gem.gemType || gem.category || 'Gemstone',
                price: gem.price ? `$${gem.price.toLocaleString()}` : 'Price on request',
                priceNumber: gem.price || 0,
                location: gem.origin || 'Unknown Origin',
                image: gem.images?.[0] || '/images/gem-placeholder.svg',
                carat: gem.weight?.value ? `${gem.weight.value} ${gem.weight.unit || 'ct'}` : 'Unknown',
                rarity: gem.investmentGrade || 'Fine',
                color: gem.color || 'Unknown',
                clarity: gem.clarity || 'Unknown',
                cut: gem.shapeCut || 'Unknown',
                treatment: gem.treatments || 'Unknown',
                labCertified: gem.labName ? true : false,
                seller: seller.id ? {
                  name: seller.storeSettings?.storeName || 'Unknown Seller',
                  verified: true,
                  rating: 4.5,
                  totalReviews: 0
                } : undefined,
                dateAdded: apiItem.dateAdded
              };
              
              // Add item to store
              const items = get().items
              const existingItem = items.find((i) => i.gemId === gemId)
              
              if (!existingItem) {
                set({
                  items: [...items, transformedItem],
                  isLoading: false,
                  error: null
                })
              } else {
                set({ isLoading: false })
              }
            } else if (action === 'removed') {
              // Remove item from store
              set((state) => ({
                items: state.items.filter((item) => item.gemId !== gemId),
                isLoading: false,
                error: null
              }))
            }
            
            return { action, success: true }
          } else {
            set({ 
              error: response.message || 'Failed to toggle wishlist item',
              isLoading: false 
            })
            return { action: 'added', success: false }
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to toggle wishlist item',
            isLoading: false 
          })
          return { action: 'added', success: false }
        }
      },

      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id || item.gemId === id)
      },
      
      clearWishlist: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await wishlistService.clearWishlist()
          
          if (response.success) {
            set({ 
              items: [],
              isLoading: false,
              error: null 
            })
          } else {
            // Clear locally even if API fails
            set({ 
              items: [],
              error: response.message || 'Failed to clear wishlist (cleared locally)',
              isLoading: false 
            })
          }
        } catch (error) {
          // Clear locally even if API fails
          set({ 
            items: [],
            error: error instanceof Error ? error.message : 'Failed to clear wishlist (cleared locally)',
            isLoading: false 
          })
        }
      },
      
      getTotalItems: () => {
        return get().items.length
      }
    }),
    {
      name: 'ishq-wishlist',
      // Only persist items, not loading states or errors
      partialize: (state) => ({ items: state.items })
    }
  )
) 