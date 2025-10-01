import Link from 'next/link'
import { ArrowLeft, Clock, Star } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description: string
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Decorative Element */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-6">
              <Clock className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl -z-10"></div>
          </div>

          {/* Content */}
          <div className="luxury-fade-in">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              {title}
            </h1>
            
            <div className="flex items-center justify-center space-x-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 text-primary fill-current"
                />
              ))}
            </div>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              {description}
            </p>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 mb-8">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                Something Beautiful is Coming
              </h2>
              <p className="text-muted-foreground mb-6">
                We&apos;re crafting an exceptional experience that matches the elegance of our jewelry collection. 
                Stay tuned for something truly special.
              </p>
              
              {/* Newsletter Signup */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email for updates"
                  className="flex-1 px-4 py-3 bg-input border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 whitespace-nowrap">
                  Notify Me
                </button>
              </div>
            </div>

            {/* Back to Home */}
            <Link 
              href="/"
              className="group inline-flex items-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 