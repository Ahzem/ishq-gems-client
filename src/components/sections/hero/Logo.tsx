'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Sparkles, Diamond } from 'lucide-react'
import CursorReactive from '@/components/common/CursorReactive'

export default function Logo() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 max-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-l from-accent/3 to-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Main Logo Container */}
          <CursorReactive
            className="group relative inline-block"
            enableTilt={true}
            maxRotation={12}
            enableScale={true}
            scaleAmount={1.05}
            transitionDuration="0.6s"
          >
            <div 
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Logo Image */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
                <Image
                  src="/images/logo/ishq-gems.png"
                  alt="Ishq Gems - Premium Luxury Gemstones"
                  width={600}
                  height={600}
                  className={`w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl transition-all duration-700 ease-in-out ${
                    isHovered 
                      ? 'drop-shadow-2xl' 
                      : 'grayscale brightness-75 contrast-75 drop-shadow-lg'
                  }`}
                  priority
                />
                
     
                
                {/* Sparkle Effects on Hover */}
                <div className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                  <Sparkles className="absolute top-2 sm:top-4 right-2 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-accent animate-sparkle-1" />
                  <Sparkles className="absolute top-1/3 left-4 sm:left-6 lg:left-8 w-3 h-3 sm:w-4 sm:h-4 text-primary animate-sparkle-2" />
                  <Diamond className="absolute bottom-4 sm:bottom-6 lg:bottom-8 right-1/4 w-4 h-4 sm:w-5 sm:h-5 text-accent animate-sparkle-3" />
                  <Sparkles className="absolute bottom-1/4 left-6 sm:left-8 lg:left-12 w-2 h-2 sm:w-3 sm:h-3 text-primary animate-sparkle-4" />
                </div>
              </div>
            </div>
          </CursorReactive>

          {/* Brand Text */}
          <div className="mt-6 sm:mt-8 lg:mt-12 space-y-3 sm:space-y-4 px-2">
            <p className={`text-sm sm:text-base lg:text-lg xl:text-xl transition-all duration-500 ${
              isHovered 
                ? 'text-foreground' 
                : 'text-muted-foreground/70'
            }`}>
              Where Passion Meets Perfection
            </p>

            {/* Animated Tagline */}
            <div className={`transition-all duration-700 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-primary/80">
                <Diamond className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Premium Luxury Collection</span>
                <Diamond className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse-slow opacity-60"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse-slow opacity-60" style={{ animationDelay: '1s' }}></div>
    </section>
  )
}
