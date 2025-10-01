'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Award, 
  Truck, 
  CreditCard, 
  Building2, 
  Gem, 
  Sparkles, 
  Crown, 
  CheckCircle,
  Zap,
  Star,
  Globe,
  Lock,
  Heart,
  BadgeCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import CursorReactive from '@/components/common/CursorReactive'

interface Partner {
  name: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
  category: 'certification' | 'shipping' | 'payment' | 'institution'
  status: 'verified' | 'trusted' | 'premium' | 'featured'
  features: string[]
  gradient: string
  accent: string
}

const partners: Partner[] = [
  {
    name: 'NGJA',
    icon: Gem,
    description: 'National Gem & Jewellery Authority',
    category: 'certification',
    status: 'verified',
    features: ['Certified Authentication', 'Quality Assurance', 'International Standards'],
    gradient: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-500'
  },
  {
    name: 'GIA',
    icon: Award,
    description: 'Gemological Institute of America',
    category: 'certification',
    status: 'premium',
    features: ['Global Recognition', 'Expert Grading', 'Research Excellence'],
    gradient: 'from-blue-500 to-indigo-600',
    accent: 'text-blue-500'
  },
  {
    name: 'Ssef',
    icon: Shield,
    description: 'Swiss Gemmological Institute',
    category: 'certification',
    status: 'featured',
    features: ['Swiss Precision', 'Advanced Analysis', 'Trusted Worldwide'],
    gradient: 'from-purple-500 to-violet-600',
    accent: 'text-purple-500'
  },
  {
    name: 'DHL Express',
    icon: Truck,
    description: 'Worldwide Express Shipping',
    category: 'shipping',
    status: 'trusted',
    features: ['Express Delivery', 'Insurance Coverage', 'Global Network'],
    gradient: 'from-amber-500 to-orange-600',
    accent: 'text-amber-500'
  },
  {
    name: 'FedEx',
    icon: Truck,
    description: 'International Logistics',
    category: 'shipping',
    status: 'verified',
    features: ['Secure Transport', 'Real-time Tracking', 'Customs Clearance'],
    gradient: 'from-rose-500 to-pink-600',
    accent: 'text-rose-500'
  },
  {
    name: 'Stripe',
    icon: CreditCard,
    description: 'Secure Payment Processing',
    category: 'payment',
    status: 'premium',
    features: ['Bank-level Security', 'Global Payments', 'Fraud Protection'],
    gradient: 'from-cyan-500 to-blue-600',
    accent: 'text-cyan-500'
  },
  {
    name: 'PayPal',
    icon: Shield,
    description: 'Buyer Protection Program',
    category: 'payment',
    status: 'trusted',
    features: ['Buyer Protection', 'Secure Transactions', 'Global Acceptance'],
    gradient: 'from-slate-500 to-gray-600',
    accent: 'text-slate-500'
  },
  {
    name: 'Lloyd\'s of London',
    icon: Building2,
    description: 'Insurance & Risk Management',
    category: 'institution',
    status: 'featured',
    features: ['Premium Insurance', 'Risk Assessment', 'Global Coverage'],
    gradient: 'from-indigo-500 to-purple-600',
    accent: 'text-indigo-500'
  }
]

const getCategoryInfo = (category: Partner['category']) => {
  switch (category) {
    case 'certification':
      return {
        icon: BadgeCheck,
        label: 'Certification',
        color: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20'
      }
    case 'shipping':
      return {
        icon: Truck,
        label: 'Logistics',
        color: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-50 dark:bg-amber-900/20'
      }
    case 'payment':
      return {
        icon: Lock,
        label: 'Security',
        color: 'from-cyan-500 to-blue-500',
        bg: 'bg-cyan-50 dark:bg-cyan-900/20'
      }
    case 'institution':
      return {
        icon: Crown,
        label: 'Institution',
        color: 'from-purple-500 to-indigo-500',
        bg: 'bg-purple-50 dark:bg-purple-900/20'
      }
  }
}

const getStatusBadge = (status: Partner['status']) => {
  switch (status) {
    case 'verified':
      return {
        icon: CheckCircle,
        label: 'Verified',
        color: 'bg-green-500 text-white',
        glow: 'shadow-green-500/25'
      }
    case 'trusted':
      return {
        icon: Shield,
        label: 'Trusted',
        color: 'bg-blue-500 text-white',
        glow: 'shadow-blue-500/25'
      }
    case 'premium':
      return {
        icon: Crown,
        label: 'Premium',
        color: 'bg-purple-500 text-white',
        glow: 'shadow-purple-500/25'
      }
    case 'featured':
      return {
        icon: Star,
        label: 'Featured',
        color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        glow: 'shadow-amber-500/25'
      }
  }
}

