import Link from 'next/link'
import { Crown, Heart, Star, ArrowRight } from 'lucide-react'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import CursorReactive, { ParallaxBackground } from '@/components/common/CursorReactive'

export default function About() {
  const features = [
    {
      icon: Crown,
      title: "Premium Quality",
      description: "Each piece is carefully selected and crafted with the finest materials and attention to detail."
    },
    {
      icon: Heart,
      title: "Passionate Craftsmanship",
      description: "Our master artisans pour their heart and soul into every creation, ensuring unique beauty."
    },
    {
      icon: Star,
      title: "Timeless Elegance",
      description: "Classic designs that transcend trends, creating heirloom pieces for generations."
    }
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden bg-gradient-to-br from-secondary/10 via-background to-secondary/10">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <ParallaxBackground strength={0.4}>
          <div className="absolute top-1/4 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
        </ParallaxBackground>
        <ParallaxBackground strength={-0.3}>
          <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-l from-accent/3 to-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </ParallaxBackground>
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <ScrollAnimation animation="fadeIn" duration={0.8}>
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 xl:mb-20 luxury-fade-in">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 px-2">
              About <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Ishq Gems</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              For over two decades, Ishq Gems has been synonymous with luxury, authenticity, and unparalleled craftsmanship. 
              We believe that every gem tells a story, and every piece of jewelry should be a testament to life&apos;s most precious moments.
            </p>
          </div>
          </ScrollAnimation>

          {/* Features Grid */}
          <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16 px-2">
            {features.map((feature, index) => (
              <CursorReactive
                key={index}
                className="group text-center p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 luxury-slide-up touch-manipulation"
                enableTilt={true}
                maxRotation={5}
                enableScale={true}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary" />
                </div>
                <h3 className="font-serif text-base sm:text-lg lg:text-xl font-semibold text-foreground mb-2 sm:mb-3 lg:mb-4 group-hover:text-primary transition-colors duration-300 px-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed px-2">
                  {feature.description}
                </p>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </CursorReactive>
              ))}
            </div>
          </ScrollAnimation>

          {/* Story Section */}
          <ScrollAnimation animation="slideUp" delay={0.1} duration={0.8}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center px-2">
            <div className="luxury-slide-up">
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6 px-2">
                Our Legacy of Excellence
              </h3>
              <p className="text-muted-foreground mb-3 sm:mb-4 lg:mb-6 leading-relaxed text-xs sm:text-sm lg:text-base px-2">
                Founded in 1999, Ishq Gems began as a small family business with a simple mission: to make luxury jewelry accessible 
                to those who appreciate true craftsmanship. What started as a passion project has grown into a trusted name in the 
                luxury jewelry industry.
              </p>
              <p className="text-muted-foreground mb-4 sm:mb-6 lg:mb-8 leading-relaxed text-xs sm:text-sm lg:text-base px-2">
                Today, we continue to honor our heritage while embracing innovation, offering both classic designs and contemporary 
                pieces that reflect the evolving tastes of our discerning clientele.
              </p>
              <CursorReactive
                enableTilt={true}
                maxRotation={3}
                enableScale={true}
                className="inline-block"
              >
                <Link 
                  href="/explore"
                  className="group inline-flex items-center px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm sm:text-base font-semibold rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform active:scale-95"
                >
                  Start Exploring
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </CursorReactive>
            </div>
            
            <CursorReactive
              className="relative luxury-fade-in"
              enableTilt={true}
              maxRotation={4}
              enableScale={true}
              scaleAmount={1.0}
            >
              <div className="aspect-square rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden border border-border/50">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-110"
                  style={{
                    backgroundImage: `url('https://img.freepik.com/premium-photo/golden-shimmer-pattern-many-yellow-rhinestones_1022901-9711.jpg')`
                  }}
                />
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-2xl opacity-60"></div>
              <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-2xl opacity-40"></div>
            </CursorReactive>
          </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
} 