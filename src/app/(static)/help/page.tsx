'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronDown, 
  HelpCircle, 
  Users, 
  Shield, 
  Mail, 
  Phone, 
  MessageCircle,
  FileText,
  AlertTriangle,
  Gem
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import { companyInfo } from '@/lib/constants'

interface FAQItem {
  question: string
  answer: string | React.ReactNode
}

interface FAQSection {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  items: FAQItem[]
}

export default function HelpPage() {
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState('buyers')
  const [isNavVisible, setIsNavVisible] = useState(false)
  const router = useRouter()

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Navigation sections - memoized to prevent useEffect dependency changes
  const navigationSections = useMemo(() => [
    { id: 'buyers', title: 'For Buyers', icon: Users, color: 'blue' },
    { id: 'sellers', title: 'For Sellers', icon: Gem, color: 'primary' },
    { id: 'platform', title: 'Platform Guide', icon: Shield, color: 'purple' },
    { id: 'support', title: 'Contact Support', icon: MessageCircle, color: 'green' }
  ], [])

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const isMobile = window.innerWidth < 640
      const offset = isMobile ? 80 : 100 // Smaller offset for mobile
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  // Handle scroll tracking and navigation visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const isMobile = window.innerWidth < 640 // sm breakpoint
      
      // Show navigation after scrolling past hero section (adjusted for mobile)
      setIsNavVisible(scrollY > (isMobile ? 200 : 300))
      
      // Track active section with mobile-optimized thresholds
      const sections = navigationSections.map(section => {
        const element = document.getElementById(section.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          return {
            id: section.id,
            top: rect.top,
            bottom: rect.bottom
          }
        }
        return null
      }).filter(Boolean)

      // Find the section currently in view (adjusted threshold for mobile)
      const threshold = isMobile ? 150 : 200
      const currentSection = sections.find(section => 
        section && section.top <= threshold && section.bottom >= threshold
      )
      
      if (currentSection) {
        setActiveSection(currentSection.id)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll) // Handle orientation changes
    handleScroll() // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [navigationSections])

  // Handle anchor links for shipping methods
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#shipping-methods') {
        // Find the shipping methods question and open it
        const shippingMethodsKey = 'platform-4' // This will be the index of the shipping methods question
        setOpenAccordions(prev => ({
          ...prev,
          [shippingMethodsKey]: true
        }))
        
        // Scroll to the section after a short delay
        setTimeout(() => {
          const element = document.getElementById('shipping-methods')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    }
  }, [])

  const buyerFAQs: FAQSection = {
    title: 'For Buyers',
    description: 'Everything you need to know about purchasing gemstones on Ishq Gems',
    icon: Users,
    items: [
      {
        question: 'How do I buy a gemstone on Ishq Gems?',
        answer: (
          <div className="space-y-3">
            <p>Purchasing a gemstone is simple and secure:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Browse our curated collection or use filters to find specific gems</li>
              <li>Click on any gemstone to view detailed information and certificates</li>
              <li>Contact the seller directly through our chat system if you have questions</li>
              <li>Add the gem to your cart and proceed to secure checkout</li>
              <li>Complete payment using our encrypted payment system</li>
              <li>Track your order and receive your certified gemstone</li>
            </ol>
          </div>
        )
      },
      {
        question: 'Are all gems certified and authentic?',
        answer: (
          <div className="space-y-3">
            <p>Yes, absolutely. Every gemstone on Ishq Gems comes with:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Lab Certification:</strong> GIA, SSEF, Gübelin, or equivalent lab reports</li>
              <li><strong>Origin Documentation:</strong> Verified source and mining location</li>
              <li><strong>Internal Verification:</strong> Our team of certified gemologists review each listing</li>
              <li><strong>Seller Verification:</strong> All sellers are thoroughly vetted and licensed</li>
            </ul>
            <p className="text-primary font-medium">We guarantee 100% authenticity or full refund.</p>
          </div>
        )
      },
      {
        question: 'What if I receive a fake or incorrect product?',
        answer: (
          <div className="space-y-3">
            <p>Your protection is our priority:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Immediate Refund:</strong> Full refund if the product doesn&apos;t match its description</li>
              <li><strong>Expert Verification:</strong> Our gemologists will verify any disputed items</li>
              <li><strong>Seller Accountability:</strong> Fraudulent sellers are permanently banned</li>
              <li><strong>Insurance Coverage:</strong> All shipments are fully insured</li>
              <li><strong>24/7 Support:</strong> Contact us immediately if you have concerns</li>
            </ul>
            <p>Report issues within 48 hours of delivery for fastest resolution.</p>
          </div>
        )
      },
      {
        question: 'Can I return a gemstone after purchase?',
        answer: (
          <div className="space-y-3">
            <p>Yes, we offer a flexible return policy:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>7-Day Return Window:</strong> From the date of delivery</li>
              <li><strong>Condition Requirements:</strong> Gem must be unused with original certificate</li>
              <li><strong>Return Process:</strong> Contact support to initiate return</li>
              <li><strong>Refund Timeline:</strong> 3-5 business days after we receive the item</li>
              <li><strong>Return Shipping:</strong> We provide prepaid, insured return labels</li>
            </ul>
            <p className="text-amber-600 dark:text-amber-400">Custom-cut or modified gems cannot be returned unless damaged.</p>
          </div>
        )
      },
      {
        question: 'How do I contact a seller before buying?',
        answer: (
          <div className="space-y-3">
            <p>Connect with sellers easily through multiple channels:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Integrated Chat:</strong> Use the chat button on any listing page</li>
              <li><strong>Inquiry Form:</strong> Send detailed questions through the listing form</li>
              <li><strong>Video Calls:</strong> Schedule virtual gem viewing sessions</li>
              <li><strong>Phone Contact:</strong> Available for high-value purchases ($5,000+)</li>
            </ul>
            <p>All communications are monitored for security and quality assurance.</p>
          </div>
        )
      }
    ]
  }

  const sellerFAQs: FAQSection = {
    title: 'For Sellers',
    description: 'Your guide to becoming a successful seller on our platform',
    icon: Gem,
    items: [
      {
        question: 'How do I become a seller on Ishq Gems?',
        answer: (
          <div className="space-y-3">
            <p>Join our exclusive network of verified sellers:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Visit our <Link href="/sell" className="text-primary hover:underline">Sell With Us</Link> page</li>
              <li>Complete the comprehensive seller application</li>
              <li>Provide required documentation (business license, certifications)</li>
              <li>Undergo identity verification and background check</li>
              <li>Participate in a video interview with our team</li>
              <li>Receive approval and access to the seller dashboard</li>
            </ol>
            <p className="text-primary font-medium">Approval typically takes 5-7 business days.</p>
          </div>
        )
      },
      {
        question: 'Can I upload and manage my gem listings myself?',
        answer: (
          <div className="space-y-3">
            <p>Yes! Our seller dashboard provides complete control:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Easy Upload:</strong> Drag-and-drop interface for photos and certificates</li>
              <li><strong>Detailed Listings:</strong> Add specifications, origin, treatments, and pricing</li>
              <li><strong>Inventory Management:</strong> Track stock, sales, and pending orders</li>
              <li><strong>Analytics:</strong> View listing performance and buyer engagement</li>
              <li><strong>Bulk Operations:</strong> Upload multiple gems simultaneously</li>
              <li><strong>Real-time Editing:</strong> Update prices, descriptions, and availability instantly</li>
            </ul>
          </div>
        )
      },
      {
        question: 'Do I need an NGJA license or certification to sell?',
        answer: (
          <div className="space-y-3">
            <p>Professional certification is required for all sellers:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>NGJA License:</strong> Natural Gem & Jewelry Association certification</li>
              <li><strong>GIA Credentials:</strong> Gemological Institute of America certification</li>
              <li><strong>Equivalent Certifications:</strong> AIGS, Gübelin, SSEF, or regional equivalents</li>
              <li><strong>Business License:</strong> Valid business registration in your jurisdiction</li>
              <li><strong>Insurance Coverage:</strong> Professional liability and product insurance</li>
            </ul>
            <p>We help you obtain necessary certifications if you&apos;re new to the industry.</p>
          </div>
        )
      },
      {
        question: 'What fees and commissions do you charge?',
        answer: (
          <div className="space-y-3">
            <p>Transparent pricing with no hidden fees:</p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Basic Plan:</strong> 5% commission on sales + $29/month</li>
                <li><strong>Premium Plan:</strong> 3% commission on sales + $99/month</li>
                <li><strong>Enterprise Plan:</strong> 2% commission on sales + $299/month</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Payment processing fees (2.9% + $0.30) are additional and industry standard.
            </p>
            <p>Volume discounts available for established sellers with 50+ monthly sales.</p>
          </div>
        )
      }
    ]
  }

  const platformGuides: FAQSection = {
    title: 'Platform Usage & Policies',
    description: 'Understanding how Ishq Gems works and our policies',
    icon: Shield,
    items: [
      {
        question: 'What are the different account types?',
        answer: (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-950 dark:text-blue-100 mb-2">Buyer Account</h4>
                <ul className="text-sm text-blue-900 dark:text-blue-200 space-y-1">
                  <li>• Browse and purchase gems</li>
                  <li>• Save favorites and wishlists</li>
                  <li>• Track orders and history</li>
                  <li>• Contact sellers directly</li>
                </ul>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Seller Account</h4>
                <ul className="text-sm text-primary/80 space-y-1">
                  <li>• List and sell gemstones</li>
                  <li>• Access seller dashboard</li>
                  <li>• Manage inventory and orders</li>
                  <li>• View sales analytics</li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-950 dark:text-purple-100 mb-2">Admin Account</h4>
                <ul className="text-sm text-purple-900 dark:text-purple-200 space-y-1">
                  <li>• Platform management</li>
                  <li>• User verification</li>
                  <li>• Quality control</li>
                  <li>• Dispute resolution</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      {
        question: 'How does the seller verification process work?',
        answer: (
          <div className="space-y-3">
            <p>Our rigorous 6-step verification ensures quality and trust:</p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 dark:text-blue-400 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h5 className="font-semibold text-blue-950 dark:text-blue-100">Identity Verification</h5>
                  <p className="text-sm text-blue-800 dark:text-blue-300">Government ID and address confirmation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-700 dark:text-purple-400 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h5 className="font-semibold text-purple-950 dark:text-purple-100">Professional Credentials</h5>
                  <p className="text-sm text-purple-800 dark:text-purple-300">NGJA license and gemological certifications</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-700 dark:text-indigo-400 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h5 className="font-semibold text-indigo-950 dark:text-indigo-100">Business Documentation</h5>
                  <p className="text-sm text-indigo-800 dark:text-indigo-300">Business license, tax ID, and insurance</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-700 dark:text-teal-400 font-semibold text-sm">4</span>
                </div>
                <div>
                  <h5 className="font-semibold text-teal-950 dark:text-teal-100">Video Interview</h5>
                  <p className="text-sm text-teal-800 dark:text-teal-300">Face-to-face verification with our team</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-700 dark:text-cyan-400 font-semibold text-sm">5</span>
                </div>
                <div>
                  <h5 className="font-semibold text-cyan-950 dark:text-cyan-100">Sample Evaluation</h5>
                  <p className="text-sm text-cyan-800 dark:text-cyan-300">Review of sample listings and gem quality</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 dark:text-green-400 font-semibold text-sm">✓</span>
                </div>
                <div>
                  <h5 className="font-semibold text-green-950 dark:text-green-100">Approval & Activation</h5>
                  <p className="text-sm text-green-800 dark:text-green-300">Access to seller dashboard and listing tools</p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        question: 'How do transactions and payments work?',
        answer: (
          <div className="space-y-3">
            <p>Secure, escrow-style transactions protect both buyers and sellers:</p>
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4">
              <h5 className="font-semibold mb-3">Transaction Flow:</h5>
              <ol className="list-decimal list-inside space-y-2">
                <li>Buyer places order and payment is held in escrow</li>
                <li>Seller is notified and ships the gemstone</li>
                <li>Buyer receives and has 48 hours to inspect</li>
                <li>Upon approval, payment is released to seller</li>
                <li>If disputed, our team mediates the resolution</li>
              </ol>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <h6 className="font-semibold mb-2">Accepted Payment Methods:</h6>
                <ul className="text-sm space-y-1">
                  <li>• Credit/Debit Cards (Visa, MasterCard, Amex)</li>
                  <li>• Bank Wire Transfers (for high-value purchases)</li>
                  <li>• PayPal and Apple Pay</li>
                  <li>• Cryptocurrency (Bitcoin, Ethereum)</li>
                </ul>
              </div>
              <div>
                <h6 className="font-semibold mb-2">Security Features:</h6>
                <ul className="text-sm space-y-1">
                  <li>• 256-bit SSL encryption</li>
                  <li>• PCI DSS compliance</li>
                  <li>• Fraud detection systems</li>
                  <li>• Two-factor authentication</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      {
        question: 'How does shipping and delivery work?',
        answer: (
          <div className="space-y-3">
            <p>Premium shipping service for valuable gemstones:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-semibold text-blue-950 dark:text-blue-100 mb-2">Domestic Shipping (US)</h5>
                <ul className="text-sm text-blue-900 dark:text-blue-200 space-y-1">
                  <li>• FedEx Overnight or UPS Next Day</li>
                  <li>• Fully insured for full value</li>
                  <li>• Signature required delivery</li>
                  <li>• Real-time tracking</li>
                  <li>• 1-2 business days</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h5 className="font-semibold text-green-950 dark:text-green-100 mb-2">International Shipping</h5>
                <ul className="text-sm text-green-900 dark:text-green-200 space-y-1">
                  <li>• DHL or FedEx International</li>
                  <li>• Customs documentation included</li>
                  <li>• Full insurance coverage</li>
                  <li>• 3-7 business days</li>
                  <li>• Duty and tax calculator provided</li>
                </ul>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
              <h5 className="font-semibold text-amber-950 dark:text-amber-100 mb-2">Special Handling:</h5>
              <p className="text-sm text-amber-900 dark:text-amber-200">
                High-value items ($25,000+) may require armed courier service or bank-to-bank transfer for maximum security.
              </p>
            </div>
          </div>
        )
      },
      {
        question: 'How are disputes and complaints handled?',
        answer: (
          <div className="space-y-3">
            <p>Fair and transparent dispute resolution process:</p>
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h5 className="font-semibold text-red-950 dark:text-red-100 mb-2">Step 1: Direct Resolution</h5>
                <p className="text-sm text-red-900 dark:text-red-200">
                  Buyers and sellers attempt to resolve issues through our mediated chat system within 48 hours.
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-semibold text-blue-950 dark:text-blue-100 mb-2">Step 2: Platform Mediation</h5>
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  Our expert team reviews evidence, certificates, and communications to make a fair determination.
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h5 className="font-semibold text-green-950 dark:text-green-100 mb-2">Step 3: Expert Assessment</h5>
                <p className="text-sm text-green-900 dark:text-green-200">
                  Independent gemological assessment for disputed authenticity or quality claims (cost shared if dispute is valid).
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h5 className="font-semibold text-purple-950 dark:text-purple-100 mb-2">Final Resolution</h5>
                <p className="text-sm text-purple-900 dark:text-purple-200">
                  Binding decision with appropriate remedy (refund, replacement, credit, or no action required).
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        question: 'What are the different shipping methods available?',
        answer: (
          <div className="space-y-3" id="shipping-methods">
            <div className="flex items-center justify-between mb-4">
              <p>We offer three secure shipping options to meet different needs:</p>
              <button 
                onClick={() => router.back()} 
                className="text-sm text-primary hover:text-accent underline flex items-center gap-1"
              >
                ← Back
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-semibold text-blue-950 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  Seller Fulfilled
                </h5>
                <p className="text-sm text-blue-900 dark:text-blue-200 mb-2">
                  The seller handles shipping directly to the buyer using their preferred courier service.
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Seller chooses shipping carrier and method</li>
                  <li>• Direct communication between seller and buyer</li>
                  <li>• Seller responsible for insurance and tracking</li>
                  <li>• Typically faster for local or established sellers</li>
                </ul>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h5 className="font-semibold text-green-950 dark:text-green-100 mb-2 flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  Ishq Gems Logistics
                </h5>
                <p className="text-sm text-green-900 dark:text-green-200 mb-2">
                  Ishq Gems handles the entire shipping process from seller to buyer with additional verification.
                </p>
                <ul className="text-xs text-green-800 dark:text-green-300 space-y-1">
                  <li>• Professional handling and verification</li>
                  <li>• Full insurance coverage included</li>
                  <li>• Quality assurance before shipping</li>
                  <li>• Standardized packaging and tracking</li>
                  <li>• Additional security for high-value items</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h5 className="font-semibold text-purple-950 dark:text-purple-100 mb-2 flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">•</span>
                  In-Person via Ishq Gems
                </h5>
                <p className="text-sm text-purple-900 dark:text-purple-200 mb-2">
                  Buyer and seller meet physically under Ishq Gems&apos; arrangement for high-value transactions.
                </p>
                <ul className="text-xs text-purple-800 dark:text-purple-300 space-y-1">
                  <li>• Secure meeting location arranged by Ishq Gems</li>
                  <li>• Professional gemologist present for verification</li>
                  <li>• Immediate payment and transfer</li>
                  <li>• Ideal for items over $25,000</li>
                  <li>• No shipping risks or delays</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h6 className="font-semibold text-amber-950 dark:text-amber-100 mb-2">Important Notes:</h6>
              <ul className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <li>• All methods include full insurance coverage</li>
                <li>• Tracking information provided for all shipments</li>
                <li>• Signature required for delivery</li>
                <li>• 48-hour inspection period after delivery</li>
                <li>• Dispute resolution available for all methods</li>
              </ul>
            </div>
          </div>
        )
      }
    ]
  }

  const AccordionItem = ({ item, sectionKey, index }: { item: FAQItem; sectionKey: string; index: number }) => {
    const key = `${sectionKey}-${index}`
    const isOpen = openAccordions[key]

    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => toggleAccordion(key)}
          className="w-full px-6 py-4 text-left bg-card hover:bg-secondary/30 transition-all duration-300 flex items-center justify-between group"
        >
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {item.question}
          </h3>
          <ChevronDown 
            className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-all duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>
        {isOpen && (
          <div className="px-6 py-4 bg-secondary/20 border-t border-border">
            <div className="text-muted-foreground leading-relaxed">
              {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Floating Navigation Component - Mobile Responsive
  const FloatingNavigation = () => (
    <>
      {/* Mobile Navigation - Bottom Fixed */}
      <div className={`fixed bottom-4 left-4 right-4 z-50 sm:hidden transition-all duration-500 ${
        isNavVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
      }`}>
        <div className="bg-card/95 dark:bg-card/90 backdrop-blur-xl border border-border/60 dark:border-border/40 rounded-2xl shadow-2xl shadow-primary/10 dark:shadow-primary/5 p-3">
          {/* Mobile navigation items - horizontal layout */}
          <div className="flex items-center justify-between gap-2">
            {navigationSections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    scrollToSection(section.id)
                    // Auto-hide after navigation on mobile (functionality removed)
                  }}
                  className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 flex-1 min-w-0 ${
                    isActive 
                      ? 'bg-primary/20 dark:bg-primary/10 text-primary shadow-lg shadow-primary/20' 
                      : 'hover:bg-secondary/50 dark:hover:bg-secondary/30 text-muted-foreground hover:text-foreground active:scale-95'
                  }`}
                  title={section.title}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-primary to-accent rounded-b-full"></div>
                  )}
                  
                  {/* Icon with enhanced mobile sizing */}
                  <div className={`relative flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-105 group-active:scale-95'} transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${
                      isActive 
                        ? 'text-primary' 
                        : section.color === 'blue' ? 'text-blue-500 dark:text-blue-400' :
                          section.color === 'primary' ? 'text-primary' :
                          section.color === 'purple' ? 'text-purple-500 dark:text-purple-400' :
                          section.color === 'green' ? 'text-green-500 dark:text-green-400' :
                          'text-muted-foreground'
                    }`} />
                    
                    {/* Glow effect for active item */}
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-md -z-10 animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Compact text label for mobile */}
                  <span className={`text-xs font-medium text-center leading-tight transition-all duration-300 ${
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  }`}>
                    {section.title.split(' ')[0]}
                  </span>
                  
                  {/* Active pulse indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                  )}
                </button>
              )
            })}
          </div>
          
          {/* Mobile progress indicator */}
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center justify-center gap-2">
              {navigationSections.map((section) => (
                <div
                  key={section.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeSection === section.id 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Navigation - Right Side */}
      <div className={`fixed right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 hidden sm:block transition-all duration-500 ${
        isNavVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
      }`}>
        <div className="bg-card/95 dark:bg-card/90 backdrop-blur-xl border border-border/60 dark:border-border/40 rounded-2xl shadow-2xl shadow-primary/10 dark:shadow-primary/5 p-2">
          {/* Progress indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary rounded-l-2xl opacity-20"></div>
          
          {/* Navigation items */}
          <div className="space-y-2">
            {navigationSections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`group relative flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary/20 dark:bg-primary/10 text-primary shadow-lg shadow-primary/20' 
                      : 'hover:bg-secondary/50 dark:hover:bg-secondary/30 text-muted-foreground hover:text-foreground'
                  }`}
                  title={section.title}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 sm:h-5 md:h-6 bg-gradient-to-b from-primary to-accent rounded-r-full"></div>
                  )}
                  
                  {/* Icon with responsive sizing */}
                  <div className={`relative flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform duration-300`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      isActive 
                        ? 'text-primary' 
                        : section.color === 'blue' ? 'text-blue-500 dark:text-blue-400' :
                          section.color === 'primary' ? 'text-primary' :
                          section.color === 'purple' ? 'text-purple-500 dark:text-purple-400' :
                          section.color === 'green' ? 'text-green-500 dark:text-green-400' :
                          'text-muted-foreground'
                    }`} />
                    
                    {/* Glow effect for active item */}
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-md -z-10 animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Text label - responsive visibility */}
                  <span className={`hidden md:block lg:block text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive ? 'text-primary' : 'group-hover:text-foreground'
                  }`}>
                    {section.title}
                  </span>
                  
                  {/* Tablet tooltip */}
                  <div className="md:hidden absolute right-full mr-2 sm:mr-3 top-1/2 -translate-y-1/2 px-2 sm:px-3 py-1.5 sm:py-2 bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap text-xs sm:text-sm font-medium z-10">
                    {section.title}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-l-4 border-l-card/95 border-y-4 border-y-transparent"></div>
                  </div>
                  
                  {/* Progress dots - desktop only */}
                  <div className="hidden lg:flex items-center gap-1 ml-auto">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                          isActive 
                            ? 'bg-primary animate-pulse' 
                            : 'bg-muted-foreground/30'
                        }`}
                        style={{ 
                          animationDelay: `${i * 200}ms`,
                          animationDuration: '1.5s'
                        }}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
          
          {/* Decorative gradient line */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/30">
            <div className="h-0.5 sm:h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </>
  )

  const FAQSection = ({ section, sectionKey }: { section: FAQSection; sectionKey: string }) => (
    <div className="mb-16">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
          <section.icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            {section.title}
          </h2>
          <p className="text-muted-foreground mt-1">
            {section.description}
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {section.items.map((item, index) => (
          <AccordionItem 
            key={index} 
            item={item} 
            sectionKey={sectionKey} 
            index={index} 
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Floating Navigation */}
      <FloatingNavigation />
      
      <main className="pt-20 sm:pt-24 pb-20 sm:pb-8">
        {/* Hero Section */}
        <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-l from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollAnimation animation="fadeIn" duration={0.8}>
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-8">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span className="text-primary font-semibold">Help Center</span>
                </div>
                
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Help Center
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  Find answers to common questions, learn how Ishq Gems works, and get support 
                  with buying or selling gemstones. Our comprehensive guide covers everything 
                  you need to know.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <ScrollAnimation animation="slideUp" delay={0.1} duration={0.8}>
              <div id="buyers">
                <FAQSection section={buyerFAQs} sectionKey="buyer" />
              </div>
            </ScrollAnimation>
            <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
              <div id="sellers">
                <FAQSection section={sellerFAQs} sectionKey="seller" />
              </div>
            </ScrollAnimation>
            <ScrollAnimation animation="slideUp" delay={0.3} duration={0.8}>
              <div id="platform">
                <FAQSection section={platformGuides} sectionKey="platform" />
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Contact Support Section */}
        <section id="support" className="py-16 sm:py-20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-y border-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <ScrollAnimation animation="fadeIn" delay={0.1} duration={0.8}>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-card border border-primary/20 rounded-full mb-8">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="text-primary font-semibold">Need More Help?</span>
                </div>
                
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Still Have Questions?
                </h2>
                
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                  Our expert support team is here to help you with any questions about buying, 
                  selling, or using the Ishq Gems platform.
                </p>
              </ScrollAnimation>
              
              <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
                      <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get detailed help via email
                    </p>
                    <a 
                      href={`mailto:${companyInfo.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium text-sm"
                    >
                      {companyInfo.email}
                    </a>
                  </div>
                  
                  <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
                      <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Phone Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Speak with our experts directly
                    </p>
                    <a 
                      href={`tel:${companyInfo.phone}`}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors font-medium text-sm"
                    >
                      {companyInfo.phone}
                    </a>
                  </div>
                  
                  <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Contact Form</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send us a detailed message
                    </p>
                    <Link 
                      href="/contact"
                      className="text-primary hover:text-accent transition-colors font-medium text-sm"
                    >
                      Contact Page →
                    </Link>
                  </div>
                </div>
              </ScrollAnimation>
              
              <ScrollAnimation animation="scaleIn" delay={0.3} duration={0.8}>
                <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <h3 className="font-semibold text-red-900 dark:text-red-100">Emergency Support</h3>
                  </div>
                  <p className="text-red-800 dark:text-red-200 mb-4">
                    For urgent issues related to high-value transactions, shipping problems, 
                    or suspected fraud, call our 24/7 emergency line:
                  </p>
                  <a 
                    href={`tel:${companyInfo.phone}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Emergency: {companyInfo.phone}
                  </a>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
} 