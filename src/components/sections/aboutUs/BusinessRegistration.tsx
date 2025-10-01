'use client'

import { Shield, ExternalLink, FileText, Calendar, Building } from 'lucide-react'
import Link from 'next/link'

export default function BusinessRegistration() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-secondary/5 via-background to-secondary/5">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-[250px] sm:w-[400px] md:w-[600px] h-[250px] sm:h-[400px] md:h-[600px] bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-[200px] sm:w-[300px] md:w-[500px] h-[200px] sm:h-[300px] md:h-[500px] bg-gradient-to-l from-accent/2 to-primary/2 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 luxury-fade-in">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-4 sm:mb-6">
            <Shield className="w-3 sm:w-4 h-3 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary">Legal Compliance</span>
          </div>
          
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            Official Company{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Registration
            </span>
          </h2>
        </div>

        {/* Registration Details Card */}
        <div className="max-w-4xl mx-auto luxury-fade-in">
          <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10">
            
            {/* Registration Info */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Building className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
              </div>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 sm:mb-8">
                <strong className="text-foreground">ISHQ GEMS</strong> is officially registered as a Private Limited Company in Sri Lanka.
              </p>
            </div>

            {/* Registration Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              
              {/* Company Number */}
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl sm:rounded-2xl border border-primary/10 hover:border-primary/20 transition-all duration-300">
                <FileText className="w-6 sm:w-8 h-6 sm:h-8 text-primary mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Company Number</h3>
                <p className="text-lg sm:text-2xl font-serif font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  PV00335214
                </p>
              </div>

              {/* Registration Date */}
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl sm:rounded-2xl border border-primary/10 hover:border-primary/20 transition-all duration-300">
                <Calendar className="w-6 sm:w-8 h-6 sm:h-8 text-primary mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Registration Date</h3>
                <p className="text-base sm:text-lg font-semibold text-foreground">
                  18th July 2025
                </p>
              </div>

              {/* Legal Act */}
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl sm:rounded-2xl border border-primary/10 hover:border-primary/20 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-primary mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Registered Under</h3>
                <p className="text-xs sm:text-sm text-foreground font-medium">
                  Companies Act No. 7 of 2007
                </p>
              </div>
            </div>

            {/* Certificate Button */}
            <div className="text-center">
              <Link 
                href="/docs/Certificate.pdf"
                target="_blank"
                className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-full hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 transform hover:-translate-y-1 text-sm sm:text-base"
              >
                <FileText className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                View Certificate
                <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        </div>

        {/* Trust Statement */}
        <div className="mt-8 sm:mt-12 text-center luxury-fade-in">
          <div className="max-w-2xl mx-auto px-4">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              As a legally registered entity in Sri Lanka, ISHQ GEMS operates under full legal compliance 
              and regulatory oversight, ensuring transparent and trustworthy business operations for our 
              global customers and partners.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
