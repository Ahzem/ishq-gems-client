'use client'

import React, { useEffect, memo } from 'react'
import { createPortal } from 'react-dom'
import { X, FileText } from 'lucide-react'
import { InvoiceData } from '@/types/components'
import InvoiceGenerator from './InvoiceGenerator'
import { InvoiceService } from '@/services/invoice.service'

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  invoiceData: InvoiceData
}

const InvoiceModal = memo(function InvoiceModal({ isOpen, onClose, invoiceData }: InvoiceModalProps) {
  const handlePrint = () => {
    InvoiceService.printInvoice(invoiceData, { theme: 'luxury' })
  }

  const handleDownload = () => {
    InvoiceService.downloadInvoicePDF(invoiceData, { theme: 'luxury' })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Render modal in a portal to escape parent stacking contexts
  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 lg:p-8"
      onClick={handleBackdropClick}
      style={{ isolation: 'isolate' }}
    >
      <div 
        className="bg-card rounded-lg sm:rounded-xl max-w-7xl w-full max-h-[98vh] sm:max-h-[95vh] lg:max-h-[85vh] overflow-hidden shadow-2xl border border-border transform transition-all duration-300 ease-out animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 xl:p-8 border-b border-border bg-gradient-to-r from-card to-muted/30">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-primary to-accent rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-serif font-bold text-foreground">Invoice</h2>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground font-medium">#{invoiceData.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-3 lg:px-4 xl:px-6 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base font-medium text-primary hover:bg-primary/10 rounded-md sm:rounded-lg transition-all duration-200 border border-primary/20 hover:border-primary/40 hover:shadow-md"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">Download</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-3 lg:px-4 xl:px-6 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base font-medium text-secondary-foreground hover:bg-secondary rounded-md sm:rounded-lg transition-all duration-200 border border-border hover:border-primary/40 hover:shadow-md"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 lg:p-2.5 hover:bg-secondary rounded-md sm:rounded-lg transition-all duration-200 hover:shadow-md"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-y-auto max-h-[calc(98vh-80px)] sm:max-h-[calc(95vh-88px)] lg:max-h-[calc(85vh-120px)] scrollbar-hide">
          <InvoiceGenerator 
            invoiceData={invoiceData}
            config={{ theme: 'luxury' }}
            className="border-none rounded-none"
          />
        </div>
      </div>
    </div>
  )

  // Use portal to render modal at document body level
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
})

export default InvoiceModal
