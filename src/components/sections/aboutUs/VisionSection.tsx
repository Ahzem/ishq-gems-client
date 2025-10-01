'use client'

import { Target, Eye, Zap, Globe, Shield, Brain } from 'lucide-react'

export default function VisionSection() {
  const missionPoints = [
    {
      icon: Globe,
      title: 'Global Market Access',
      description: 'Provide global market access to verified Sri Lankan gem sellers, connecting local expertise with international buyers.'
    },
    {
      icon: Shield,
      title: 'Trust & Certification',
      description: 'Deliver trust, certification, and clarity to every buyer through rigorous verification and transparent processes.'
    },
    {
      icon: Brain,
      title: 'Innovation Leadership',
      description: 'Innovate with AI, blockchain provenance, and AR-based inspections to revolutionize gem trading.'
    }
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-secondary/10 via-background to-secondary/10">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-[300px] sm:w-[500px] md:w-[700px] h-[300px] sm:h-[500px] md:h-[700px] bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-[250px] sm:w-[400px] md:w-[600px] h-[250px] sm:h-[400px] md:h-[600px] bg-gradient-to-l from-accent/2 to-primary/2 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 luxury-fade-in">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-6 sm:mb-8">
            <Target className="w-3 sm:w-4 h-3 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary">Our Purpose</span>
          </div>
          
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            Bringing Sri Lanka&apos;s{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Gem Heritage
            </span>
            <br />
            to the World
          </h2>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Vision Section */}
          <div className="mb-16 sm:mb-20 luxury-fade-in">
            <div className="bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6 text-center sm:text-left">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  Our Vision
                </h3>
              </div>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed text-center sm:text-left">
                To digitize and globalize Sri Lanka&apos;s gem trade with full transparency and authenticity, 
                creating a trusted marketplace where heritage meets innovation, and where every gem&apos;s journey 
                from mine to market is clear, verified, and accessible to collectors worldwide.
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="luxury-fade-in">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Our Mission
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                We are committed to revolutionizing the gem industry through three core pillars
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {missionPoints.map((point, index) => (
                <div 
                  key={index}
                  className="group luxury-slide-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-primary/40 transition-all duration-700 hover:shadow-xl hover:shadow-primary/10 text-center h-full">
                    
                    {/* Icon */}
                    <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <point.icon className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                    </div>
                    
                    {/* Content */}
                    <h4 className="font-serif text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">
                      {point.title}
                    </h4>
                    
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>

                    {/* Decorative line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Innovation Highlight */}
          <div className="mt-16 sm:mt-20 luxury-fade-in">
            <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4 sm:mb-6">
                <Zap className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  Innovation at Our Core
                </h3>
              </div>
              
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
                We leverage cutting-edge technology including artificial intelligence for gem identification, 
                blockchain for provenance tracking, and augmented reality for virtual inspections. Our platform 
                represents the future of gem trading - transparent, secure, and globally accessible.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
                <div className="text-center px-2">
                  <div className="text-xl sm:text-2xl font-bold text-primary mb-1">AI</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Gem Analysis</div>
                </div>
                <div className="text-center px-2">
                  <div className="text-xl sm:text-2xl font-bold text-primary mb-1">AR</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Virtual Inspection</div>
                </div>
                <div className="text-center px-2">
                  <div className="text-xl sm:text-2xl font-bold text-primary mb-1">Blockchain</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Provenance Tracking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 