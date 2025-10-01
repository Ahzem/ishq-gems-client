'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import CursorReactive from '@/components/common/CursorReactive'

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30
      const y = (e.clientY / window.innerHeight - 0.5) * 30
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 ease-out"
          style={{
            backgroundImage: `url('https://img.freepik.com/premium-photo/close-up-gold-gemstones-black-background_900370-8992.jpg')`,
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.1)`
          }}
        />
        {/* Theme-aware overlays */}
        <div className="absolute inset-0 bg-background/70 dark:bg-background/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-background/50"></div>
      </div>

      {/* Background Effects - Theme Aware */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-primary/10 via-accent/8 to-primary/6 rounded-full blur-3xl animate-pulse opacity-80 dark:opacity-60"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-l from-accent/8 via-primary/6 to-accent/4 rounded-full blur-3xl animate-pulse opacity-80 dark:opacity-60" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 text-center mt-16 sm:mt-20">
        <div className="max-w-4xl mx-auto luxury-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card/90 dark:bg-card/80 backdrop-blur-sm border border-border/60 dark:border-border/40 mb-3 sm:mb-4 shadow-sm dark:shadow-lg">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-accent mr-1.5 sm:mr-2" />
            <span className="text-foreground/90 dark:text-foreground/95 text-xs sm:text-sm font-medium">Premium Luxury Collection</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2">
            Discover the
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Art of Elegance
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Exquisite gems and handcrafted jewelry that tell stories of timeless beauty, 
            passion, and unparalleled craftsmanship.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 px-2">
            <CursorReactive
              enableTilt={true}
              maxRotation={24}
              enableScale={true}
              scaleAmount={1.0}
              transitionDuration="0.3s"
            >
            <Link 
              href="/explore"
              className="group relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm sm:text-base font-semibold rounded-full hover:shadow-2xl hover:shadow-primary/30 dark:hover:shadow-primary/20 transition-all duration-300 transform w-full sm:w-auto justify-center ring-1 ring-primary/20 dark:ring-primary/30"
            >
              Start Exploring
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            </CursorReactive>

            <CursorReactive
              enableTilt={true}
              maxRotation={24}
              enableScale={true}
              scaleAmount={1.0}
              transitionDuration="0.3s"
            >
            <Link 
              href="/about"
              className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-border/60 dark:border-border/40 text-foreground bg-card/30 dark:bg-card/20 backdrop-blur-sm text-sm sm:text-base font-semibold rounded-full hover:bg-secondary/60 dark:hover:bg-secondary/40 hover:border-primary/60 dark:hover:border-primary/50 transition-all duration-300 w-full sm:w-auto justify-center shadow-sm dark:shadow-lg"
            >
              Our Story
            </Link>
            </CursorReactive>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border/40 dark:border-border/20 px-2">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-primary mb-1 sm:mb-2">10K+</div>
              <div className="text-muted-foreground text-xs sm:text-sm lg:text-base">Premium Pieces</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-primary mb-1 sm:mb-2">50+</div>
              <div className="text-muted-foreground text-xs sm:text-sm lg:text-base">Master Craftsmen</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-primary mb-1 sm:mb-2">25</div>
              <div className="text-muted-foreground text-xs sm:text-sm lg:text-base">Years Legacy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements - Theme Aware */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 rounded-full blur-xl animate-pulse-slow opacity-70 dark:opacity-50"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-accent/30 via-primary/20 to-accent/10 rounded-full blur-xl animate-pulse-slow opacity-70 dark:opacity-50" style={{ animationDelay: '1s' }}></div>
    </section>
  )
} 