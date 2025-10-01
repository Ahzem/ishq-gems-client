'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { companyInfo } from '@/lib/constants'

export default function CookiesPage() {
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
              Cookie Policy
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
              <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
              <p className="text-muted-foreground">
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                analyzing how you use our platform. This Cookie Policy explains how Ishq Gems uses cookies 
                and similar technologies on https://ishqgems.com.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">1. Types of Cookies We Use</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Essential Cookies</h3>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-muted-foreground mb-3">
                    These cookies are necessary for the basic functioning of our website and cannot be disabled.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li><strong>Authentication:</strong> Keep you logged in during your session</li>
                    <li><strong>Session Management:</strong> Maintain your shopping cart contents</li>
                    <li><strong>Security:</strong> Protect against fraud and ensure platform security</li>
                    <li><strong>Load Balancing:</strong> Distribute server load for optimal performance</li>
                    <li><strong>CSRF Protection:</strong> Prevent cross-site request forgery attacks</li>
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Functional Cookies</h3>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-muted-foreground mb-3">
                    These cookies enhance your experience by remembering your preferences and settings.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li><strong>Language Settings:</strong> Remember your preferred language</li>
                    <li><strong>Theme Preferences:</strong> Save your dark/light mode choice</li>
                    <li><strong>Currency Selection:</strong> Remember your preferred currency</li>
                    <li><strong>Wishlist:</strong> Save your favorite items</li>
                    <li><strong>Recently Viewed:</strong> Track items you&apos;ve browsed</li>
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Analytics Cookies</h3>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-muted-foreground mb-3">
                    These cookies help us understand how visitors interact with our website.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li><strong>Google Analytics:</strong> Track website usage and performance</li>
                    <li><strong>User Behavior:</strong> Understand how you navigate our site</li>
                    <li><strong>Performance Metrics:</strong> Monitor page load times and errors</li>
                    <li><strong>Conversion Tracking:</strong> Measure success of our marketing efforts</li>
                    <li><strong>A/B Testing:</strong> Test different versions of our pages</li>
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Marketing Cookies</h3>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-muted-foreground mb-3">
                    These cookies are used to deliver personalized advertisements and track marketing campaigns.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li><strong>Advertising:</strong> Show you relevant ads based on your interests</li>
                    <li><strong>Retargeting:</strong> Display our ads on other websites you visit</li>
                    <li><strong>Social Media:</strong> Enable sharing and social media integration</li>
                    <li><strong>Email Marketing:</strong> Optimize email campaigns and newsletters</li>
                    <li><strong>Campaign Tracking:</strong> Measure effectiveness of marketing campaigns</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">2. Third-Party Cookies</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We work with trusted third-party services that may place cookies on your device:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h3 className="font-semibold mb-2">Google Services</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Google Analytics</li>
                      <li>• Google Ads</li>
                      <li>• Google Tag Manager</li>
                      <li>• reCAPTCHA</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h3 className="font-semibold mb-2">Payment Providers</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Stripe</li>
                      <li>• PayPal</li>
                      <li>• Credit Card Processors</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h3 className="font-semibold mb-2">Social Media</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Facebook Pixel</li>
                      <li>• Instagram</li>
                      <li>• Twitter</li>
                      <li>• YouTube</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h3 className="font-semibold mb-2">Support & Communication</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Live Chat Services</li>
                      <li>• Email Marketing Tools</li>
                      <li>• Customer Support Platforms</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">3. Cookie Duration</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Cookies have different lifespans depending on their purpose:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h3 className="font-semibold mb-2">Session Cookies</h3>
                    <p className="text-sm">Expire when you close your browser</p>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Shopping cart contents</li>
                      <li>• Login sessions</li>
                      <li>• Form data</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <h3 className="font-semibold mb-2">Persistent Cookies</h3>
                    <p className="text-sm">Remain on your device for a set period</p>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Remember me: 30 days</li>
                      <li>• Preferences: 1 year</li>
                      <li>• Analytics: 2 years</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">4. Managing Your Cookie Preferences</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Cookie Consent Banner</h3>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-muted-foreground">
                    When you first visit our website, you&apos;ll see a cookie consent banner where you can:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mt-2">
                    <li>Accept all cookies</li>
                    <li>Reject non-essential cookies</li>
                    <li>Customize your preferences</li>
                    <li>Learn more about each cookie type</li>
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Browser Settings</h3>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-muted-foreground mb-3">
                    You can also manage cookies through your browser settings:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium mb-2">Chrome:</p>
                      <p className="text-sm">Settings → Privacy & Security → Site Settings → Cookies</p>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Firefox:</p>
                      <p className="text-sm">Settings → Privacy & Security → Cookies and Site Data</p>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Safari:</p>
                      <p className="text-sm">Preferences → Privacy → Manage Website Data</p>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Edge:</p>
                      <p className="text-sm">Settings → Cookies and site permissions → Cookies</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Opting Out of Analytics</h3>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-muted-foreground">
                    You can opt out of Google Analytics tracking by:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mt-2">
                    <li>Installing the Google Analytics Opt-out Browser Add-on</li>
                    <li>Adjusting your cookie preferences in our cookie banner</li>
                    <li>Enabling &quot;Do Not Track&quot; in your browser settings</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">5. Impact of Disabling Cookies</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Disabling certain cookies may affect your experience on our platform:</p>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Essential Cookies</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Disabling these will prevent basic functionality and you may not be able to use our platform properly.
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Functional Cookies</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You&apos;ll need to reset your preferences each time you visit, and some features may not work as expected.
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold mb-2 text-purple-800 dark:text-purple-200">Analytics Cookies</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    We won&apos;t be able to improve our platform based on usage data, but functionality won&apos;t be affected.
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold mb-2 text-green-800 dark:text-green-200">Marketing Cookies</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You&apos;ll see less relevant advertisements and may receive duplicate marketing messages.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-primary">6. Contact Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>If you have questions about our use of cookies, please contact us:</p>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p><strong>{companyInfo.fullName}</strong></p>
                  <p>Email: {companyInfo.email}</p>
                  <p>Phone: {companyInfo.phone}</p>
                  <p>Address: {companyInfo.address}</p>
                </div>
              </div>
            </section>

            <div className="bg-accent/10 p-6 rounded-lg border border-accent/20 mt-12">
              <h3 className="text-xl font-semibold mb-3">Updates to This Cookie Policy</h3>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting a notice on our website or sending you an email notification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 