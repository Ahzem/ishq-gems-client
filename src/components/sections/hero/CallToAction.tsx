'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Star, Diamond } from 'lucide-react'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import CursorReactive from '@/components/common/CursorReactive'

export default function CallToAction() {

  return (
    <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden bg-gradient-to-br from-secondary/10 via-background to-secondary/10">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-l from-accent/3 to-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimation animation="fadeIn" duration={0.8}>
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16 xl:mb-20 luxury-fade-in px-2">
              <CursorReactive
                enableTilt={true}
                maxRotation={6}
                enableScale={true}
                scaleAmount={1.05}
                transitionDuration="0.3s"
              >
                <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3 sm:mb-4">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-accent mr-1.5 sm:mr-2" />
                  <span className="text-primary/90 text-xs sm:text-sm font-medium">Exclusive Collection Awaits</span>
                </div>
              </CursorReactive>
              
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 px-2">
                Ready to Find Your <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Perfect Gem?</span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                Join thousands of collectors who trust Ishq Gems for their most precious investments. 
                Start your journey with our curated selection of the world&apos;s finest gemstones.
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center mb-8 sm:mb-12 lg:mb-16 px-2">
              <CursorReactive
                enableTilt={true}
                maxRotation={12}
                enableScale={true}
                scaleAmount={1.0}
                transitionDuration="0.3s"
              >
                <Link 
                  href="/marketplace"
                  className="group bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center"
                >
                  <Diamond className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </CursorReactive>
              
              <CursorReactive
                enableTilt={true}
                maxRotation={12}
                enableScale={true}
                scaleAmount={1.0}
                transitionDuration="0.3s"
              >
                <Link 
                  href="/seller-setup"
                  className="group bg-secondary/50 backdrop-blur-sm text-foreground border border-border/50 hover:border-primary/50 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 flex items-center gap-2 sm:gap-3 hover:bg-secondary/70 w-full sm:w-auto justify-center"
                >
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110" />
                  <span>Become a Seller</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </CursorReactive>
            </div>
          </ScrollAnimation>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse-slow opacity-60"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse-slow opacity-60" style={{ animationDelay: '1s' }}></div>
    </section>
  )
}
