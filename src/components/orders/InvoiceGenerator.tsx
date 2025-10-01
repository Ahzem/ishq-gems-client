'use client'

import React, { useRef } from 'react'
import { InvoiceGeneratorProps } from '@/types/components'
import { InvoiceService } from '@/services/invoice.service'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function InvoiceGenerator({ 
  invoiceData, 
  config = {}, 
  className,
  showActions = false,
  onPrint,
  onDownload 
}: InvoiceGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const formatDate = InvoiceService.formatDate
  const formatCurrency = InvoiceService.formatCurrency

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      InvoiceService.printInvoice(invoiceData, config)
    }
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else {
      InvoiceService.downloadInvoicePDF(invoiceData, config)
    }
  }

  return (
    <div className={cn("bg-card rounded-xl overflow-hidden", className)}>
      <div ref={printRef} className="p-0">
        {/* Header */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary animate-gradient-flow bg-[length:400%_400%]" />
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Header Content */}
          <div className="relative bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground p-10 text-center">
            <div className="relative z-10">
              <div className="flex items-start justify-center gap-4 mb-2 luxury-fade-in">
                <Image 
                  src="/images/logo/ishq-gems-logo-only.png" 
                  alt="Ishq Gems Logo" 
                  className="object-contain"
                  width={64}
                  height={64}
                />
                <Image
                  src="/images/logo/ishq-gems-name-only.png" 
                  alt="Ishq Gems" 
                  className="object-contain"
                  width={248}
                  height={64}
                />
              </div>
              <div className="text-sm opacity-90 font-medium mb-6 luxury-slide-up">
                Premium Gemstone Marketplace
              </div>
              <div className="text-3xl font-serif font-bold tracking-wider animate-slide-up-delayed">
                INVOICE
              </div>
            </div>
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-slow transform -skew-x-12" />
          </div>
        </div>

        {/* Invoice Number */}
        <div className="mx-10 mt-8 mb-8">
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 rounded-xl text-center font-bold text-xl border-2 border-primary shadow-lg">
            Invoice #{invoiceData.orderNumber}
          </div>
        </div>

        {/* Invoice Info */}
        <div className="flex flex-col lg:flex-row gap-8 mx-10 mb-10">
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-serif font-bold text-primary border-b-2 border-border pb-2">
              Bill To
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-foreground text-base">{invoiceData.customer.name}</p>
              <p className="text-muted-foreground">{invoiceData.customer.email}</p>
              {invoiceData.customer.phone && (
                <p className="text-muted-foreground">{invoiceData.customer.phone}</p>
              )}
              {invoiceData.customer.address && (
                <div className="text-muted-foreground space-y-1">
                  <p>{invoiceData.customer.address.street}</p>
                  <p>{invoiceData.customer.address.city}, {invoiceData.customer.address.state}</p>
                  <p>{invoiceData.customer.address.country} {invoiceData.customer.address.zipCode}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-serif font-bold text-primary border-b-2 border-border pb-2">
              Invoice Details
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Date:</span> {formatDate(invoiceData.orderDate)}</p>
              <p><span className="font-semibold">Order ID:</span> {invoiceData.orderNumber}</p>
              <p><span className="font-semibold">Payment Method:</span> {invoiceData.payment.method.replace('-', ' ').toUpperCase()}</p>
              <p className="flex items-center gap-2">
                <span className="font-semibold">Status:</span> 
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                  InvoiceService.getPaymentStatusColor(invoiceData.payment.status)
                )}>
                  {invoiceData.payment.status}
                </span>
              </p>
              {invoiceData.dueDate && (
                <p><span className="font-semibold">Due Date:</span> {formatDate(invoiceData.dueDate)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mx-10 mb-10">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-muted to-muted/50">
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wide text-foreground">Item</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wide text-foreground">Seller</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wide text-foreground">Qty</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wide text-foreground">Unit Price</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wide text-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-foreground mb-1 text-base">{item.name}</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>{item.gemType} • {item.color} • {item.weight}ct</div>
                        {item.reportNumber && <div>Report: {item.reportNumber}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-primary">{item.sellerName}</div>
                    </td>
                    <td className="p-4 text-foreground font-medium">{item.quantity}</td>
                    <td className="p-4 text-foreground font-medium">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-4 text-foreground font-bold">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="mx-10 mb-10">
          <div className="bg-gradient-to-br from-muted/30 to-muted/50 p-8 rounded-xl border border-border shadow-lg">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-base">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-foreground">{formatCurrency(invoiceData.totals.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="text-muted-foreground">Shipping:</span>
                <span className="font-medium text-foreground">{formatCurrency(invoiceData.totals.shipping)}</span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="text-muted-foreground">Taxes:</span>
                <span className="font-medium text-foreground">{formatCurrency(invoiceData.totals.taxes)}</span>
              </div>
              {invoiceData.totals.discount && (
                <div className="flex justify-between items-center text-base">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(invoiceData.totals.discount)}</span>
                </div>
              )}
              <div className="border-t-2 border-primary pt-4 mt-4">
                <div className="flex justify-between items-center text-2xl font-bold text-primary">
                  <span>Total Amount:</span>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatCurrency(invoiceData.totals.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mx-10 mb-10">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-8 rounded-xl">
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
              🔒 Payment & Security
            </h3>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <span className="font-semibold text-green-800 dark:text-green-300">Payment Status:</span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                  InvoiceService.getPaymentStatusColor(invoiceData.payment.status)
                )}>
                  {invoiceData.payment.status}
                </span>
              </p>
              <p className="text-green-700 dark:text-green-300">
                <span className="font-semibold">Escrow Protection:</span> Your payment is held securely until you confirm receipt of your gems.
              </p>
              <p className="text-green-700 dark:text-green-300">
                <span className="font-semibold">Transaction ID:</span> {invoiceData.payment.transactionId}
              </p>
              {invoiceData.payment.hasReceipt && (
                <p className="text-green-700 dark:text-green-300">
                  <span className="font-semibold">Receipt:</span> Bank transfer receipt uploaded and verified
                </p>
              )}
              {invoiceData.payment.paidAt && (
                <p className="text-green-700 dark:text-green-300">
                  <span className="font-semibold">Paid At:</span> {formatDate(invoiceData.payment.paidAt)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoiceData.notes && (
          <div className="mx-10 mb-10">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                📝 Notes
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                {invoiceData.notes}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground p-8 text-center border-t border-border">
          <div className="flex items-start justify-center gap-3 mb-4 luxury-slide-up bg-white/90 px-6 py-4 rounded-xl">
            <Image 
              src="/images/logo/ishq-gems-logo-only.png" 
              alt="Ishq Gems Logo" 
              className="object-contain opacity-80"
              width={32}
              height={32}
            />
            <Image 
              src="/images/logo/ishq-gems-name-only.png" 
              alt="Ishq Gems" 
              className="object-contain opacity-80"
              width={128}
              height={32}
            />
          </div>
          <div className="text-lg font-semibold mb-2">
            Thank you for choosing us!
          </div>
          <div className="text-sm opacity-80">
            For support, contact us at {config.companyEmail || 'support@ishqgems.com'} | 
            Visit us at {config.companyWebsite || 'ishqgems.com'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="p-6 bg-muted/30 border-t border-border flex gap-3 justify-end">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 hover:border-primary/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary rounded-lg transition-colors border border-border hover:border-primary/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      )}
    </div>
  )
}
