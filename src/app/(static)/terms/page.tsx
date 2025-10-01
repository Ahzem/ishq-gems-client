'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import { companyInfo } from '@/lib/constants'

export default function TermsPage() {
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
                Terms of Service
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
                <h2 className="text-2xl font-semibold mb-4">Agreement Overview</h2>
                <p className="text-muted-foreground">
                  These Terms of Service (&quot;Terms&quot;) govern your access to and use of Ishq Gems 
                  (https://ishqgems.com), operated by Ishq Gems (Pvt) Ltd, a company incorporated 
                  in Sri Lanka. By accessing or using our platform, you agree to be bound by these Terms.
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. User Eligibility</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>To use our platform, you must:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Be at least 18 years of age</li>
                    <li>Have the legal capacity to enter into binding agreements</li>
                    <li>Comply with all applicable local, national, and international laws</li>
                    <li>Not be prohibited from using our services under any applicable law</li>
                    <li>Provide accurate and complete information during registration</li>
                  </ul>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.3} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Account Responsibilities</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>As a user of Ishq Gems, you are responsible for:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Providing accurate, current, and complete information</li>
                    <li>Updating your information as needed</li>
                    <li>Notifying us immediately of any unauthorized use of your account</li>
                    <li>Complying with all applicable laws and regulations</li>
                  </ul>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.4} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. Buying & Selling Rules</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">For Buyers:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li>You may purchase gemstones and jewelry listed on our platform</li>
                    <li>All purchases are subject to availability and acceptance by the seller</li>
                    <li>You agree to pay all applicable fees, taxes, and shipping costs</li>
                    <li>You must provide accurate shipping and billing information</li>
                    <li>Risk of loss passes to you upon delivery</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">For Sellers:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li>You must apply and be verified before selling on our platform</li>
                    <li>You must provide accurate descriptions and images of your items</li>
                    <li>You must hold valid licenses and permits required for your business</li>
                    <li>You are responsible for fulfilling orders and customer service</li>
                    <li>You must comply with all applicable laws regarding gemstone sales</li>
                    <li>You warrant that you have the right to sell all listed items</li>
                  </ul>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.5} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Fees, Commissions & Payment Terms</h2>
                <div className="space-y-4 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Ishq Gems charges a commission on successful sales as communicated to sellers</li>
                    <li>Payment processing fees may apply and will be clearly disclosed</li>
                    <li>Sellers are responsible for applicable taxes on their sales</li>
                    <li>Refunds and returns are subject to our return policy</li>
                    <li>We reserve the right to modify fees with 30 days&apos; notice</li>
                    <li>All payments are processed through secure third-party payment providers</li>
                  </ul>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.6} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Prohibited Items & Activities</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>The following are strictly prohibited on our platform:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Selling counterfeit, synthetic, or misrepresented gemstones</li>
                    <li>Listing items without proper certification or documentation</li>
                    <li>Engaging in fraudulent or deceptive practices</li>
                    <li>Violating intellectual property rights</li>
                    <li>Manipulating reviews or ratings</li>
                    <li>Circumventing our fee structure</li>
                    <li>Selling prohibited or restricted items</li>
                    <li>Harassment or abusive behavior toward other users</li>
                    <li>Spamming or unauthorized marketing activities</li>
                  </ul>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.7} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Dispute Handling</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>In case of disputes:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Users should first attempt to resolve disputes directly with each other</li>
                    <li>If direct resolution fails, contact our customer support team</li>
                    <li>We will investigate disputes and may mediate between parties</li>
                    <li>Our decision in disputes is final and binding</li>
                    <li>We reserve the right to withhold payments during dispute resolution</li>
                    <li>Serious disputes may be referred to appropriate authorities</li>
                  </ul>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.8} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Termination</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We may terminate or suspend your account if you:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Violate these Terms of Service</li>
                    <li>Engage in fraudulent or illegal activities</li>
                    <li>Provide false or misleading information</li>
                    <li>Fail to pay applicable fees</li>
                    <li>Cause harm to other users or our platform</li>
                  </ul>
                  <p>You may terminate your account at any time by contacting us. Upon termination, your access to the platform will cease, but these Terms will continue to apply to any prior use.</p>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={0.9} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">8. Intellectual Property</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>All content on Ishq Gems, including but not limited to text, graphics, logos, images, and software, is the property of Ishq (Gems Pvt) Ltd or its licensors and is protected by copyright, trademark, and other intellectual property laws.</p>
                  <p>You may not use, reproduce, distribute, or create derivative works from our content without express written permission.</p>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={1.0} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">9. Governing Law</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>These Terms are governed by the laws of Sri Lanka. Any disputes arising from these Terms or your use of our platform will be subject to the exclusive jurisdiction of the courts of Sri Lanka.</p>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={1.1} duration={0.8}>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">10. Contact Information</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>For questions about these Terms of Service, please contact us:</p>
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <p><strong>{companyInfo.fullName}</strong></p>
                    <p>Email: {companyInfo.email}</p>
                    <p>Phone: {companyInfo.phone}</p>
                    <p>Address: {companyInfo.address}</p>
                  </div>
                </div>
              </section>
            </ScrollAnimation>

            <ScrollAnimation animation="slideUp" delay={1.2} duration={0.8}>
              <div className="bg-accent/10 p-6 rounded-lg border border-accent/20 mt-12">
                <h3 className="text-xl font-semibold mb-3">Changes to Terms</h3>
                <p className="text-muted-foreground">
                  We reserve the right to update these Terms of Service at any time. We will notify users of any material changes via email or platform notification. Your continued use of the platform after such changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </div>
  )
} 