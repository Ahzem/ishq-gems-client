export interface InvoiceAddress {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}

export interface InvoiceCustomer {
  name: string
  email: string
  phone?: string
  address?: InvoiceAddress
}

export interface InvoiceItem {
  name: string
  gemType: string
  color: string
  weight: number
  reportNumber?: string
  sellerName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image?: string
}

export interface InvoicePayment {
  method: string
  status: 'completed' | 'pending' | 'processing' | 'failed'
  transactionId: string
  hasReceipt: boolean
  paidAt?: string
}

export interface InvoiceTotals {
  subtotal: number
  shipping: number
  taxes: number
  discount?: number
  total: number
}

export interface InvoiceData {
  orderNumber: string
  orderDate: string
  dueDate?: string
  customer: InvoiceCustomer
  items: InvoiceItem[]
  payment: InvoicePayment
  totals: InvoiceTotals
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  notes?: string
  terms?: string
}

export interface InvoiceConfig {
  companyName: string
  companyLogo?: string
  companyAddress?: InvoiceAddress
  companyPhone?: string
  companyEmail?: string
  companyWebsite?: string
  taxNumber?: string
  theme: 'light' | 'dark' | 'luxury'
}

export interface InvoiceGeneratorProps {
  invoiceData: InvoiceData
  config?: Partial<InvoiceConfig>
  className?: string
  showActions?: boolean
  onPrint?: () => void
  onDownload?: () => void
}
