'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'

interface CursorReactiveProps {
  children: ReactNode
  className?: string
  /** Enable 3D tilt effect on hover */
  enableTilt?: boolean
  /** Maximum rotation angle in degrees */
  maxRotation?: number
  /** Enable scale effect on hover */
  enableScale?: boolean
  /** Scale factor on hover */
  scaleAmount?: number
  /** Transition duration when not hovering */
  transitionDuration?: string
  /** Custom transform function for advanced effects */
  customTransform?: (x: number, y: number, isHovered: boolean) => string
  /** Callback when hover state changes */
  onHoverChange?: (isHovered: boolean) => void
  /** Whether to apply transform to the wrapper or child */
  transformTarget?: 'wrapper' | 'child'
}

export default function CursorReactive({
  children,
  className = '',
  enableTilt = true,
  maxRotation = 10,
  enableScale = false,
  scaleAmount = 1.05,
  transitionDuration = '0.3s',
  customTransform,
  onHoverChange,
  transformTarget = 'wrapper'
}: CursorReactiveProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [transform, setTransform] = useState({ x: 0, y: 0 })
  const elementRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt && !enableScale && !customTransform) return

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX
    const mouseY = e.clientY

    // Calculate rotation based on mouse position
    const rotateX = enableTilt ? ((mouseY - centerY) / rect.height) * maxRotation : 0
    const rotateY = enableTilt ? ((mouseX - centerX) / rect.width) * maxRotation : 0

    setTransform({ x: rotateY, y: -rotateX })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHoverChange?.(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTransform({ x: 0, y: 0 })
    onHoverChange?.(false)
  }

  const getTransformString = () => {
    if (customTransform) {
      return customTransform(transform.x, transform.y, isHovered)
    }

    const transformParts: string[] = []

    // Add perspective for 3D effect
    if (enableTilt) {
      transformParts.push('perspective(1000px)')
      transformParts.push(`rotateX(${transform.y}deg)`)
      transformParts.push(`rotateY(${transform.x}deg)`)
    }

    // Add scale effect
    if (enableScale && isHovered) {
      transformParts.push(`scale(${scaleAmount})`)
    }

    return transformParts.join(' ')
  }

  const commonProps = {
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    style: {
      transition: isHovered ? 'none' : `transform ${transitionDuration} ease-out`,
      ...(transformTarget === 'wrapper' ? { transform: getTransformString() } : {})
    }
  }

  if (transformTarget === 'child') {
    return (
      <div 
        ref={elementRef}
        className={`${className} cursor-glow-hover`}
        {...commonProps}
      >
        <div style={{ 
          transform: getTransformString(),
          transition: isHovered ? 'none' : `transform ${transitionDuration} ease-out`
        }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={elementRef}
      className={`${className} cursor-glow-hover`}
      {...commonProps}
    >
      {children}
    </div>
  )
}

// Hook for global mouse position (for background parallax effects)
export function useGlobalMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2 // Normalize to -1 to 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return mousePosition
}

// Component for background parallax elements
interface ParallaxBackgroundProps {
  children: ReactNode
  strength?: number
  className?: string
}

export function ParallaxBackground({ 
  children, 
  strength = 0.5, 
  className = '' 
}: ParallaxBackgroundProps) {
  const mousePosition = useGlobalMousePosition()

  return (
    <div 
      className={className}
      style={{
        transform: `translate(${mousePosition.x * strength * 20}px, ${mousePosition.y * strength * 20}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {children}
    </div>
  )
}
