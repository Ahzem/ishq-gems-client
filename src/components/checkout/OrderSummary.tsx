'use client'

import { Package, Truck, Calculator, CreditCard } from 'lucide-react'
import S3Image from '@/components/common/S3Image'

interface CartItem {
  id: string
  name: string
  price: string
  priceNumber: number
  quantity: number
  image?: string
  seller: {
    name: string
  }
}

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  shippingFee: number
  taxes: number
  total: number
}

export default function OrderSummary({ 
  items, 
  subtotal, 
  shippingFee, 
  taxes, 
  total 
}: OrderSummaryProps) {
  return (
    <div className="bg-card rounded-lg sm:rounded-xl border border-border/30 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-serif font-semibold text-foreground mb-4 sm:mb-6 flex items-center space-x-2">
        <Package className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
        <span>Order Summary</span>
      </h2>

      {/* Items */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-start space-x-2 sm:space-x-3 py-2 sm:py-3 border-b border-border/20 last:border-b-0">
            <div className="relative w-12 sm:w-16 h-12 sm:h-16 rounded-lg overflow-hidden bg-secondary/30 flex-shrink-0">
              {item.image ? (
                <S3Image
                  src={item.image}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-4 sm:w-6 h-4 sm:h-6 text-muted-foreground" />
                </div>
              )}
              {item.quantity > 1 && (
                <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-5 sm:w-6 h-5 sm:h-6 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center justify-center">
                  {item.quantity}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground line-clamp-2 text-xs sm:text-sm">
                {item.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                by {item.seller.name}
              </p>
              {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground mt-1">
                ${item.priceNumber.toFixed(2)} × {item.quantity}
              </p>
              )}
            </div>
            
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-foreground text-xs sm:text-sm">
                ${(item.priceNumber * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 sm:space-y-3 border-t border-border/30 pt-3 sm:pt-4">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Package className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
            <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
          </div>
          <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Truck className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
            <span>Shipping</span>
          </div>
          <span className="font-medium text-foreground">
            {shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : 'Free'}
          </span>
        </div>

        {taxes > 0 && (
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calculator className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
              <span>Taxes</span>
            </div>
            <span className="font-medium text-foreground">${taxes.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-border/30 pt-2 sm:pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
              <span className="font-semibold text-foreground text-base sm:text-lg">Total</span>
            </div>
            <span className="font-bold text-foreground text-lg sm:text-xl">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Estimated Delivery */}
      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-secondary/30 rounded-lg">
        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <Truck className="w-3 sm:w-4 h-3 sm:h-4 text-accent flex-shrink-0" />
          <span className="font-medium text-foreground">Estimated Delivery</span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          3-7 business days after payment confirmation
        </p>
      </div>
    </div>
  )
}
