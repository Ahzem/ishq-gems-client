'use client'

import { Shield, Award, FileCheck, Users, CheckCircle } from 'lucide-react'

export default function TrustLogos() {
  const certifications = [
    {
      name: 'NGJA',
      fullName: 'National Gem & Jewellery Authority',
      description: 'Official Sri Lankan gem certification body',
      icon: Shield,
      verified: true
    },
    {
      name: 'GIA',
      fullName: 'Gemological Institute of America',
      description: 'World-renowned gemological education and research',
      icon: Award,
      verified: true
    },
    {
      name: 'Gem Research Labs',
      fullName: 'Ceylon Gem Testing Laboratory',
      description: 'Local expertise in Sri Lankan gem identification',
      icon: FileCheck,
      verified: true
    }
  ]

  const compliancePoints = [
    {
      icon: Shield,
      title: 'NGJA Export Documentation',
      description: 'Every gem follows strict NGJA export documentation process for international shipping.'
    },
    {
      icon: FileCheck,
      title: 'Manual Review Process',
      description: 'All gems undergo rigorous manual review and authenticity verification before listing.'
    },
    {
      icon: CheckCircle,
      title: 'Certified Authenticity',
      description: 'Each listing includes detailed certification and lab reports for buyer confidence.'
    },
    {
      icon: Users,
      title: 'Ethical Sourcing',
      description: 'We work only with verified local miners and ethical sourcing practices.'
    }
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-secondary/10 via-background to-secondary/10">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-[300px] sm:w-[500px] md:w-[700px] h-[300px] sm:h-[500px] md:h-[700px] bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-[250px] sm:w-[400px] md:w-[600px] h-[250px] sm:h-[400px] md:h-[600px] bg-gradient-to-l from-accent/2 to-primary/2 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 luxury-fade-in">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-6 sm:mb-8">
            <Shield className="w-3 sm:w-4 h-3 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary">Trust & Compliance</span>
          </div>
          
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            Backed by{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Authority
            </span>
            {' '}& Ethics
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            We strictly follow the NGJA export documentation process. All gems listed go through 
            a strict manual review and authenticity check.
          </p>
        </div>

        {/* Certification Partners */}
        <div className="mb-16 sm:mb-20 luxury-fade-in">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Certification Partners
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Recognized by leading gemological institutions worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {certifications.map((cert, index) => (
              <div 
                key={cert.name}
                className="group luxury-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-primary/40 transition-all duration-700 hover:shadow-xl hover:shadow-primary/10 text-center">
                  
                  {/* Verified Badge */}
                  {cert.verified && (
                    <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 sm:w-8 h-6 sm:h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                    </div>
                  )}

                  {/* Icon */}
                  <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <cert.icon className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <h4 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">
                    {cert.name}
                  </h4>
                  
                  <h5 className="font-medium text-primary mb-3 sm:mb-4 text-xs sm:text-sm">
                    {cert.fullName}
                  </h5>
                  
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    {cert.description}
                  </p>

                  {/* Decorative line */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Process */}
        <div className="luxury-fade-in">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Our Compliance Process
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
              Every step is designed to ensure authenticity, quality, and legal compliance
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {compliancePoints.map((point, index) => (
              <div 
                key={index}
                className="group luxury-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-full bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/40 transition-all duration-700 hover:shadow-xl hover:shadow-primary/10 text-center">
                  
                  {/* Step Number */}
                  <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground text-xs sm:text-sm font-bold">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <point.icon className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <h4 className="font-semibold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300 text-sm sm:text-base">
                    {point.title}
                  </h4>
                  
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    {point.description}
                  </p>

                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Statement */}
        <div className="mt-16 sm:mt-20 text-center luxury-fade-in">
          <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Your Trust, Our Priority
              </h3>
            </div>
            
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6 px-2">
              Every gem on our platform comes with complete documentation, ethical sourcing verification, 
              and professional certification. We believe transparency builds trust, and trust builds lasting relationships.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div className="px-2">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">100%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Verified Listings</div>
              </div>
              <div className="px-2">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">NGJA</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Compliant Process</div>
              </div>
              <div className="px-2">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">24/7</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 