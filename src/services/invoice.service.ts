import { InvoiceData, InvoiceConfig } from '@/types/components'

export class InvoiceService {
  private static readonly defaultConfig: InvoiceConfig = {
    companyName: 'Ishq Gems',
    companyWebsite: 'ishqgems.com',
    companyEmail: 'support@ishqgems.com',
    theme: 'luxury'
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  static getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      case 'processing':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'failed':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
    }
  }

  static getOrderStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'sent':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      case 'draft':
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
      case 'overdue':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      case 'cancelled':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
    }
  }

  static generateInvoiceHTML(invoiceData: InvoiceData, config: Partial<InvoiceConfig> = {}): string {
    const fullConfig = { ...this.defaultConfig, ...config }
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceData.orderNumber}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            ${this.getInvoiceStyles(fullConfig.theme)}
          </style>
        </head>
        <body>
          ${this.generateInvoiceContent(invoiceData, fullConfig)}
        </body>
      </html>
    `
  }

  private static getInvoiceStyles(theme: 'light' | 'dark' | 'luxury'): string {
    const baseStyles = `
      * { 
        margin: 0; 
        padding: 0; 
        box-sizing: border-box; 
      }
      
      body { 
        font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        line-height: 1.6; 
        background: white;
        padding: 20px;
        color: #1a1a1a;
      }
      
      .invoice-container { 
        max-width: 800px; 
        margin: 0 auto; 
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      
      .invoice-header { 
        padding: 40px; 
        text-align: center; 
        margin-bottom: 0;
        position: relative;
        overflow: hidden;
      }
      
      .invoice-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.1;
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      }
      
      .logo-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-bottom: 8px;
        position: relative;
        z-index: 1;
      }
      
      .logo-icon {
        width: 64px;
        height: 64px;
        object-fit: contain;
      }
      
      .logo-text {
        height: 64px;
        object-fit: contain;
      }
      
      .tagline { 
        font-size: 14px; 
        opacity: 0.9; 
        position: relative;
        z-index: 1;
        font-weight: 500;
      }
      
      .invoice-title { 
        font-size: 28px; 
        font-weight: 700; 
        margin-top: 20px; 
        position: relative;
        z-index: 1;
        letter-spacing: 0.05em;
      }
      
      .invoice-number { 
        padding: 20px 30px; 
        text-align: center; 
        margin: 30px 40px; 
        font-weight: 700; 
        font-size: 20px; 
        border-radius: 12px;
        border: 2px solid;
      }
      
      .invoice-info { 
        display: flex; 
        justify-content: space-between; 
        margin: 40px; 
        gap: 40px; 
      }
      
      .info-section { 
        flex: 1; 
      }
      
      .info-section h3 { 
        font-size: 18px; 
        font-weight: 700; 
        margin-bottom: 16px; 
        padding-bottom: 8px; 
        border-bottom: 2px solid;
      }
      
      .info-section p { 
        margin-bottom: 8px; 
        font-size: 14px; 
        line-height: 1.5;
      }
      
      .items-table { 
        width: calc(100% - 80px);
        margin: 0 40px 40px 40px;
        border-collapse: collapse; 
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      .items-table th { 
        padding: 20px 16px; 
        text-align: left; 
        font-weight: 700; 
        font-size: 14px; 
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .items-table td { 
        padding: 20px 16px; 
        font-size: 14px; 
        border-top: 1px solid;
      }
      
      .gem-info { 
        font-weight: 700; 
        font-size: 16px;
        margin-bottom: 4px;
      }
      
      .gem-details { 
        font-size: 12px; 
        opacity: 0.7; 
        margin-top: 4px; 
        line-height: 1.4;
      }
      
      .seller-name { 
        font-size: 12px; 
        font-weight: 600; 
        opacity: 0.8;
      }
      
      .totals-section { 
        margin: 0 40px 40px 40px;
        padding: 30px; 
        border-radius: 12px; 
        border: 1px solid;
      }
      
      .total-row { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 12px; 
        font-size: 16px; 
      }
      
      .total-row.final { 
        border-top: 2px solid; 
        padding-top: 20px; 
        margin-top: 20px; 
        font-size: 24px; 
        font-weight: 700; 
      }
      
      .payment-info { 
        border-radius: 12px; 
        padding: 30px; 
        margin: 0 40px 40px 40px; 
        border: 1px solid;
      }
      
      .payment-info h3 { 
        font-size: 18px; 
        font-weight: 700; 
        margin-bottom: 16px; 
      }
      
      .payment-status { 
        display: inline-block; 
        padding: 8px 16px; 
        border-radius: 8px; 
        font-size: 12px; 
        font-weight: 700; 
        text-transform: uppercase; 
        letter-spacing: 0.05em;
      }
      
      .footer { 
        padding: 40px; 
        text-align: center; 
        border-top: 1px solid;
        margin-top: 0;
      }
      
      .footer-logo {
        display: flex;
        align-items: start;
        justify-content: center;
        gap: 12px;
        margin-bottom: 16px;
        background-color: rgba(255, 255, 255, 0.9);
        padding: 12px;
        border-radius: 8px;
      }
      
      .footer-logo-icon {
        width: 32px;
        height: 32px;
        object-fit: contain;
        opacity: 0.8;
      }
      
      .footer-logo-text {
        height: 32px;
        object-fit: contain;
        opacity: 0.8;
      }
      
      .footer-text { 
        font-size: 16px; 
        margin-bottom: 8px; 
        font-weight: 600;
      }
      
      .footer-contact { 
        font-size: 14px; 
        opacity: 0.8; 
      }
      
      @media print {
        body { 
          padding: 0; 
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .invoice-container { 
          max-width: none; 
          box-shadow: none;
        }
      }
    `

    const themeStyles = {
      light: `
        .invoice-header { 
          background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%); 
          color: #1a1a1a; 
        }
        .invoice-number {
          background: linear-gradient(135deg, #d4af37, #ffd700);
          color: #1a1a1a;
          border-color: #d4af37;
        }
        .info-section h3 { 
          color: #d4af37; 
          border-color: #e5e5e5; 
        }
        .items-table th { 
          background: #fafafa; 
          color: #1a1a1a; 
        }
        .items-table td { 
          border-color: #e5e5e5; 
        }
        .gem-info { color: #1a1a1a; }
        .totals-section { 
          background: #fafafa; 
          border-color: #e5e5e5;
        }
        .total-row.final { 
          border-color: #d4af37; 
          color: #d4af37; 
        }
        .payment-info { 
          background: linear-gradient(135deg, #f0fff4, #e6fffa); 
          border-color: #10b981; 
        }
        .payment-info h3 { color: #10b981; }
        .status-completed { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-processing { background: #dbeafe; color: #1e40af; }
        .footer { 
          background: #1a1a1a; 
          color: #fafafa; 
          border-color: #e5e5e5;
        }
      `,
      dark: `
        .invoice-header { 
          background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%); 
          color: #0a0a0a; 
        }
        body { background: #0a0a0a; color: #fafafa; }
        .invoice-container { background: #1a1a1a; }
        .invoice-number {
          background: linear-gradient(135deg, #d4af37, #ffd700);
          color: #0a0a0a;
          border-color: #d4af37;
        }
        .info-section h3 { 
          color: #d4af37; 
          border-color: #262626; 
        }
        .items-table th { 
          background: #262626; 
          color: #fafafa; 
        }
        .items-table td { 
          border-color: #262626; 
        }
        .gem-info { color: #fafafa; }
        .totals-section { 
          background: #262626; 
          border-color: #262626;
        }
        .total-row.final { 
          border-color: #d4af37; 
          color: #d4af37; 
        }
        .payment-info { 
          background: linear-gradient(135deg, #14532d, #16a34a); 
          border-color: #22c55e; 
          color: #bbf7d0;
        }
        .payment-info h3 { color: #22c55e; }
        .status-completed { background: #14532d; color: #bbf7d0; }
        .status-pending { background: #78350f; color: #fef3c7; }
        .status-processing { background: #1e3a8a; color: #dbeafe; }
        .footer { 
          background: #262626; 
          color: #fafafa; 
          border-color: #262626;
        }
      `,
      luxury: `
        .invoice-header { 
          background: linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #d4af37 100%); 
          color: #0a0a0a; 
          position: relative;
        }
        .invoice-header::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        .invoice-number {
          background: linear-gradient(135deg, #d4af37, #ffd700, #d4af37);
          color: #0a0a0a;
          border-color: #d4af37;
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
        }
        .info-section h3 { 
          color: #d4af37; 
          border-color: #e5e5e5; 
        }
        .items-table th { 
          background: linear-gradient(135deg, #fafafa, #f5f5f5); 
          color: #1a1a1a; 
        }
        .items-table td { 
          border-color: #e5e5e5; 
        }
        .gem-info { 
          color: #1a1a1a; 
          background: linear-gradient(135deg, #d4af37, #ffd700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .totals-section { 
          background: linear-gradient(135deg, #fafafa, #ffffff); 
          border-color: #d4af37;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.1);
        }
        .total-row.final { 
          border-color: #d4af37; 
          color: #d4af37; 
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }
        .payment-info { 
          background: linear-gradient(135deg, #f0fff4, #e6fffa); 
          border-color: #10b981; 
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.1);
        }
        .payment-info h3 { color: #10b981; }
        .status-completed { 
          background: linear-gradient(135deg, #dcfce7, #bbf7d0); 
          color: #166534; 
          box-shadow: 0 2px 8px rgba(22, 101, 52, 0.2);
        }
        .status-pending { 
          background: linear-gradient(135deg, #fef3c7, #fde68a); 
          color: #92400e; 
          box-shadow: 0 2px 8px rgba(146, 64, 14, 0.2);
        }
        .status-processing { 
          background: linear-gradient(135deg, #dbeafe, #bfdbfe); 
          color: #1e40af; 
          box-shadow: 0 2px 8px rgba(30, 64, 175, 0.2);
        }
        .footer { 
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d); 
          color: #fafafa; 
          border-color: #d4af37;
        }
      `
    }

    return baseStyles + themeStyles[theme]
  }

  private static generateInvoiceContent(invoiceData: InvoiceData, config: InvoiceConfig): string {
    return `
      <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
          <div class="logo-container">
            <img src="/images/logo/ishq-gems-logo-only.png" alt="Ishq Gems Logo" class="logo-icon">
            <img src="/images/logo/ishq-gems-name-only.png" alt="Ishq Gems" class="logo-text">
          </div>
          <div class="tagline">Premium Gemstone Marketplace</div>
          <div class="invoice-title">INVOICE</div>
        </div>
        
        <!-- Invoice Number -->
        <div class="invoice-number">
          Invoice #${invoiceData.orderNumber}
        </div>
        
        <!-- Invoice Info -->
        <div class="invoice-info">
          <div class="info-section">
            <h3>Bill To</h3>
            <p><strong>${invoiceData.customer.name}</strong></p>
            <p>${invoiceData.customer.email}</p>
            ${invoiceData.customer.phone ? `<p>${invoiceData.customer.phone}</p>` : ''}
            ${invoiceData.customer.address ? `
              <p>${invoiceData.customer.address.street}</p>
              <p>${invoiceData.customer.address.city}, ${invoiceData.customer.address.state}</p>
              <p>${invoiceData.customer.address.country} ${invoiceData.customer.address.zipCode}</p>
            ` : ''}
          </div>
          
          <div class="info-section">
            <h3>Invoice Details</h3>
            <p><strong>Date:</strong> ${this.formatDate(invoiceData.orderDate)}</p>
            <p><strong>Order ID:</strong> ${invoiceData.orderNumber}</p>
            <p><strong>Payment Method:</strong> ${invoiceData.payment.method.replace('-', ' ').toUpperCase()}</p>
            <p><strong>Status:</strong> <span class="payment-status status-${invoiceData.payment.status}">${invoiceData.payment.status}</span></p>
            ${invoiceData.dueDate ? `<p><strong>Due Date:</strong> ${this.formatDate(invoiceData.dueDate)}</p>` : ''}
          </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Seller</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map(item => `
              <tr>
                <td>
                  <div class="gem-info">${item.name}</div>
                  <div class="gem-details">
                    ${item.gemType} • ${item.color} • ${item.weight}ct
                    ${item.reportNumber ? `<br/>Report: ${item.reportNumber}` : ''}
                  </div>
                </td>
                <td>
                  <div class="seller-name">${item.sellerName}</div>
                </td>
                <td>${item.quantity}</td>
                <td>${this.formatCurrency(item.unitPrice)}</td>
                <td>${this.formatCurrency(item.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${this.formatCurrency(invoiceData.totals.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>${this.formatCurrency(invoiceData.totals.shipping)}</span>
          </div>
          <div class="total-row">
            <span>Taxes:</span>
            <span>${this.formatCurrency(invoiceData.totals.taxes)}</span>
          </div>
          ${invoiceData.totals.discount ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-${this.formatCurrency(invoiceData.totals.discount)}</span>
            </div>
          ` : ''}
          <div class="total-row final">
            <span>Total Amount:</span>
            <span>${this.formatCurrency(invoiceData.totals.total)}</span>
          </div>
        </div>
        
        <!-- Payment Information -->
        <div class="payment-info">
          <h3>🔒 Payment & Security</h3>
          <p><strong>Payment Status:</strong> <span class="payment-status status-${invoiceData.payment.status}">${invoiceData.payment.status}</span></p>
          <p><strong>Escrow Protection:</strong> Your payment is held securely until you confirm receipt of your gems.</p>
          <p><strong>Transaction ID:</strong> ${invoiceData.payment.transactionId}</p>
          ${invoiceData.payment.hasReceipt ? '<p><strong>Receipt:</strong> Bank transfer receipt uploaded and verified</p>' : ''}
          ${invoiceData.payment.paidAt ? `<p><strong>Paid At:</strong> ${this.formatDate(invoiceData.payment.paidAt)}</p>` : ''}
        </div>
        
        ${invoiceData.notes ? `
          <div class="payment-info">
            <h3>📝 Notes</h3>
            <p>${invoiceData.notes}</p>
          </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo">
            <img src="/images/logo/ishq-gems-logo-only.png" alt="Ishq Gems Logo" class="footer-logo-icon">
            <img src="/images/logo/ishq-gems-name-only.png" alt="Ishq Gems" class="footer-logo-text">
          </div>
          <div class="footer-text">Thank you for choosing us!</div>
          <div class="footer-contact">
            For support, contact us at ${config.companyEmail} | Visit us at ${config.companyWebsite}
          </div>
        </div>
      </div>
    `
  }

  static printInvoice(invoiceData: InvoiceData, config: Partial<InvoiceConfig> = {}): void {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(this.generateInvoiceHTML(invoiceData, config))
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  static downloadInvoicePDF(invoiceData: InvoiceData, config: Partial<InvoiceConfig> = {}): void {
    // For now, use print functionality - can be extended with proper PDF generation
    this.printInvoice(invoiceData, config)
  }
}
