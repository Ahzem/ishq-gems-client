import Link from 'next/link'
import { Gem, Facebook, Instagram, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import { companyInfo, APP_CONFIG } from '@/lib/constants'
import Button from '@/components/buttons/Button'

export default function Footer() {
  const socialLinks = [
    { icon: Facebook, href: companyInfo.social.facebook, label: 'Facebook' },
    { icon: Instagram, href: companyInfo.social.instagram, label: 'Instagram' },
  ]

  const footerLinks = {
    'Quick Links': [
      { href: '/explore', label: 'Explore Collection' },
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/sell', label: 'Sell with Us' },
    ],
    'Customer Care': [
      { href: '/help', label: 'Help Center' },
      { href: '/shipping', label: 'Shipping Info' },
      { href: '/returns', label: 'Returns & Exchanges' },
      { href: '/sizing', label: 'Size Guide' },
    ],
    'Legal': [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/cookies', label: 'Cookie Policy' },
      { href: '/security', label: 'Security' },
    ]
  }

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        {/* Main Footer Content */}
        <div className="py-4 sm:py-8 lg:py-12 xl:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-4 lg:mb-6">
                <div className="relative">
                  <Gem className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-primary" />
                  <div className="absolute inset-0 bg-primary/20 blur-sm"></div>
                </div>
                <span className="font-serif text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {APP_CONFIG.name}
                </span>
              </Link>
              
              <p className="text-muted-foreground mb-2 sm:mb-4 lg:mb-6 leading-relaxed max-w-md text-sm sm:text-sm lg:text-base">
                {APP_CONFIG.description}. Discover the art of elegance with our exquisite collection of luxury gems and handcrafted jewelry. 
                Each piece tells a story of timeless beauty and unparalleled craftsmanship.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-1 sm:space-y-2 lg:space-y-3 mb-2 sm:mb-4 lg:mb-6">
                <a 
                  href={`mailto:${companyInfo.email}`}
                  className="flex items-center space-x-1.5 sm:space-x-3 text-muted-foreground hover:text-primary transition-colors duration-300 text-xs sm:text-sm"
                >
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="break-all">{companyInfo.email}</span>
                </a>
                <a 
                  href={`tel:${companyInfo.phone}`}
                  className="flex items-center space-x-1.5 sm:space-x-3 text-muted-foreground hover:text-primary transition-colors duration-300 text-xs sm:text-sm"
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span>{companyInfo.phone}</span>
                </a>
                <div className="flex items-center space-x-1.5 sm:space-x-3 text-muted-foreground text-xs sm:text-sm">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="leading-tight">{companyInfo.address}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-2 sm:space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 sm:p-2 rounded-full bg-secondary hover:bg-primary/20 transition-colors duration-300 group"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="min-w-0">
                <h3 className="font-semibold text-foreground mb-1.5 sm:mb-3 lg:mb-4 text-sm sm:text-base">{category}</h3>
                <ul className="space-y-0.5 sm:space-y-1.5 lg:space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm sm:text-sm leading-tight"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-3 sm:py-6 lg:py-8 border-t border-border">
          <div className="max-w-md mx-auto text-center px-1">
            <h3 className="font-serif text-base sm:text-lg lg:text-xl font-semibold text-foreground mb-1 sm:mb-2">
              Stay Updated
            </h3>
            <p className="text-muted-foreground mb-2 sm:mb-3 lg:mb-4 text-xs sm:text-sm leading-tight">
              Subscribe to receive exclusive offers and new collection updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-input border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 text-xs sm:text-sm"
              />
              <Button 
                variant="primary"
                shape="rounded"
                size="sm"
                className="text-xs sm:text-sm px-3 sm:px-6 py-1.5 sm:py-2.5"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-2 sm:py-4 lg:py-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm text-muted-foreground gap-1.5 sm:gap-3 px-1 sm:px-2">
            <div className="text-center md:text-left">
              <p className="text-xs sm:text-sm leading-tight">© 2024 {APP_CONFIG.name}. All rights reserved.</p>
              <p className="text-xs mt-0.5 sm:mt-1 leading-tight">
                Registered Company No: PV00335214 • 
                <Link
                  href="/docs/Certificate.pdf"
                  target="_blank"
                  className="ml-1 text-primary hover:text-accent transition-colors duration-300 inline-flex items-center gap-0.5 sm:gap-1"
                >
                  View Certificate
                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 lg:gap-4 xl:gap-6 mt-1 sm:mt-2 md:mt-0">
              <Link href="/terms" className="hover:text-primary transition-colors duration-300 text-xs sm:text-sm">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors duration-300 text-xs sm:text-sm">
                Privacy
              </Link>
              <Link href="/cookies" className="hover:text-primary transition-colors duration-300 text-xs sm:text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 