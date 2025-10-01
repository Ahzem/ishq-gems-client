'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import { companyInfo } from '@/lib/constants'

export default function PrivacyPage() {
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

          <ScrollAnimation animation="fadeIn" duration={0.8}>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground text-lg">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </ScrollAnimation>

          <div className="prose prose-lg max-w-none text-foreground">
            <ScrollAnimation animation="slideUp" delay={0.1} duration={0.8}>
              <div className="bg-card p-6 rounded-lg border border-border mb-8">
                <h2 className="text-2xl font-semibold mb-4">Our Commitment to Privacy</h2>
                <p className="text-muted-foreground">
                  At Ishq Gems, operated by Ishq (Gems Pvt) Ltd, we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, share, and protect your information when you use our platform at https://ishqgems.com.
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. What Data We Collect</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li><strong>Identity Information:</strong> Name, email address, phone number, date of birth</li>
                    <li><strong>Address Information:</strong> Billing address, shipping address, country of residence</li>
                    <li><strong>Government ID:</strong> National Identity Card (NIC), passport number, or other government-issued ID</li>
                    <li><strong>Financial Information:</strong> Payment method details, billing information</li>
                    <li><strong>Professional Information:</strong> Business license, tax registration (for sellers)</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Business Information (For Sellers)</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li>Business name and registration details</li>
                    <li>Tax identification numbers</li>
                    <li>Bank account information for payments</li>
                    <li>Business licenses and certifications</li>
                    <li>Professional references and credentials</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Product Information</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li>Gemstone listings, descriptions, and specifications</li>
                    <li>Product images and videos</li>
                    <li>Certification documents and lab reports</li>
                    <li>Pricing and inventory information</li>
                    <li>Transaction history and order details</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Technical Information</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Operating system and device specifications</li>
                    <li>Pages visited and time spent on our platform</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.3} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Why We Collect Your Data</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We collect and process your personal data for the following purposes:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Account Management:</strong> Creating and managing your user account</li>
                    <li><strong>Transaction Processing:</strong> Processing purchases, payments, and orders</li>
                    <li><strong>KYC & Verification:</strong> Verifying identity and business credentials for sellers</li>
                    <li><strong>Order Fulfillment:</strong> Shipping products and tracking deliveries</li>
                    <li><strong>Customer Support:</strong> Providing assistance and resolving issues</li>
                    <li><strong>Platform Security:</strong> Preventing fraud and ensuring platform safety</li>
                    <li><strong>Legal Compliance:</strong> Meeting regulatory requirements and legal obligations</li>
                    <li><strong>Communication:</strong> Sending updates, notifications, and promotional materials</li>
                    <li><strong>Analytics:</strong> Improving our platform and user experience</li>
                    <li><strong>Marketing:</strong> Personalizing content and advertising (with consent)</li>
                  </ul>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.4} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. How We Share Your Data</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We may share your personal data with:</p>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Service Providers</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Payment processors (Stripe, PayPal, etc.)</li>
                      <li>Shipping and logistics companies</li>
                      <li>Cloud storage and hosting providers</li>
                      <li>Email service providers</li>
                      <li>Analytics and marketing platforms</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Legal Authorities</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Law enforcement when required by law</li>
                      <li>Tax authorities for tax compliance</li>
                      <li>Regulatory bodies for compliance purposes</li>
                      <li>Courts and legal representatives in legal proceedings</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Business Partners</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Other users (buyers and sellers) for transaction purposes</li>
                      <li>Verification services for identity and business checks</li>
                      <li>Insurance providers for shipment protection</li>
                    </ul>
                  </div>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.5} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Cookies & Analytics</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We use cookies and similar technologies to enhance your experience:</p>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Essential Cookies</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Authentication and session management</li>
                      <li>Shopping cart functionality</li>
                      <li>Security and fraud prevention</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Analytics Cookies</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Google Analytics for website performance</li>
                      <li>User behavior and interaction tracking</li>
                      <li>Platform optimization and improvements</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Marketing Cookies</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Personalized advertising and content</li>
                      <li>Social media integration</li>
                      <li>Email marketing optimization</li>
                    </ul>
                  </div>

                  <p>You can manage your cookie preferences through your browser settings or our cookie consent banner.</p>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.6} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Your Rights</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>You have the following rights regarding your personal data:</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <h3 className="font-semibold mb-2">Access Right</h3>
                      <p className="text-sm">Request a copy of your personal data we hold</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <h3 className="font-semibold mb-2">Correction Right</h3>
                      <p className="text-sm">Request correction of inaccurate or incomplete data</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <h3 className="font-semibold mb-2">Deletion Right</h3>
                      <p className="text-sm">Request deletion of your personal data</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <h3 className="font-semibold mb-2">Portability Right</h3>
                      <p className="text-sm">Request transfer of your data to another service</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <h3 className="font-semibold mb-2">Objection Right</h3>
                      <p className="text-sm">Object to processing of your data for certain purposes</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border">
                      <h3 className="font-semibold mb-2">Restriction Right</h3>
                      <p className="text-sm">Request limitation of processing in certain circumstances</p>
                    </div>
                  </div>

                  <p className="mt-4">To exercise any of these rights, please contact us using the information provided below.</p>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.7} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Data Retention</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We retain your personal data for as long as necessary to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide our services and maintain your account</li>
                    <li>Comply with legal and regulatory requirements</li>
                    <li>Resolve disputes and enforce our agreements</li>
                    <li>Prevent fraud and ensure platform security</li>
                  </ul>
                  
                  <div className="bg-card p-4 rounded-lg border border-border mt-4">
                    <h3 className="font-semibold mb-2">Specific Retention Periods:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                      <li><strong>Account Data:</strong> Retained while account is active + 2 years after closure</li>
                      <li><strong>Transaction Records:</strong> 7 years for tax and legal compliance</li>
                      <li><strong>Communication Records:</strong> 3 years for customer support purposes</li>
                      <li><strong>Marketing Data:</strong> Until consent is withdrawn or 2 years of inactivity</li>
                    </ul>
                  </div>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.8} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Data Security</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We implement appropriate technical and organizational measures to protect your data:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Secure data centers with restricted access</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication measures</li>
                    <li>Data backup and recovery procedures</li>
                    <li>Employee training on data protection</li>
                  </ul>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.9} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">8. International Data Transfers</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>As we serve customers globally, your data may be transferred to and processed in countries outside Sri Lanka. We ensure appropriate safeguards are in place for such transfers, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Standard contractual clauses</li>
                    <li>Adequacy decisions by relevant authorities</li>
                    <li>Certification schemes and codes of conduct</li>
                    <li>Your explicit consent where required</li>
                  </ul>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={1} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">9. Contact for Privacy Requests</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>For any privacy-related questions or to exercise your rights, please contact:</p>
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <p><strong>Data Protection Officer</strong></p>
                    <p><strong>{companyInfo.fullName}</strong></p>
                    <p>Email: {companyInfo.email}</p>
                    <p>Phone: {companyInfo.phone}</p>
                    <p>Address: {companyInfo.address}</p>
                  </div>
                  <p>We will respond to your request within 30 days of receipt.</p>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={1.1} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">10. Children&apos;s Privacy</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>Our platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.</p>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={1.2} duration={0.8}>
              <div className="bg-accent/10 p-6 rounded-lg border border-accent/20 mt-12">
                <h3 className="text-xl font-semibold mb-3">Updates to This Privacy Policy</h3>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting a notice on our website or sending you an email notification.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </div>
  )
} 