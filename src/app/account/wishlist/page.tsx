'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WishlistContent from '@/components/wishlist/WishlistContent'

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 min-h-screen">
        <WishlistContent 
          emptyStateHref="/explore"
          emptyStateText="Explore Gemstones"
        />
      </div>

      <Footer />
    </div>
  )
}
