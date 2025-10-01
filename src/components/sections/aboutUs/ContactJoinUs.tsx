'use client'

import { Mail, MessageCircle, UserPlus, ArrowRight, Phone, MapPin } from 'lucide-react'
import { companyInfo } from '@/lib/constants'
import Button from '@/components/buttons/Button'

export default function ContactJoinUs() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background via-secondary/10 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-[300px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[600px] md:h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[250px] sm:w-[400px] md:w-[600px] h-[250px] sm:h-[400px] md:h-[600px] bg-gradient-to-l from-accent/3 to-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 luxury-fade-in">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-6 sm:mb-8">
            <MessageCircle className="w-3 sm:w-4 h-3 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary">Get In Touch</span>
          </div>
          
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            Want to work with us or join the{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ishq Gems
            </span>
            {' '}family?
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Whether you&apos;re interested in partnership opportunities, seller access, or just want to learn more about our mission, we&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact Options */}
        <div className="max-w-6xl mx-auto mb-12 sm:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            
            {/* General Contact */}
            <div className="group luxury-fade-in">
              <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 h-full">
                
                {/* Icon */}
                <div className="w-16 sm:w-20 h-16 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">
                  Contact Us
                </h3>
                
                <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                  Have questions about our platform, need support, or want to discuss partnership opportunities? 
                  We&apos;re here to help and would love to connect with you.
                </p>

                {/* Contact Info */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground break-all">{companyInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">{companyInfo.phone}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-foreground">{companyInfo.address}</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <Button 
                  href="/contact"
                  variant="primary"
                  shape="rounded"
                  size="lg"
                  rightIcon={<ArrowRight />}
                >
                  Get in Touch
                </Button>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>

            {/* Seller Access */}
            <div className="group luxury-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 h-full">
                
                {/* Icon */}
                <div className="w-16 sm:w-20 h-16 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">
                  Seller Access
                </h3>
                
                <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                  Are you a gemologist, dealer, or miner looking to reach a global audience? 
                  Apply for seller access and join our curated marketplace of verified professionals.
                </p>

                {/* Benefits List */}
                <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 text-xs sm:text-sm">
                  <li className="flex items-center gap-2.5">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-foreground">Personal onboarding process</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-foreground">Global market exposure</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-foreground">Professional listing tools</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-foreground">Dedicated support team</span>
                  </li>
                </ul>
                
                {/* CTA Button */}
                <Button 
                  href="/sell"
                  variant="primaryReverse"
                  shape="rounded"
                  size="lg"
                  rightIcon={<ArrowRight />}
                >
                  Request Seller Access
                </Button>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-accent to-primary opacity-60 rounded-full"></div>
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center luxury-fade-in">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
            <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4">
              Join Our Growing Community
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6 px-2">
              Be part of the future of gem trading. Whether you&apos;re buying, selling, or simply passionate about gemstones, 
              Ishq Gems offers a platform built on trust, expertise, and innovation.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div className="px-2">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Satisfied Customers</div>
              </div>
              <div className="px-2">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">100+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Verified Sellers</div>
              </div>
              <div className="px-2">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">25+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Countries Served</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 