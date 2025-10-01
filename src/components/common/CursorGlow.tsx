'use client'

import { useEffect, useState, useRef } from 'react'

interface CursorGlowProps {
  /** Size of the glow effect in pixels */
  size?: number
  /** Color of the glow (CSS color value) */
  color?: string
  /** Blur radius of the glow */
  blur?: number
  /** Animation duration when transitioning in/out */
  duration?: number
  /** Z-index for the cursor glow */
  zIndex?: number
}

export default function CursorGlow({
  size = 200,
  color = 'var(--primary)',
  blur = 100,
  duration = 300,
  zIndex = 9999
}: CursorGlowProps) {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const requestRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleMouseMove = (e: MouseEvent) => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }

      requestRef.current = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      })
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Check if the element or its parents have hover glow classes
      const shouldGlow = target.closest(`
        .cursor-glow,
        .cursor-glow-hover,
        button,
        a,
        [role="button"],
        .group,
        .hover\\:shadow-2xl,
        .hover\\:border-primary,
        .cursor-pointer,
        .touch-manipulation,
        input[type="submit"],
        input[type="button"],
        .card-hover-enhanced,
        [data-cursor-glow],
        .luxury-form input,
        .luxury-form select,
        .luxury-form textarea
      `.replace(/\s+/g, ''))

      if (shouldGlow) {
        setIsHovering(true)
        setIsVisible(true)
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement
      
      // Check if we're moving to another hoverable element
      if (!relatedTarget || !relatedTarget.closest(`
        .cursor-glow,
        .cursor-glow-hover,
        button,
        a,
        [role="button"],
        .group,
        .hover\\:shadow-2xl,
        .hover\\:border-primary,
        .cursor-pointer,
        .touch-manipulation,
        input[type="submit"],
        input[type="button"],
        .card-hover-enhanced,
        [data-cursor-glow],
        .luxury-form input,
        .luxury-form select,
        .luxury-form textarea
      `.replace(/\s+/g, ''))) {
        setIsHovering(false)
        
        // Hide after animation duration
        timeoutId = setTimeout(() => {
          setIsVisible(false)
        }, duration)
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target === document.documentElement || target === document.body) {
        setIsHovering(false)
        setIsVisible(false)
      }
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseover', handleMouseEnter, true)
    document.addEventListener('mouseout', handleMouseLeave, true)
    document.addEventListener('mouseleave', handleMouseOut, true)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseEnter, true)
      document.removeEventListener('mouseout', handleMouseLeave, true)
      document.removeEventListener('mouseleave', handleMouseOut, true)
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [duration])

  if (!isVisible) return null

  return (
    <>
      <div
        className="cursor-glow-element pointer-events-none fixed rounded-full mix-blend-screen"
        style={{
          left: mousePosition.x - size / 2,
          top: mousePosition.y - size / 2,
          width: size,
          height: size,
          background: `radial-gradient(circle, hsl(${color} / 0.15) 0%, hsl(${color} / 0.08) 30%, transparent 70%)`,
          filter: `blur(${blur * 0.5}px)`,
          transform: isHovering ? 'scale(1)' : 'scale(0.5)',
          opacity: isHovering ? 0.8 : 0,
          transition: `all ${duration}ms cubic-bezier(0.23, 1, 0.320, 1)`,
          zIndex: zIndex,
        }}
      />
      
      {/* Inner intense glow */}
      <div
        className="cursor-glow-inner pointer-events-none fixed rounded-full"
        style={{
          left: mousePosition.x - (size * 0.3) / 2,
          top: mousePosition.y - (size * 0.3) / 2,
          width: size * 0.3,
          height: size * 0.3,
          background: `radial-gradient(circle, hsl(${color} / 0.25) 0%, hsl(${color} / 0.15) 50%, transparent 100%)`,
          filter: `blur(${blur * 0.2}px)`,
          transform: isHovering ? 'scale(1)' : 'scale(0.8)',
          opacity: isHovering ? 1 : 0,
          transition: `all ${duration * 0.8}ms cubic-bezier(0.23, 1, 0.320, 1)`,
          zIndex: zIndex + 1,
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Outer soft glow */}
      <div
        className="cursor-glow-outer pointer-events-none fixed rounded-full"
        style={{
          left: mousePosition.x - (size * 1.5) / 2,
          top: mousePosition.y - (size * 1.5) / 2,
          width: size * 1.5,
          height: size * 1.5,
          background: `radial-gradient(circle, hsl(${color} / 0.08) 0%, hsl(${color} / 0.03) 40%, transparent 80%)`,
          filter: `blur(${blur}px)`,
          transform: isHovering ? 'scale(1)' : 'scale(0.3)',
          opacity: isHovering ? 0.6 : 0,
          transition: `all ${duration * 1.2}ms cubic-bezier(0.23, 1, 0.320, 1)`,
          zIndex: zIndex - 1,
        }}
      />
    </>
  )
}

// Hook to manually trigger cursor glow on specific elements
export function useCursorGlow() {
  const enableGlow = (element: HTMLElement) => {
    element.setAttribute('data-cursor-glow', 'true')
    element.classList.add('cursor-glow')
  }

  const disableGlow = (element: HTMLElement) => {
    element.removeAttribute('data-cursor-glow')
    element.classList.remove('cursor-glow')
  }

  return { enableGlow, disableGlow }
} 