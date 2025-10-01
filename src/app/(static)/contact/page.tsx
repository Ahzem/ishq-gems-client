import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import ContactInfo from '@/components/sections/ContactInfo'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import { MessageCircle } from 'lucide-react'
import { companyInfo } from '@/lib/constants'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Contact Us - Get in Touch | Ishq Gems',
  description: 'Contact Ishq Gems for inquiries about luxury gemstones, seller verification, partnerships, or support. We\'re here to help you find the perfect gem.',
  keywords: 'contact Ishq Gems, gem inquiries, gemstone support, seller verification, luxury gems contact',
})

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20 sm:pt-24 md:pt-32">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[250px] sm:w-[400px] md:w-[600px] h-[250px] sm:h-[400px] md:h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[200px] sm:w-[300px] md:w-[500px] h-[200px] sm:h-[300px] md:h-[500px] bg-gradient-to-l from-accent/3 to-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollAnimation animation="fadeIn" duration={0.8}>
              <div className="text-center mb-12 sm:mb-16 luxury-fade-in">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-6 sm:mb-8">
                  <MessageCircle className="w-3 sm:w-4 h-3 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold text-primary">Get In Touch</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                  Get in{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Touch
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                  We&apos;re here to answer your questions and help you find the perfect gem.
                  Whether you&apos;re a collector, looking for something special, or interested in our services.
                </p>
              </div>
            </ScrollAnimation>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 max-w-7xl mx-auto">
              {/* Contact Form */}
              <ScrollAnimation animation="slideLeft" delay={0.2} duration={0.8}>
                <div className="luxury-fade-in order-2 lg:order-1">
                  <ContactForm />
                </div>
              </ScrollAnimation>

              {/* Contact Information */}
              <ScrollAnimation animation="slideRight" delay={0.3} duration={0.8}>
                <div className="luxury-fade-in order-1 lg:order-2" style={{ animationDelay: '200ms' }}>
                  <ContactInfo />
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-b from-secondary/10 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation animation="slideUp" delay={0.1} duration={0.8}>
              <div className="text-center mb-8 sm:mb-12 luxury-fade-in">
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                  Visit Our Location
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground px-4">
                  Located in {companyInfo.address} - the gem capital of the world
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="scaleIn" delay={0.2} duration={0.8}>
              <div className="max-w-4xl mx-auto luxury-fade-in">
                <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden">
                  {/* Map Placeholder - You can replace this with actual Google Maps embed */}
                  <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-border/30">
                    <div className="text-center px-4">
                      <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <svg className="w-6 sm:w-8 h-6 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground font-medium">Interactive Map</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{companyInfo.address}</p>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
} 