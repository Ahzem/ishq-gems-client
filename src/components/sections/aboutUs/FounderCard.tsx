'use client'

import { Badge, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface FounderCardProps {
  founder: {
    name: string
    role: string
    bio: string
    image: string
    skills: string[]
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    certifications?: string[]
  }
  index: number
}

export default function FounderCard({ founder, index }: FounderCardProps) {
  return (
    <div 
      className="group luxury-fade-in"
      style={{ animationDelay: `${index * 200}ms` }}
    >
      <div className="relative bg-gradient-to-br from-card via-card to-secondary/10 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 hover:border-primary/40 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 transform">
        
        {/* Profile Image */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/20">
              <Image 
                src={founder.image} 
                alt={founder.name} 
                width={160} 
                height={160} 
                className="w-full h-full object-cover" 
              />
            </div>
            {/* Decorative ring */}
            <div className="absolute -inset-1 sm:-inset-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 blur-sm opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 leading-tight">
              {founder.name}
            </h3>
            <p className="text-primary font-semibold text-base sm:text-lg mb-3 sm:mb-4 leading-tight">
              {founder.role}
            </p>
            
            {/* Certifications for gemologist */}
            {founder.certifications && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2 mb-4">
                {founder.certifications.map((cert) => (
                  <div key={cert} className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 text-xs sm:text-sm">
                    <CheckCircle className="w-2.5 sm:w-3 h-2.5 sm:h-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">{cert}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6 sm:mb-8">
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base md:text-lg">
            {founder.bio}
          </p>
        </div>

        {/* Skills */}
        <div className="mb-4 sm:mb-6">
          <h4 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
            <Badge className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary flex-shrink-0" />
            Key Expertise
          </h4>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {founder.skills.map((skill) => (
              <div 
                key={skill}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-foreground hover:bg-primary/20 transition-colors duration-300"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent opacity-60 rounded-full"></div>
        
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    </div>
  )
} 