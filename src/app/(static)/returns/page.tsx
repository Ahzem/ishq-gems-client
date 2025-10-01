'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Shield, Package, RefreshCw, AlertCircle } from 'lucide-react'
import { companyInfo } from '@/lib/constants'

export default function ReturnsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300 mb-8 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back</span>
          </button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              Returns & Exchanges Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-foreground">
            <div className="bg-card p-6 rounded-lg border border-border mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our Commitment to You</h2>
              <p className="text-muted-foreground">
                At Ishq Gems, we stand behind the quality and authenticity of every piece in our collection. 
                We want you to be completely satisfied with your purchase. If for any reason you&apos;re not 
                happy with your gem or jewelry, our returns and exchanges policy is designed to make 
                the process as smooth as possible.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">1. Return Policy Overview</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-semibold">Return Window</h3>
                  </div>
                  <p className="text-muted-foreground">
                    You have <strong>30 days</strong> from the date of delivery to return your purchase for a full refund.
                  </p>
                </div>
                
                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-semibold">Condition Requirements</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Items must be in original condition, unworn, and include all original packaging and certificates.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">What&apos;s Covered</h3>
                <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                  <li>• All loose gemstones and jewelry pieces</li>
                  <li>• Custom pieces (subject to additional conditions)</li>
                  <li>• Certified gems with original certificates</li>
                  <li>• Items damaged during shipping</li>
                  <li>• Items significantly different from description</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">2. Eligible Items for Return</h2>
              
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold mb-3 text-green-800 dark:text-green-200">✓ Returnable Items</h3>
                  <ul className="space-y-2 text-green-700 dark:text-green-300">
                    <li>• Unworn jewelry in original condition</li>
                    <li>• Loose gemstones with original packaging</li>
                    <li>• Items with certificates and authenticity documents</li>
                    <li>• Engagement rings (within 30 days, unworn)</li>
                    <li>• Wedding bands (within 30 days, unworn)</li>
                    <li>• Ready-to-ship pieces</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-semibold mb-3 text-red-800 dark:text-red-200">✗ Non-Returnable Items</h3>
                  <ul className="space-y-2 text-red-700 dark:text-red-300">
                    <li>• Personalized or engraved jewelry</li>
                    <li>• Custom-made pieces (after production begins)</li>
                    <li>• Worn or damaged items</li>
                    <li>• Items without original packaging or certificates</li>
                    <li>• Vintage or antique pieces (marked as final sale)</li>
                    <li>• Items purchased with special promotions (case-by-case)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">3. How to Initiate a Return</h2>
              
              <div className="space-y-6">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">Step-by-Step Process</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Contact Our Customer Service</h4>
                        <p className="text-muted-foreground text-sm">
                          Email us at returns@ishqgems.com or call +94 11 234 5678 within 30 days of delivery
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Provide Order Information</h4>
                        <p className="text-muted-foreground text-sm">
                          Include your order number, reason for return, and photos if applicable
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Receive Return Authorization</h4>
                        <p className="text-muted-foreground text-sm">
                          We&apos;ll send you a Return Authorization Number (RAN) and shipping instructions
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Package & Ship</h4>
                        <p className="text-muted-foreground text-sm">
                          Securely package the item with all original materials and ship using our prepaid label
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">4. Exchange Policy</h2>
              
              <div className="space-y-6">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <RefreshCw className="w-6 h-6 text-purple-500" />
                    <h3 className="text-xl font-semibold">Exchange Options</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    We offer exchanges for size adjustments, different gem cuts, or alternative pieces of equal or greater value.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-background/50 p-4 rounded-lg border border-border/30">
                      <h4 className="font-semibold mb-2">Size Exchanges</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Ring resizing (standard sizes)</li>
                        <li>• Bracelet length adjustments</li>
                        <li>• Necklace chain length changes</li>
                      </ul>
                    </div>
                    
                    <div className="bg-background/50 p-4 rounded-lg border border-border/30">
                      <h4 className="font-semibold mb-2">Style Exchanges</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Different gem cuts</li>
                        <li>• Alternative settings</li>
                        <li>• Metal type changes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">5. Refund Process</h2>
              
              <div className="space-y-6">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">Refund Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-border/30">
                      <span className="font-medium">Item Received & Inspected</span>
                      <span className="text-muted-foreground">1-2 business days</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/30">
                      <span className="font-medium">Refund Processed</span>
                      <span className="text-muted-foreground">2-3 business days</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="font-medium">Refund Appears in Account</span>
                      <span className="text-muted-foreground">3-7 business days</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Important Notes</h3>
                  </div>
                  <ul className="space-y-2 text-yellow-700 dark:text-yellow-300">
                    <li>• Refunds are processed to the original payment method</li>
                    <li>• Shipping costs are non-refundable (unless item was damaged/defective)</li>
                    <li>• International returns may take longer to process</li>
                    <li>• Custom pieces may have different refund conditions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">6. Damaged or Defective Items</h2>
              
              <div className="space-y-6">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">Quality Guarantee</h3>
                  <p className="text-muted-foreground mb-4">
                    If you receive a damaged or defective item, we&apos;ll make it right immediately:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-background/50 p-4 rounded-lg border border-border/30">
                      <h4 className="font-semibold mb-2">Shipping Damage</h4>
                      <p className="text-sm text-muted-foreground">
                        Items damaged during shipping will be replaced or refunded immediately. 
                        Contact us within 48 hours of delivery with photos.
                      </p>
                    </div>
                    
                    <div className="bg-background/50 p-4 rounded-lg border border-border/30">
                      <h4 className="font-semibold mb-2">Manufacturing Defects</h4>
                      <p className="text-sm text-muted-foreground">
                        We guarantee our craftsmanship. Any manufacturing defects will be 
                        repaired or replaced at no cost to you.
                      </p>
                    </div>
                    
                    <div className="bg-background/50 p-4 rounded-lg border border-border/30">
                      <h4 className="font-semibold mb-2">Certification Issues</h4>
                      <p className="text-sm text-muted-foreground">
                        If a gem doesn&apos;t match its certification, we&apos;ll provide a full refund 
                        plus return shipping costs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">7. International Returns</h2>
              
              <div className="space-y-4">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">Special Considerations</h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>Extended Return Window:</strong> International customers have 45 days 
                      from delivery to account for longer shipping times.
                    </p>
                    <p>
                      <strong>Customs & Duties:</strong> Original customs duties paid by the customer 
                      are non-refundable. Return shipping may incur additional duties.
                    </p>
                    <p>
                      <strong>Shipping Costs:</strong> Return shipping costs are covered by Ishq Gems 
                      for defective items, but customer&apos;s responsibility for other returns.
                    </p>
                    <p>
                      <strong>Documentation:</strong> All original customs forms and certificates 
                      must be included with international returns.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">8. Contact Information</h2>
              <div className="space-y-4">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">Returns Department</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Returns Processing Center</p>
                        <p className="text-sm text-muted-foreground">{companyInfo.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Customer Service Hours</p>
                        <p className="text-sm text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM (GMT+5:30)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Email Support</h4>
                    <p className="text-sm text-muted-foreground">{companyInfo.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
                  </div>
                  
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Phone Support</h4>
                    <p className="text-sm text-muted-foreground">{companyInfo.phone}</p>
                    <p className="text-xs text-muted-foreground mt-1">Available during business hours</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-accent/10 p-6 rounded-lg border border-accent/20 mt-12">
              <h3 className="text-xl font-semibold mb-3">Policy Updates</h3>
              <p className="text-muted-foreground">
                This returns policy may be updated from time to time. Any changes will be posted on this page 
                and will take effect immediately. For returns initiated before policy changes, the original 
                policy terms will apply.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 