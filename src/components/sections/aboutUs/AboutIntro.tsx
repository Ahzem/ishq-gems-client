'use client'

import { Users, Code, Gem } from 'lucide-react'
import FounderCard from './FounderCard'
import { companyInfo } from '@/lib/constants'

export default function AboutIntro() {
  const founders = [
    {
      name: 'Muhammadh Ahzem',
      role: 'Co-Founder, Director of Technology',
      bio: 'A passionate software engineer and entrepreneur, Ahzem leads Ishq Gems\' digital innovation, bridging Sri Lanka\'s gem legacy with the global market through cutting-edge technology.',
      image: '/images/owners/Ahzem.jpg',
      skills: ['Full-Stack Development', 'AI & Machine Learning', 'Digital Innovation', 'E-commerce'],
      icon: Code,
      certifications: ['Software Engineer', '1+ Years Experience']
    },
    {
      name: 'Hamis Muhammadh',
      role: 'Co-Founder, Certified Gemologist',
      bio: 'A trained gemologist with deep industry roots, Hamis brings over 5 years of hands-on gem valuation and sourcing experience. He ensures every listing meets strict authenticity standards.',
      image: '/images/owners/Hamis.PNG',
      skills: ['Gem Identification', 'Quality Assessment', 'Sourcing Networks', 'Certification Standards'],
      icon: Gem,
      certifications: ['GIA Certified', 'NGJA Member', '5+ Years Experience']
    }
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[250px] sm:w-[400px] md:w-[600px] h-[250px] sm:h-[400px] md:h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[200px] sm:w-[300px] md:w-[500px] h-[200px] sm:h-[300px] md:h-[500px] bg-gradient-to-l from-accent/3 to-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 luxury-fade-in">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-6 sm:mb-8">
            <Users className="w-3 sm:w-4 h-3 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary">Meet the Team</span>
          </div>
          
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            Meet the Founders of{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {companyInfo.name}
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
            Driven by technology. Backed by gemological expertise.
          </p>
        </div>

        {/* Founders Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
          {founders.map((founder, index) => (
            <FounderCard 
              key={founder.name}
              founder={founder}
              index={index}
            />
          ))}
        </div>

        {/* Company Stats */}
        <div className="mt-12 sm:mt-16 lg:mt-20 pt-12 sm:pt-16 border-t border-border/30 luxury-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto text-center">
            <div className="px-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 sm:mb-2">
                2024
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm md:text-base">Founded</div>
            </div>
            <div className="px-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 sm:mb-2">
                100+
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm md:text-base">Verified Sellers</div>
            </div>
            <div className="px-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 sm:mb-2">
                5K+
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm md:text-base">Gems Listed</div>
            </div>
            <div className="px-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 sm:mb-2">
                25+
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm md:text-base">Countries Served</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 