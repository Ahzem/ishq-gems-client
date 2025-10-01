import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SellerForm from '@/components/forms/SellerForm'
import VerificationProcess from '@/components/sections/VerificationProcess'
import { UserPlus, Award, Globe, Shield } from 'lucide-react'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Become a Verified Seller | Ishq Gems',
  description: 'Join our network of trusted gem sellers. Apply to become a verified seller on Ishq Gems - the luxury gemstone marketplace trusted by global buyers.',
  keywords: 'become gem seller, NGJA licensed seller, verified gemstone dealer, luxury gem marketplace, Sri Lankan gems',
})

export default function SellPage() {
  const benefits = [
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Access international buyers and collectors worldwide'
    },
    {
      icon: Award,
      title: 'Premium Audience',
      description: 'Connect with serious buyers seeking authentic luxury gems'
    },
    {
      icon: Shield,
      title: 'Compliance First',
      description: 'NGJA-compliant platform ensuring legal and ethical trading'
    }
  ]

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 md:pt-32">
        
        {/* Hero Section */}
        <section className="py-16 md:py-3 relative overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-l from-accent/3 to-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Header */}
            <ScrollAnimation animation="fadeIn" duration={0.8}>
            <div className="text-center mb-16 luxury-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-8">
                <UserPlus className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Join Our Network</span>
              </div>
              
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Become a Verified Seller on{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Ishq Gems
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
                We only accept trusted sellers who meet our quality and ethical sourcing standards.
                Submit your details below — our team will personally review and contact you for verification.
              </p>

              {/* Why Sell With Us */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
                <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-4">
                  Why Sell with Ishq Gems?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Join a luxury gem marketplace trusted by global buyers. Reach new markets, build your reputation, 
                  and sell with confidence. Every seller goes through our strict onboarding and compliance process.
                </p>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </ScrollAnimation>
            {/* Application Form */}
            <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
              <div className="max-w-4xl mx-auto mb-16 luxury-fade-in">
                <SellerForm />
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Verification Process Section */}
        <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
          <VerificationProcess />
        </ScrollAnimation>
        
      </main>
      <Footer />
    </div>
  )
} 