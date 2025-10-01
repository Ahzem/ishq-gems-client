'use client'

import Link from 'next/link'
import { Gem, ArrowLeft, Diamond, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FormLayoutProps, GemDisplayItem } from '@/types'

export default function FormLayout({
  children,
  title,
  subtitle,
  className
}: FormLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Image */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group mb-8">
            <div className="relative">
              <Gem className="h-10 w-10 text-primary group-hover:text-accent transition-colors duration-300" />
              <div className="absolute inset-0 bg-primary/30 blur-lg group-hover:bg-accent/40 transition-all duration-300" />
            </div>
            <span className="font-serif text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ishq Gems
            </span>
          </Link>

          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-serif font-bold text-foreground leading-tight">
              Where Elegance
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Meets Excellence
              </span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              Discover the world&apos;s finest gemstones, carefully curated and authenticated 
              by our expert gemologists. Your journey into luxury begins here.
            </p>
          </div>

          {/* Gemstone Display */}
          <div className="relative group">
            <div className="grid grid-cols-3 gap-4 p-6 bg-card/20 border border-border/50 rounded-2xl backdrop-blur-sm">
              {([
                { name: 'Sapphire', icon: Diamond, color: 'text-blue-400' },
                { name: 'Ruby', icon: Gem, color: 'text-red-400' },
                { name: 'Emerald', icon: Zap, color: 'text-green-400' }
              ] as GemDisplayItem[]).map((gem) => (
                <div key={gem.name} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-card/50 rounded-xl border border-border/30 group-hover:scale-110 transition-transform duration-300">
                    <gem.icon className={cn('h-6 w-6', gem.color)} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {gem.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>GIA Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Secure Trading</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Global Shipping</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="relative">
                <Gem className="h-8 w-8 text-primary group-hover:text-accent transition-colors duration-300" />
                <div className="absolute inset-0 bg-primary/30 blur-md group-hover:bg-accent/40 transition-all duration-300" />
              </div>
              <span className="font-serif text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ishq Gems
              </span>
            </Link>
          </div>

          {/* Form Container */}
          <div className={cn(
            'relative p-8 bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl',
            'luxury-fade-in',
            className
          )}>
            {/* Decorative Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 rounded-2xl p-[1px]">
              <div className="h-full w-full bg-card/90 rounded-2xl" />
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Back to Home Button */}
              <div className="mb-6">
                <Link 
                  href="/" 
                  className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300 group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="text-sm font-medium">Back to Home</span>
                </Link>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-serif font-bold text-foreground mb-2">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Form Content */}
              {children}
            </div>

            {/* Subtle Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
} 