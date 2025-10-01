'use client'

import { FileText, Search, Video, UserCheck, Shield, CheckCircle, Clock } from 'lucide-react'
import { companyInfo } from '@/lib/constants'
import ScrollAnimation from '@/components/animations/ScrollAnimation'

export default function VerificationProcess() {
  const verificationSteps = [
    {
      icon: FileText,
      step: '01',
      title: 'Submit Application',
      description: 'Complete the seller application form with all required documents and information.',
      duration: 'Immediate',
      color: 'text-blue-500'
    },
    {
      icon: Search,
      step: '02', 
      title: 'Document Review',
      description: 'Our team reviews your documents, background, and verifies your NGJA license.',
      duration: '1-2 business days',
      color: 'text-orange-500'
    },
    {
      icon: Video,
      step: '03',
      title: 'Video Call Interview',
      description: 'Schedule a face-to-face verification call with our gemologist team.',
      duration: '30-45 minutes',
      color: 'text-purple-500'
    },
    {
      icon: UserCheck,
      step: '04',
      title: 'Account Creation',
      description: 'Seller account created with login access and listing tools provided.',
      duration: 'Same day',
      color: 'text-green-500'
    }
  ]

  const compliancePoints = [
    {
      icon: Shield,
      title: 'NGJA Export Compliance',
      description: 'All listings must follow NGJA export documentation and compliance rules for international shipping.'
    },
    {
      icon: CheckCircle,
      title: 'No Anonymous Sellers',
      description: 'We do not allow anonymous or unverified sellers. All listings are connected to real, legally registered sellers.'
    },
    {
      icon: Clock,
      title: 'Ongoing Monitoring',
      description: 'Continuous monitoring of seller activity and compliance with platform standards and regulations.'
    }
  ]

  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-secondary/10 via-background to-secondary/10">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-l from-accent/2 to-primary/2 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
        <div className="text-center mb-16 luxury-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-8">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Trust & Verification</span>
          </div>
          
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Our Seller{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Verification
            </span>
            {' '}Process
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We maintain the highest standards of trust and authenticity through our comprehensive verification process.
          </p>
        </div>
        </ScrollAnimation>
        {/* Verification Steps */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {verificationSteps.map((step, index) => (
              <div 
                key={index}
                className="group luxury-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl p-6 hover:border-primary/40 transition-all duration-700 hover:shadow-xl hover:shadow-primary/10 text-center">
                  
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold border-4 border-background">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-serif text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                    {step.description}
                  </p>

                  {/* Duration */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full">
                    <Clock className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      {step.duration}
                    </span>
                  </div>

                  {/* Decorative line */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Information */}
        <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
        <div className="max-w-6xl mx-auto luxury-fade-in">
          <div className="bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-3xl p-8 lg:p-12 hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10">
            
            <div className="text-center mb-10">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                Compliance & Standards
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Our verification process ensures all sellers meet legal requirements and maintain the highest ethical standards.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {compliancePoints.map((point, index) => (
                <div 
                  key={index}
                  className="group text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <point.icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h4 className="font-serif text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {point.title}
                  </h4>
                  
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Important Notice */}
            <div className="mt-10 p-6 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Important Notice
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We do not allow anonymous or unverified sellers. All listings are connected to real, legally registered sellers 
                    and follow NGJA export compliance rules. This ensures the authenticity and legal integrity of every transaction 
                    on our platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        </div>
        </ScrollAnimation>
        {/* Contact Information */}
        <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
        <div className="mt-16 text-center luxury-fade-in">
          <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h4 className="font-serif text-xl font-bold text-foreground mb-4">
              Questions About the Process?
            </h4>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Our team is here to help guide you through the verification process. Contact us if you have any questions 
              or need assistance with your application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={`mailto:${companyInfo.email}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                <FileText className="w-4 h-4" />
                Email: {companyInfo.email}
              </a>
              <a 
                href={`tel:${companyInfo.phone}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-primary text-primary-foreground font-medium rounded-full hover:shadow-lg hover:shadow-accent/25 transition-all duration-300"
              >
                <Video className="w-4 h-4" />
                Call: {companyInfo.phone}
              </a>
            </div>
          </div>
        </div>
        </ScrollAnimation>
        </div>
    </section>
  )
} 