export default function PartnersSection() {
  const [activeCategory, setActiveCategory] = useState<Partner['category'] | null>(null)
  const [hoveredPartner, setHoveredPartner] = useState<string | null>(null)
  const [animationIndex, setAnimationIndex] = useState(0)

  // Cycle through categories for animation
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationIndex(prev => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const categories = Array.from(new Set(partners.map(p => p.category)))
  const filteredPartners = activeCategory 
    ? partners.filter(p => p.category === activeCategory)
    : partners

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-float-slow opacity-60"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-float-delayed opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-2xl animate-pulse-slow"></div>
        
        {/* Floating Connection Lines */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M100,200 Q300,100 500,200 T900,200"
              stroke="url(#connectionGradient)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse-slow"
            />
            <path
              d="M200,400 Q400,300 600,400 T1000,400"
              stroke="url(#connectionGradient)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse-slow"
              style={{ animationDelay: '1s' }}
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Elegant Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16 xl:mb-20 px-2">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
            <div className="relative">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
          </div>
          
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-primary via-accent via-primary to-accent bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-flow">
              Trusted Partners
            </span>
          </h2>
          
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg xl:text-xl max-w-3xl mx-auto leading-relaxed px-4">
            Collaborating with world-class institutions to deliver unmatched quality, security, and authenticity in every gemstone transaction.
          </p>
        </div>

        {/* Interactive Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 mb-8 sm:mb-10 lg:mb-12 px-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shadow-lg hover:shadow-xl",
              activeCategory === null
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground scale-105"
                : "bg-card text-foreground hover:bg-primary/10 hover:text-primary border border-border"
            )}
          >
            <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">All Partners</span>
            <span className="sm:hidden">All</span>
          </button>
          
          {categories.map((category, index) => {
            const categoryInfo = getCategoryInfo(category)
            const CategoryIcon = categoryInfo.icon
            
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shadow-lg hover:shadow-xl",
                  activeCategory === category
                    ? `bg-gradient-to-r ${categoryInfo.color} text-white scale-105`
                    : `bg-card text-foreground hover:${categoryInfo.bg} hover:text-foreground border border-border`,
                  animationIndex === index && "animate-pulse"
                )}
              >
                <CategoryIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{categoryInfo.label}</span>
                <span className="sm:hidden">{categoryInfo.label.slice(0, 4)}</span>
              </button>
            )
          })}
        </div>

        {/* Partners Grid - Magazine Style Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-10 sm:mb-14 lg:mb-16 px-2">
          {filteredPartners.map((partner, index) => {
            const PartnerIcon = partner.icon
            const statusBadge = getStatusBadge(partner.status)
            const StatusIcon = statusBadge.icon
            const isHovered = hoveredPartner === partner.name
            
            return (
              <div
                key={partner.name}
                className={cn(
                  "group relative transition-all duration-700 hover:scale-105",
                  index === 0 && "md:col-span-2 lg:col-span-1",
                  index === 1 && "lg:row-span-2",
                  index === 3 && "xl:col-span-2"
                )}
                onMouseEnter={() => setHoveredPartner(partner.name)}
                onMouseLeave={() => setHoveredPartner(null)}
              >
                <div className="relative h-full bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-500">
                  {/* Gradient Background */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                    partner.gradient
                  )} />
                  
                  {/* Status Badge */}
                  <div className={cn(
                    "absolute top-3 right-3 sm:top-4 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg",
                    statusBadge.color,
                    statusBadge.glow
                  )}>
                    <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">{statusBadge.label}</span>
                  </div>
                  
                  <div className="relative z-10 p-4 sm:p-5 lg:p-6 h-full flex flex-col">
                    {/* Partner Icon and Name */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-all duration-300",
                        partner.gradient,
                        isHovered && "scale-110 shadow-xl"
                      )}>
                        <PartnerIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base lg:text-lg xl:text-xl text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                          {partner.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {partner.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Features List */}
                    <div className="flex-1 space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      {partner.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-foreground"
                        >
                          <div className={cn(
                            "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r transition-all duration-300",
                            partner.gradient,
                            isHovered && "scale-125"
                          )} />
                          <span className="group-hover:text-primary transition-colors duration-300 line-clamp-1">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Category Badge */}
                    <div className={cn(
                      "inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium",
                      getCategoryInfo(partner.category).bg,
                      partner.accent
                    )}>
                      <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="hidden sm:inline">{getCategoryInfo(partner.category).label}</span>
                      <span className="sm:hidden">{getCategoryInfo(partner.category).label.slice(0, 4)}</span>
                    </div>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Animated Border */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 group-hover:w-40 transition-all duration-500" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust Metrics Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-10 sm:mb-14 lg:mb-16 px-2">
        <CursorReactive
          enableTilt={true}
          maxRotation={12}
          enableScale={true}
          scaleAmount={1.0}
          transitionDuration="0.3s"
        >
          <div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-1 sm:mb-2">
              100%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Authenticity Guaranteed</div>
          </div>
        </CursorReactive>
          
        <CursorReactive
          enableTilt={true}
          maxRotation={12}
          enableScale={true}
          scaleAmount={1.0}
          transitionDuration="0.3s"
        >
          <div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-500" />
                        </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-1 sm:mb-2">
              256-bit
                      </div>
            <div className="text-xs sm:text-sm text-muted-foreground">SSL Encryption</div>
          </div>
        </CursorReactive>
        
        <CursorReactive
          enableTilt={true}
          maxRotation={12}
          enableScale={true}
          scaleAmount={1.0}
          transitionDuration="0.3s"
        >
          <div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-500" />
                  </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent mb-1 sm:mb-2">
                150+
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Countries Served</div>
          </div>
        </CursorReactive>

        <CursorReactive
          enableTilt={true}
          maxRotation={12}
          enableScale={true}
          scaleAmount={1.0}
          transitionDuration="0.3s"
        >
          <div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-1 sm:mb-2">
              99.9%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Customer Satisfaction</div>
          </div>
        </CursorReactive>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse-slow opacity-60"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse-slow opacity-60" style={{ animationDelay: '1s' }}></div>
    </section>
  )
} 