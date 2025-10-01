'use client'

import { Check, X, Trophy, Users } from 'lucide-react'

export default function ComparisonTable() {
  const comparisonData = [
    {
      feature: 'Verified Local Sellers',
      ishq: 'Personal onboarding with gemologist verification',
      competitors: 'Open to unknown dealers',
      ishqAdvantage: true
    },
    {
      feature: 'Sri Lankan Expertise',
      ishq: 'On-ground gemologist team with local knowledge',
      competitors: 'Global-only staff without local expertise',
      ishqAdvantage: true
    },
    {
      feature: 'User Experience',
      ishq: 'Clean UI + WhatsApp chat support',
      competitors: 'Overwhelming tools and complex interfaces',
      ishqAdvantage: true
    },
    {
      feature: 'Transparency',
      ishq: 'Public seller info + detailed lab reports',
      competitors: 'Limited seller details and documentation',
      ishqAdvantage: true
    },
    {
      feature: 'Personal Connection',
      ishq: 'Built by founders you can see and contact',
      competitors: 'Anonymous corporate structure',
      ishqAdvantage: true
    },
    {
      feature: 'Pricing Model',
      ishq: 'Fair commission with no hidden fees',
      competitors: 'Complex fee structures',
      ishqAdvantage: true
    }
  ]

  const competitors = ['GemSelect', 'Nivoda', 'RapNet', 'Others']

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background via-secondary/5 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-[300px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[600px] md:h-[800px] bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 luxury-fade-in">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-6 sm:mb-8">
            <Trophy className="w-3 sm:w-4 h-3 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary">Competitive Advantage</span>
          </div>
          
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            How{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ishq Gems
            </span>
            <br />
            Challenges the Giants
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            We&apos;re not just another marketplace. We&apos;re redefining how gems are bought and sold globally.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-7xl mx-auto luxury-fade-in">
          
          {/* Mobile Header */}
          <div className="block md:hidden text-center mb-8">
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">
              Feature Comparison
            </h3>
            <p className="text-muted-foreground text-sm">
              See what sets us apart
            </p>
          </div>

          {/* Desktop Version */}
          <div className="hidden md:block bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-3xl overflow-hidden">
            
            {/* Table Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-8 border-b border-border/30">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-left">
                  <h3 className="font-serif text-xl lg:text-2xl font-bold text-foreground mb-2">
                    Feature Comparison
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    See what sets us apart
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-full text-primary-foreground font-bold">
                    <Trophy className="w-4 h-4" />
                    Ishq Gems
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full text-muted-foreground">
                    <Users className="w-4 h-4" />
                    Competitors
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Table Body */}
            <div className="divide-y divide-border/30">
              {comparisonData.map((row, index) => (
                <div 
                  key={index}
                  className="px-6 py-6 hover:bg-secondary/20 transition-colors duration-300"
                >
                  <div className="grid grid-cols-3 gap-4 items-start">
                    {/* Feature Name */}
                    <div className="py-2">
                      <h4 className="font-semibold text-foreground text-base lg:text-lg mb-1">
                        {row.feature}
                      </h4>
                    </div>
                    
                    {/* Ishq Gems */}
                    <div className="py-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-foreground text-sm lg:text-base leading-relaxed">
                          {row.ishq}
                        </p>
                      </div>
                    </div>
                    
                    {/* Competitors */}
                    <div className="py-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                          <X className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">
                          {row.competitors}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Summary */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-8 border-t border-border/30">
              <div className="text-center">
                <h4 className="font-serif text-xl font-bold text-foreground mb-2">
                  The Ishq Gems Advantage
                </h4>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm lg:text-base">
                  While others focus on volume, we focus on value. Our platform combines cutting-edge technology 
                  with deep gemological expertise and personal relationships that span generations in the Sri Lankan gem industry.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Version - Card Layout */}
          <div className="block md:hidden space-y-4">
            {comparisonData.map((row, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl p-4 sm:p-6"
              >
                <h4 className="font-serif text-lg font-bold text-foreground mb-4 text-center">
                  {row.feature}
                </h4>
                
                {/* Ishq Gems */}
                <div className="mb-4 p-3 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-200/30 dark:border-green-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-primary-foreground text-xs font-bold">
                      <Trophy className="w-3 h-3" />
                      Ishq Gems
                    </div>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed">
                    {row.ishq}
                  </p>
                </div>
                
                {/* Competitors */}
                <div className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200/30 dark:border-red-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary border border-border rounded-full text-muted-foreground text-xs">
                      <Users className="w-3 h-3" />
                      Competitors
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {row.competitors}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Mobile Bottom Summary */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-4 sm:p-6 mt-6">
              <div className="text-center">
                <h4 className="font-serif text-lg font-bold text-foreground mb-3">
                  The Ishq Gems Advantage
                </h4>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  While others focus on volume, we focus on value. Our platform combines cutting-edge technology 
                  with deep gemological expertise and personal relationships that span generations in the Sri Lankan gem industry.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Logos/Names */}
        <div className="mt-12 sm:mt-16 text-center luxury-fade-in">
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            Compared against leading platforms:
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-8">
            {competitors.map((competitor) => (
              <div 
                key={competitor}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary/50 border border-border/30 rounded-lg sm:rounded-xl text-muted-foreground text-xs sm:text-sm font-medium"
              >
                {competitor}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 