'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { GemFiltersState } from '@/types'

interface ShapeFilterChipsProps {
  filters: GemFiltersState
  onFiltersChange: (filters: GemFiltersState) => void
  className?: string
}

interface ShapeOption {
  name: string
  displayName: string
  image: string
  alt: string
}

// Map the available shape images to their corresponding filter values
const availableShapes: ShapeOption[] = [
  {
    name: 'Round Brilliant',
    displayName: 'Round',
    image: '/images/shapes/round-diamond.png',
    alt: 'Round Brilliant Cut'
  },
  {
    name: 'Princess',
    displayName: 'Princess',
    image: '/images/shapes/princess-diamond.png',
    alt: 'Princess Cut'
  },
  {
    name: 'Emerald Cut',
    displayName: 'Emerald',
    image: '/images/shapes/emerald-diamond.png',
    alt: 'Emerald Cut'
  },
  {
    name: 'Asscher',
    displayName: 'Asscher',
    image: '/images/shapes/asscher-diamond.png',
    alt: 'Asscher Cut'
  },
  {
    name: 'Marquise',
    displayName: 'Marquise',
    image: '/images/shapes/marquise-diamond.png',
    alt: 'Marquise Cut'
  },
  {
    name: 'Oval',
    displayName: 'Oval',
    image: '/images/shapes/oval-diamond.png',
    alt: 'Oval Cut'
  },
  {
    name: 'Radiant',
    displayName: 'Radiant',
    image: '/images/shapes/radiant-diamond.png',
    alt: 'Radiant Cut'
  },
  {
    name: 'Pear',
    displayName: 'Pear',
    image: '/images/shapes/pear-diamond.png',
    alt: 'Pear Cut'
  },
  {
    name: 'Heart',
    displayName: 'Heart',
    image: '/images/shapes/heart-diamond.png',
    alt: 'Heart Cut'
  },
  {
    name: 'Cushion',
    displayName: 'Cushion',
    image: '/images/shapes/cushion-diamond.png',
    alt: 'Cushion Cut'
  }
]

export default function ShapeFilterChips({ filters, onFiltersChange, className }: ShapeFilterChipsProps) {
  const handleShapeToggle = (shapeName: string) => {
    const newShapes = filters.shapes.includes(shapeName)
      ? filters.shapes.filter(s => s !== shapeName)
      : [...filters.shapes, shapeName]
    
    onFiltersChange({ ...filters, shapes: newShapes })
  }

  return (
    <div className={cn("flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4", className)}>
      {availableShapes.map((shape) => {
        const isActive = filters.shapes.includes(shape.name)
        
        return (
          <button
            key={shape.name}
            onClick={() => handleShapeToggle(shape.name)}
            className={cn(
              "inline-flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-full border transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
            title={`Filter by ${shape.alt}`}
          >
            {/* Shape Image */}
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7">
              <Image
                src={shape.image}
                alt={shape.alt}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 20px, (max-width: 768px) 24px, 28px"
              />
            </div>
            
            {/* Shape Name */}
            <span className="text-xs sm:text-sm md:text-base font-medium">
              {shape.displayName}
            </span>
          </button>
        )
      })}
    </div>
  )
}
