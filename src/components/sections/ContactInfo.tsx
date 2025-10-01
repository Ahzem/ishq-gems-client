'use client'

import { Mail, Phone, MapPin, Clock, MessageCircle, Globe, Award } from 'lucide-react'
import { companyInfo } from '@/lib/constants'

export default function ContactInfo() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: companyInfo.email,
      description: 'Send us an email anytime',
      action: `mailto:${companyInfo.email}`,
      color: 'text-blue-500'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: companyInfo.phone,
      description: 'Call us during business hours',
      action: `tel:${companyInfo.phone}`,
      color: 'text-green-500'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: companyInfo.whatsapp,
      description: 'Quick chat on WhatsApp',
      action: `https://wa.me/${companyInfo.whatsapp.replace(/\D/g, '')}`,
      color: 'text-green-600'
    },
    {
      icon: MapPin,
      title: 'Address',
      value: companyInfo.address,
      description: 'Currently online only',
      action: '#',
      color: 'text-red-500'
    }
  ]

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ]

  const specialties = [
    {
      icon: Award,
      title: 'Certified Gemstones',
      description: 'All our gems come with proper certification'
    },
    {
      icon: Globe,
      title: 'Worldwide Shipping',
      description: 'We ship globally with secure packaging'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Online support available around the clock'
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Direct Contact Methods */}
      <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
            Contact Information
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Multiple ways to reach our expert team
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.action}
              target={method.action.startsWith('http') ? '_blank' : undefined}
              rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-secondary/30 transition-all duration-300"
            >
              <div className={`w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-${method.color.split('-')[1]}-500/20 to-${method.color.split('-')[1]}-600/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                <method.icon className={`w-5 sm:w-6 h-5 sm:h-6 ${method.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 text-sm sm:text-base">
                  {method.title}
                </h3>
                <p className="font-medium text-foreground mb-1 text-sm sm:text-base break-all">
                  {method.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {method.description}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
        
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>

      {/* Business Hours */}
      <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 hover:border-primary/40 transition-all duration-700 hover:shadow-xl hover:shadow-primary/10">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
              Business Hours
            </h3>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Sri Lanka Standard Time (UTC+5:30)
          </p>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {businessHours.map((schedule, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0 gap-2">
              <span className="font-medium text-foreground text-sm sm:text-base">
                {schedule.day}
              </span>
              <span className="text-muted-foreground text-sm sm:text-base text-right">
                {schedule.hours}
              </span>
            </div>
          ))}
        </div>

        {/* Current Status */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg sm:rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
            <span className="text-green-600 font-medium text-xs sm:text-sm">
              Currently Online - We&apos;ll respond within 2 hours
            </span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
      </div>

      {/* Our Specialties */}
      <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 hover:border-primary/40 transition-all duration-700 hover:shadow-xl hover:shadow-primary/10">
        <div className="mb-4 sm:mb-6">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground mb-2">
            Why Choose Ishq Gems?
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm">
            We&apos;re committed to excellence in every aspect
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {specialties.map((specialty, index) => (
            <div key={index} className="flex items-start gap-3 sm:gap-4 group">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <specialty.icon className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 text-sm sm:text-base">
                  {specialty.title}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {specialty.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
      </div>

      {/* Emergency Contact */}
      <div className="relative bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
        <h4 className="font-serif text-base sm:text-lg font-bold text-foreground mb-2">
          Need Immediate Assistance?
        </h4>
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 px-2">
          For urgent gem verification or high-value transactions
        </p>
        <a 
          href={`tel:${companyInfo.phone}`}
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-sm sm:text-base"
        >
          <Phone className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">Call Now: {companyInfo.phone}</span>
        </a>
      </div>
    </div>
  )
} 