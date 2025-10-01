'use client'

import Link from 'next/link'
import { Star, MapPin, ShieldCheck, Trash2, Eye, Sparkles, Globe, Truck, Package, Info } from 'lucide-react'
import { useUserCart } from '@/hooks/useUserCart'
import { CartItem } from '@/types'
import { 
  SellerInfo, 
  formatPrice, 
  getSellerInitials,
  getRarityBadgeColor,
  getItemBadges,
  getShippingMethodInfo,
  getSellerTotalWithShipping
} from '@/lib/cartHelpers'
import { S3Image } from '../common'

interface GroupedSellerCartProps {
  seller: SellerInfo
  items: CartItem[]
}

export default function GroupedSellerCart({ seller, items }: GroupedSellerCartProps) {
  const { removeItem } = useUserCart()
  
  const subtotal = items.reduce((total, item) => total + item.priceNumber, 0)
  const totalWithShipping = getSellerTotalWithShipping(items, seller.shippingFee)
  const sellerInitials = getSellerInitials(seller.name)
  const shippingInfo = getShippingMethodInfo(seller.shippingMode)

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl card-enhanced card-hover-enhanced overflow-hidden">
      {/* Seller Header */}
      <div className="bg-seller-header p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Seller Avatar / Store Logo */}
            <div className="relative flex-shrink-0">
              {seller.storeSettings?.logoUrl ? (
                <S3Image
                  src={seller.storeSettings.logoUrl}
                  alt={seller.name}
                  width={64}
                  height={64}
                  className="w-12 sm:w-16 h-12 sm:h-16 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  {sellerInitials}
                </div>
              )}
              {seller.verified && (
                <div className="absolute -top-1 -right-1 w-5 sm:w-6 h-5 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-white" />
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/seller/${seller.id}`}
                  className="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors truncate"
                >
                  {seller.name}
                </Link>
                {seller.verified && (
                  <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
                    <ShieldCheck className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span className="text-xs font-medium hidden sm:inline">Verified</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Globe className="w-3 sm:w-4 h-3 sm:h-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">{seller.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  <span className="font-medium">{seller.rating}</span>
                  <span className="hidden sm:inline">({seller.totalReviews} reviews)</span>
                  <span className="sm:hidden">({seller.totalReviews})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items count */}
          <div className="text-right flex-shrink-0">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </div>
            <div className="text-sm sm:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {formatPrice(subtotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {items.map((item) => {
          const badges = getItemBadges(item)
          const rarityColor = getRarityBadgeColor(item.rarity || 'Fine')
          
          return (
            <div
              key={item.id}
              className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl item-card group"
            >
              {/* Gem Image */}
              <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                <S3Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 640px) 64px, 80px"
                />
                
                {/* Badges */}
                <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 flex flex-col gap-1">
                  {badges.isNew && (
                    <div className="px-1 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">
                      <span className="hidden sm:inline">NEW</span>
                      <span className="sm:hidden">N</span>
                    </div>
                  )}
                  {badges.isFeatured && (
                    <div className="px-1 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-medium flex items-center justify-center">
                      <Sparkles className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Gem Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors duration-300 truncate">
                      {item.name}
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <span className="text-xs sm:text-sm text-muted-foreground truncate">{item.location}</span>
                      <span className="text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{item.carat || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm sm:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {item.price}
                    </div>
                  </div>
                </div>

                {/* Rarity Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${rarityColor} flex-shrink-0`}>
                    <Sparkles className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{item.rarity || 'Fine'}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <Link
                      href={`/gem/${item.id}`}
                      className="p-1.5 sm:p-2 bg-primary/10 text-primary rounded-md sm:rounded-lg hover:bg-primary/20 transition-colors duration-200"
                      title="View details"
                    >
                      <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-md sm:rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Shipping Information */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-secondary/20 border-y border-border/30">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <Package className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary flex-shrink-0" />
          <h4 className="font-serif font-medium text-foreground text-sm sm:text-base">Shipping Information</h4>
          <div className="group relative">
            <Info className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-muted-foreground cursor-help flex-shrink-0" />
            <div className="absolute left-0 top-6 w-64 p-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
              <p className="text-xs text-muted-foreground">{shippingInfo.description}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Shipping Method:</div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                seller.shippingMode === 'ishq_gems' ? 'shipping-badge-ishq' :
                seller.shippingMode === 'in_person' ? 'shipping-badge-inperson' :
                'shipping-badge-seller'
              }`}>
                {shippingInfo.icon === 'shield-check' && <ShieldCheck className="w-3 h-3 flex-shrink-0" />}
                {shippingInfo.icon === 'truck' && <Truck className="w-3 h-3 flex-shrink-0" />}
                {shippingInfo.icon === 'map-pin' && <MapPin className="w-3 h-3 flex-shrink-0" />}
                {shippingInfo.icon === 'package' && <Package className="w-3 h-3 flex-shrink-0" />}
                <span className="truncate">{shippingInfo.label}</span>
              </div>
              {shippingInfo.hasInsurance && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium insurance-badge">
                  <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline">Insured</span>
                  <span className="sm:hidden">Ins</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Shipping Fee:</div>
            <div className="text-base sm:text-lg font-semibold text-foreground">
              {seller.shippingFee === 0 ? 'Free' : formatPrice(seller.shippingFee)}
            </div>
          </div>
        </div>
      </div>

      {/* Seller Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-secondary/30 border-t border-border/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
            <span className="truncate">Ships from {seller.location}</span>
          </div>
          <div className="">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-sm gap-4">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm gap-4">
                <span className="text-muted-foreground">Shipping:</span>
                <span className="font-medium text-foreground">
                  {seller.shippingFee === 0 ? 'Free' : formatPrice(seller.shippingFee)}
                </span>
              </div>
              <div className="pt-1 border-t border-border/30">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs sm:text-sm text-muted-foreground">Total:</span>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatPrice(totalWithShipping)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center sm:text-left">
          <span>Taxes calculated at checkout</span>
        </div>
      </div>
    </div>
  )
} 