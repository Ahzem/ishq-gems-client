'use client'

import React from 'react'
import { X, FileText } from 'lucide-react'
import { InvoiceData } from '@/types/components'
import InvoiceGenerator from './InvoiceGenerator'
import { InvoiceService } from '@/services/invoice.service'

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  invoiceData: InvoiceData
}

export default function InvoiceModal({ isOpen, onClose, invoiceData }: InvoiceModalProps) {
  if (!isOpen) return null

  const handlePrint = () => {
    InvoiceService.printInvoice(invoiceData, { theme: 'luxury' })
  }

  const handleDownload = () => {
    InvoiceService.downloadInvoicePDF(invoiceData, { theme: 'luxury' })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
      <div className="bg-card rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-border">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-card to-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Invoice</h2>
              <p className="text-sm text-muted-foreground font-medium">#{invoiceData.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 border border-primary/20 hover:border-primary/40 hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary rounded-lg transition-all duration-200 border border-border hover:border-primary/40 hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-all duration-200 hover:shadow-md"
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-88px)] scrollbar-hide">
          <InvoiceGenerator 
            invoiceData={invoiceData}
            config={{ theme: 'luxury' }}
            className="border-none rounded-none"
          />
        </div>
      </div>
    </div>
  )
}
