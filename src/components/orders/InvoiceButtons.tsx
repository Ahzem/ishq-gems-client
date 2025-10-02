'use client'

import React, { useState, memo } from 'react'
import { Download, Printer, FileText, Eye } from 'lucide-react'
import { InvoiceData } from '@/types/components'
import { InvoiceService } from '@/services/invoice.service'
import InvoiceModal from './InvoiceModal'
import { cn } from '@/lib/utils'

interface InvoiceButtonsProps {
  invoiceData: InvoiceData
  variant?: 'default' | 'compact' | 'icon-only'
  showViewButton?: boolean
  showPrintButton?: boolean
  showDownloadButton?: boolean
  className?: string
  buttonClassName?: string
}

const InvoiceButtons = memo(function InvoiceButtons({
  invoiceData,
  variant = 'default',
  showViewButton = true,
  showPrintButton = true,
  showDownloadButton = true,
  className,
  buttonClassName
}: InvoiceButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePrint = () => {
    InvoiceService.printInvoice(invoiceData, { theme: 'luxury' })
  }

  const handleDownload = () => {
    InvoiceService.downloadInvoicePDF(invoiceData, { theme: 'luxury' })
  }

  const handleView = () => {
    setIsModalOpen(true)
  }

  const baseButtonClass = cn(
    "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md",
    buttonClassName
  )

  const iconOnlyClass = cn(
    "inline-flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:shadow-md",
    buttonClassName
  )

  const getButtonContent = (icon: React.ReactNode, label: string) => {
    if (variant === 'icon-only') {
      return icon
    }
    return (
      <>
        {icon}
        {variant === 'compact' ? '' : label}
      </>
    )
  }

  return (
    <>
      <div className={cn("flex items-center gap-2", className)}>
        {showViewButton && (
          <button
            onClick={handleView}
            className={variant === 'icon-only' ? iconOnlyClass : baseButtonClass}
            title="View Invoice"
            style={variant === 'icon-only' ? {} : undefined}
          >
            {getButtonContent(
              <Eye className="w-4 h-4" />,
              'View Invoice'
            )}
          </button>
        )}

        {showDownloadButton && (
          <button
            onClick={handleDownload}
            className={cn(
              variant === 'icon-only' ? iconOnlyClass : baseButtonClass,
              "text-primary hover:bg-primary/10 border border-primary/20 hover:border-primary/40"
            )}
            title="Download PDF"
          >
            {getButtonContent(
              <Download className="w-4 h-4" />,
              'Download PDF'
            )}
          </button>
        )}

        {showPrintButton && (
          <button
            onClick={handlePrint}
            className={cn(
              variant === 'icon-only' ? iconOnlyClass : baseButtonClass,
              "text-secondary-foreground hover:bg-secondary border border-border hover:border-primary/40"
            )}
            title="Print Invoice"
          >
            {getButtonContent(
              <Printer className="w-4 h-4" />,
              'Print'
            )}
          </button>
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoiceData={invoiceData}
      />
    </>
  )
})

export default InvoiceButtons

// Individual button components for more granular control
export function ViewInvoiceButton({
  invoiceData,
  className,
  children
}: {
  invoiceData: InvoiceData
  className?: string
  children?: React.ReactNode
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 border border-primary/20 hover:border-primary/40 hover:shadow-md",
          className
        )}
      >
        {children || (
          <>
            <FileText className="w-4 h-4" />
            View Invoice
          </>
        )}
      </button>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoiceData={invoiceData}
      />
    </>
  )
}

export function DownloadInvoiceButton({
  invoiceData,
  className,
  children
}: {
  invoiceData: InvoiceData
  className?: string
  children?: React.ReactNode
}) {
  const handleDownload = () => {
    InvoiceService.downloadInvoicePDF(invoiceData, { theme: 'luxury' })
  }

  return (
    <button
      onClick={handleDownload}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 border border-primary/20 hover:border-primary/40 hover:shadow-md",
        className
      )}
    >
      {children || (
        <>
          <Download className="w-4 h-4" />
          Download PDF
        </>
      )}
    </button>
  )
}

export function PrintInvoiceButton({
  invoiceData,
  className,
  children
}: {
  invoiceData: InvoiceData
  className?: string
  children?: React.ReactNode
}) {
  const handlePrint = () => {
    InvoiceService.printInvoice(invoiceData, { theme: 'luxury' })
  }

  return (
    <button
      onClick={handlePrint}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary rounded-lg transition-all duration-200 border border-border hover:border-primary/40 hover:shadow-md",
        className
      )}
    >
      {children || (
        <>
          <Printer className="w-4 h-4" />
          Print Invoice
        </>
      )}
    </button>
  )
}

// Dropdown menu version for compact spaces
export function InvoiceActionsDropdown({
  invoiceData,
  className
}: {
  invoiceData: InvoiceData
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePrint = () => {
    InvoiceService.printInvoice(invoiceData, { theme: 'luxury' })
    setIsOpen(false)
  }

  const handleDownload = () => {
    InvoiceService.downloadInvoicePDF(invoiceData, { theme: 'luxury' })
    setIsOpen(false)
  }

  const handleView = () => {
    setIsModalOpen(true)
    setIsOpen(false)
  }

  return (
    <>
      <div className={cn("relative inline-block text-left", className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary rounded-lg transition-all duration-200 border border-border hover:border-primary/40"
        >
          <FileText className="w-4 h-4" />
          Invoice
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
              <button
                onClick={handleView}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Invoice
              </button>
              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
            </div>
          </>
        )}
      </div>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoiceData={invoiceData}
      />
    </>
  )
}
