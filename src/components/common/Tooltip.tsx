'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
  delay?: number
  maxWidth?: number
}

export default function Tooltip({ 
  children, 
  content, 
  className,
  delay = 200,
  maxWidth = 240
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isHovered) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, 300) // Show after 300ms
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, delay) // Hide after delay
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isHovered, delay])

  // Handle positioning
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const tooltipHeight = rect.height
      const spaceBelow = viewportHeight - rect.top
      const spaceAbove = rect.top

      // If there's not enough space below, position above
      if (spaceBelow < tooltipHeight + 20 && spaceAbove > tooltipHeight + 20) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
    }
  }, [isVisible])

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg",
            "border border-gray-700",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            "min-w-[240px] max-h-48 overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800",
            className
          )}
          style={{ 
            maxWidth: `${maxWidth}px`,
            ...(position === 'bottom' 
              ? { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }
              : { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }
            ),
          }}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          <div className="relative">
            {content}
            {/* Arrow */}
            <div 
              className="absolute w-2 h-2 bg-gray-900 border-l border-t border-gray-700 transform rotate-45"
              style={{
                ...(position === 'bottom'
                  ? { top: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
                  : { bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
                ),
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
} 